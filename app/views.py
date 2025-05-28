from flask import Blueprint, current_app
from flask import render_template, request, flash, redirect, url_for, abort, session, jsonify
from werkzeug.utils import secure_filename
from flask_wtf.csrf import CSRFError
from flask_login import login_user,logout_user,login_required, current_user
from .forms import LoginForm
from .forms import GestionUsers
from .forms import RegistrarUsuarios
from .forms import formgdi, RegistrarHojaVida
from .models import User, Indicadores,HojaVida,Cronograma, Cargos
from .email import welcome_mail, Prueba_mail, inicio_gdd, cierre_gdd, aprobacion_indicadores, indicadores_cargados
from .servicios import servicio_notificacion
from . import login_manager
from .consts import *
from datetime import datetime
from requests.auth import HTTPBasicAuth
from .funciones import generar_contrasena_aleatoria
import json
import collections
import random
import requests
from bs4 import BeautifulSoup
import os
import requests
from requests.auth import HTTPBasicAuth
import json
import pandas as pd
import asyncio


adj_imagenes = 'app/static/img/fotos_personal/'
page = Blueprint('page', __name__)




@page.route("/app_crm/prueba", methods=['GET', 'POST'])
@login_required
def prueba():
    """
    ruta = 'app/static/adj/Cargos_GDD.xlsx'
    df = pd.read_excel(ruta, usecols=['   Ficha', 'Departamento', 'Cargo'])
    df = df.dropna(subset=['   Ficha', 'Departamento', 'Cargo'])
    df['   Ficha'] = df['   Ficha'].astype(int)
    for _, row in df.iterrows():
        print(row['   Ficha'])
        Cargos.insert_cargo(
            ficha=str(row['   Ficha']).strip(),
            departamento=str(row['Departamento']).strip(),
            cargo=str(row['Cargo']).strip()
        )
"""
    return 'Prueba rey'

#======================================== MANEJO DE ERRORES====================================================================>
@page.errorhandler(CSRFError)
def handle_csrf_error(e):
    flash('La sesión ha expirado. Por favor inicie sesión nuevamente.', 'warning')
    return redirect(url_for('.login'))

@page.app_errorhandler(500)
def internar_error_server(error):
    flash(ERROR_500,'error')
    return render_template('no hay nada pa'),500

@page.app_errorhandler(404)
def page_not_found(error):
    flash(ERROR_404)
    return "no hay nada pa, no se que no se encontró pero no se encontro"
#======================================== FIN MANEJO DE ERRORES=================================================================<



#========================================= MANEJO DE SESION ===========================================================================
@page.route('/app_crm/logout')
def logout():
    logout_user()
    flash(LOGOUT)
    return redirect(url_for('.login'))

@page.route('/app_crm/', methods=['GET', 'POST'])
@page.route('/app_crm//login', methods=['GET', 'POST'])
def login():
    print('asda')

    form = LoginForm()

    if request.method == 'POST':
        if form.ficha.data and form.password.data:  

            user = User.get_by_ficha(form.ficha.data)

            if user and user.verify_password(form.password.data):
                login_user(user)  
                flash(f'Bienvenido, {user.nombre.title()}!', 'success')
                return redirect(url_for('.menu'))
            

            flash('Usuario o contraseña incorrectos', 'error')
    return render_template('auth/login.html', form=form)
#=========================================================================================================================================

#------------------------------------------------ GESTION USUARIOS------------------------------------------------------------------------
@page.route("/app_crm/perfil", methods=['GET', 'POST'])
@login_required 
def perfil():
    form = GestionUsers()
    usuario = current_user
    
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    if request.method == 'POST':
        clave = form.password.data
        clave_confirm = form.Confirmarpassword.data
        telefono = form.telefono.data
        print(telefono)
        print(clave)
        print(clave_confirm)
        if clave != clave_confirm:
            flash("Las contraseñas no coinciden.", "warning")
        else:
            flash("Perfil actualizado correctamente.", "success")
            act = User.update_clave_telefono(ficha,clave,telefono)

            return redirect(url_for('.perfil'))      
    return render_template("auth/perfil.html", titulo="Perfil Usuario", rest=rest, usuario= usuario, ficha = ficha, form= form, consultar_cargo = consultar_cargo)

@page.route("/app_crm/usuario/agregar", methods=['GET', 'POST'])
@login_required 
def add_user():
    form = RegistrarUsuarios() 
    usuario = current_user
    ficha = current_user.ficha
    if usuario.nivel_usuario == "Medio":
        return redirect(url_for('.menu'))  
    rest = consultar_sap(ficha)
        
    if request.method == 'POST':
        try:
            nombre = form.nombre.data
            apellido = form.apellido.data
            email = form.email.data
            username = f"{form.nombre.data.lower()}_{form.apellido.data.lower()}"
            ficha_formulario = str(form.n_ficha.data)
            nivel_usuario = form.nivel.data
            password = form.password.data
            documento_texto = form.documento_texto.data
            print(documento_texto)
            ruta_guardar = None
            contrasena = generar_contrasena_aleatoria()
            if not documento_texto:
                documento = form.documento.data
                # Manejo de subida de archivo
                if documento:
                    documento.filename = f"{ficha_formulario}.jpg"
                    nombre_archivo = secure_filename(documento.filename)
                    ruta_guardar = os.path.join(os.path.abspath(adj_imagenes), nombre_archivo)

                    # Verificar si el archivo ya existe
                    if os.path.exists(ruta_guardar):
                        print(f'Error: Ya existe un archivo con el nombre {nombre_archivo}. No se puede sobrescribir.')
                        flash("Error: Ya existe un usuario con estos datos", "error")
                        return redirect(url_for('.add_user')) 
                    else:
                        documento.save(ruta_guardar)
                        print(f'Archivo guardado en: {ruta_guardar}')
            filial = form.filial.data
            telefono = form.telefono.data

            existe = User.get_by_ficha(ficha_formulario)

            if not existe:

                # Inserción del usuario en la base de datos
                user = User.insertar_usuario(
                    nombre=nombre,
                    apellido=apellido,
                    email=email,
                    filial=filial,
                    ficha=ficha_formulario,
                    nivel_usuario=nivel_usuario,
                    password=contrasena,
                    telefono=telefono,
                )
                #---------agregar envio de correo aqui
                #welcome_mail(user, contrasena)
                flash("Usuario registrado exitosamente", "success")
                #return redirect(url_for('.add_user'))  
            else:
                #Actualizar
                user= User.update(ficha_formulario, password,email,nivel_usuario,telefono)

                flash("Usuario editado exitosamente", "success")
                #return redirect(url_for('.add_user'))

            print(contrasena)
            #welcome_mail(user, contrasena)        
            #Prueba_mail(user, "22/05/2025 hasta 22/05/2025")       
        except Exception as e:
            if "UNIQUE constraint failed" in str(e):
                flash("Error: Ya existe un usuario con estos datos", "error")
            else:
                flash(f"Error inesperado: {str(e)}", "error")

            return redirect(url_for('.add_user'))  

    return render_template("auth/register_user.html", consultar_cargo= consultar_cargo,  titulo="Perfil Usuario", usuario=usuario, rest=rest, form=form, ficha = ficha)

@page.route("/app_crm/usuarios", methods=['GET'] )
@login_required
def participantes():
    usuario = current_user
    ficha = current_user.ficha
    if usuario.nivel_usuario == "Medio":
        return redirect(url_for('.menu'))  

    rest = consultar_sap(ficha)
    participantes = participantes_gdd()
    print(participantes)
    return render_template('/auth/list_users.html', consultar_cargo= consultar_cargo, ficha = ficha,  titulo= "participantes", participantes = participantes,usuario=usuario,rest=rest)


@page.route("/app_crm/detalles_usuarios/<int:ficha_get>", methods=['GET','POST'] )
@login_required
def detalles_usuarios(ficha_get):
    
    if request.method == 'POST':
        lista_ids= []

        datos = request.get_json() 

        
        # Caso 1: Si datos es un diccionario y contiene la clave 'accion'
        if isinstance(datos, dict) and 'accion' in datos:
            accion = datos['accion']
            print(f"Acción recibida: {accion}")
            
            if accion == 'actualizar' and 'estado' in datos:
                nuevo_estado = datos['estado']
                print(f"Actualizando estado a: {nuevo_estado}")
                User.update_estado_gdd(ficha_get, nuevo_estado)
                return jsonify({"status": "ok", "message": f"Estado actualizado a {nuevo_estado}"})
        
            return jsonify({"status": "ok", "message": f"Acción {accion} procesada"})
        
        # Caso 2: Si datos es una lista 
        elif isinstance(datos, list) and len(datos) > 0:
            aprobacion = None
            
            for item in datos:
                if isinstance(item, dict) and 'id' in item and 'estado' in item:
                    id = item['id']
                    aprobacion = item['estado']  
                    print(id)
                    print(aprobacion)
                    lista_ids.append(id)
                    print(lista_ids)
            
            if lista_ids and aprobacion is not None:
                if aprobacion == "Cerrado":
                    Indicadores.actualizar_indicadores_usuario(ficha_get, lista_ids, nuevo_status="Cerrado")
                else:
                    Indicadores.actualizar_indicadores_usuario(ficha_get, lista_ids, nuevo_status="Abierto")
                
                return jsonify({"status": "ok", "message": f"Indicadores actualizados con estado {aprobacion}"})
            else:
                return jsonify({"status": "error", "message": "No se pudo procesar la lista de indicadores"})
        
        # Si ninguno de los casos anteriores aplica
        return jsonify({"status": "error", "message": "Formato de datos no reconocido"})
    
    
    usuario = current_user
    if usuario.nivel_usuario == "Medio":
        return redirect(url_for('.menu'))  
    usuario_dueño_indicador= consultar_sap(ficha_get)
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    #print(rest)
    participantes = participantes_gdd()
    indicadores = Indicadores.obtener_indicador_usuario(ficha_get)
    total_peso = sum(float(i.peso) for i in indicadores if i.peso)
    total_cumplimiento = round(
        sum(float(i.cumplimiento) for i in indicadores if i.cumplimiento),
        2
    )
    
    
    
    return render_template('/auth/detalles_list_user.html', consultar_cargo= consultar_cargo,  titulo= "Detalles" ,usuario=usuario,rest=rest, participantes= participantes, indicadores = indicadores, total_cumplimiento= total_cumplimiento, total_peso=total_peso, ficha_get= ficha_get, ficha=ficha, ruta_foto_personal= ruta_foto_personal, usuario_dueño_indicador = usuario_dueño_indicador )
#-------------------------------------------------------------------------------------------------------------------------------------
#-------------------------------------------- GDD-----------------------------------------------------------------------------------

@page.route("/app_crm/gdd/menu", methods=['GET'] )
@login_required
def menu():
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)

    return render_template('/gdd/menu.html', consultar_cargo= consultar_cargo,  titulo= "Menu",usuario=usuario,rest=rest, ficha = ficha)


@page.route("/app_crm/gdd/gestion_equipo", methods=['GET'] )
@login_required
def gestion_equipo():
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    participantes = participantes_gdd()
    #print(participantes)
    try:
        lista_equipo = obtener_lista_equipo(participantes,ficha)
    except:
        lista_equipo=[]

    equipo = obtener_lista_equipo(participantes,ficha)

    #print(ruta_foto_personal(2824))

    return render_template('/gdd/gestion_equipo.html', consultar_cargo= consultar_cargo,  titulo= "Gestión de Equipo",usuario=usuario,rest=rest, participantes= equipo , ruta_foto_personal=ruta_foto_personal, obtener_indicador_usuario = Indicadores.obtener_indicador_usuario, ficha= ficha)



@page.route("/app_crm/gdd/gestion_equipo/<int:ficha_get>", methods=['GET', 'POST'] )
@login_required
def gestion_equipo_detalles(ficha_get):
    if request.method == 'POST':
        user = current_user
        dueño_indicadores = User.get_by_ficha(ficha_get)
        nombre_dueño_indicador = dueño_indicadores.nombre
        apellido_dueño_indicador = dueño_indicadores.apellido
        lista_datos_correo =[]
        datos = request.get_json() 
        for item in datos:
            id = item['id']
            nombre = item['nombre_indicador']
            aprobacion = item['aprobacion']  
            print(aprobacion)
            Indicadores.actualizar_aprobacion_indicadores_usuario(ficha_get, id, nuevo_status=aprobacion)
            lista_datos_correo.append({
                'nombre': nombre,
                'aprobacion': aprobacion
            })
        
        aprobacion_indicadores(user, nombre_dueño_indicador, apellido_dueño_indicador, lista_datos_correo, dueño_indicadores.email)
        
        flash("Datos recibidos", "success")
        return jsonify({'status': 'success'})
    
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    usuario_dueño_indicador= consultar_sap(ficha_get)
    #print(rest)
    participantes = participantes_gdd()
    indicadores = Indicadores.obtener_indicador_usuario(ficha_get)
    total_peso = sum(float(i.peso) for i in indicadores if i.peso)
    total_cumplimiento = round(
        sum(float(i.cumplimiento) for i in indicadores if i.cumplimiento),
        2
    )
    
    
    
    return render_template('/gdd/detalles_gestion_equipo.html', consultar_cargo= consultar_cargo,  titulo= "Detalles" ,usuario=usuario,rest=rest, participantes= participantes, indicadores = indicadores, total_cumplimiento= total_cumplimiento, total_peso=total_peso, ficha_get= ficha_get, ficha=ficha, usuario_dueño_indicador = usuario_dueño_indicador, ruta_foto_personal = ruta_foto_personal )

@page.route("/app_crm/gdd/indicadores", methods=['GET', 'POST'] )
@login_required 
def gdi():
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    vista= "gdd"
    año_fiscal = "20252026"
    estatus_proceso = "Abriendo"
    form = formgdi()
    indicadores = Indicadores.obtener_indicador_usuario(usuario.ficha)
    total_peso = sum(float(i.peso) for i in indicadores if i.peso)
    total_cumplimiento = round(
        sum(float(i.cumplimiento) for i in indicadores if i.cumplimiento),
        2
    )

    return render_template('/gdd/indicadores.html', consultar_cargo= consultar_cargo,  titulo="Indicadores", indicadores = indicadores, total_peso= total_peso, total_cumplimiento= total_cumplimiento,   año_fiscal=año_fiscal, usuario = usuario, rest = rest, vista = vista, estatus_proceso = estatus_proceso, form = form, ficha= ficha)

@page.route("/app_crm/configuracionGDD", methods=['GET', 'POST'] )
@login_required 
def configuracionGDD():
    if request.method == 'POST':
        datos = request.get_json() 
        print(datos)
    
        if datos == 'AFACTIVO':
            User.actualizar_status_global(datos)
            Indicadores.actualizar_status_global('Abierto')
        else:
            Indicadores.actualizar_status_global(datos)
            User.actualizar_status_global(datos)
        print('listo')
        return jsonify({'status': 'success'})

    usuario = current_user
    if usuario.nivel_usuario == "Medio":
        return redirect(url_for('.menu'))  
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    vista= "gdd"
    
    indicadores_status_actual = Indicadores.existe_indicador_abierto()
    if indicadores_status_actual:
        status_actual = 'Abierto'
    else:
        status_actual = "Cerrado"

    return render_template('/gdd/ventanaRH.html', consultar_cargo= consultar_cargo,  titulo="Administración Talento Humano", usuario = usuario, rest = rest, vista = vista, status_actual= status_actual, ficha = ficha)

@page.route("/app_crm/gdd/hoja_vida-<int:indicador>", methods=['GET', 'POST'] )
@login_required 
def hoja_vida(indicador):
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    Tipo_indicador = None
    indicador_resultado = Indicadores.obtener_indicador(indicador)
    nombre_indicador = indicador_resultado.nombre_indicador
    ficha_del_dueño_del_indicador = indicador_resultado.ficha_usuario
    estado= User.estado_gdd(ficha_del_dueño_del_indicador)
    info_indicador = HojaVida.get_by_id(indicador)
    form = RegistrarHojaVida()
    if request.method == "GET":
        try:
            if info_indicador:
                form.definicion.data = str(info_indicador.definicion)
                form.calculo.data = str(info_indicador.calculo)
                Tipo_indicador = json.loads(info_indicador.naturaleza)

        except:
            pass
    elif request.method == 'POST': 
        vigencia_inicio =form.vigencia_inicio.data
        vigencia_fin=form.vigencia_fin.data
        nivel_generacion=form.nivel_generacion.data
        nivel_util=form.nivel_util.data
        unidad_medida=form.unidad_medida.data
        definicion=form.definicion.data
        calculo=form.calculo.data  
        valores_tipo_indicadores = request.form.getlist("tipoIndicadores[]")
        naturaleza = json.dumps(valores_tipo_indicadores)
        print("Post-------------------------------")
        if nombre_indicador:
            if info_indicador:
                print("Actualizo")
                HojaVida.update(indicador,vigencia_inicio, vigencia_fin, nivel_generacion, nivel_util, unidad_medida, naturaleza, definicion,calculo)
                print(info_indicador)
            else:
                print("Creo elemento")
                HojaVida.create_element(indicador,vigencia_inicio, vigencia_fin, nivel_generacion, nivel_util, unidad_medida, naturaleza, definicion,calculo)
                print(info_indicador)
        flash("Carga completada con éxito")
        print("redireccion")
        return redirect(url_for('.gdi'))
    print("O GET o no hace nada")
    return render_template('/gdd/hoja_de_vida.html', consultar_cargo= consultar_cargo,  estado= estado, titulo="Hoja de Vida", usuario = usuario,form =form,rest=rest,nombre_indicador=nombre_indicador,info_indicador=info_indicador, Tipo_indicador= Tipo_indicador, indicador = indicador, ficha= ficha, ficha_del_dueño_del_indicador= ficha_del_dueño_del_indicador)

@page.route("/app_crm/gdd/cronograma-<int:indicador>", methods=['GET', 'POST'] )
@login_required 
def cronograma(indicador):
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)

    registros = Cronograma.get_by_indicador(indicador)
    indicador_resultado = Indicadores.obtener_indicador(indicador)
    ficha_del_dueño_del_indicador = indicador_resultado.ficha_usuario
    estado= User.estado_gdd(ficha_del_dueño_del_indicador)
    data = []

    if registros and registros.data_cronograma:
        try:
            data = json.loads(registros.data_cronograma)
        except json.JSONDecodeError:
            print("Error al decodificar JSON de data_cronograma")
            data = []
    return render_template('/gdd/cronograma.html', consultar_cargo= consultar_cargo,  estado = estado,  titulo="Cronograma", usuario = usuario,rest=rest, registros = registros, indicador= indicador, data = data , ficha= ficha, ficha_del_dueño_del_indicador =ficha_del_dueño_del_indicador)

@page.route("/app_crm/gdd/gestion-gdd", methods=['GET', 'POST'])
@login_required
def gestion_gdd():
    usuario = current_user
    ficha = usuario.ficha
    rest = consultar_sap(ficha)

    return render_template('/gdd/gestion_gdd.html', consultar_cargo= consultar_cargo,  titulo= "Gestion",usuario=usuario,rest=rest)


#---------------------------------------------------------------------------------------------------------------------------------------------------


#---------------------------------------ENDPOINTS PARA JS-------------------------------------
"""
    Función para consulta de SAP inicial
    Parametro: La ficha
    retorna: response_json    
"""

def consultar_sap(ficha):
    sap_url = "http://10.207.4.68:8000/sap/bc/zhr_rest/zhrgestiondes"
    
    params = {
        'sap-client': '510',
        'FICHA': ficha,
    }
    
    user_fuente = "RFCUSER"
    contra_fuente = "C0rimon.0724$"
    
    try:
        response = requests.get(
            sap_url, 
            auth=HTTPBasicAuth(user_fuente, contra_fuente), 
            params=params, 
            verify=True
        )
        
        #print(f"Status HTTP: {response.status_code}")
        
        if response.status_code == 200:
            response_json = response.json()
            
            if response_json and 'pernr' in response_json[0]:
                #print(f"el response {response_json}")
                return response_json
            else:
                print(error_message)
                flash(error_message, "error")
                return "Error en consulta SAP"
        else:
            error_message = f" Error HTTP {response.status_code}: {response.text}"
            print(error_message)
            flash('Error en consulta a SAP', 'error')
            return "Error en consulta"
        
    except requests.RequestException as e:
        error_message = f" Excepción durante la consulta a SAP: {str(e)}"
        print(error_message)
        flash('Error de conexión a SAP', 'error')
        return "Error de conexión"


"consultar listado de participantes gdd"
def participantes_gdd():
    sap_url = "http://10.207.4.68:8000/sap/bc/zhr_rest/zhrgestiondes_2"
    args = {
        'sap-client': '510',
    }
    
    user_fuente = "RFCUSER"
    contra_fuente = "C0rimon.0724$"
    
    response = requests.get(sap_url, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, verify=True)

    if response.status_code == 200:
        nomina = response.json()
        # Filtrar solo los que tienen indicadorGdd == "x"
        participantes = [
            participante for participante in nomina 
            if participante.get('indicadorGdd', '').lower() == 'x'
        ]
    else:
        return "Error 404"
    
    return participantes

@page.route('/app_crm/buscar_sap', methods=['POST'])
@login_required
def rutaSap():
    try:
        data = request.get_json()  
        ficha = data.get("ficha")

        if not ficha:
            return jsonify({"success": False, "message": "Ficha no proporcionada"}), 400

        rest = consultar_sap(ficha)

        # Verificar imagen en múltiples formatos
        extensiones = ['jpg', 'png', 'jpeg']
        imagen_existe = False
        ruta_imagen = None
        
        for ext in extensiones:
            nombre_imagen = f"{ficha}.{ext}"
            ruta_absoluta = os.path.join(adj_imagenes, nombre_imagen)
            
            if os.path.exists(ruta_absoluta):
                imagen_existe = True
                ruta_imagen = url_for('static', filename=f'img/fotos_personal/{nombre_imagen}')
                break 

        return jsonify({
            "success": True if rest else False,
            "response_json": rest if rest else None,
            "imagen_disponible": imagen_existe,
            "ruta_imagen": ruta_imagen
        }), 200 if rest else 404

    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500
    
@page.route('/app_crm/insertarIndicador', methods=['POST'])
@login_required
def insertar_indicador():
    data = request.get_json()
    
    
    try:
        nombre_indicador = data.get('nombre_indicador')
        tendencia = data.get('tendencia')
        peso = data.get('peso')
        real_af_antes= data.get('real_af_antes')
        objetivo_af_actual = data.get('objetivo_af_actual') 
        ficha_usuario = data.get('ficha_usuario')
        año_fiscal = data.get('año_fiscal')
        real_af_actual = data.get('real_af_actual') 
        cumplimiento = data.get('cumplimiento')
        desempeno = data.get('desempeno')   
        Indicadores_full = data.get('numero_enviado')
        if Indicadores_full:
            user = current_user
            ficha = current_user.ficha
            rest = consultar_sap(ficha)
            
            ficha_superv = rest[0]['fichaSuperv']
            ficha_superv_corta =0
            if len(ficha_superv) >= 5 and ficha_superv[4] != '0':
                ficha_superv_corta = ficha_superv[4:]
            else:
                ficha_superv_corta = ficha_superv[-4:]
            supervisor= User.get_by_ficha(ficha_superv_corta)
            indicadores_cargados(user, supervisor)
            print(f"el numero de indicadores esta full? {data.get('numero_enviado')}")   
        
        Indicadores.create_indicador(
            nombre_indicador=nombre_indicador,
            tendencia= tendencia,
            peso= peso,
            real_af_antes= real_af_antes,
            objetivo_af_actual= objetivo_af_actual,
            ficha_usuario = ficha_usuario, 
            año_fiscal= año_fiscal
            
        )
        print('todo bien mi rey')
        flash("Indicador registrado exitosamente", "success")
        return jsonify({"success": True, "message": "Indicador registrado exitosamente"}), 200

    except Exception as e:
        flash("Hubo un error Registrando el Indicador", "error")
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": f"Error inesperado: {str(e)}"}), 500
    
    
    
    
@page.route('/app_crm/actualizarTelefono', methods=['POST'])
@login_required
def actualizarTelefono():
    data = request.get_json()
    ficha = current_user.ficha
    try:
        nuevo_telefono = data.get('telefono')     
        User.actualizar_telefono(ficha=ficha, nuevo_telefono= nuevo_telefono)

        print('todo bien mi rey')
        flash("Usuario editado exitosamente", "success")
        return jsonify({"success": True, "message": "Indicador registrado exitosamente"}), 200

    except Exception as e:
        flash("Paso algo malo papá", "error")
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": f"Error inesperado: {str(e)}"}), 500    




@page.route('/app_crm/editarIndicador', methods=['POST'])
@login_required
def editar_indicador():
    data = request.get_json()
    try:
        nombre_indicador = data.get('nombre_indicador')
        tendencia = data.get('tendencia')
        peso = data.get('peso')
        real_af_antes= data.get('real_af_antes')
        objetivo_af_actual = data.get('objetivo_af_actual') 
        ficha_usuario = data.get('ficha_usuario')
        año_fiscal = data.get('año_fiscal')
        real_af_actual = data.get('real_af_actual') 
        cumplimiento = data.get('cumplimiento')
        desempeno = data.get('desempeno')  
        pivote = data.get('pivote')  
        
        print(f"nombre {nombre_indicador}")
        id = data.get('id')  

        Indicadores.update_indicador(
            id= id,
            nombre_indicador=nombre_indicador,
            tendencia= tendencia,
            peso= peso,
            real_af_antes= real_af_antes,
            objetivo_af_actual= objetivo_af_actual,
            real_af_actual= real_af_actual,
            cumplimiento = cumplimiento,
            desempeno = desempeno,
            ficha_usuario = ficha_usuario, 
            año_fiscal= año_fiscal
        )
        print('todo bien mi rey')
        flash("Indicador editado exitosamente", "success")
        return jsonify({"success": True, "message": "Indicador registrado exitosamente"}), 200

    except Exception as e:
        flash("Ocurrió un error editando el indicador", "error")
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": f"Error inesperado: {str(e)}"}), 500


@page.route('/app_crm/consultarStatus', methods=['POST'])
def consultarStatus():
    try:
        estado_actual_backend= ''
        variable = Indicadores.existe_indicador_abierto()
        estados = User.obtener_todos_los_estados_gdd()
        print(estados)
        estado_user = ''
        if("AFACTIVO" in estados):
            estado_user = "AFACTIVO"

        elif estados.count("Abierto") > len(estados) / 2:
            estado_user = "Abierto"
        elif estados.count("Cerrado") > len(estados) / 2:
            estado_user = "Cerrado"
            
            
        if variable:
            estado_actual_backend = 'Abierto'
        else:
            estado_actual_backend = 'Cerrado'
        print(estado_actual_backend)
            
        print(f"estado actual {estado_user}")

        print('todo bien mi rey')
        return jsonify({
            "success": True,
            "message": "Cronograma enviado",
            "status_actual_indicadores": estado_actual_backend,
            "status_user": estado_user
        }), 200

    except Exception as e:
        flash("Ocurrió un error", "error")
        print(f"Error: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error inesperado: {str(e)}"
        }), 500

@page.route('/app_crm/consultarStatusConFicha', methods=['POST'])
def consultar_status_con_ficha():
    try:
        datos = request.get_json()
        

        if datos and 'numero' in datos:
            ficha = datos['numero']
            estado= User.estado_gdd(ficha)
            print(estado)
            
            # Devolver solo la respuesta específica para este caso
            return jsonify({
                "success": True,
                "message": "Procesamiento específico completado",
                "estado": estado,
                "de la ficha": ficha
            }), 200

    except Exception as e:
        flash("Ocurrió un error", "error")
        print(f"Error: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error inesperado: {str(e)}"
        }), 500



"""
Función para Elimimnar un indicador pa
"""
@page.route('/app_crm/eliminarIndicador', methods=['POST'])
@login_required
def eliminar_indicador():
    print('asdsa')
    data = request.get_json()
    try:
        
        id = data.get('id')  
        if isinstance(id, str):
            id = id.strip()
        print(id)

        
        Indicadores.delete_element(
            id= id,

        )
        print('todo bien mi rey')
        flash("Indicador Eliminado", "success")
        return jsonify({"success": True, "message": "Indicador Eliminmado exitosamente"}), 200

    except Exception as e:
        flash("Ocurrió un error al eliminar el indicador ", "error")
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": f"Error inesperado: {str(e)}"}), 500
    

    
"""
Para agregar registro de cronograma
"""
@page.route('/app_crm/agregarCronograma', methods=['POST'])
def agregarCronograma():
    datos = request.get_json()
    try:
        indicador_id = datos.get('id')
        data = datos.get('data')


        resultado = Cronograma.create_cronograma(
            lista=data,
            indicador_id=indicador_id
        )

        if resultado is None:
            flash("Ya existe un cronograma para este indicador", "error")
        

        print('todo bien mi rey')
        flash("Cronograma enviado exitosamente", "success")
        return jsonify({"success": True, "message": "Cronograma enviado"}), 200

    except Exception as e:
        flash("Ocurrió un error", "error")
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": f"Error inesperado: {str(e)}"}), 500
"""
def encontrar_subordinados_recursivo(participantes, ficha_superior,equipo=None):
    if equipo is None:
        equipo = []
    for participante in participantes:
        if participante['fichaSuperv'] == ficha_superior:
            equipo.append({participantes})
            print(participante)
            encontrar_subordinados_recursivo(participantes, participante['pernr'],equipo)
    return equipo

def obtener_lista_equipo(participantes, ficha_superior):
    subordinados = encontrar_subordinados_recursivo(participantes, ficha_superior)
    return subordinados
"""
def encontrar_subordinados_recursivo(participantes, ficha_superior, equipo=None):
    if equipo is None:
        equipo = []
    
    # Normalizamos la ficha (eliminar ceros izquierda y convertir a string)
    ficha_superior_normalizada = str(int(ficha_superior)) if ficha_superior else None
    
    for participante in participantes:
        # Normalizamos la ficha del supervisor del participante
        ficha_superv = str(int(participante['fichaSuperv'])) if participante.get('fichaSuperv') else None
        
        # Comparamos las fichas normalizadas
        if ficha_superv == ficha_superior_normalizada:
            # Agregamos copia de todos los datos del participante
            equipo.append(participante.copy())
            
            # Llamada recursiva con la ficha del participante actual (sin normalizar aquí)
            encontrar_subordinados_recursivo(participantes, participante['pernr'], equipo)
    
    return equipo

def obtener_lista_equipo(participantes, ficha_superior):
    # Aseguramos que la ficha llegue como string (por si viene como número)
    ficha_superior_str = str(ficha_superior) if ficha_superior is not None else None
    subordinados = encontrar_subordinados_recursivo(participantes, ficha_superior_str)
    return subordinados

def consultar_cargo(ficha):
    registro = Cargos.select_by_ficha(ficha)
    #print(registro)
    return registro 

def ruta_foto_personal(numero):
        ejemplo_dir = 'app/static/img/fotos_personal'
        extensiones = ['.png', '.jpg', '.jpeg']
        num_str = str(numero)
        try:
            contenido = os.listdir(ejemplo_dir)
            for archivo in contenido:
                nombre, ext = os.path.splitext(archivo)
                if nombre == num_str and ext.lower() in extensiones:
                    return f"img/fotos_personal/{archivo}"
            #print(f"No se encontró imagen para el número {numero}")
            return None
            
        except Exception as e:
            #print(f"Error al acceder al directorio: {e}")
            return None


@page.route('/app_crm/consultarCargo', methods=['POST'])
def consultarCargo():
    datos = request.get_json()
    ficha = datos.get('ficha')
    try:
        registro = consultar_cargo(ficha)
        cargo = registro.cargo
        departamento = registro.departamento 
        print(cargo)
        return jsonify({
            "success": True,
            "message": "Cronograma enviado",
            "cargo": cargo,
            "departamento": departamento
        }), 200

    except Exception as e:
        flash("Ocurrió un error", "error")
        print(f"Error: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error inesperado: {str(e)}"
        }), 500


@page.route('/app_crm/configuracionGDD/CorreoMasivo', methods=['POST'])
def CorreoMasivo():
    datos = request.get_json()
    try:
        texto = datos.get('texto')
        print(texto)
        #lista = ['escalona9465@gmail.com', 'eliezer_chirino@corimon.com', 'eliezergach1508@gmail.com', 'alejandro_padra@corimon.com', 'alejandrop912@gmail.com', 'jose_escalona@corimon.com', 'venicia_pena@corimon.com', 'alejandropadra@protonmail.com', 'eliezerincrp@gmail.com','digitalingpadra@gmail.com', 'venicia3006@gmail.com']
        lista = User.get_by_usuarios()

        if len(texto) <=11:
            asyncio.run(cierre_gdd(lista, texto))

        else:
            asyncio.run(inicio_gdd(lista, texto))
        
        return jsonify({
            "success": True,
            "message": "Correo procesado correctamente"
        }), 200

    except Exception as e:
        flash("Ocurrió un error", "error")
        print(f"Error: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error inesperado: {str(e)}"
        }), 500

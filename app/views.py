from flask import Blueprint, current_app
from flask import send_from_directory
from flask import render_template, request, flash, redirect, url_for, abort, session, jsonify
from werkzeug.utils import secure_filename
from flask_wtf.csrf import CSRFError
from flask_login import login_user,logout_user,login_required, current_user
from .forms import LoginForm
from .forms import GestionUsers
from .forms import RegistrarUsuarios
from .forms import formgdi, RegistrarHojaVida
from .models import  User, Indicadores,HojaVida,Cronograma, Cargos, Evaluacion, Configuracion, Retroalimentacion ,ResultadoFinal
from .email import welcome_mail, Prueba_mail, inicio_gdd, cierre_gdd, aprobacion_indicadores, indicadores_cargados, Seleccionado_evaluador, procesar_notificaciones_individuales, seleccionado_par, inicio_periodo_evaluacion, inicio_etapa_dos, inicio_avance, cambio_clave, inicio_CRE
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
import threading
from threading import Thread

import app



adj_imagenes = 'app/static/img/fotos_personal/'
page = Blueprint('page', __name__)


class SAPError(Exception):
    """Excepción personalizada para errores de SAP"""
    def __init__(self, message, status_code=None):
        super().__init__(message)
        self.status_code = status_code


@page.route("/app_crm/prueba", methods=['GET', 'POST'])
def prueba():
    
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

    return 'Prueba rey'


@page.context_processor
def inject_config():
    config = Configuracion.get_data()
    return dict(config_global=config)

#======================================== MANEJO DE ERRORES====================================================================>
@page.errorhandler(CSRFError)
def handle_csrf_error(e):
    flash('La sesión ha expirado. Por favor inicie sesión nuevamente.', 'warning')
    return redirect(url_for('.login'))

@page.errorhandler(CSRFError)
def handle_csrf_error(e):
    flash('La sesión ha expirado. Por favor inicie sesión nuevamente.', 'warning')
    return redirect(url_for('.login'))

@page.app_errorhandler(SAPError)
def handle_sap_error(error):
    if error.status_code:
        print(f"Error SAP - Código HTTP: {error.status_code}")
    else:
        print(f"Error SAP: {str(error)}")
    
    flash('El servicio de SAP no está disponible. Por favor, intente más tarde.', 'error')
    return render_template("errors/500.html", error=error), 503

@page.app_errorhandler(502)
def handle_sap_error(error):

    flash('sds.', 'error')
    return render_template("errors/500.html", error=error), 502

@page.app_errorhandler(Exception)
def handle_all_errors(error):
    print(f"Error: {type(error).__name__} - {str(error)}")
    
    if isinstance(error, CSRFError):
        flash('La sesión ha expirado. Por favor inicie sesión nuevamente.', 'warning')
        return redirect(url_for('.login'))
    
    flash('Ha ocurrido un error inesperado. Por favor, intente nuevamente.', 'error')
    return render_template("errors/500.html"), 500
#======================================== FIN MANEJO DE ERRORES=================================================================<



@page.route("/app_crm/error500", methods=['GET', 'POST'])
def error500():

    return render_template("errors/500.html")



@page.route("/app_crm/cambio_contraseña", methods=['GET', 'POST'])
def Cambio_contraseña():
    form = LoginForm()
    ficha = form.ficha.data
    if request.method == 'POST':
        if ficha :
            print(ficha)
            existe = User.get_by_ficha(ficha)

            if existe:
                contrasena = generar_contrasena_aleatoria()
                print(contrasena)
                User.actualizar_password(ficha,contrasena)
                usuario = existe
                print(usuario)
                flash(f'Contraseña cambiada exitosamente. Estimado(a) {usuario.nombre} {usuario.apellido}, por favor revise su correo electrónico para obtener su nueva contraseña.', 'success')
                cambio_clave(usuario, contrasena)
                return redirect(url_for('.login'))
            else:
                flash('La ficha ingresada no existe en el sistema.', 'error')

        else:
            flash('Por favor ingrese su ficha.', 'error') 

    return render_template("auth/cambio_clave.html", form=form)


#========================================= MANEJO DE SESION ===========================================================================
@page.route('/app_crm/logout')
def logout():
    logout_user()
    flash(LOGOUT)
    return redirect(url_for('.login'))

def procesar_ficha(ficha):
    """
    Procesa un número de ficha para extraer una parte específica.

    Args:
        ficha (str): El número de ficha a procesar.

    Returns:
        str: La parte procesada de la ficha.
    """
    if len(ficha) >= 5 and ficha[4] != '0':
        ficha_procesada = ficha[4:]
    else:
        ficha_procesada = ficha[-4:]
    return ficha_procesada

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
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)
    
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
            flash("Las contraseñas no coinciden.", "error")
        else:
            flash("Perfil actualizado correctamente.", "success")
            act = User.update_clave_telefono(ficha,clave,telefono)

            return redirect(url_for('.perfil'))      
    return render_template("auth/perfil.html", etapa_general= etapa_general, ruta_foto_personal = ruta_foto_personal, titulo="Perfil Usuario", rest=rest, usuario= usuario, ficha = ficha, form= form, consultar_cargo = consultar_cargo)

@page.route("/app_crm/usuario/agregar", methods=['GET', 'POST'])
@login_required 
def add_user():
    form = RegistrarUsuarios() 
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)
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
                welcome_mail(user, contrasena)
                flash("Usuario registrado exitosamente", "success")
                return redirect(url_for('.add_user'))  
            else:
                #Actualizar
                user= User.update(ficha_formulario, password,email,nivel_usuario,telefono)

                flash("Usuario editado exitosamente", "success")
                return redirect(url_for('.add_user'))

            #print(contrasena)
            #welcome_mail(user, contrasena)        
            #Prueba_mail(user, "22/05/2025 hasta 22/05/2025")       
        except Exception as e:
            if "UNIQUE constraint failed" in str(e):
                flash("Error: Ya existe un usuario con estos datos", "error")
            else:
                flash(f"Error inesperado: {str(e)}", "error")

            return redirect(url_for('.add_user'))  

    return render_template("auth/register_user.html",etapa_general= etapa_general, ruta_foto_personal= ruta_foto_personal, consultar_cargo= consultar_cargo,  titulo="Perfil Usuario", usuario=usuario, rest=rest, form=form, ficha = ficha)




@page.route("/app_crm/usuario/agregar_admin", methods=['GET', 'POST'])
def add_user_admin():
    form = RegistrarUsuarios() 
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)
    #usuario = current_user
    #ficha = current_user.ficha
    """f usuario.nivel_usuario == "Medio":
        return redirect(url_for('.menu'))  """
    #rest = consultar_sap(ficha)
        
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
                welcome_mail(user, contrasena)
                flash("Usuario registrado exitosamente", "success")
                return redirect(url_for('.add_user'))  
            else:
                #Actualizar
                user= User.update(ficha_formulario, password,email,nivel_usuario,telefono)

                flash("Usuario editado exitosamente", "success")
                return redirect(url_for('.add_user'))

            #print(contrasena)
            #welcome_mail(user, contrasena)        
            #Prueba_mail(user, "22/05/2025 hasta 22/05/2025")       
        except Exception as e:
            if "UNIQUE constraint failed" in str(e):
                flash("Error: Ya existe un usuario con estos datos", "error")
            else:
                flash(f"Error inesperado: {str(e)}", "error")

            return redirect(url_for('.add_user'))  

    return render_template("auth/register_user_admin.html", etapa_general=etapa_general, consultar_cargo= consultar_cargo,  titulo="Perfil Usuario", form=form, ruta_foto_personal = ruta_foto_personal)


@page.route("/app_crm/usuarios", methods=['GET'] )
@login_required
def participantes():
    usuario = current_user
    ficha = current_user.ficha
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    año_fiscal = variables_configuracion_global.año_fiscal
    
    etapa_general = int(etapa_general)
    if usuario.nivel_usuario == "Medio":
        return redirect(url_for('.menu'))  

    rest = consultar_sap(ficha)

    participantes = participantes_gdd()
    print(participantes)
    participantes_procesados = []
    
    


    for participante in participantes:
        ficha_participante = participante['pernr'].lstrip('0')
        indicadores = Indicadores.obtener_indicador_usuario(ficha_participante)
        aprobados = sum(1 for ind in indicadores if ind.status_aprobacion == 'A')
        
        # Calcular status de indicadores: ESTO ES PARA VER SI TIENE TODOS SUS INDICADORES APROBADOS O NEL
        if len(indicadores) < 3:
            data_status = "incompleto"
        elif len(indicadores) == 3 and aprobados == 3:
            data_status = "aprobado"
        elif len(indicadores) == 3 and aprobados < 3:
            data_status = "espera"
        

        check = None
        comentarios_colaborador = None
        comentarios_supervisor = None
        retroalimentacion_equipos = Retroalimentacion.obtener_por_ficha_y_año(ficha_participante, año_fiscal)
        if retroalimentacion_equipos:
            check = retroalimentacion_equipos.feedback
            comentarios_colaborador = retroalimentacion_equipos.comentarios_colaborador
            comentarios_supervisor = retroalimentacion_equipos.comentarios_supervisor

        
        resultados_evaluacion = Evaluacion.obtener_resultados(ficha_participante, año_fiscal)
        
        evaluaciones_pendientes = []
        evaluacion_completada = True
        supervisor_completado = False
        subordinado_completado = False
        par_completado = False
        autoeval_completado = False
        
        # Contadores para cada tipo de evaluación
        autoeval_count = 0
        supervisor_count = 0
        par_count = 0
        subordinado_count = 0
        
        if resultados_evaluacion and isinstance(resultados_evaluacion, list):
            for competencia in resultados_evaluacion:
                if competencia.get('autoeval') and competencia['autoeval'].strip():
                    autoeval_completado = True
                    autoeval_count += 1
                
                if competencia.get('superv_eval') and competencia['superv_eval'].strip():
                    supervisor_completado = True
                    supervisor_count += 1
                
                if competencia.get('par_eval') and competencia['par_eval'].strip():
                    par_completado = True
                    par_count += 1
                    
                if competencia.get('subordinado_eval') and competencia['subordinado_eval'].strip():
                    subordinado_completado = True
                    subordinado_count += 1
            
            # Determinar qué evaluaciones faltan
            if not autoeval_completado:
                evaluaciones_pendientes.append('Autoevaluación')
                evaluacion_completada = False
                
            if not supervisor_completado:
                evaluaciones_pendientes.append('Evaluación del Supervisor')
                evaluacion_completada = False
                
            if participante['nivel'] == 'I':
                if not subordinado_completado:
                    evaluaciones_pendientes.append('Evaluación del Subordinado')
                    evaluacion_completada = False
                    
                if not par_completado:
                    evaluaciones_pendientes.append('Evaluación del Par')
                    evaluacion_completada = False
            
            # Calcular estadísticas adicionales
            total_competencias = len(resultados_evaluacion)
            
            print(f"para la ficha {ficha_participante} : {evaluaciones_pendientes}")
            
            # Extraer información de desempeño
            desempeno_valores = [c.get('desempeno_eval', '') for c in resultados_evaluacion if c.get('desempeno_eval')]
            cumplimiento_valores = [c.get('cumplimiento_eval', '') for c in resultados_evaluacion if c.get('cumplimiento_eval')]
            
        else:
            evaluaciones_pendientes = ['No tiene evaluación creada']
            evaluacion_completada = False
            total_competencias = 0
            desempeno_valores = []
            cumplimiento_valores = []
            autoeval_count = 0
            supervisor_count = 0
            par_count = 0
            subordinado_count = 0
        
            # Crear diccionario con el resumen de evaluaciones
        resumen_evaluacion = {
            'tiene_evaluacion': bool(resultados_evaluacion),
            'autoeval_completado': autoeval_completado,
            'supervisor_completado': supervisor_completado,
            'subordinado_completado': subordinado_completado,
            'par_completado': par_completado,
            'autoeval_count': autoeval_count,
            'supervisor_count': supervisor_count,
            'subordinado_count': subordinado_count,
            'par_count': par_count,
            'total_competencias': total_competencias,
            'desempeno_valores': desempeno_valores,
            'cumplimiento_valores': cumplimiento_valores,
            'evaluacion_id': resultados_evaluacion[0].get('evaluacion_id') if resultados_evaluacion else None
        }
        
        participante_procesado = {
            **participante,  
            'ficha_participante': ficha_participante,
            'indicadores_count': len(indicadores),
            'aprobados_count': aprobados,
            'data_status': data_status,
            'comentarios_supervisor': comentarios_supervisor,
            'check': check,
            'comentarios_colaborador': comentarios_colaborador,
            #  DATOS DE EVALUACIÓN PROCESADOS
            'resultados_evaluacion_raw': resultados_evaluacion,  
            'resumen_evaluacion': resumen_evaluacion,  
            'evaluaciones_pendientes': evaluaciones_pendientes,
            'evaluacion_completada': evaluacion_completada,
            'total_evaluaciones_pendientes': len(evaluaciones_pendientes)
        }
        
        participantes_procesados.append(participante_procesado)
        
        
        
    
    #print(participantes)
    return render_template('/auth/list_users.html', etapa_general= etapa_general, participantes_procesados= participantes_procesados, ruta_foto_personal= ruta_foto_personal, año_fiscal= año_fiscal,  resultados_evaluacion = Evaluacion.obtener_resultados,  obtener_indicador_usuario = Indicadores.obtener_indicador_usuario,  consultar_cargo= consultar_cargo, ficha = ficha,  titulo= "participantes", participantes = participantes,usuario=usuario,rest=rest)


@page.route("/app_crm/detalles_usuarios/<int:ficha_get>", methods=['GET', 'POST'])
@page.route("/app_crm/detalles_usuarios/<int:ficha_get>/<string:af_seleccionado>", methods=['GET', 'POST'])
@login_required
def detalles_usuarios(ficha_get, af_seleccionado=None):
    variables_configuracion_global = Configuracion.get_data()
    sin_equipo = False
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)
    año_fiscal_actual = variables_configuracion_global.año_fiscal
    
    año_fiscal = af_seleccionado if af_seleccionado else año_fiscal_actual
    viendo_af_historico = af_seleccionado is not None and af_seleccionado != año_fiscal_actual

    
    usuario = current_user
    if usuario.nivel_usuario == "Medio":
        return redirect(url_for('.menu'))
    
    resultados_usuario = ResultadoFinal.query.filter_by(ficha_usuario=ficha_get).all()
    años_disponibles = sorted(
        {r.año_fiscal for r in resultados_usuario if r.año_fiscal},
        reverse=True
    )
    
    if año_fiscal_actual not in años_disponibles:
        años_disponibles.insert(0, año_fiscal_actual)

    usuario_dueño_indicador = consultar_sap(ficha_get)
    ficha = current_user.ficha
    rest = consultar_sap(ficha)

    # Asignar supervisor a la evaluación del dueño (si no existe aún)
    ficha_supervisor = procesar_ficha(usuario_dueño_indicador[0]['fichaSuperv'])
    evaluacion = Evaluacion.asignar_supervisor(
        ficha_usuario=ficha_get,
        año_fiscal=año_fiscal,
        ficha_supervisor=ficha_supervisor
    )

    # Indicadores del usuario, filtrados por año fiscal activo
    indicadores = Indicadores.obtener_indicador_usuario(ficha_get)
    indicadores_filtrados = []
    for indicador in indicadores:
        if indicador.año_fiscal == año_fiscal or \
            (indicador.año_fiscal == "20252026" and año_fiscal == "AF26"):
            indicadores_filtrados.append(indicador)

    total_peso = sum(float(i.peso) for i in indicadores_filtrados if i.peso)
    total_cumplimiento = round(
        sum(float(i.cumplimiento) for i in indicadores_filtrados if i.cumplimiento),
        2
    )

    # Participantes GDD (para colaboradores/equipo y asignación de evaluadores)
    participantes = participantes_gdd()

    colaboradores = obtener_colaboradores_directos(
        participantes=participantes,
        ficha_superior=usuario_dueño_indicador[0]['fichaSuperv']
    )
    if usuario_dueño_indicador[0]['nivel'] == 'I':
        colaboradores = obtener_colaboradores_mismo_nivel(participantes, ficha_get)
    colaboradores_json = json.dumps(colaboradores, ensure_ascii=False)

    equipo = obtener_colaboradores_directos(participantes, ficha_get)
    if len(equipo) == 0 and usuario_dueño_indicador[0]['nivel'] == 'I':
        sin_equipo = True
        print("si, este pana no tiene equipo ")
        equipo = [p.copy() for p in participantes]
        flash('El participante no tiene colaboradores directos. Puedes seleccionar de todos los participantes disponibles.', 'info')
    equipo_json = json.dumps(equipo, ensure_ascii=False)

    # Registro de evaluación del usuario (para mostrar par/subordinado asignados)
    usuario_par = None
    usuario_subordinado = None
    nombre_apellido_usuario_par = None
    nombre_apellido_usuario_subordinado = None
    registro_evaluacion = Evaluacion.obtener_evaluaciones_por_usuario(
        ficha_usuario=ficha_get
    )

    if registro_evaluacion:
        if registro_evaluacion.par_evaluador:
            usuario_par = User.get_by_ficha(registro_evaluacion.par_evaluador)
            if not usuario_par:
                usuario_par_from_sap = consultar_sap(registro_evaluacion.par_evaluador)
                nombre_apellido_usuario_par = usuario_par_from_sap[0]['ename']

        if registro_evaluacion.subordinado_evaluador:
            usuario_subordinado = User.get_by_ficha(registro_evaluacion.subordinado_evaluador)
            if not usuario_subordinado:
                usuario_subordinado_from_sap = consultar_sap(registro_evaluacion.par_evaluador)
                nombre_apellido_usuario_subordinado = usuario_subordinado_from_sap[0]['ename']

    # ============================================================
    # DATOS DE ETAPA 2 (SOLO LECTURA PARA RH)
    # ============================================================
    cumplimientos = {f'numero_{i}': None for i in range(1, 6)}
    autoevaluaciones = {f'numero_{i}': None for i in range(1, 6)}
    supervisor_evaluaciones = {f'numero_{i}': None for i in range(1, 6)}
    par_evaluaciones = {f'numero_{i}': None for i in range(1, 6)}
    subordinado_eval = {f'numero_{i}': None for i in range(1, 6)}
    desempeños = {f'numero_{i}': None for i in range(1, 6)}

    total_desempeño = ""
    retroalimentacion_resultados = ""
    evaluacion_completada = True

    if etapa_general == 2 or viendo_af_historico:
        resultados = Evaluacion.obtener_resultados(
            ficha_usuario=ficha_get,
            año_fiscal=año_fiscal
        )

        actualizar_diccionario_evaluaciones(autoevaluaciones, resultados, 'autoeval')
        actualizar_diccionario_evaluaciones(supervisor_evaluaciones, resultados, 'superv_eval')
        actualizar_diccionario_evaluaciones(par_evaluaciones, resultados, 'par_eval')
        actualizar_diccionario_evaluaciones(subordinado_eval, resultados, 'subordinado_eval')
        actualizar_diccionario_evaluaciones(cumplimientos, resultados, 'cumplimiento_eval')
        actualizar_diccionario_evaluaciones(desempeños, resultados, 'desempeno_eval')

        registro_eval_etapa2 = Evaluacion.obtener_evaluaciones_por_usuario(
            ficha_usuario=ficha_get,
            año_fiscal=año_fiscal
        )
        if registro_eval_etapa2:
            total_desempeño = registro_eval_etapa2.total

        retroalimentacion_resultados = Retroalimentacion.obtener_por_ficha_y_año(
            ficha_usuario=ficha_get,
            año_fiscal=año_fiscal
        )

        # Determinar si la evaluación está completada (para mostrar/ocultar bloques dependientes)
        autoeval_completado = False
        supervisor_completado = False
        par_completado = False
        subordinado_completado = False

        if resultados and isinstance(resultados, list):
            for competencia in resultados:
                if competencia.get('autoeval') and competencia['autoeval'].strip():
                    autoeval_completado = True
                if competencia.get('superv_eval') and competencia['superv_eval'].strip():
                    supervisor_completado = True
                if competencia.get('par_eval') and competencia['par_eval'].strip():
                    par_completado = True
                if competencia.get('subordinado_eval') and competencia['subordinado_eval'].strip():
                    subordinado_completado = True

            if not autoeval_completado or not supervisor_completado:
                evaluacion_completada = False

            if usuario_dueño_indicador[0].get('nivel') == 'I':
                if not par_completado or not subordinado_completado:
                    evaluacion_completada = False
        else:
            evaluacion_completada = False

    # ============================================================
    # MANEJO DE POST (RH puede editar estado GDD e indicadores)
    # ============================================================
    if request.method == 'POST':
        lista_ids = []
        datos = request.get_json()

        # Caso 1: datos es un diccionario con 'accion' (ej: actualizar estado GDD)
        if isinstance(datos, dict) and 'accion' in datos:
            accion = datos['accion']
            print(f"Acción recibida: {accion}")

            if accion == 'actualizar' and 'estado' in datos:
                nuevo_estado = datos['estado']
                print(f"Actualizando estado a: {nuevo_estado}")
                User.update_estado_gdd(ficha_get, nuevo_estado)
                return jsonify({"status": "ok", "message": f"Estado actualizado a {nuevo_estado}"})

            return jsonify({"status": "ok", "message": f"Acción {accion} procesada"})

        # Caso 2: datos es una lista (abrir/cerrar indicadores)
        elif isinstance(datos, list) and len(datos) > 0:
            aprobacion = None
            for item in datos:
                if isinstance(item, dict) and 'id' in item and 'estado' in item:
                    id = item['id']
                    aprobacion = item['estado']
                    lista_ids.append(id)

            if lista_ids and aprobacion is not None:
                if aprobacion == "Cerrado":
                    Indicadores.actualizar_indicadores_usuario(ficha_get, lista_ids, nuevo_status="Cerrado")
                else:
                    Indicadores.actualizar_indicadores_usuario(ficha_get, lista_ids, nuevo_status="Abierto")
                
                config = Configuracion.get_data()
                actualizar_resultado_parcial(ficha_get, config.año_fiscal, columna='indicadores')


                return jsonify({"status": "ok", "message": f"Indicadores actualizados con estado {aprobacion}"})
            else:
                return jsonify({"status": "error", "message": "No se pudo procesar la lista de indicadores"})

        return jsonify({"status": "error", "message": "Formato de datos no reconocido"})

    return render_template(
        '/auth/detalles_list_user.html',
        sin_equipo=sin_equipo,
        etapa_general=etapa_general,
        nombre_apellido_usuario_subordinado=nombre_apellido_usuario_subordinado,
        nombre_apellido_usuario_par=nombre_apellido_usuario_par,
        usuario_subordinado=usuario_subordinado,
        usuario_par=usuario_par,
        registro_evaluacion=registro_evaluacion,
        equipo=equipo,
        equipo_json=equipo_json,
        colaboradores=colaboradores,
        colaboradores_json=colaboradores_json,
        consultar_cargo=consultar_cargo,
        titulo="Detalles",
        usuario=usuario,
        rest=rest,
        participantes=participantes,
        indicadores=indicadores_filtrados,
        total_cumplimiento=total_cumplimiento,
        total_peso=total_peso,
        ficha_get=ficha_get,
        ficha=ficha,
        ruta_foto_personal=ruta_foto_personal,
        usuario_dueño_indicador=usuario_dueño_indicador,
        recortar_ficha=recortar_ficha,
        consultar_sap=consultar_sap,
        # Variables de etapa 2 (solo lectura)
        autoevaluaciones=autoevaluaciones,
        supervisor_evaluaciones=supervisor_evaluaciones,
        par_evaluaciones=par_evaluaciones,
        subordinado_eval=subordinado_eval,
        cumplimientos=cumplimientos,
        desempeños=desempeños,
        total_desempeño=total_desempeño,
        retroalimentacion_resultados=retroalimentacion_resultados,
        evaluacion_completada=evaluacion_completada,
        # Alias para que el HTML copiado de detalles_gestion_equipo funcione sin cambios
        usuario_dueño_evaluacion=usuario_dueño_indicador,
        años_disponibles=años_disponibles,
        año_fiscal_seleccionado=año_fiscal,
        viendo_af_historico=viendo_af_historico,
    )
    
def validar_flujo_completo_usuario(ficha_participante, año_fiscal, nivel_usuario):
    """
    Valida si un usuario tiene el flujo GDD completo.
    
    El orden de validación respeta el flujo real del proceso:
        1. Indicadores (mínimo 3 aprobados)
        2. Evaluación de competencias (autoeval + supervisor; par/subordinado si nivel I)
        3. Retroalimentación (ambos comentarios)
    
    
    Usado por el endpoint api_sincronizar_tabla para refrescar resultados_finales
    bajo demanda desde el botón 'Actualizar datos' en tabla_reporte.
    """
    formatos_año = [año_fiscal]
    if año_fiscal.startswith("AF"):
        año_num = int(año_fiscal[2:])
        formatos_año.append(f"20{año_num-1}20{año_num:02d}")
    else:
        formatos_año.append(f"AF{año_fiscal[6:8]}")
    
    # ── PASO 1 del flujo: INDICADORES (mínimo 3 aprobados) ──
    indicadores = Indicadores.query.filter(
        Indicadores.ficha_usuario == ficha_participante,
        Indicadores.año_fiscal.in_(formatos_año)
    ).all()
    indicadores_aprobados = [i for i in indicadores if i.status_aprobacion == 'A']
    if len(indicadores) < 3 or len(indicadores_aprobados) < 3:
        return {'completo': False, 'motivo': f'Indicadores incompletos ({len(indicadores_aprobados)}/{len(indicadores)} aprobados)'}
    
    # ── PASO 2 del flujo: EVALUACIÓN DE COMPETENCIAS ──
    resultados_eval = Evaluacion.obtener_resultados(ficha_participante, año_fiscal)
    if not resultados_eval or not isinstance(resultados_eval, list):
        return {'completo': False, 'motivo': 'Sin evaluación de competencias'}
    
    autoeval_ok = all(c.get('autoeval') and c['autoeval'].strip() for c in resultados_eval)
    superv_ok   = all(c.get('superv_eval') and c['superv_eval'].strip() for c in resultados_eval)
    if not autoeval_ok:
        return {'completo': False, 'motivo': 'Autoevaluación incompleta'}
    if not superv_ok:
        return {'completo': False, 'motivo': 'Evaluación del supervisor incompleta'}
    
    if nivel_usuario == 'I':
        par_ok = all(c.get('par_eval') and c['par_eval'].strip() for c in resultados_eval)
        sub_ok = all(c.get('subordinado_eval') and c['subordinado_eval'].strip() for c in resultados_eval)
        if not par_ok:
            return {'completo': False, 'motivo': 'Evaluación de par incompleta (nivel I)'}
        if not sub_ok:
            return {'completo': False, 'motivo': 'Evaluación de subordinado incompleta (nivel I)'}
    
    # ── PASO 3 del flujo: RETROALIMENTACIÓN (ambos comentarios) ──
    retro = Retroalimentacion.obtener_por_ficha_y_año(ficha_participante, año_fiscal)
    if not retro:
        return {'completo': False, 'motivo': 'Sin retroalimentación creada'}
    if not retro.comentarios_supervisor or not retro.comentarios_colaborador:
        return {'completo': False, 'motivo': 'Falta comentario del supervisor o del colaborador'}
    
    # ── 4. CÁLCULO DE TOTALES (solo si pasó todos los pasos) ──
    registro_eval = Evaluacion.obtener_evaluaciones_por_usuario(
        ficha_usuario=ficha_participante,
        año_fiscal=año_fiscal
    )
    raw_total = registro_eval.total if registro_eval else None
    
    try:
        safe_desempeño = float(raw_total) if raw_total not in (None, '', '---', 0) else 0
    except (ValueError, TypeError):
        safe_desempeño = 0
    
    safe_cumplimiento = round(
        sum(float(i.cumplimiento) for i in indicadores_aprobados if i.cumplimiento),
        2
    )
    total_final = round(safe_desempeño + safe_cumplimiento, 1)
    return {
        'completo': True,
        'motivo': 'OK',
        'safe_desempeño': safe_desempeño,
        'safe_cumplimiento': safe_cumplimiento,
        'total_final': total_final
    }

def actualizar_resultado_parcial(ficha_participante, año_fiscal, columna):
    """
    Actualiza la tabla resultados_finales de forma incremental.
    
    Se llama cada vez que el usuario modifica algo en una de las tres etapas del flujo:
        - 'indicadores'      → después de crear/editar/eliminar/aprobar indicadores
        - 'competencias'     → después de guardar evaluación de competencias
        - 'retroalimentacion' → después de guardar comentarios
    
    Lógica:
        1. Recalcula y guarda SOLO la columna afectada.
        2. Revalida todo el flujo.
        3. Si cumple completo → marca enviado_sap=True (y el flujo normal ya envió a SAP en funcion_verificacion_enviar).
        4. Si no cumple → mantiene enviado_sap=False.
    """
    try:

        usuario = User.get_by_ficha(ficha_participante)
        if not usuario:
            print(f" Usuario {ficha_participante} no existe en DB")
            return
        
        filial = usuario.filial or 'N/A'
        
        try:
            rest = consultar_sap(ficha_participante)
            nivel = rest[0].get('nivel') if rest else None
        except Exception as e:
            print(f" No se pudo obtener nivel de SAP para ficha {ficha_participante}: {e}")
            nivel = None
        
        # Formatos de año fiscal equivalentes
        formatos_año = [año_fiscal]
        if año_fiscal.startswith("AF"):
            año_num = int(año_fiscal[2:])
            formatos_año.append(f"20{año_num-1}20{año_num:02d}")
        

        if columna == 'indicadores':
            indicadores = Indicadores.query.filter(
                Indicadores.ficha_usuario == ficha_participante,
                Indicadores.año_fiscal.in_(formatos_año)
            ).all()
            total_ind = round(sum(float(i.cumplimiento) for i in indicadores if i.cumplimiento), 2)
            ResultadoFinal.actualizar_columna(
                ficha_usuario=ficha_participante,
                año_fiscal=año_fiscal,
                columna='total_indicadores',
                valor=total_ind,
                filial=filial,
                nivel=nivel
            )
            print(f"Actualizado total_indicadores={total_ind} para ficha {ficha_participante}")
        
        elif columna == 'competencias':
            registro_eval = Evaluacion.obtener_evaluaciones_por_usuario(
                ficha_usuario=ficha_participante
            )
            raw_total = registro_eval.total if registro_eval else 0
            safe_desempeño = 0 if (raw_total in (None, '', 0, '---')) else raw_total
            ResultadoFinal.actualizar_columna(
                ficha_usuario=ficha_participante,
                año_fiscal=año_fiscal,
                columna='total_competencias',
                valor=safe_desempeño,
                filial=filial,
                nivel=nivel
            )
            print(f"Actualizado total_competencias={safe_desempeño} para ficha {ficha_participante}")
        
        elif columna == 'retroalimentacion':
            # La retroalimentación no tiene columna propia en resultados_finales,
            # pero afecta si el flujo está completo → ya se maneja abajo.
            print(f"Retroalimentación registrada para ficha {ficha_participante}")
        
        else:
            print(f"Columna no reconocida: {columna}")
            return
        
        # ── Revalidar el flujo completo y actualizar enviado_sap ──
        validacion = validar_flujo_completo_usuario(
            ficha_participante=ficha_participante,
            año_fiscal=año_fiscal,
            nivel_usuario=nivel
        )
        
        registro = ResultadoFinal.query.filter_by(
            ficha_usuario=ficha_participante,
            año_fiscal=año_fiscal
        ).first()
        
        if registro:

            if not validacion['completo']:
                registro.enviado_sap = False
                print(f" Ficha {ficha_participante}: no cumple flujo aún → enviado_sap=False ({validacion['motivo']})")
    
    except Exception as e:
        print(f"Error en actualizar_resultado_parcial ({columna}) para ficha {ficha_participante}: {e}")

def funcion_verificacion_enviar(usuario, año_fiscal):
    """
    SOLO envía a SAP si el flujo completo pasa validación.
    
    Retorna True si envió a SAP, False si solo actualizó localmente.
    """
    ficha_participante = usuario[0]['pernr'].lstrip('0')
    nivel_usuario      = usuario[0].get('nivel')
    filial             = usuario[0].get('filial') or (
        User.get_by_ficha(ficha_participante).filial if User.get_by_ficha(ficha_participante) else 'N/A'
    )
    
    formatos_año = [año_fiscal]
    if año_fiscal.startswith("AF"):
        año_num = int(año_fiscal[2:])
        formatos_año.append(f"20{año_num-1}20{año_num:02d}")
    else:
        formatos_año.append(f"AF{año_fiscal[6:8]}")
    
    # Cumplimiento: solo suma indicadores aprobados (bug fix aplicado)
    indicadores = Indicadores.query.filter(
        Indicadores.ficha_usuario == ficha_participante,
        Indicadores.año_fiscal.in_(formatos_año)
    ).all()
    indicadores_aprobados = [i for i in indicadores if i.status_aprobacion == 'A']
    safe_cumplimiento = round(
        sum(float(i.cumplimiento) for i in indicadores_aprobados if i.cumplimiento),
        2
    )
    
    # Desempeño desde evaluación de competencias
    registro_eval = Evaluacion.obtener_evaluaciones_por_usuario(
        ficha_usuario=ficha_participante,
        año_fiscal=año_fiscal
    )
    raw_total = registro_eval.total if registro_eval else None
    try:
        safe_desempeño = float(raw_total) if raw_total not in (None, '', '---', 0) else 0
    except (ValueError, TypeError):
        safe_desempeño = 0
    
    total_final = round(safe_desempeño + safe_cumplimiento, 1)
    
    print(f"Valores calculados → cumplimiento: {safe_cumplimiento}, desempeño: {safe_desempeño}, total: {total_final}")
    
    #  2: Validar si el flujo completo está OK 
    validacion = validar_flujo_completo_usuario(
        ficha_participante=ficha_participante,
        año_fiscal=año_fiscal,
        nivel_usuario=nivel_usuario
    )
    
    
    #  Si cumple todo, enviar a SAP 
    sap_exitoso = False
    if validacion['completo']:
        print('Flujo completo → enviando a SAP...')
        
        if año_fiscal.startswith("AF"):
            año_convertido = "20" + año_fiscal[2:]
        else:
            año_convertido = año_fiscal

        resp = enviar_resultados(
            ficha_participante,
            año_convertido,
            str(int(safe_cumplimiento)),
            str(int(safe_desempeño)),
            str(int(total_final))
        )
        print(f"Respuesta SAP: {resp}")
        sap_exitoso = resp.get('success', False)
    else:
        print(f"Flujo incompleto: {validacion['motivo']} → solo guardando local")
    
    ResultadoFinal.guardar(
        ficha_usuario      = ficha_participante,
        año_fiscal         = año_fiscal,
        total_competencias = safe_desempeño,
        total_indicadores  = safe_cumplimiento,
        total_final        = total_final,
        filial             = filial,
        nivel              = nivel_usuario,
        enviado_sap        = sap_exitoso
    )
    
    return jsonify({
        'sap_exitoso': sap_exitoso,
        'safe_cumplimiento': safe_cumplimiento,
        'safe_desempeño': safe_desempeño,
        'total_final': total_final,
    })


@page.route("/app_crm/gdd/menu", methods=['GET'] )
@login_required
def menu():
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)

    
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)
    año_fiscal = variables_configuracion_global.año_fiscal
    const= participantes_gdd()
    print(const)

        
        
    



    return render_template('/gdd/menu.html', etapa_general=etapa_general, consultar_cargo= consultar_cargo,  titulo= "Menu",usuario=usuario,rest=rest, ficha = ficha, ruta_foto_personal = ruta_foto_personal)


@page.route("/app_crm/gdd/dashboard_gdd", methods=['GET'] )
@login_required
def dashboard_gdd():
    #VARIABLES PARA EL LAYOUT
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)
    año_fiscal=variables_configuracion_global.año_fiscal
    #Hasta aqui VARIABLES PARA EL LAYOUT
    distribucion_performance =ResultadoFinal.distribucion_performance(año_fiscal)
    promedios = ResultadoFinal.promedio_por_filial(año_fiscal)
    promedio_global = ResultadoFinal.obtener_promedio_global(año_fiscal)
    meta_performance=0
    año_anterior = año_fiscal
    if año_fiscal.startswith("AF"):
        año_anterior = "AF" + str(int(año_fiscal[2:]) - 1)
    else:
        año_anterior = str(int(año_fiscal) - 1)
    promedio_global_anterior = ResultadoFinal.obtener_promedio_global(año_anterior)
    if promedio_global_anterior is not None:
        promedio_global_anterior= 20  # Valor fijo para pruebas
    
    promedio_nivel_filial = ResultadoFinal.promedio_por_nivel_y_filial(año_fiscal)
    print(promedio_nivel_filial)
    
    



    return render_template('/gdd/dashboard_gdd.html', promedio_nivel_filial=promedio_nivel_filial, promedio_global_anterior=promedio_global_anterior, promedio_global= promedio_global, meta_performance=meta_performance, promedios=promedios, variables_configuracion_global=variables_configuracion_global, distribucion_performance=distribucion_performance, etapa_general=etapa_general, consultar_cargo= consultar_cargo,  titulo= "dashboard",usuario=usuario,rest=rest, ficha = ficha, ruta_foto_personal = ruta_foto_personal)



@page.route("/app_crm/gdd/tablaReporte", methods=['GET'] )
@login_required
def tablaReporte():
    #VARIABLES PARA EL LAYOUT
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)
    año_fiscal=variables_configuracion_global.año_fiscal
    
    



    return render_template('/gdd/tabla_reporte.html', variables_configuracion_global=variables_configuracion_global,  etapa_general=etapa_general, consultar_cargo= consultar_cargo,  titulo= "Reporte",usuario=usuario,rest=rest, ficha = ficha, ruta_foto_personal = ruta_foto_personal)




@page.route('/app_crm/gdd/api/tabla-reporte')
@login_required
def api_tabla_reporte():
    """
    Endpoint JSON que alimenta la tabla de reportes GDD.
    
    El año fiscal se toma de la configuración activa.
    """
    
    ABREVIACIONES_FILIALES = {
        'CER': 'CERDEX C.A.',
        'CRP': 'CORIMON PINTURAS C.A.',
        'MGR': 'MONTANA GRÁFICA C.A.',
        'RES': 'RESIMON C.A.',
        'TMO': 'TIENDAS MONTANA C.A.',
        'PPV': 'PURAS PINTURAS VENEZOLANAS C.A.',
        'EEE': 'ENVACA C.A.',
        'CRM': 'CORIMON C.A.',
    }
    # Obtener año fiscal activo
    config = Configuracion.get_data()
    if not config:
        return jsonify({'error': 'No hay configuración activa'}), 500

    año_fiscal = config.año_fiscal

    # Filtros opcionales desde query params
    filial = request.args.get('filial', None)
    nivel  = request.args.get('nivel', None)
    
    if filial and filial in ABREVIACIONES_FILIALES:
        filial = ABREVIACIONES_FILIALES[filial]

    # Obtener datos estructurados
    datos = ResultadoFinal.obtener_datos_tabla_reporte(
        año_fiscal=año_fiscal,
        filial=filial,
        nivel=nivel
    )

    return jsonify({
        'año_fiscal': año_fiscal,
        'total':      len(datos),
        'datos':      datos
    })




def abreviar_filial(nombre):
    """Convierte nombre completo a abreviación (CRM, MGR, etc.)"""
    for full, abbr in ABREVIACIONES_FILIAL.items():
        if full.lower() == nombre.lower():
            return abbr
    return nombre

@page.route("/app_crm/gdd/api/dashboard_data", methods=['GET'])
@login_required
def api_dashboard_data():
    variables_configuracion_global = Configuracion.get_data()
    año_fiscal = variables_configuracion_global.año_fiscal
    filial = request.args.get('filial', None)
    nivel = request.args.get('nivel', None)       

    if filial in (None, '', 'ALL'):
        filial = None
    if nivel in (None, '', 'ALL'):                 
        nivel = None

    filial_completa = FILIAL_POR_ABR.get(filial, filial) if filial else None

    print(f"Filial solicitada: {filial}, Nivel solicitado: {nivel}")
    distribucion = ResultadoFinal.distribucion_performance(año_fiscal, filial=filial_completa, nivel=nivel)

    if filial:
        promedios_all = ResultadoFinal.promedio_por_filial(año_fiscal, nivel=nivel)
        promedios = {k: v for k, v in promedios_all.items() if abreviar_filial(k) == filial}
    else:
        promedios = ResultadoFinal.promedio_por_filial(año_fiscal, nivel=nivel)

    promedio_global = ResultadoFinal.obtener_promedio_global(año_fiscal, filial=filial_completa, nivel=nivel)

    if filial:
        promedio_nivel_filial_all = ResultadoFinal.promedio_por_nivel_y_filial(año_fiscal, nivel=nivel)
        promedio_nivel_filial = {}
        for niv, filiales_dict in promedio_nivel_filial_all.items():
            filtered = {k: v for k, v in filiales_dict.items() if abreviar_filial(k) == filial}
            if filtered:
                promedio_nivel_filial[niv] = filtered
    else:
        promedio_nivel_filial = ResultadoFinal.promedio_por_nivel_y_filial(año_fiscal, nivel=nivel)

    return jsonify({
        'distribucion_performance': distribucion,
        'promedios': promedios,
        'promedio_global': promedio_global,
        'promedio_nivel_filial': promedio_nivel_filial,
    })
    
@page.route("/app_crm/test", methods=['GET'])
@login_required
def test():
    sap_url = "http://10.207.4.68:8000/sap/bc/zhr_rest/zhrgest_recibir?sap-client=510&FICHA=00002541"
    
    payload = [{
        "pernr": "00002541", 
        "ejerfis": "2027", 
        "valor_ind": "150",
        "valor_eval": "150",
        "valor_total": "150"
    }]

    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    user_fuente = U_FUENTE
    contra_fuente = C_FUENTE
    
    try:
        response = requests.post(
            sap_url, 
            auth=HTTPBasicAuth(user_fuente, contra_fuente), 
            json=payload, 
            headers=headers,
            verify=True
        )

        print(f"Status HTTP: {response.status_code}")
        print(f"Headers de respuesta: {dict(response.headers)}")
        print(f"Texto completo: {response.text}")
        print(f"Content-Type: {response.headers.get('content-type', 'No especificado')}")
        
        # Intentar parsear como JSON
        try:
            json_response = response.json()
            print(f"JSON parseado: {json_response}")
            print(f"Tipo de JSON: {type(json_response)}")
        except ValueError:
            print("La respuesta NO es JSON válido")
        
        # Información adicional del response
        print(f"Encoding: {response.encoding}")
        print(f"URL final: {response.url}")
        
        if response.status_code == 200:
            # Retornar información completa para ver en el navegador
            return {
                "status": response.status_code,
                "headers": dict(response.headers),
                "text": response.text,
                "content_type": response.headers.get('content-type'),
                "encoding": response.encoding,
                "url": response.url
            }
        else:
            return f"Error HTTP {response.status_code}: {response.text}"
        
    except requests.RequestException as e:
        return f"Error de conexión a SAP: {str(e)}"
    

def enviar_resultados(ficha_usuario, año_fiscal, valor_ind, valor_eval, valor_total):
    # Validaciones básicas
    if not ficha_usuario or not ficha_usuario.isdigit():
        return {"success": False, "error": "Ficha usuario debe ser numérica"}
    
    if not año_fiscal or len(año_fiscal) != 4:
        return {"success": False, "error": "Año fiscal debe tener 4 dígitos"}
    
    sap_url = f"http://10.207.4.66:8000/sap/bc/zhr_rest/zhrgest_recibir?sap-client=510&FICHA=0000{ficha_usuario}"
    
    payload = [{
        "pernr": f"0000{ficha_usuario}", 
        "ejerfis": año_fiscal, 
        "valor_ind": valor_ind,
        "valor_eval": valor_eval,
        "valor_total": valor_total
    }]

    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    user_fuente = U_FUENTE
    contra_fuente = C_FUENTE
    
    try:
        response = requests.post(
            sap_url,
            auth=HTTPBasicAuth(user_fuente, contra_fuente),
            json=payload,
            headers=headers,
            timeout=30,
            verify=True
        )
        

        print(f"SAP request - Status: {response.status_code}, Ficha: {ficha_usuario}")
        
        if response.status_code == 200:
            # Intentar parsear JSON si es posible
            try:
                data = response.json()
            except ValueError:
                data = response.text
                
            return {
                "success": True,
                "status_code": response.status_code,
                "data": data
            }
        else:
            return {
                "success": False,
                "status_code": response.status_code,
                "error": f"Error HTTP {response.status_code}",
                "details": response.text[:200]  # Primeros 200 chars
            }
            
    except requests.RequestException as e:
        print(f"Error conectando a SAP: {str(e)}")
        return {
            "success": False,
            "error": "Error de conexión a SAP",
            "details": str(e)
        }
    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        return {
            "success": False,
            "error": "Error interno",
            "details": str(e)
        }
    
    


@page.route("/app_crm/gdd/Seleccionar_evaluar", methods=['GET'] )
@login_required
def Seleccionar_evaluar():
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    participantes = participantes_gdd()
    equipo = obtener_colaboradores_directos(participantes,ficha)
    
    for evaluador in equipo:
        plstx_valor = evaluador['plstx']
        if len(plstx_valor) >= 24:
            resultado_cargo = consultar_cargo(procesar_ficha(evaluador['pernr']))
            departamento_final = resultado_cargo.departamento

        else:
            departamento_final = plstx_valor
        if departamento_final:
            evaluador['plstx'] = departamento_final

    
    
    fichas_a_evaluar = Evaluacion.obtener_evaluaciones_como_evaluador(current_user.ficha)
    print(fichas_a_evaluar)
    fichas_a_evaluar_json =  json.dumps(fichas_a_evaluar, ensure_ascii=False)
    
    return render_template('/gdd/seleccionar_evaluar.html', etapa_general= etapa_general, recortar_ficha= recortar_ficha, equipo = equipo, fichas_a_evaluar= fichas_a_evaluar, fichas_a_evaluar_json = fichas_a_evaluar_json,  consultar_cargo= consultar_cargo,  titulo= "Seleccionar quien evaluar",usuario=usuario,rest=rest, ficha = ficha, procesar_ficha= procesar_ficha, ruta_foto_personal= ruta_foto_personal, consultar_sap= consultar_sap)





@page.route("/app_crm/gdd/gestion_equipo", methods=['GET'])
@page.route("/app_crm/gdd/gestion_equipo/<year_fiscal>", methods=['GET'])
@login_required
def gestion_equipo(year_fiscal=None):
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = int(variables_configuracion_global.etapa_actual)
    
    if year_fiscal is None:
        year_fiscal = variables_configuracion_global.año_fiscal  

    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    participantes = participantes_gdd()

    try:
        equipo = obtener_lista_equipo_por_af(participantes, ficha, year_fiscal)
    except Exception as e:
        print(f"Error obteniendo equipo: {e}")
        equipo = []

    # Lista de AF disponibles para el dropdown (normalizados al formato AFxx)
    def normalizar_af(af):
        if af and not af.startswith("AF"):
            return f"AF{af[6:8]}"
        return af

    años_disponibles_raw = Evaluacion.query.with_entities(
        Evaluacion.año_fiscal
    ).distinct().all()

    años_disponibles = sorted(
        {normalizar_af(a[0]) for a in años_disponibles_raw if a[0]},
        reverse=True
    )

    return render_template(
        '/gdd/gestion_equipo.html',
        etapa_general=etapa_general,
        consultar_cargo=consultar_cargo,
        titulo="Gestión de Equipo",
        usuario=usuario,
        rest=rest,
        participantes=equipo,
        ruta_foto_personal=ruta_foto_personal,
        obtener_indicador_usuario=Indicadores.obtener_indicador_usuario,
        ficha=ficha,
        año_fiscal_seleccionado=year_fiscal,
        años_disponibles=años_disponibles,
    )


@page.route("/app_crm/gdd/gestion_equipo_detalles/<int:ficha_get>", methods=['GET'])
@page.route("/app_crm/gdd/gestion_equipo_detalles/<int:ficha_get>/<year_fiscal>", methods=['GET'])
@login_required
def gestion_equipo_detalles(ficha_get, year_fiscal=None):
    if request.method == 'POST':
        user = current_user
        dueño_indicadores = User.get_by_ficha(ficha_get)
        nombre_dueño_indicador = dueño_indicadores.nombre
        apellido_dueño_indicador = dueño_indicadores.apellido
        lista_datos_correo = []
        datos = request.get_json()
        for item in datos:
            id = item['id']
            nombre = item['nombre_indicador']
            aprobacion = item['aprobacion']
            Indicadores.actualizar_aprobacion_indicadores_usuario(ficha_get, id, nuevo_status=aprobacion)
            lista_datos_correo.append({
                'nombre': nombre,
                'aprobacion': aprobacion
            })

        aprobacion_indicadores(user, nombre_dueño_indicador, apellido_dueño_indicador, lista_datos_correo, dueño_indicadores.email)
        config = Configuracion.get_data()
        actualizar_resultado_parcial(ficha_get, config.año_fiscal, columna='indicadores')

        flash("Datos recibidos", "success")
        return jsonify({'status': 'success'})


    variables_configuracion_global = Configuracion.get_data()
    etapa_general = int(variables_configuracion_global.etapa_actual)
    if year_fiscal is None:
        year_fiscal = variables_configuracion_global.etapa_actual
    año_fiscal = year_fiscal
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    usuario_dueño_indicador = consultar_sap(ficha_get)
    participantes = participantes_gdd()

    # ============================================================
    # INDICADORES FILTRADOS POR AÑO FISCAL
    # ============================================================
    indicadores = Indicadores.obtener_indicador_usuario(ficha_get)
    indicadores_filtrados = []
    for indicador in indicadores:
        if indicador.año_fiscal == año_fiscal:
            indicador.año_fiscal_display = año_fiscal
        else:
            indicador.año_fiscal_display = indicador.año_fiscal

        if indicador.año_fiscal_display == año_fiscal or \
            (indicador.año_fiscal_display == "20252026" and año_fiscal == "AF26"):
            indicadores_filtrados.append(indicador)

    total_peso = sum(float(i.peso) for i in indicadores_filtrados if i.peso)
    total_cumplimiento = round(
        sum(float(i.cumplimiento) for i in indicadores_filtrados if i.cumplimiento),
        2
    )

    # ============================================================
    # VARIABLES DE ETAPA 2 
    # ============================================================
    ficha_evaluador_supervisor = procesar_ficha(usuario_dueño_indicador[0]['fichaSuperv'])
    cumplimientos = {f'numero_{i}': None for i in range(1, 6)}
    autoevaluaciones = {f'numero_{i}': None for i in range(1, 6)}
    supervisor_evaluaciones = {f'numero_{i}': None for i in range(1, 6)}
    par_evaluaciones = {f'numero_{i}': None for i in range(1, 6)}
    subordinado_eval = {f'numero_{i}': None for i in range(1, 6)}
    desempeños = {f'numero_{i}': None for i in range(1, 6)}

    retroalimentacion_resultados = ""
    total_desempeño = ""
    estado_evaluacion = ""
    evaluacion_completada = True

    if etapa_general == 2:
        resultados = Evaluacion.obtener_resultados(
            ficha_usuario=ficha_get,
            año_fiscal=año_fiscal
        )

        actualizar_diccionario_evaluaciones(autoevaluaciones, resultados, 'autoeval')
        actualizar_diccionario_evaluaciones(supervisor_evaluaciones, resultados, 'superv_eval')
        actualizar_diccionario_evaluaciones(par_evaluaciones, resultados, 'par_eval')
        actualizar_diccionario_evaluaciones(subordinado_eval, resultados, 'subordinado_eval')
        actualizar_diccionario_evaluaciones(cumplimientos, resultados, 'cumplimiento_eval')
        actualizar_diccionario_evaluaciones(desempeños, resultados, 'desempeno_eval')

        registro_evaluacion = Evaluacion.obtener_evaluaciones_por_usuario(
            ficha_usuario=ficha_get,
            año_fiscal=año_fiscal
        )
        # FIX: proteger contra None (antes crasheaba si no había registro)
        if registro_evaluacion:
            total_desempeño = registro_evaluacion.total
        

        retroalimentacion_resultados = Retroalimentacion.obtener_por_ficha_y_año(
            ficha_usuario=ficha_get,
            año_fiscal=año_fiscal
        )

        if ficha != ficha_get and ficha == int(ficha_evaluador_supervisor):
            estado_evaluacion = "supervisorEvaluacion"
        
        print(f"Estado de la evaluación: {estado_evaluacion}")

        # Chequeo de evaluaciones completadas
        supervisor_completado = False
        subordinado_completado = False
        par_completado = False
        autoeval_completado = False

        if resultados and isinstance(resultados, list):
            for competencia in resultados:
                if competencia.get('autoeval') and competencia['autoeval'].strip():
                    autoeval_completado = True
                if competencia.get('superv_eval') and competencia['superv_eval'].strip():
                    supervisor_completado = True
                if competencia.get('par_eval') and competencia['par_eval'].strip():
                    par_completado = True
                if competencia.get('subordinado_eval') and competencia['subordinado_eval'].strip():
                    subordinado_completado = True

            if not autoeval_completado or not supervisor_completado:
                evaluacion_completada = False


            if usuario_dueño_indicador[0].get('nivel') == 'I':
                if not par_completado or not subordinado_completado:
                    evaluacion_completada = False
        else:
            evaluacion_completada = False

    return render_template(
        '/gdd/detalles_gestion_equipo.html',
        evaluacion_completada=evaluacion_completada,
        ficha_evaluador_supervisor=ficha_evaluador_supervisor,
        estado_evaluacion=estado_evaluacion,
        retroalimentacion_resultados=retroalimentacion_resultados,
        total_desempeño=total_desempeño,
        cumplimientos=cumplimientos,
        desempeños=desempeños,
        autoevaluaciones=autoevaluaciones,
        supervisor_evaluaciones=supervisor_evaluaciones,
        par_evaluaciones=par_evaluaciones,
        subordinado_eval=subordinado_eval,
        etapa_general=etapa_general,
        año_fiscal=año_fiscal,
        consultar_cargo=consultar_cargo,
        titulo="Detalles",
        usuario=usuario,
        rest=rest,
        participantes=participantes,
        indicadores=indicadores_filtrados,
        total_cumplimiento=total_cumplimiento,
        total_peso=total_peso,
        ficha_get=ficha_get,
        ficha=ficha,
        usuario_dueño_indicador=usuario_dueño_indicador,
        usuario_dueño_evaluacion=usuario_dueño_indicador,
        ruta_foto_personal=ruta_foto_personal
    )
@page.route("/app_crm/gdd/indicadores", methods=['GET', 'POST'] )
@login_required 
def gdi():
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)
    año_fiscal = variables_configuracion_global.año_fiscal
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)

    año_fiscal = variables_configuracion_global.año_fiscal
    vista= "gdd"
    estatus_proceso = "Abriendo"
    form = formgdi()
    indicadores = Indicadores.obtener_indicador_usuario(usuario.ficha)
    indicadores_filtrados = []
    # Crear un atributo temporal para mostrar en el frontend
    for indicador in indicadores:
        if indicador.año_fiscal == año_fiscal:
            indicador.año_fiscal_display = año_fiscal
            
        else:
            indicador.año_fiscal_display = indicador.año_fiscal
        print(indicador.año_fiscal_display)
        if indicador.año_fiscal_display == año_fiscal or \
        (indicador.año_fiscal_display == "20252026" and año_fiscal == "AF26"):
            indicadores_filtrados.append(indicador)
    
    print(indicadores_filtrados)
            
            
    total_peso = sum(float(i.peso) for i in indicadores if i.peso)
    total_cumplimiento = round(
        sum(float(i.cumplimiento) for i in indicadores if i.cumplimiento),
        2
    )

    return render_template('/gdd/indicadores.html', etapa_general= etapa_general, ruta_foto_personal= ruta_foto_personal, consultar_cargo= consultar_cargo,  titulo="Indicadores", indicadores = indicadores_filtrados, total_peso= total_peso, total_cumplimiento= total_cumplimiento,   año_fiscal=año_fiscal, usuario = usuario, rest = rest, vista = vista, estatus_proceso = estatus_proceso, form = form, ficha= ficha)

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

    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)
    año_fiscal = variables_configuracion_global.año_fiscal
    print(etapa_general)
    print(año_fiscal)
    print(variables_configuracion_global)
    indicadores_status_actual = Indicadores.existe_indicador_abierto()
    if indicadores_status_actual:
        status_actual = 'Abierto'
    else:
        status_actual = "Cerrado"

    return render_template('/gdd/ventanaRH.html', año_fiscal= año_fiscal, etapa_general= etapa_general, ruta_foto_personal = ruta_foto_personal, consultar_cargo= consultar_cargo,  titulo="Administración Talento Humano", usuario = usuario, rest = rest, vista = vista, status_actual= status_actual, ficha = ficha)

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
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)

    estado_indicador_individual= indicador_resultado.status
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
    return render_template('/gdd/hoja_de_vida.html', estado_indicador_individual=estado_indicador_individual, etapa_general= etapa_general, ruta_foto_personal = ruta_foto_personal, consultar_cargo= consultar_cargo,  estado= estado, titulo="Hoja de Vida", usuario = usuario,form =form,rest=rest,nombre_indicador=nombre_indicador,info_indicador=info_indicador, Tipo_indicador= Tipo_indicador, indicador = indicador, ficha= ficha, ficha_del_dueño_del_indicador= ficha_del_dueño_del_indicador)

@page.route("/app_crm/gdd/cronograma-<int:indicador>", methods=['GET', 'POST'] )
@login_required 
def cronograma(indicador):
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)

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
    return render_template('/gdd/cronograma.html', etapa_general= etapa_general, consultar_cargo= consultar_cargo, ruta_foto_personal = ruta_foto_personal,  estado = estado,  titulo="Cronograma", usuario = usuario,rest=rest, registros = registros, indicador= indicador, data = data , ficha= ficha, ficha_del_dueño_del_indicador =ficha_del_dueño_del_indicador)

@page.route("/app_crm/gdd/gestion-gdd", methods=['GET', 'POST'])
@login_required
def gestion_gdd():
    usuario = current_user
    ficha = usuario.ficha
    rest = consultar_sap(ficha)
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)

    return render_template('/gdd/gestion_gdd.html', etapa_general= etapa_general, consultar_cargo= consultar_cargo,  titulo= "Gestion",usuario=usuario,rest=rest, ruta_foto_personal = ruta_foto_personal)


#---------------------------------------------------------------------------------------------------------------------------------------------------
#----------------------------- COMPETENCIAS---------------------------------------------------------------------
@page.route("/app_crm/gdd/competencias-evaluacion", methods=['GET','POST'])
@login_required
def evaluar_colaborador():
    usuario = current_user
    ficha = usuario.ficha
    rest = consultar_sap(ficha)
    participantes = participantes_gdd()
    colaboradores = obtener_colaboradores_directos(participantes,ficha)
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)

    return render_template('/gdd/evaluar_colaborador', etapa_general= etapa_general, titulo ="Seleccion de evalucacion de competencias", usuario = usuario, rest=rest,colaboradores=colaboradores, ruta_foto_personal = ruta_foto_personal)

@page.route("/app_crm/gdd/Evaluacion<int:ficha_get>", methods=['GET','POST'])
@login_required
def evaluacion_competencias(ficha_get):
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)
    año_fiscal = variables_configuracion_global.año_fiscal
    usuario = current_user
    ficha = usuario.ficha
    rest = consultar_sap(ficha)
    habilitacion_supervisor = False
    estado_evaluacion = ""
    usuario_dueño_evaluacion= rest
    if ficha_get != ficha:
        usuario_dueño_evaluacion = consultar_sap(ficha_get)
    resultados = Evaluacion.obtener_resultados(
        ficha_usuario=ficha_get,
        año_fiscal= año_fiscal
    )
    


    
    autoevaluaciones = {
        'numero_1': None,
        'numero_2': None,
        'numero_3': None,
        'numero_4': None,
        'numero_5': None
    }

    actualizar_diccionario_evaluaciones(autoevaluaciones, resultados, 'autoeval')
    json_autoevaluaciones = json.dumps(autoevaluaciones)
    print(json_autoevaluaciones)
    
    supervisor_evaluaciones ={
        'numero_1': None,
        'numero_2': None,
        'numero_3': None,
        'numero_4': None,
        'numero_5': None
    }
    actualizar_diccionario_evaluaciones(supervisor_evaluaciones, resultados, 'superv_eval')
    json_supervisor_evaluaciones = json.dumps(supervisor_evaluaciones)
    
    par_evaluaciones ={
        'numero_1': None,
        'numero_2': None,
        'numero_3': None,
        'numero_4': None,
        'numero_5': None
    }
    actualizar_diccionario_evaluaciones(par_evaluaciones, resultados, 'par_eval')
    
    
    subordinado_eval ={
        'numero_1': None,
        'numero_2': None,
        'numero_3': None,
        'numero_4': None,
        'numero_5': None
    }
    actualizar_diccionario_evaluaciones(subordinado_eval, resultados, 'subordinado_eval')
    
    
    
    cumplimientos ={
        'numero_1': None,
        'numero_2': None,
        'numero_3': None,
        'numero_4': None,
        'numero_5': None
    }
    actualizar_diccionario_evaluaciones(cumplimientos, resultados, 'cumplimiento_eval')

    desempeños ={
        'numero_1': None,
        'numero_2': None,
        'numero_3': None,
        'numero_4': None,
        'numero_5': None
    }
    actualizar_diccionario_evaluaciones(desempeños, resultados, 'desempeno_eval')
    
    registro_evaluacion = Evaluacion.obtener_evaluaciones_por_usuario(
        ficha_usuario=ficha_get
    )

    ficha_evaluador_supervisor = procesar_ficha(usuario_dueño_evaluacion[0]['fichaSuperv'])
    if registro_evaluacion:
        ficha_evaluador_par = registro_evaluacion.par_evaluador
        ficha_subordinado = registro_evaluacion.subordinado_evaluador
        total_desempeño = registro_evaluacion.total
    else:

        ficha_evaluador_par = "0"
        ficha_subordinado = "0"
        total_desempeño = 0

    
    print(f"el par {ficha_evaluador_par}")
    
    print(ficha)
    if ficha != ficha_get and ficha== int(ficha_evaluador_supervisor):
        estado_evaluacion = "supervisorEvaluacion"
    elif ficha != ficha_get and ficha== int(ficha_evaluador_par):
        estado_evaluacion = "parEvaluacion"
    elif ficha != ficha_get and ficha== int(ficha_subordinado):
        estado_evaluacion = "subordinadoEvaluacion"
    elif ficha == ficha_get:
        estado_evaluacion = "Autoevaluacion"
    else:
        flash("No puedes evaluar a este usuario" , "Error")
        return redirect(url_for('.menu'))



    print(f"asdasdasd {subordinado_eval}")
    usuario_dueño_indicador = usuario_dueño_evaluacion

    return render_template('/gdd/evaluacion.html', etapa_general=etapa_general, ruta_foto_personal= ruta_foto_personal, json_supervisor_evaluaciones= json_supervisor_evaluaciones,  json_autoevaluaciones = json_autoevaluaciones,  usuario_dueño_indicador= usuario_dueño_indicador,  par_evaluaciones= par_evaluaciones, subordinado_eval= subordinado_eval,  total_desempeño = total_desempeño, desempeños= desempeños,  cumplimientos= cumplimientos, supervisor_evaluaciones= supervisor_evaluaciones,  usuario_dueño_evaluacion= usuario_dueño_evaluacion,  ficha_evaluador_supervisor=ficha_evaluador_supervisor, ficha_get= ficha_get, autoevaluaciones=autoevaluaciones, estado_evaluacion = estado_evaluacion, habilitacion_supervisor= habilitacion_supervisor, consultar_cargo= consultar_cargo, titulo ="Evaluación", usuario = usuario, rest=rest, ficha=ficha)



@page.route("/app_crm/gdd/historial", methods=['GET'])
@login_required
def historial():
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = int(variables_configuracion_global.etapa_actual)

    registros = ResultadoFinal.query.filter_by(
        ficha_usuario=ficha
    ).order_by(ResultadoFinal.año_fiscal.desc()).all()

    # Armar lista de cards con solo lo necesario
    historial = []
    for r in registros:
        historial.append({
            'año_fiscal':      r.año_fiscal,
            'total_final':     r.total_final or 0,
            'clasificacion':   r.clasificacion or '---',
            'enviado_sap':     r.enviado_sap,
        })

    return render_template(
        '/gdd/historial.html',
        etapa_general=etapa_general,
        usuario=usuario,
        rest=rest,
        ficha=ficha,
        historial=historial,
        ruta_foto_personal=ruta_foto_personal,
        consultar_cargo=consultar_cargo,
        titulo="Mi Historial GDD"
    )


@page.route("/app_crm/gdd/historial/<ficha_get>/<year_fiscal_ver>", methods=['GET'])
@login_required
def historial_detalle(ficha_get, year_fiscal_ver):
    año_fiscal_ver = year_fiscal_ver
    usuario = current_user
    ficha = ficha_get
    rest = consultar_sap(ficha)
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = int(variables_configuracion_global.etapa_actual)

    # Verificar que el registro pertenece al usuario logueado
    registro_resultado = ResultadoFinal.query.filter_by(
        ficha_usuario=ficha,
        año_fiscal=año_fiscal_ver
    ).first()

    if not registro_resultado:
        flash("No tienes un GDD registrado para ese año fiscal.", "error")
        return redirect(url_for('.historial'))


    formatos_año = [año_fiscal_ver]
    if año_fiscal_ver.startswith("AF"):
        año_num = int(año_fiscal_ver[2:])
        formatos_año.append(f"20{año_num-1}20{año_num:02d}")
    else:
        formatos_año.append(f"AF{año_fiscal_ver[6:8]}")

    indicadores = Indicadores.query.filter(
        Indicadores.ficha_usuario == ficha,
        Indicadores.año_fiscal.in_(formatos_año)
    ).all()

    total_peso = sum(float(i.peso) for i in indicadores if i.peso)
    total_cumplimiento = round(
        sum(float(i.cumplimiento) for i in indicadores if i.cumplimiento), 2
    )

    autoevaluaciones      = {f'numero_{i}': None for i in range(1, 6)}
    supervisor_evaluaciones = {f'numero_{i}': None for i in range(1, 6)}
    par_evaluaciones      = {f'numero_{i}': None for i in range(1, 6)}
    subordinado_eval      = {f'numero_{i}': None for i in range(1, 6)}
    cumplimientos         = {f'numero_{i}': None for i in range(1, 6)}
    desempeños            = {f'numero_{i}': None for i in range(1, 6)}
    total_desempeño       = ""
    retroalimentacion_resultados = None

    resultados = Evaluacion.obtener_resultados(
        ficha_usuario=ficha,
        año_fiscal=año_fiscal_ver
    )
    
    actualizar_diccionario_evaluaciones(autoevaluaciones,       resultados, 'autoeval')
    actualizar_diccionario_evaluaciones(supervisor_evaluaciones, resultados, 'superv_eval')
    actualizar_diccionario_evaluaciones(par_evaluaciones,        resultados, 'par_eval')
    actualizar_diccionario_evaluaciones(subordinado_eval,        resultados, 'subordinado_eval')
    actualizar_diccionario_evaluaciones(cumplimientos,           resultados, 'cumplimiento_eval')
    actualizar_diccionario_evaluaciones(desempeños,              resultados, 'desempeno_eval')


    registro_eval = Evaluacion.obtener_evaluaciones_por_usuario(
        ficha_usuario=ficha,
        año_fiscal=año_fiscal_ver
    )
    if registro_eval:
        total_desempeño = registro_eval.total
    
    print(registro_eval)

    retroalimentacion_resultados = Retroalimentacion.obtener_por_ficha_y_año(
        ficha_usuario=ficha,
        año_fiscal=año_fiscal_ver
    )


    usuario_dueño_indicador = rest

    return render_template(
        '/gdd/historial_detalle.html',

        modo_lectura=True,
        año_fiscal_ver=año_fiscal_ver,
        registro_resultado=registro_resultado,
        etapa_general=etapa_general,
        usuario=usuario,
        rest=rest,
        ficha=ficha,
        ficha_get=ficha,
        indicadores=indicadores,
        total_peso=total_peso,
        total_cumplimiento=total_cumplimiento,
        autoevaluaciones=autoevaluaciones,
        supervisor_evaluaciones=supervisor_evaluaciones,
        par_evaluaciones=par_evaluaciones,
        subordinado_eval=subordinado_eval,
        cumplimientos=cumplimientos,
        desempeños=desempeños,
        total_desempeño=total_desempeño,
        retroalimentacion_resultados=retroalimentacion_resultados,
        usuario_dueño_indicador=usuario_dueño_indicador,
        usuario_dueño_evaluacion=usuario_dueño_indicador,
        evaluacion_completada=True,
        ruta_foto_personal=ruta_foto_personal,
        consultar_cargo=consultar_cargo,
        titulo=f"Mi GDD {año_fiscal_ver}"
    )











































#---------------------------------------ENDPOINTS PARA JS-------------------------------------
"""
    Función para consulta de SAP inicial
    Parametro: La ficha
    retorna: response_json    
"""

"""
def consultar_sap(ficha):
    sap_url = USRL_SAP_PARTICIPANTES_FICHA
    
    params = {
        'sap-client': '510',
        'FICHA': ficha,
    }
    
    user_fuente = U_FUENTE
    contra_fuente = C_FUENTE
    
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
        return "Error de conexión"""
        
        
def consultar_sap(ficha):
    sap_url = USRL_SAP_PARTICIPANTES_FICHA
    
    
    params = {
        'sap-client': '510',
        'FICHA': ficha,
    }
    
    user_fuente = U_FUENTE
    contra_fuente = C_FUENTE
    
    try:
        response = requests.get(
            sap_url, 
            auth=HTTPBasicAuth(user_fuente, contra_fuente), 
            params=params, 
            verify=True,
            timeout=10
        )
        
        if response.status_code == 200:
            response_json = response.json()
            
            if response_json and 'pernr' in response_json[0]:
                return response_json
            else:
                raise SAPError("Respuesta SAP inválida: falta campo 'pernr'")
        else:
                raise SAPError(f"Servicio SAP no disponible (HTTP {response.status_code})", status_code=response.status_code)
        
    except requests.RequestException as e:
        raise SAPError(f"Error de conexión con SAP: {str(e)}")
    

def consulta_prueba():
    
    sap_url= URL_SAP_PRUEBAS
    user_fuente = "700-010"
    contra_fuente = "Corimon.2603$"
    
    parametros = {
        'sap-client':'510',
        'SOCIEDAD':'1200',
        'REPORTE':'PBI1'
    }

    try:
        response = requests.get(
            sap_url, 
            auth=HTTPBasicAuth(user_fuente, contra_fuente), 
            params=parametros, 
            verify=False,
            timeout=10
        )
        
        if response.status_code == 200:
            response_json = response.json()
                
            if response_json and 'pernr' in response_json[0]:
                return response_json
            else:
                raise SAPError("Respuesta SAP inválida")
        else:
            raise SAPError(f"Servicio SAP no disponible (HTTP {response.status_code})", status_code=response.status_code)
        
    except requests.RequestException as e:
        raise SAPError(f"Error de conexión con SAP: {str(e)}")
    

"consultar listado de participantes gdd"
def participantes_gdd():
    sap_url = URL_SAP_PARTICIPANTES
    args = {
        'sap-client': '510',
    }
    
    user_fuente = U_FUENTE
    contra_fuente = C_FUENTE

    print(user_fuente)
    print(contra_fuente)

    print(sap_url)
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
def rutaSap():
    try:
        data = request.get_json()  
        ficha = data.get("ficha")
        
        if not ficha:
            return jsonify({"success": False, "message": "Ficha no proporcionada"}), 400

        rest = consultar_sap(ficha)
        print(rest)
        # Verificar imagen en múltiples formatos
        extensiones = ['jpg', 'png', 'jpeg']
        imagen_existe = False
        ruta_imagen = None
        
        departamento_final = None
        plstx_valor = rest[0]['plstx']
        if len(plstx_valor) >= 24:
            resultado_cargo = consultar_cargo(ficha)
            print(f" asdasdas {resultado_cargo}")
            departamento_final = resultado_cargo.departamento
        else:
            departamento_final = plstx_valor
        
        if departamento_final:
            rest[0]['plstx'] = departamento_final
            
            
        """for ext in extensiones:
            nombre_imagen = f"{ficha}.{ext}"
            ruta_absoluta = os.path.join(adj_imagenes, nombre_imagen)
            
            if os.path.exists(ruta_absoluta):
                imagen_existe = True
                ruta_imagen = url_for('static', filename=f'img/fotos_personal/{nombre_imagen}')
                break """

        return jsonify({
            "success": True if rest else False,
            "response_json": rest if rest else None,
            "imagen_disponible": imagen_existe,
            #"ruta_imagen": ruta_imagen
        }), 200 if rest else 404

    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500
    
@page.route('/app_crm/insertarIndicador', methods=['POST'])
@login_required
def insertar_indicador():
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    año_fiscal = variables_configuracion_global.año_fiscal
    data = request.get_json()
    
    
    try:
        nombre_indicador = data.get('nombre_indicador')
        tendencia = data.get('tendencia')
        peso = data.get('peso')
        real_af_antes= data.get('real_af_antes')
        objetivo_af_actual = data.get('objetivo_af_actual') 
        ficha_usuario = data.get('ficha_usuario')
        #año_fiscal = data.get('año_fiscal')
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
        actualizar_resultado_parcial(ficha_usuario, año_fiscal, columna='indicadores')
        flash("Indicador registrado exitosamente, no olvides cargar tu hoja de vida", "success")
        return jsonify({"success": True, "message": "Indicador registrado exitosamente"}), 200

    except Exception as e:
        flash("Hubo un error Registrando el Indicador", "error")
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": f"Error inesperado: {str(e)}"}), 500
    

@page.route('/app_crm/evaluacion', methods=['POST'])
@login_required
def evaluacion():
    data = request.get_json()
    print(data)
    
    try:
        lista_evaluaciones = data['data']
        ficha_dueño = data['ficha_del_dueño_del_indicador']
        if ficha_dueño =="":
            ficha_dueño = current_user.ficha
        
        variables_configuracion_global = Configuracion.get_data()
        
        variables_configuracion_global = Configuracion.get_data()
        año = variables_configuracion_global.año_fiscal
        resultados = []
        total = 0
        rest = consultar_sap(ficha_dueño)
        ficha_supervisor = procesar_ficha(rest[0]['fichaSuperv'])     
        Evaluacion.asignar_supervisor(
            ficha_usuario=ficha_dueño,
            año_fiscal=año,
            ficha_supervisor=ficha_supervisor
        )
        for evaluacion_individual in lista_evaluaciones:
            competencia = evaluacion_individual.get('competencia')
            valor_autoeval = evaluacion_individual.get('autoEvaluacion')
            valor_supervisor = evaluacion_individual.get('supervisorEvaluacion', '')
            valor_par = evaluacion_individual.get('parEvaluacion', '')
            valor_subordinado = evaluacion_individual.get('subordinadoEvaluacion', '')
            valor_cumplomiento = evaluacion_individual.get('cumplimiento', '')
            valor_desempeno = evaluacion_individual.get('desempeno', '')
            valor_cumplomiento = 0 if valor_cumplomiento == "" else valor_cumplomiento
            total= valor_cumplomiento+ total
            print(f" Competencia: {competencia} | AutoEval: {valor_autoeval} | Supervisor: {valor_supervisor} | par: {valor_par}, subordinado {valor_subordinado}, cumplimiento {valor_cumplomiento} desempeno {valor_desempeno}")

            resultado = Evaluacion.registrar_dato(
                ficha_usuario=ficha_dueño,
                año_fiscal=año,
                nombre_competencia=competencia,
                datos_a_registrar={
                    'autoeval': valor_autoeval,
                    'superv_eval': valor_supervisor,
                    'par_eval': valor_par,
                    'subordinado_eval': valor_subordinado,
                    'cumplimiento_eval': valor_cumplomiento,
                    'desempeno_eval':  valor_desempeno
                }
            )

            if resultado:
                resultados.append(resultado.id)

            
        Evaluacion.actualizar_total(
            ficha_usuario=ficha_dueño,
            año_fiscal=año,
            nuevo_total=total
        )
        
        actualizar_resultado_parcial(ficha_dueño, año, columna='competencias')

        if resultados:
            return jsonify({
                'success': True,
                'mensaje': 'Todos los datos fueron registrados correctamente.',
                'ids_resultados': resultados
            }), 200
        else:
            return jsonify({
                'success': False,
                'mensaje': 'No se registraron datos (ningún resultado fue exitoso).'
            }), 400

    except Exception as e:
        flash("Hubo un error registrando la evaluación", "error")
        print(f" Error en el backend: {str(e)}")
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





@page.route('/app_crm/Arduino', methods=['POST', 'GET'])
def Arduino():
    if request.method == 'GET':

        data = request.args.to_dict()
        print(f"consulta fue por GET, y los datos son {data}")
    else:
        data = request.get_json()
        print(f"Consulta por POST y los datos son {data}")

    try:
        print(f"Datos recibidos: {data}")
        return jsonify({"success": True, "message": "ta funcionando compai"}), 200

    except Exception as e:
        flash("Paso algo malo papá", "error")
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
        actualizar_resultado_parcial(ficha_usuario, año_fiscal, columna='indicadores')
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
        
        indicador_obj = Indicadores.obtener_indicador(id)
        ficha_dueño = indicador_obj.ficha_usuario if indicador_obj else None
        año_fiscal_ind = indicador_obj.año_fiscal if indicador_obj else None
        

        
        Indicadores.delete_element(
            id= id,
        )
        
        if ficha_dueño and año_fiscal_ind:
            config = Configuracion.get_data()
            año_fiscal_activo = config.año_fiscal if config else año_fiscal_ind
            actualizar_resultado_parcial(ficha_dueño, año_fiscal_activo, columna='indicadores')
        
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
    
    
    
    
    
    
@page.route('/app_crm/establecer_evaluadores', methods=['POST'])
def establecer_evaluadores():
    datos = request.get_json()
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    año_fiscal = variables_configuracion_global.año_fiscal
    
    try:
        par = datos.get('idPar')
        subordinado = datos.get('idSubordinado')
        fichaUsuarioEvaluar = datos.get('fichaUsuarioEvaluar')
        
        if par or par != "":
            Evaluacion.asignar_par_evaluador(
                ficha_usuario=fichaUsuarioEvaluar,
                año_fiscal= año_fiscal,
                ficha_par=par
            )
            par= User.get_by_ficha(par)
            a_quien_evaluar = User.get_by_ficha(fichaUsuarioEvaluar)
            seleccionado_par( par=par, a_quien_evaluar=a_quien_evaluar)
            print('listo')
            
        
        if subordinado or subordinado != "":
            Evaluacion.asignar_subordinado_evaluador(
                ficha_usuario=fichaUsuarioEvaluar,
                año_fiscal= año_fiscal,
                ficha_subordinado=subordinado
            )
            subordinado_evaluador= User.get_by_ficha(subordinado)
            supervisor_a_evaluar= User.get_by_ficha(fichaUsuarioEvaluar)
            Seleccionado_evaluador(subordinado=subordinado_evaluador, supervisor=supervisor_a_evaluar)
            print('listo')
            
            
            
            
        
        
        print('todo bien mi rey')
        flash("Evaluadores agregados Exitosamente", "success")
        return jsonify({"success": True, "message": "Evaluadores enviado"}), 200

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


def obtener_lista_equipo_por_af(participantes, ficha_superior, año_fiscal):
    """
    Devuelve el equipo de un supervisor para un año fiscal dado.
    - AF actual: usa SAP recursivamente (igual que antes).
    - AF pasados: usa la tabla Evaluacion como fuente de verdad histórica.
    """
    # Año fiscal actual desde Configuracion
    af_actual = Configuracion.get_data()
    af_actual = af_actual.año_fiscal 
    if año_fiscal == af_actual:
        return obtener_lista_equipo(participantes, ficha_superior)

    # AF histórico: reconstruir desde Evaluacion
    return obtener_equipo_historico(ficha_superior, año_fiscal, participantes)

def obtener_equipo_historico(ficha_superior, año_fiscal, participantes):
    # Normalizar formato AF para comparar
    formatos_af = [año_fiscal]
    if año_fiscal.startswith("AF"):
        año_num = int(año_fiscal[2:])
        formatos_af.append(f"20{año_num-1}20{año_num:02d}")
    else:
        formatos_af.append(f"AF{año_fiscal[6:8]}")

    mapa_sap = {}
    for p in participantes:
        pernr = p.get('pernr')
        if pernr:
            mapa_sap[str(int(pernr))] = p

    equipo = []
    visitados = set()

    def recursivo(ficha_sup):
        if ficha_sup in visitados:
            return
        visitados.add(ficha_sup)
        evaluaciones = Evaluacion.obtener_evaluaciones_como_evaluador(ficha_sup)

        for ev in evaluaciones:
            if ev['año_fiscal'] not in formatos_af:
                continue
            if 'supervisor' not in ev['rol_evaluador']:
                continue

            ficha_emp = str(int(ev['ficha_evaluado']))
            datos = mapa_sap.get(ficha_emp, {'pernr': ficha_emp, 'fichaSuperv': ficha_sup}).copy()
            equipo.append(datos)
            recursivo(ficha_emp)

    recursivo(str(int(ficha_superior)))
    return equipo

def obtener_lista_equipo(participantes, ficha_superior):
    # Aseguramos que la ficha llegue como string (por si viene como número)
    ficha_superior_str = str(ficha_superior) if ficha_superior is not None else None
    subordinados = encontrar_subordinados_recursivo(participantes, ficha_superior_str)
    return subordinados

def obtener_colaboradores_directos(participantes, ficha_superior):
    """
    Obtiene los colaboradores directos (subordinados de primer nivel) de una persona
    
    Args:
        participantes: Lista de diccionarios con información de empleados
                    (debe contener 'pernr' y 'fichaSuperv')
        ficha_superior: Ficha de la persona cuyos colaboradores directos se buscan
    
    Returns:
        Lista con los colaboradores directos (puede estar vacía)
    """
    # Normalizamos la ficha del superior (eliminar ceros izquierda)
    ficha_superior_normalizada = str(int(ficha_superior)) if ficha_superior else None
    
    # Filtramos los participantes cuyo supervisor sea el indicado
    colaboradores = [
        p.copy() for p in participantes 
        if p.get('fichaSuperv') and str(int(p['fichaSuperv'])) == ficha_superior_normalizada
    ]
    
    return colaboradores

def obtener_colaboradores_mismo_nivel(participantes, ficha_superior):
    """
    Obtiene todos los participantes que tienen el mismo nivel_usuario
    que la persona identificada por ficha_superior.

    """
    # Normalizamos la ficha del superior
    ficha_normalizada = str(int(ficha_superior)) if ficha_superior else None

    # Buscamos el participante referencia para obtener su nivel
    referencia = next(
        (p for p in participantes if p.get('pernr') and str(int(p['pernr'])) == ficha_normalizada),
        None
    )

    if not referencia:
        return []

    nivel_referencia = referencia.get('nivel')

    if nivel_referencia is None:
        return []

    return [
        p.copy() for p in participantes
        if p.get('nivel') == nivel_referencia
    ]
def consultar_cargo(ficha):
    registro = Cargos.select_by_ficha(ficha)
    #print(registro)
    return registro 

def ruta_foto_personal(numero):

    ejemplo_dir = 'app/static/img/fotos_personal'
    extensiones = ['.png', '.jpg', '.jpeg']
    
    if numero is None or str(numero).strip() == '':
        return None
    
    num_str = str(numero).strip()
    
    variantes = [num_str]
    try:
        num_int = int(num_str)
        variantes.append(str(num_int))           # sin ceros: '44'
        variantes.append(str(num_int).zfill(3))  # padding 3:  '044'
        variantes.append(str(num_int).zfill(4))  # padding 4:  '0044'
    except ValueError:
        pass  # la ficha no es numérica, solo probamos como viene
    
    variantes = list(dict.fromkeys(variantes))
    
    try:
        contenido = os.listdir(ejemplo_dir)
        for archivo in contenido:
            nombre, ext = os.path.splitext(archivo)
            if nombre in variantes and ext.lower() in extensiones:
                return f"img/fotos_personal/{archivo}"
        
        return None
        
    except Exception as e:
        return None
        
def recortar_ficha(ficha):

    if len(ficha) < 4:
        return ficha 


    cuarto_digito = ficha[-4]

    if cuarto_digito == '0':

        return ficha[-3:]
    else:

        return ficha[-4:]



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
        variables_configuracion_global = Configuracion.get_data()
        etapa_general = variables_configuracion_global.etapa_actual
        año_fiscal = variables_configuracion_global.año_fiscal
        texto = datos.get('texto')
        
        tipo = datos.get('tipo')
        mensaje = ""
        print(texto)
        print(tipo)
        """lista = ['escalona9465@gmail.com', 'eliezer_chirino@corimon.com', 
                    'eliezergach1508@gmail.com', 'alejandro_padra@corimon.com', 
                    'alejandrop912@gmail.com', 'jose_escalona@corimon.com', 
                    'venicia_pena@corimon.com', 'alejandropadra@protonmail.com', 
                    'eliezerincrp@gmail.com','digitalingpadra@gmail.com', 
                    'venicia3006@gmail.com', 'dguedez2002@gmail.com',
                    ]"""

        """class SimpleUser:
            def __init__(self, email):
                self.email = email
        
        lista_users = [SimpleUser(email) for email in lista]"""
        lista_users= User.get_by_usuarios()
        #lista_users= lista
        
        app = current_app._get_current_object()
        def enviar_en_background():

            with app.app_context():
                try:
                    if tipo == 'cierre':
                        asyncio.run(cierre_gdd(lista_users, texto))
                    elif tipo == "inicio":
                        asyncio.run(inicio_gdd(lista_users, texto, año_fiscal))
                    elif tipo == 'avance':
                        asyncio.run(inicio_avance(lista_users, texto))
                    elif tipo == 'InicioEtapaDos':
                        usuarios = User.get_by_usuarios()
                        usuarios_notificar = []
                        
                        asyncio.run(inicio_CRE(usuarios, texto))
                        #asyncio.run(inicio_periodo_evaluacion(usuarios))
                        
                        """for usuario in usuarios:
                            usuario_from_sap = consultar_sap(usuario.ficha)
                            usuario_nivel = usuario_from_sap[0]["nivel"]
                            ficha_supervisor = procesar_ficha(usuario_from_sap[0]['fichaSuperv']) 
                            if ficha_supervisor:    
                                Evaluacion.asignar_supervisor(
                                    ficha_usuario=usuario.ficha,
                                    año_fiscal=año_fiscal,
                                    ficha_supervisor=ficha_supervisor
                                )
                            
                            if usuario_nivel == "I" or (usuario_nivel == "" and usuario.ficha == 3104):
                                user = User.get_by_ficha(usuario.ficha)     
                                participantes = participantes_gdd()
                                equipo = obtener_colaboradores_directos(participantes, usuario.ficha)
                                usuarios_notificar.append((user, equipo))  
                        
                        if usuarios_notificar:
                            thread = Thread(target=procesar_notificaciones_individuales, args=(app, usuarios_notificar))
                            thread.start()
                            
                            mensaje = f"Proceso iniciado. Se enviarán {len(usuarios_notificar)} notificaciones."
                        else:
                            mensaje = "No se encontraron usuarios nivel I para notificar."""
                except Exception as e:
                    print(f" Error en envío masivo: {e}")
                    import traceback
                    traceback.print_exc()
        
        # Iniciar thread en background
        thread = threading.Thread(target=enviar_en_background)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            "success": True,
            "message": f"Enviando correos a  destinatarios en segundo plano..."
        }), 202  

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error inesperado: {str(e)}"
        }), 500


@page.route('/app_crm/configuracionGDD/MoverEtapa', methods=['POST'])
def mover_etapa():
    datos = request.get_json()
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    año_fiscal = variables_configuracion_global.año_fiscal
    mensaje = ""
    try:
        currentActive = datos.get('currentActive')
        print(currentActive)
        Configuracion.actualizar_solo_etapa(currentActive)
        
        
        if currentActive == 3:
            Configuracion.actualizar_solo_etapa(1)
            User.actualizar_status_global("Abierto")
            Indicadores.actualizar_status_global("Cerrado")
        mensaje = "Etapa actualizada correctamente."
        return jsonify({
            "success": True,
            "message": mensaje
        }), 200
        
    except Exception as e:
        print(f"Error en mover_etapa: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error inesperado: {str(e)}"
        }), 500

@page.route('/app_crm/configuracionGDD/actualizarAF', methods=['POST'])
def actualizarAF():
    datos = request.get_json()

    try:
        Afconfig = datos.get('currentActive')
        año_fiscal = f"AF{Afconfig}"
        Configuracion.actualizar_solo_año(año_fiscal)


        
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
        
        
def actualizar_diccionario_evaluaciones(diccionario, resultados_lista, columna):
    for i, resultado in enumerate(resultados_lista):
        key = f'numero_{i + 1}'
        if key in diccionario:
            diccionario[key] = resultado[columna]
        
        
        
@page.route('/app_crm/Retroalimentacion', methods=['POST'])
def Retroalimentacion_ruta():
    datos = request.get_json()

    try:
        primer_item = datos[0]  
        ficha_usuario = primer_item.get('ficha')
        rest = consultar_sap(ficha_usuario)
        variables_configuracion_global = Configuracion.get_data()
        año_fiscal = variables_configuracion_global.año_fiscal
    
        comentario_supervisor = primer_item.get('ComentarioSuperv')
        comentario_colaborador = primer_item.get('ComentarioColabr')
        feedback = primer_item.get('feedbackTexto')
        
        # Normalizar: "" o "   " equivalen a None (no tocar ese campo)
        if comentario_supervisor is not None and not comentario_supervisor.strip():
            comentario_supervisor = None
        if comentario_colaborador is not None and not comentario_colaborador.strip():
            comentario_colaborador = None
        if feedback is not None and not feedback.strip():
            feedback = None

        print(f"Payload recibido -> ficha: {ficha_usuario}, superv: {comentario_supervisor}, colab: {comentario_colaborador}, feedback: {feedback}")

        # Validación: si TODOS los campos vinieron None/vacíos, no tiene sentido el POST
        if comentario_supervisor is None and comentario_colaborador is None and feedback is None:
            return jsonify({
                "success": False,
                "message": "No se recibió ningún comentario ni feedback para guardar."
            }), 400

        resultado = Retroalimentacion.crear_o_actualizar(
            año_fiscal=año_fiscal,
            ficha_usuario=ficha_usuario,
            comentarios_supervisor=comentario_supervisor,
            comentarios_colaborador=comentario_colaborador,
            feedback=feedback
        )
        flash("Retroalimentación guardada correctamente", "success")
        
        funcion_verificacion_enviar(rest, año_fiscal)

        return jsonify({
            "success": True,
            "message": "Retroalimentación guardada correctamente"
        }), 200

    except Exception as e:
        flash("Ocurrió un error", "error")
        print(f"Error: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error inesperado: {str(e)}"
        }), 500


@page.route('/app_crm/gdd/documentacion', methods=['GET'])
def Documentacion():
    variables_configuracion_global = Configuracion.get_data()
    etapa_general = variables_configuracion_global.etapa_actual
    etapa_general = int(etapa_general)
    usuario = current_user
    ficha = current_user.ficha
    rest = consultar_sap(ficha)


    
    return render_template('/gdd/documentacion.html', 
                            titulo= "Documentacion",
                            usuario=usuario,
                            etapa_general=etapa_general,
                            rest=rest,
                            ruta_foto_personal = ruta_foto_personal,
                            consultar_cargo = consultar_cargo,
                            ficha=ficha)



@page.route('/app_crm/archivo/<nombre_archivo>', methods=['GET'])
def archivo(nombre_archivo):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    adj_documents = os.path.join(base_dir, 'static', 'adj')
    archivo_completo = os.path.join(adj_documents, nombre_archivo)


    if not os.path.exists(archivo_completo):
        return f"Archivo no encontrado: {nombre_archivo}", 404
    
    descargar = request.args.get('download')
    try:
        return send_from_directory(
            directory=adj_documents,
            path=nombre_archivo,
            as_attachment=bool(descargar)
        )
    except FileNotFoundError:
        return "Archivo no encontrado en el servidor.", 404
    except Exception as e:
        return f"Error al servir el archivo: {str(e)}", 500
    
    
    
@page.route('/app_crm/verificar', methods=['GET'])
def consultar_nivel():
    rest= participantes_gdd()
    return jsonify(rest)




FICHAS_EXCLUIDAS = [3141, 2937, 3104]


@page.route('/app_crm/reenviar_sap', methods=['GET'])
@login_required
def reenviar_sap():
    """
    Reenvía a SAP los datos ya calculados en resultados_finales.
    No recalcula nada, solo toma lo que está en la tabla y lo envía.
    Ignora la columna enviado_sap (fuerza reenvío).
    Requiere nivel admin.
    """
    if current_user.nivel_usuario not in ('admin', 'Administrador'):
        return jsonify({'error': 'No autorizado'}), 403

    config = Configuracion.get_data()
    año_fiscal = config.año_fiscal

    # Manejar formato dual AF26 / 20252026
    formatos_busqueda = [año_fiscal]
    if año_fiscal.startswith("AF"):
        año_num = int(año_fiscal[2:])
        formatos_busqueda.append(f"20{año_num-1}20{año_num:02d}")
    else:
        formatos_busqueda.append(f"AF{año_fiscal[6:8]}")

    if año_fiscal.startswith("AF"):
        año_convertido = "20" + año_fiscal[2:]
    else:
        año_convertido = año_fiscal

    # Consultar directamente desde resultados_finales en lugar de iterar todos los User
    todos_resultados = ResultadoFinal.query.filter(
        ResultadoFinal.año_fiscal.in_(formatos_busqueda)
    ).all()

    omitidos = 0
    exitosos = 0
    fallidos = 0
    usuarios_omitidos = []
    detalle_fallidos = []

    for resultado in todos_resultados:
        ficha = resultado.ficha_usuario

        if ficha in FICHAS_EXCLUIDAS:
            omitidos += 1
            usuarios_omitidos.append(ficha)
            continue

        ficha_str = str(ficha)

        resp = enviar_resultados(
            ficha_str,
            año_convertido,
            str(int(resultado.total_indicadores)),
            str(int(resultado.total_competencias)),
            str(int(resultado.total_final))
        )

        if resp.get('success', False):
            exitosos += 1
        else:
            fallidos += 1
            detalle_fallidos.append({
                'ficha': ficha,
                'error': resp.get('error', 'desconocido')
            })

        print(f"Ficha {ficha_str} → {'OK' if resp.get('success') else 'FAIL'} | ind={resultado.total_indicadores} comp={resultado.total_competencias} total={resultado.total_final}")

    return jsonify({
        "success": fallidos == 0,
        "año_fiscal": año_fiscal,
        "año_convertido_sap": año_convertido,
        "resumen": {
            "total_procesados": len(todos_resultados),
            "exitosos": exitosos,
            "fallidos": fallidos,
            "omitidos": omitidos
        },
        "usuarios_omitidos": usuarios_omitidos,
        "detalle_fallidos": detalle_fallidos
    }), 200

@page.route('/app_crm/inicializar_resultados/<year_fiscal>', methods=['GET'])
@login_required
def inicializar_resultados(year_fiscal):
    """
    Inicializa en 0 la tabla resultados_finales para todos los usuarios.
    Útil para que el dashboard no muestre vacíos mientras el proceso avanza.
    Los valores reales se sobreescriben después con sincronizar_resultados.
    Ejecutar: /app_crm/inicializar_resultados/AF26
    """

    if current_user.nivel_usuario != 'admin' and current_user.nivel_usuario != "Administrador":
        return jsonify({'error': 'No autorizado'}), 403

    participantes = participantes_gdd()
    niveles_por_ficha = {
        int(p['pernr'].lstrip('0')): p.get('nivel')
        for p in participantes
        if p.get('pernr')
    }

    todos_los_usuarios = User.query.all()
    exitosos = 0
    omitidos = 0
    errores  = 0

    for usuario in todos_los_usuarios:
        ficha = usuario.ficha

        if ficha in FICHAS_EXCLUIDAS:
            omitidos += 1
            continue

        ya_existe = ResultadoFinal.query.filter_by(
            ficha_usuario=ficha,
            año_fiscal=year_fiscal
        ).first()

        if ya_existe:
            omitidos += 1
            continue

        resultado = ResultadoFinal.guardar(
            ficha_usuario      = ficha,
            año_fiscal         = year_fiscal,
            filial             = usuario.filial,
            nivel              = niveles_por_ficha.get(ficha),  # lookup directo sin SAP
            total_competencias = 0,
            total_indicadores  = 0,
            total_final        = 0,
            enviado_sap        = False
        )

        if resultado:
            exitosos += 1
        else:
            errores += 1

    return jsonify({
        'success': True,
        'resumen': {
            'total_usuarios': len(todos_los_usuarios),
            'inicializados': exitosos,
            'omitidos': omitidos,
            'errores': errores
        }
    })


@page.route('/app_crm/sincronizar-resultados/<year_fiscal>', methods=['GET'])
@login_required
def sincronizar_resultados(year_fiscal):
    """
    RUTA DEPRECADA
    Esta ruta no valida retroalimentación ni indicadores aprobados, y causó registros
    huérfanos con enviado_sap=True en resultados_finales.
    
    Usar en su lugar: POST /app_crm/gdd/api/sincronizar-tabla
    (disparado desde el botón 'Actualizar datos' en tabla_reporte.html)
    """

    if current_user.nivel_usuario != 'admin' and current_user.nivel_usuario != "Administrador":
        return jsonify({'error': 'No autorizado'}), 403

    # Una sola llamada a SAP para obtener todos los niveles
    participantes = participantes_gdd()
    niveles_por_ficha = {
        int(p['pernr'].lstrip('0')): p.get('nivel')
        for p in participantes
        if p.get('pernr')
    }

    formatos_busqueda = [year_fiscal]
    if year_fiscal.startswith("AF"):
        año_num = int(year_fiscal[2:])
        año_numerico = f"20{año_num-1}20{año_num:02d}"
        formatos_busqueda.append(año_numerico)
    else:
        formatos_busqueda.append(f"AF{year_fiscal[6:8]}")

    print(f"Buscando evaluaciones con formatos: {formatos_busqueda}")

    evaluaciones = Evaluacion.query.filter(
        Evaluacion.año_fiscal.in_(formatos_busqueda),
        Evaluacion.total.isnot(None),
        Evaluacion.total != 0
    ).all()

    if not evaluaciones:
        return jsonify({
            'success': False,
            'mensaje': f'No se encontraron evaluaciones para {formatos_busqueda}'
        }), 404

    exitosos = 0
    omitidos = 0
    errores  = 0
    detalle  = []

    for evaluacion in evaluaciones:
        ficha   = evaluacion.ficha_usuario
        af_real = evaluacion.año_fiscal

        if ficha in FICHAS_EXCLUIDAS:
            detalle.append({
                'ficha': ficha,
                'status': 'excluido',
                'motivo': 'Ficha en lista de exclusiones'
            })
            continue

        # Nivel desde el dict — sin llamada extra a SAP
        nivel = niveles_por_ficha.get(ficha)

        formatos_indicadores = [af_real]
        if af_real.startswith("AF"):
            año_num = int(af_real[2:])
            formatos_indicadores.append(f"20{año_num-1}20{año_num:02d}")
        else:
            formatos_indicadores.append(f"AF{af_real[6:8]}")

        indicadores = Indicadores.query.filter(
            Indicadores.ficha_usuario == ficha,
            Indicadores.año_fiscal.in_(formatos_indicadores)
        ).all()

        print(f"Ficha {ficha} | af_real={af_real} | indicadores encontrados={len(indicadores)}")

        # Opción A: sumar solo aprobados
        indicadores_aprobados = [i for i in indicadores if i.status_aprobacion == 'A']
        safe_cumplimiento = round(sum(float(i.cumplimiento) for i in indicadores_aprobados if i.cumplimiento), 2)

        raw_total      = evaluacion.total
        safe_desempeño = 0 if (raw_total is None or raw_total == '' or raw_total == 0) else raw_total
        total_final    = round(safe_desempeño + safe_cumplimiento, 1)
        clasificacion  = ResultadoFinal._clasificar(total_final)

        print(f"  → safe_desempeño={safe_desempeño} | safe_cumplimiento={safe_cumplimiento} | total_final={total_final} | clasificacion={clasificacion}")

        registro_existente = ResultadoFinal.query.filter_by(
            ficha_usuario=ficha,
            año_fiscal=af_real,
        ).first()

        if registro_existente and registro_existente.enviado_sap:
            omitidos += 1
            detalle.append({
                'ficha': ficha,
                'status': 'omitido',
                'motivo': 'Ya tiene datos reales enviados a SAP'
            })
            continue

        usuario = User.get_by_ficha(ficha)
        resultado = ResultadoFinal.guardar(
            ficha_usuario      = ficha,
            año_fiscal         = af_real,
            total_competencias = safe_desempeño,
            total_indicadores  = safe_cumplimiento,
            total_final        = total_final,
            filial             = usuario.filial if usuario else 'N/A',
            nivel              = nivel,
            enviado_sap        = True
        )

        if resultado:
            exitosos += 1
            detalle.append({
                'ficha'                        : ficha,
                'filial'                       : usuario.filial if usuario else 'N/A',
                'nivel'                        : nivel,
                'status'                       : 'guardado',
                'año_fiscal_usado'             : af_real,
                'indicadores_encontrados'      : len(indicadores),
                'total_competencias'           : safe_desempeño,
                'total_indicadores'            : safe_cumplimiento,
                'total_final'                  : total_final,
                'clasificacion'               : clasificacion
            })
        else:
            errores += 1
            detalle.append({'ficha': ficha, 'status': 'error'})

    return jsonify({
        'success': True,
        'formatos_buscados': formatos_busqueda,
        'resumen': {
            'total_evaluaciones': len(evaluaciones),
            'guardados'         : exitosos,
            'omitidos'          : omitidos,
            'errores'           : errores
        },
        'detalle': detalle
    })
    
    

@page.route('/app_crm/gdd/api/sincronizar-tabla', methods=['POST'])
@login_required
def api_sincronizar_tabla():
    """
    Endpoint para refrescar la tabla resultados_finales bajo demanda.
    Llamado desde el botón 'Actualizar datos' en tabla_reporte.html.
    """
    if current_user.nivel_usuario not in ('admin', 'Administrador'):
        return jsonify({'success': False, 'error': 'No autorizado'}), 403
    
    config = Configuracion.get_data()
    if not config:
        return jsonify({'success': False, 'error': 'Sin configuración activa'}), 500
    
    año_fiscal = config.año_fiscal
    
    try:
        participantes = participantes_gdd()
    except Exception as e:
        return jsonify({'success': False, 'error': f'Error consultando SAP: {str(e)}'}), 500
    
    niveles_por_ficha = {
        int(p['pernr'].lstrip('0')): p.get('nivel')
        for p in participantes if p.get('pernr')
    }
    
    formatos_busqueda = [año_fiscal]
    if año_fiscal.startswith("AF"):
        año_num = int(año_fiscal[2:])
        formatos_busqueda.append(f"20{año_num-1}20{año_num:02d}")
    else:
        formatos_busqueda.append(f"AF{año_fiscal[6:8]}")
    
    evaluaciones = Evaluacion.query.filter(
        Evaluacion.año_fiscal.in_(formatos_busqueda)
    ).all()
    
    if not evaluaciones:
        return jsonify({'success': False, 'mensaje': f'No se encontraron evaluaciones para {año_fiscal}'}), 404
    
    culminados = 0  # cumplen flujo completo → enviado_sap=True
    parciales  = 0  # no cumplen, pero tienen valores > 0
    vacios     = 0  # no cumplen y valores en 0
    errores    = 0
    
    for evaluacion in evaluaciones:
        ficha   = evaluacion.ficha_usuario
        af_real = evaluacion.año_fiscal
        
        if ficha in FICHAS_EXCLUIDAS:
            continue
        
        nivel   = niveles_por_ficha.get(ficha)
        usuario = User.get_by_ficha(ficha)
        filial  = usuario.filial if usuario else 'N/A'
        
        try:

            formatos_año_ind = [af_real]
            if af_real.startswith("AF"):
                an = int(af_real[2:])
                formatos_año_ind.append(f"20{an-1}20{an:02d}")
            else:
                formatos_año_ind.append(f"AF{af_real[6:8]}")
            
            # Cumplimiento: solo indicadores aprobados
            indicadores = Indicadores.query.filter(
                Indicadores.ficha_usuario == ficha,
                Indicadores.año_fiscal.in_(formatos_año_ind)
            ).all()
            indicadores_aprobados = [i for i in indicadores if i.status_aprobacion == 'A']
            safe_cumplimiento = round(
                sum(float(i.cumplimiento) for i in indicadores_aprobados if i.cumplimiento),
                2
            )
            
            # Desempeño desde la evaluación
            raw_total = evaluacion.total
            try:
                safe_desempeño = float(raw_total) if raw_total not in (None, '', '---', 0) else 0
            except (ValueError, TypeError):
                safe_desempeño = 0
            
            total_final = round(safe_desempeño + safe_cumplimiento, 1)
            
            # ── Validar flujo completo ──
            validacion = validar_flujo_completo_usuario(
                ficha_participante=ficha,
                año_fiscal=af_real,
                nivel_usuario=nivel
            )
            
            # ── Guardar SIEMPRE (con valores reales, no resetear a 0) ──
            ResultadoFinal.guardar(
                ficha_usuario=ficha,
                año_fiscal=af_real,
                total_competencias=safe_desempeño,
                total_indicadores=safe_cumplimiento,
                total_final=total_final,
                filial=filial,
                nivel=nivel,
                enviado_sap=validacion['completo']
            )
            
            # Clasificar para el reporte de respuesta
            if validacion['completo']:
                culminados += 1
            elif total_final > 0:
                parciales += 1
            else:
                vacios += 1
        
        except Exception as e:
            print(f"Error sincronizando ficha {ficha}: {str(e)}")
            errores += 1
    
    return jsonify({
        'success': True,
        'año_fiscal': año_fiscal,
        'resumen': {
            'total_procesados': len(evaluaciones),
            'culminados': culminados,
            'parciales': parciales,
            'vacios':    vacios,
            'errores':   errores
        }
    }), 200

@page.route('/app_crm/corregir_supervisores/<year_fiscal>', methods=['GET'])
@login_required
def corregir_supervisores(year_fiscal):
    print(current_user.nivel_usuario)  
    if current_user.nivel_usuario != 'admin' and current_user.nivel_usuario != "Administrador":
        return jsonify({'error': 'No autorizado'}), 403

    resultado = Evaluacion.corregir_supervisores_masivo(
        año_fiscal=year_fiscal,
        participantes_gdd_fn=participantes_gdd,   
        procesar_ficha_fn=procesar_ficha
    )

    return jsonify(resultado)

@page.route('/app_crm/gdd/api/recalcular-nivel-i', methods=['POST'])
@login_required
def api_recalcular_nivel_i():
    """
    Recalcula evaluaciones Nivel I mal computadas por el bug del calcularCumplimiento.
    
    Body JSON:
        { "año_fiscal": "AF26", "dry_run": true }   ← por defecto dry_run=True
    
    USO: primero llamar con dry_run=true para ver reporte,
            después con dry_run=false para ejecutar.
    """
    if current_user.nivel_usuario != 'admin' and current_user.nivel_usuario != "Administrador":
        return jsonify({'error': 'No autorizado'}), 403
    
    data = request.get_json() or {}
    año_fiscal = data.get('año_fiscal')
    dry_run = data.get('dry_run', True)  # seguro por defecto
    
    if not año_fiscal:
        return jsonify({'success': False, 'error': 'Falta año_fiscal'}), 400
    
    resultado = Evaluacion.recalcular_nivel_i(año_fiscal=año_fiscal, dry_run=dry_run)
    
    if not resultado['success']:
        return jsonify(resultado), 500
    
    return jsonify(resultado), 200
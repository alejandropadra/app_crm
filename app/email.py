import time
import datetime
from threading import Thread
import asyncio
from aiosmtplib import SMTP
from email.message import EmailMessage
from flask import current_app, render_template
from flask_mail import Message
import sys
from .models import GestionCorreos

from concurrent.futures import ThreadPoolExecutor

import logging


from . import mail

def send_async_mail(app, message): ##ESTO LO HIZO ELIEZER PARA RPOBAR PQ NO ENTIENDE NADA, LO QUE HICE FUE PONER PRINTS PA VER QLQ
    """Envía email de forma asíncrona"""
    try:
        with app.app_context():
            mail.send(message)
            print(f"Email enviado exitosamente a: {message.recipients}")
    except Exception as e:
        print(f"Error enviando email: {str(e)}")
        print("---------------------------------------------------")
        
        
        

def send_mass_email(users, subject, template, delay=5, **template_vars):
    """
    Envía correos electrónicos en lotes de 5 con pausas entre lotes
    
    Args:
        users: Lista de usuarios (deben tener atributo email)
        subject: Asunto del correo
        template: Plantilla HTML del correo
        delay: Segundos de espera entre lotes (default 5)
        **template_vars: Variables adicionales para pasar al template
    """
    app = current_app._get_current_object()  
    batch_size = 5
    
    for i in range(0, len(users), batch_size):
        batch = users[i:i + batch_size]
        
        for user in batch:
            print(f"enviando a {user}")
            print("--------------------------------------------------------------------------------------------------")
            print("--------------------------------------------------------------------------------------------------")
            try:
                message = Message(
                    subject,
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[user]
                )
                
                """aqui solo me estoy asegurando de que se pasen en las variables, los contextos de user, es decir, que en los html puedo usar 
                {{ user.nombre }}
                {{ user.email }}
                {{ user.ficha }}
                """
                template_context = {'user': user}
                template_context.update(template_vars)
                """Aqui se las estoy pasando junto con el template"""
                message.html = render_template(template, **template_context)
                
                thread = Thread(target=send_async_mail, args=[app, message])
                thread.start()
                
            except Exception as e:
                print(f"Error preparando email para {user.email}: {str(e)}")
        

        if i + batch_size < len(users):
            time.sleep(delay)



def welcome_mail(user,clave, ):
    print('entro')
    app = current_app._get_current_object()
    message = Message('Bienvenido a la Plataforma de Gestión del Desempeño',
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[user.email])

    message.html = render_template('email/bienvenida.html', user=user, clave=clave)

    thread = Thread(target=send_async_mail, args=[app, message])
    thread.start()
    
    
def Prueba_mail(user,texto ):

    app = current_app._get_current_object()
    message = Message('Indicadores cargados por Eunice León - Requiere su aprobación',
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[user.email])

    message.html = render_template('email/inicio_gdd.html', user=user, texto=texto)

    thread = Thread(target=send_async_mail, args=[app, message])
    thread.start()


def aprobacion_indicadores(user, nombre_dueño_indicador, apellido_dueño_indicador, lista_indicadores, email):
    app = current_app._get_current_object()
    message = Message('Indicadores funcionales Aprobados y/o Rechazados',
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[email])
    message.html = render_template('email/indicadores_aprobados.html', user=user, nombre_dueño_indicador= nombre_dueño_indicador, apellido_dueño_indicador= apellido_dueño_indicador, lista_indicadores=lista_indicadores)
    thread = Thread(target=send_async_mail, args=[app, message])
    thread.start()

def indicadores_cargados(user, supervisor, url, año_fiscal):
    app = current_app._get_current_object()
    message = Message(f'Indicadores cargados por {user.nombre.title()} {user.apellido.title()}- Requiere su aprobación',
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[supervisor.email])
    message.html = render_template('email/indicadores_cargados.html', user=user, url=url, año_fiscal=año_fiscal)
    thread = Thread(target=send_async_mail, args=[app, message])
    thread.start()

def Seleccionado_evaluador(subordinado, supervisor):
    app = current_app._get_current_object()
    message = Message(f'Notificación de evaluación a supervisor {supervisor.nombre} {supervisor.apellido} ',
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[subordinado.email])
    message.html = render_template('email/seleccionado_evaluador.html', subordinado=subordinado, supervisor=supervisor)
    thread = Thread(target=send_async_mail, args=[app, message])
    thread.start()
    
def seleccionado_par(par, a_quien_evaluar):
    app = current_app._get_current_object()
    message = Message(f'Notificación de evaluación a par: {a_quien_evaluar.nombre} {a_quien_evaluar.apellido} ',
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[par.email])
    message.html = render_template('email/seleccionado_par.html', a_quien_evaluar=a_quien_evaluar, par=par)
    thread = Thread(target=send_async_mail, args=[app, message])
    thread.start()

def cambio_clave(usuario, nueva_clave):
    app = current_app._get_current_object()
    message = Message(f'Nueva clave de acceso - Plataforma de Gestión del Desempeño',
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[usuario.email])
    message.html = render_template('email/cambio_clave.html', usuario=usuario, nueva_clave=nueva_clave)
    thread = Thread(target=send_async_mail, args=[app, message])
    thread.start()

"""def Notificar_a_supervisor_evaluar_colaboradores(user, equipo):
    app = current_app._get_current_object()
    message = Message(f'Notificación de evaluación a colaboradores ',
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[user.email,'eliezergach1508@gmail.com' ])
    message.html = render_template('email/notificacion_evaluar_colaboradores.html', equipo=equipo)
    thread = Thread(target=send_async_mail, args=[app, message])
    thread.start()"""
    


# EN ESTAS FUNCIONES SON LOS CORREOS MASIVOS
##↓EN ESTA FUNCION ACUERDATE DE PASAR LITERALMENTE LA VARIABLE TEXTO AL JINJA↓
async def inicio_gdd(users, texto, año_fiscal):
    """Notificación masiva de inicio de periodo"""
    if isinstance(users, list):
        return await enviar_correo_masivo_async(users, "Inicio de periodo de carga de indicadores funcionales", "email/inicio_gdd.html", tipo_correo='Inicio_GDD', texto=texto, año_fiscal=año_fiscal)
    else:
        return await enviar_correo_masivo_async([users], "Inicio de periodo de carga de indicadores funcionales", "email/inicio_gdd.html", tipo_correo='Inicio_GDD', texto=texto, año_fiscal=año_fiscal)

async def cierre_gdd(users, texto):
    """Notificación masiva de cierre de periodo"""
    if isinstance(users, list):
        return await enviar_correo_masivo_async(users, 'Cierre periodo de carga indicadores funcionales', "email/cierre_carga.html", tipo_correo='Fin_GDD', texto=texto )
    else:
        return await enviar_correo_masivo_async([users], 'Cierre periodo de carga indicadores funcionales', "email/cierre_carga.html", tipo_correo='Fin_GDD', texto=texto )
    
async def inicio_periodo_evaluacion(users):
    """Notificación masiva de cierre de periodo"""
    if isinstance(users, list):
        return await enviar_correo_masivo_async(users, 'Cierre periodo de carga indicadores funcionales', "email/notificacion_evaluacion_general.html", tipo_correo='Inicio_periodo')
    else:
        return await enviar_correo_masivo_async([users], 'Cierre periodo de carga indicadores funcionales', "email/notificacion_evaluacion_general.html", tipo_correo='Inicio_periodo')

async def inicio_etapa_dos(users):
    """Notificación masiva de cierre de periodo"""
    if isinstance(users, list):
        return await enviar_correo_masivo_async(users, 'Inicio de carga de resultados de los indicadores funcionales e inicio del proceso de Evaluación de Competencia', "email/evaluacion_etapa2.html", tipo_correo='Inicio_estapa_dos')
    else:
        return await enviar_correo_masivo_async([users], 'resultados de los indicadores funcionales y el inicio del proceso de Evaluación de Competencia', "email/evaluacion_etapa2.html", tipo_correo='Inicio_estapa_dos')



async def inicio_CRE(users, texto):
    """Notificación para la carga de resultados GDD y comienzo de evaluación de competencia"""
    if isinstance(users, list):
        return await enviar_correo_masivo_async(users, 
                                                'Inicio de carga de resultados de los indicadores funcionales e inicio del proceso de Evaluación de Competencia', 
                                                "email/CRE.html", 
                                                texto=texto,
                                                tipo_correo='Inicio_estapa_dos')
    else:
        return await enviar_correo_masivo_async([users], 'resultados de los indicadores funcionales y el inicio del proceso de Evaluación de Competencia', "email/evaluacion_etapa2.html", tipo_correo='Inicio_estapa_dos')

async def inicio_avance(users, texto, año_fiscal):
    """Notificación masiva de cierre de periodo"""
    if isinstance(users, list):
        return await enviar_correo_masivo_async(users, 'Carga de Avances de Primer Semestre - GDD', "email/avances_primer_semestre.html", tipo_correo='avance_semestre', texto=texto, año_fiscal=año_fiscal)
    else:
        return await enviar_correo_masivo_async([users], 'Carga de Avances de Primer Semestre - GDD', "email/avances_primer_semestre.html", tipo_correo='avance_semestre', texto=texto, año_fiscal=año_fiscal)
    
# ↑↑EN ESTAS FUNCIONES SON LOS CORREOS MASIVOS↑↑




MAX_CONCURRENT = 2  # Reducido para evitar saturar el servidor
BATCH_SIZE = 15     # Procesar en lotes de 15 emails
DELAY_BETWEEN_BATCHES = 0.8  # Pausa de 0.8 segundos entre lotes


async def send_email(user_email, subject, html_content, smtp_user, smtp_pass, semaphore, tipo_correo):
    """Envía un email individual con reintentos"""
    async with semaphore:
        email = user_email.email if hasattr(user_email, 'email') else user_email
        max_retries = 3
        for attempt in range(max_retries):
            smtp = None
            try:
                message = EmailMessage()
                message["From"] = smtp_user
                message["To"] = user_email
                message["Subject"] = subject
                message.set_content("Este mensaje requiere un cliente compatible con HTML.")
                message.add_alternative(html_content, subtype='html')
                
                smtp = SMTP(
                    hostname=current_app.config['MAIL_SERVER'],
                    port=current_app.config['MAIL_PORT'],
                    start_tls=True,
                    timeout=20  
                )
                
                await smtp.connect()
                await smtp.login(smtp_user, smtp_pass)
                await smtp.send_message(message)
                await smtp.quit()
                
                print(f"Enviado a {user_email}")
                return {'success': True, 'email': email, 'tipo_correo': tipo_correo}

                
            except Exception as e:
                if smtp:
                    try:
                        await smtp.quit()
                    except:
                        pass
                
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2  # Backoff: 2s, 4s, 6s
                    print(f"Reintento {attempt + 1}/{max_retries} para {user_email} en {wait_time}s")
                    await asyncio.sleep(wait_time)
                else:
                    print(f"Error definitivo con {user_email}: {str(e)}")
                    return {'success': False, 'email': email, 'tipo_correo': tipo_correo, 'error': str(e)}

async def enviar_correo_masivo_async(users, subject, template, tipo_correo, **template_vars):
    """
    Esta versión debe ejecutarse desde un entorno async:
    await enviar_correo_masivo_async(...)
    """
    if not users:
        raise ValueError("Debe haber al menos un destinatario.")
    
    start_time = time.time()
    total_users = len(users)
    
    print(f"Iniciando envío masivo a {total_users} destinatarios")
    
    app = current_app._get_current_object()
    smtp_user = app.config['MAIL_USERNAME']
    smtp_pass = app.config['MAIL_PASSWORD']
    
    # Renderizar template una sola vez 
    html_content = render_template(template, **template_vars)
    
    # FILTRAR USUARIOS QUE YA FUERON ENVIADOS HOY
    hoy = datetime.date.today()
    usuarios_filtrados = []
    usuarios_omitidos = []
    
    for user in users:
        email = user.email if hasattr(user, 'email') else user
        if not GestionCorreos.ya_enviado_hoy(email, tipo_correo):
            usuarios_filtrados.append(user)
        else:
            usuarios_omitidos.append(email)
    
    if usuarios_omitidos:
        print(f"{len(usuarios_omitidos)} emails ya fueron enviados hoy y se omitirán del envío")
    
    if not usuarios_filtrados:
        print(" No hay emails nuevos para enviar. Todos ya fueron enviados hoy.")
        return {
            'total_sent': 0,
            'total_failed': 0,
            'success_rate': 0,
            'duration': 0,
            'skipped': len(usuarios_omitidos)
        }
    
    print(f"Se enviarán {len(usuarios_filtrados)} emails nuevos")
    
    # Guardar en la BD ANTES de enviar (solo los filtrados)
    envios_data = [
        {
            'email': user.email if hasattr(user, 'email') else user,
            'tipo_correo': tipo_correo,
            'asunto': subject,
            'estado': 'pendiente',
            'enviado_por': 'sistema'
        }
        for user in usuarios_filtrados
    ]
    registrados = GestionCorreos.registrar_envios_bulk(envios_data)
    print(f" Registrados {registrados} emails en BD")
    
    successful_sends = 0
    failed_sends = 0
    total_a_enviar = len(usuarios_filtrados)
    
    # Procesar SOLO los usuarios filtrados (no duplicados)
    for i in range(0, total_a_enviar, BATCH_SIZE):
        batch = usuarios_filtrados[i:i + BATCH_SIZE] 
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = (total_a_enviar + BATCH_SIZE - 1) // BATCH_SIZE
        
        print(f"Procesando lote {batch_num}/{total_batches} ({len(batch)} emails)")
        
        # Crear semáforo para este lote
        semaphore = asyncio.Semaphore(MAX_CONCURRENT)
        
        # Crear tareas para el lote actual
        tasks = [
            asyncio.create_task(send_email(
                user.email if hasattr(user, 'email') else user, 
                subject, 
                html_content, 
                smtp_user, 
                smtp_pass, 
                semaphore, 
                tipo_correo
            ))
            for user in batch
        ]
        
        # Ejecutar lote y contar resultados
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Actualizar BD y contar éxitos/fallos
        for result in batch_results:
            if isinstance(result, dict):
                if result['success']:
                    GestionCorreos.marcar_como_enviado(result['email'], result['tipo_correo'])
                    successful_sends += 1
                else:
                    GestionCorreos.marcar_como_fallido(result['email'], result['tipo_correo'], result.get('error', 'Error desconocido'))
                    failed_sends += 1
            else:
                # Si hubo una excepción no manejada
                failed_sends += 1
        
        # Pausa entre lotes (excepto en el último)
        if i + BATCH_SIZE < total_a_enviar:
            print(f"Pausa de {DELAY_BETWEEN_BATCHES}s antes del siguiente lote")
            await asyncio.sleep(DELAY_BETWEEN_BATCHES)
    
    end_time = time.time()
    duration = end_time - start_time
    success_rate = (successful_sends / total_a_enviar * 100) if total_a_enviar > 0 else 0
    
    print(f"Completado en {duration:.2f}s:")
    print(f"Enviados: {successful_sends}")
    print(f"Fallidos: {failed_sends}")
    print(f"Omitidos: {len(usuarios_omitidos)}")
    print(f"Tasa de éxito: {success_rate:.1f}%")
    
    return {
        'total_sent': successful_sends,
        'total_failed': failed_sends,
        'skipped': len(usuarios_omitidos),
        'success_rate': success_rate,
        'duration': duration
    }





def enviar_notificacion_individual_mejorada(app, user, equipo, delay=0):
    """
    Envía notificación individual con datos específicos del usuario, usando el contexto correcto de Flask.
    """
    try:
        if delay > 0:
            time.sleep(delay)

        with app.app_context():  
            message = Message(
                'Notificación de evaluación a colaboradores',
                sender=app.config['MAIL_USERNAME'],
                recipients=[user.email]  
            )
            message.html = render_template('email/notificacion_evaluar_colaboradores.html', 
                                            user=user, equipo=equipo)
            mail.send(message)

        print(f" Correo enviado a {user.email}")
        return {"success": True, "email": user.email}

    except Exception as e:
        print(f" Error enviando a {user.email}: {str(e)}")
        return {"success": False, "email": user.email, "error": str(e)}

def procesar_notificaciones_individuales(app, users_data):
    resultados = {"enviados": 0, "fallidos": 0, "errores": []}

    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {}
        
        for i, (user, equipo) in enumerate(users_data):
            delay = i * 1.0
            future = executor.submit(enviar_notificacion_individual_mejorada, app, user, equipo, delay)
            futures[future] = user.email

        for future in futures:
            try:
                resultado = future.result(timeout=45)
                if resultado["success"]:
                    resultados["enviados"] += 1
                else:
                    resultados["fallidos"] += 1
                    resultados["errores"].append(f"{futures[future]}: {resultado.get('error')}")
            except Exception as e:
                resultados["fallidos"] += 1
                resultados["errores"].append(f"{futures[future]}: {str(e)}")

    print(f"Proceso completado: {resultados['enviados']} enviados, {resultados['fallidos']} fallidos")
    return resultados





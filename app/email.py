import time
from threading import Thread
import asyncio
from aiosmtplib import SMTP
from email.message import EmailMessage
from flask import current_app, render_template
from flask_mail import Message
import sys

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

def indicadores_cargados(user, supervisor):
    app = current_app._get_current_object()
    message = Message(f'Indicadores cargados por {user.nombre.title()} {user.apellido.title()}- Requiere su aprobación',
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[supervisor.email])
    message.html = render_template('email/indicadores_cargados.html', user=user)
    thread = Thread(target=send_async_mail, args=[app, message])
    thread.start()

def Seleccionado_evaluador(subordinado, supervisor):
    app = current_app._get_current_object()
    message = Message(f'Notificación de evaluación a supervisor {supervisor.nombre} {supervisor.apellido} ',
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[subordinado.email,'eliezergach1508@gmail.com' ])
    message.html = render_template('email/seleccionado_evaluador.html', subordinado=subordinado, supervisor=supervisor)
    thread = Thread(target=send_async_mail, args=[app, message])
    thread.start()
    
def seleccionado_par(par, a_quien_evaluar):
    app = current_app._get_current_object()
    message = Message(f'Notificación de evaluación a par: {a_quien_evaluar.nombre} {a_quien_evaluar.apellido} ',
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[par.email,'eliezergach1508@gmail.com' ])
    message.html = render_template('email/seleccionado_par.html', a_quien_evaluar=a_quien_evaluar, par=par)
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
async def inicio_gdd(users, texto):
    """Notificación masiva de inicio de periodo"""
    if isinstance(users, list):
        return await enviar_correo_masivo_async(users, "Inicio de periodo de carga de indicadores funcionales", "email/inicio_gdd.html", texto=texto)
    else:
        return await enviar_correo_masivo_async([users], "Inicio de periodo de carga de indicadores funcionales", "email/inicio_gdd.html", texto=texto)

async def cierre_gdd(users, texto):
    """Notificación masiva de cierre de periodo"""
    if isinstance(users, list):
        return await enviar_correo_masivo_async(users, 'Cierre periodo de carga indicadores funcionales', "email/cierre_carga.html", texto=texto)
    else:
        return await enviar_correo_masivo_async([users], 'Cierre periodo de carga indicadores funcionales', "email/cierre_carga.html", texto=texto)
    
async def inicio_periodo_evaluacion(users):
    """Notificación masiva de cierre de periodo"""
    if isinstance(users, list):
        return await enviar_correo_masivo_async(users, 'Cierre periodo de carga indicadores funcionales', "email/notificacion_evaluacion_general.html")
    else:
        return await enviar_correo_masivo_async([users], 'Cierre periodo de carga indicadores funcionales', "email/notificacion_evaluacion_general.html")

# ↑↑EN ESTAS FUNCIONES SON LOS CORREOS MASIVOS↑↑






"""
def cierre_carga(users):
    if isinstance(users, list):
        send_mass_email(users, 
                    'Cierre periodo de carga indicadores funcionales', 
                    'email/cierre_carga.html')
    else:
        send_mass_email([users], 
                    'Cierre periodo de carga indicadores funcionales', 
                    'email/cierre_carga.html')
"""


"""def indicadores_cargados(user):
    message = Message('Indicadores cargados por Nombre del Colaborador - Requiere su aprobación',
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=[user.email])
    
    message.html = render_template('email/indicadores_cargados.html', user=user)
    thread = Thread(target=send_async_mail, args=[message])
    thread.start()"""
"""
def aprobacion_indicadores(user):
    message = Message('Indicadores funcionales aprobados',
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=[user.email])
    
    message.html = render_template('email/aprobacion_indicadores.html', user=user)
    thread = Thread(target=send_async_mail, args=[message])
    thread.start()
    """


MAX_CONCURRENT = 2  # Reducido para evitar saturar el servidor
BATCH_SIZE = 15     # Procesar en lotes de 15 emails
DELAY_BETWEEN_BATCHES = 0.8  # Pausa de 0.8 segundos entre lotes


async def send_email(user_email, subject, html_content, smtp_user, smtp_pass, semaphore):
    """Envía un email individual con reintentos"""
    async with semaphore:
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
                
                print(f"✅ Enviado a {user_email}")
                return True
                
            except Exception as e:
                if smtp:
                    try:
                        await smtp.quit()
                    except:
                        pass
                
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2  # Backoff: 2s, 4s, 6s
                    print(f"⚠️ Reintento {attempt + 1}/{max_retries} para {user_email} en {wait_time}s")
                    await asyncio.sleep(wait_time)
                else:
                    print(f"❌ Error definitivo con {user_email}: {str(e)}")
                    return False

async def enviar_correo_masivo_async(users, subject, template, **template_vars):
    """
    Esta versión debe ejecutarse desde un entorno async:
    await enviar_correo_masivo_async(...)
    """
    if not users:
        raise ValueError("Debe haber al menos un destinatario.")
    
    start_time = time.time()
    total_users = len(users)
    successful_sends = 0
    failed_sends = 0
    
    print(f"Iniciando envío masivo a {total_users} destinatarios")
    
    app = current_app._get_current_object()
    smtp_user = app.config['MAIL_USERNAME']
    smtp_pass = app.config['MAIL_PASSWORD']
    
    # Renderizar template una sola vez 
    html_content = render_template(template, **template_vars)
    
    # Procesar en lotes para evitar saturar el servidor
    for i in range(0, total_users, BATCH_SIZE):
        batch = users[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = (total_users + BATCH_SIZE - 1) // BATCH_SIZE
        
        print(f"📦 Procesando lote {batch_num}/{total_batches} ({len(batch)} emails)")
        
        # Crear semáforo para este lote
        semaphore = asyncio.Semaphore(MAX_CONCURRENT)
        
        # Crear tareas para el lote actual
        tasks = [
            asyncio.create_task(send_email(user.email, subject, html_content, smtp_user, smtp_pass, semaphore))
            for user in batch
        ]
        
        # Ejecutar lote y contar resultados
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Contar éxitos y fallos
        for result in batch_results:
            if result is True:
                successful_sends += 1
            else:
                failed_sends += 1
        
        # Pausa entre lotes (excepto en el último)
        if i + BATCH_SIZE < total_users:
            print(f"⏸️ Pausa de {DELAY_BETWEEN_BATCHES}s antes del siguiente lote")
            await asyncio.sleep(DELAY_BETWEEN_BATCHES)
    
    # Estadísticas finales
    end_time = time.time()
    duration = end_time - start_time
    success_rate = (successful_sends / total_users * 100) if total_users > 0 else 0
    
    print(f"Completado en {duration:.2f}s:")
    print(f" Enviados: {successful_sends}")
    print(f" Fallidos: {failed_sends}")
    print(f"Tasa de éxito: {success_rate:.1f}%")
    
    return {
        'total_sent': successful_sends,
        'total_failed': failed_sends,
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

        print(f"✅ Correo enviado a {user.email}")
        return {"success": True, "email": user.email}

    except Exception as e:
        print(f"❌ Error enviando a {user.email}: {str(e)}")
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













#Esto es una función de prueba para enviar masivamente por copia oculta
""" 
def enviar_correo_masivo(users, asunto, template, **template_vars):
    
    Envía un único correo HTML a múltiples destinatarios:
    - El primero en To
    - El resto en BCC (ocultos)
    - Usa un template HTML con variables dinámicas

    Args:
        users (list): lista de emails (str)
        asunto (str): asunto del correo
        template (str): ruta al template HTML
        **template_vars: variables para el template (ej: texto="Hola")
    
    if not users or len(users) < 1:
        raise ValueError("Debe haber al menos un destinatario")

    app = current_app._get_current_object()

    # Renderiza el HTML del mensaje con las variables proporcionadas
    html_content = render_template(template, **template_vars)

    msg = Message(
        subject=asunto,
        recipients=[users[0]],
        bcc=users[1:],
        html=html_content,  # ENVÍA HTML, no plain text
        sender=app.config['MAIL_USERNAME']
    )

    mail.send(msg)
    print(f"✅ Correo enviado a {users[0]} con {len(users[1:])} BCC ocultos.")"""

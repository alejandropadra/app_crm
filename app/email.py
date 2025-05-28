import time
from threading import Thread
import asyncio
from aiosmtplib import SMTP
from email.message import EmailMessage
from flask import current_app, render_template
from flask_mail import Message
import sys


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
    
    


# EN ESTAS FUNCIONES SON LOS CORREOS MASIVOS
##↓EN ESTA FUNCION ACUERDATE DE PASAR LITERALMENTE LA VARIABLE TEXTO AL JINJA↓
async def inicio_gdd(users, texto ):
    """Notificación masiva de inicio de periodo"""
    if isinstance(users, list):
        await enviar_correo_masivo_async(users, "Inicio de periodo de carga de indicadores funcionales", "email/inicio_gdd.html", texto=texto)
    else:
        await enviar_correo_masivo_async(users, "Inicio de periodo de carga de indicadores funcionales", "email/inicio_gdd.html", texto=texto)
        
async def cierre_gdd(users, texto ):
    """Notificación masiva de cierre de periodo"""
    if isinstance(users, list):
        await enviar_correo_masivo_async(users, 'Cierre periodo de carga indicadores funcionales', "email/cierre_carga.html", texto=texto)
    else:
        await enviar_correo_masivo_async(users, 'Cierre periodo de carga indicadores funcionales', "email/cierre_carga.html", texto=texto)

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




MAX_CONCURRENT = 3

async def send_email(user_email, subject, html_content, smtp_user, smtp_pass, semaphore):
    async with semaphore:
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
                start_tls=True  # ✅ Automáticamente usa STARTTLS después de conectar
            )
            await smtp.connect()
            await smtp.login(smtp_user, smtp_pass)
            await smtp.send_message(message)
            await smtp.quit()

            print(f"✅ Enviado a {user_email}")
        except Exception as e:
            print(f"❌ Error con {user_email}: {str(e)}")

async def enviar_correo_masivo_async(users, subject, template, **template_vars):
    """
    Esta versión debe ejecutarse desde un entorno async:
    await enviar_correo_masivo_async(...)
    """
    if not users:
        raise ValueError("Debe haber al menos un destinatario.")

    app = current_app._get_current_object()
    smtp_user = app.config['MAIL_USERNAME']
    smtp_pass = app.config['MAIL_PASSWORD']
    html_content = render_template(template, **template_vars)

    semaphore = asyncio.Semaphore(MAX_CONCURRENT)

    tasks = [
        asyncio.create_task(send_email(user.email, subject, html_content, smtp_user, smtp_pass, semaphore))
        for user in users
    ]

    await asyncio.gather(*tasks)















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

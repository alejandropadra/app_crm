from datetime import datetime

import hashlib

import random
import string
import secrets

def generar_contrasena_aleatoria(longitud=8):
    """Genera una contraseña aleatoria SOLO con letras mayúsculas y minúsculas."""
    # string.ascii_letters contiene 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    letras = string.ascii_letters
    contrasena = ''.join(secrets.choice(letras) for _ in range(longitud))
    return contrasena

def obtener_hora_minutos_segundos_fecha():
    ahora = datetime.now()
    hora_min_seg = ahora.strftime("%H%M%S")
    fecha = ahora.strftime("%d%m%Y")
    return hora_min_seg,fecha

def cadena_md5(sociedad,cliente,hora_total,fecha):
    cadena = sociedad+cliente+hora_total+fecha
    cadena_md5 = hashlib.md5(cadena.encode()).hexdigest()
    return cadena_md5


def fecha_sap():
    fecha = datetime.now()
    fecha = fecha.strftime("%Y%m%d")
    fecha_objeto = datetime.strptime(fecha, "%Y%m%d")
    fecha = fecha_objeto.strftime("%Y%m%d")
    return fecha

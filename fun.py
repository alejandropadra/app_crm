"""
Esta funcion es para darle el formato de la ficha de los ultimos 4 numeros
si el si el numero numero 5 (de izquierda a derecha) es mayor que 0, pues este se toma
"""
def format_ficha(ficha):
    ficha = str(ficha)
    if len(ficha) > 4 and int(ficha[-5]) > 0:
        return ficha
    else:
        return ficha[-4:]
class servicio_notificacion:
    """
    Define los tipos de notificaciones y sus mensajes predefinidos.
    """
    TIPOS = {
        'bienvenida': {
            'mensaje': "Bienvenido a nuestra plataforma, {usuario}!",
            'descripcion': "Notificación enviada al usuario al registrarse.",
        },
        'Nuevo registro':{
            'mensaje': "Se ha registrado una nueva Queja/Reclamo con el numero {numero}",
            'descripcion': "Notificación enviada al usuario para indicar una nueva Q/R",
        },
        'editada':{
            'mensaje': "Se ha editado la Queja/Reclamo # {numero}",
            'descripcion': "Notificación enviada al usuario para indicar que se ha editado una Q/R",
        }
    }
    
    @classmethod
    def obtener_mensaje(cls, tipo, **kwargs):
        """
        Obtiene el mensaje predefinido para un tipo de notificación y reemplaza las variables dinámicas.
        """
        if tipo not in cls.TIPOS:
            raise ValueError(f"Tipo de notificación no válido: {tipo}")
        mensaje = cls.TIPOS[tipo]['mensaje']
        return mensaje.format(**kwargs)
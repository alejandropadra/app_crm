import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash,check_password_hash 
from sqlalchemy.exc import IntegrityError
import json

from . import db

#========Esta es la tabla para manejar los USUARIOS de la aplicacion =====================================
class User(db.Model, UserMixin):
    __tablename__ = 'users'

    ficha = db.Column(db.Integer, primary_key=True, nullable=False)  
    nombre = db.Column(db.String(50), nullable=False)  
    apellido = db.Column(db.String(50), nullable=False)  
    email = db.Column(db.String(100), unique=True, nullable=False)    
    filial = db.Column(db.String(50), nullable=False) 
    telefono = db.Column(db.String(20)) 
    path_imagen_user = db.Column(db.Text, nullable=False)
    nivel_usuario = db.Column(db.String(30), nullable=False)  
    encrypted_password = db.Column(db.String(120), nullable=False)  
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)  
    habilitacion_gdd = db.Column(db.String(30)) #Activo, bloqueado, evaluando
    # Relación uno-a-muchos con Indicador
    indicadores = db.relationship('Indicadores', back_populates='usuario', cascade='all, delete-orphan')

    def get_id(self):
        return str(self.ficha)

    def verify_password(self, password):
        """ 
        Verifica el loguin de la contraseña
        """
        return check_password_hash(self.encrypted_password, password)
    
    @classmethod
    def get_by_ficha(cls, ficha):
        """
        Busca un usuario por su nombre de usuario (ficha).
        """
        return cls.query.filter_by(ficha=ficha).first()
    
    @classmethod
    def get_by_usuarios(cls):

        return cls.query.all()
    
    @classmethod
    def estado_gdd(cls, ficha):
        usuario = User.get_by_ficha(ficha)
        return usuario.habilitacion_gdd
    
    @classmethod
    def update_estado_gdd(cls,ficha, estado):
        usuario = User.get_by_ficha(ficha)
        if not usuario:
            raise Exception("Usuario no encontrado")
        try:
            
            usuario.habilitacion_gdd = estado
            print(estado)
            db.session.add(usuario)
            db.session.commit()
            print("se guardo")
            return True
        except IntegrityError as e:
            db.session.rollback()
            print(f"Error de integridad: {e.orig}")  
            raise Exception(f"Error de integridad: {str(e.orig)}")  

        except Exception as e:
            db.session.rollback()
            raise Exception(f"Error al insertar usuario: {str(e)}")


    @classmethod
    def insertar_usuario(cls, nombre, apellido, email,  filial, ficha, nivel_usuario, password, telefono):
        """
        Inserta un nuevo usuario en la tabla `users`, manejando errores de integridad.
        """
        try:
            encrypted_password = generate_password_hash(password)  
            path_imagen_user = f"img/fotos_personal/{ficha}.jpg"  
            
            nuevo_usuario = cls(
                nombre=nombre,
                apellido=apellido,
                email=email,
                filial=filial,
                ficha=ficha,
                nivel_usuario=nivel_usuario,
                telefono= telefono,
                encrypted_password=encrypted_password,
                path_imagen_user=path_imagen_user
            )
            
            db.session.add(nuevo_usuario)
            db.session.commit()

            return nuevo_usuario

        except IntegrityError as e:
            db.session.rollback()
            print(f"Error de integridad: {e.orig}")  
            raise Exception(f"Error de integridad: {str(e.orig)}")  

        except Exception as e:
            db.session.rollback()
            raise Exception(f"Error al insertar usuario: {str(e)}")


    @classmethod
    def update_clave_telefono(cls,ficha, clave, telefono):
        usuario = User.get_by_ficha(ficha)
        if not usuario:
            raise Exception("Usuario no encontrado")
        try:
            if clave:
                usuario.encrypted_password = generate_password_hash(clave)
                print(clave)
            if telefono:
                usuario.telefono = telefono
                print(telefono)
            db.session.add(usuario)
            db.session.commit()
            print("se guardo")
            return True
        except IntegrityError as e:
            db.session.rollback()
            print(f"Error de integridad: {e.orig}")  
            raise Exception(f"Error de integridad: {str(e.orig)}")  

        except Exception as e:
            db.session.rollback()
            raise Exception(f"Error al insertar usuario: {str(e)}")

    @classmethod
    def actualizar_password(cls, ficha, nueva_password):
        """
        Actualiza la contraseña y opcionalmente el teléfono de un usuario.

        param ficha: Identificador único del usuario (ficha).
        param nueva_password: Nueva contraseña en texto plano.
        param nuevo_telefono: Nuevo número de teléfono (opcional).
        return: `True` si la actualización fue exitosa, `False` en caso contrario.
        """
        try:
            usuario = cls.get_by_ficha(ficha)
            if not usuario:
                raise Exception("Usuario no encontrado.")

            usuario.encrypted_password = generate_password_hash(nueva_password)

            db.session.commit()
            return True  

        except IntegrityError as e:
            db.session.rollback()
            print(f"Error de integridad: {e.orig}")
            return False

        except Exception as e:
            db.session.rollback()
            print(f"Error al actualizar usuario: {str(e)}")
            return False



    @classmethod
    def obtener_todos_los_estados_gdd(cls):
        """
        Devuelve una lista con los valores literales de la columna 'habilitacion_gdd' de todos los usuarios.
        return: Lista de strings.
        """
        try:
            estados = db.session.query(cls.habilitacion_gdd).all()
            # Extrae solo los strings desde las tuplas
            return [estado[0] for estado in estados if estado[0] is not None]

        except Exception as e:
            print(f"Error al consultar estados GDD: {str(e)}")
            raise Exception("No se pudo obtener los estados de habilitación GDD.")
        
    @classmethod
    def actualizar_telefono(cls, ficha, nuevo_telefono):
        """
        Actualiza la contraseña y opcionalmente el teléfono de un usuario.

        param ficha: Identificador único del usuario (ficha).
        param nueva_password: Nueva contraseña en texto plano.
        param nuevo_telefono: Nuevo número de teléfono (opcional).
        return: `True` si la actualización fue exitosa, `False` en caso contrario.
        """
        try:
            usuario = cls.get_by_ficha(ficha)
            if not usuario:
                raise Exception("Usuario no encontrado.")

            if nuevo_telefono is not None:
                usuario.telefono = nuevo_telefono

            db.session.commit()
            return True  

        except IntegrityError as e:
            db.session.rollback()
            print(f"Error de integridad: {e.orig}")
            return False

        except Exception as e:
            db.session.rollback()
            print(f"Error al actualizar usuario: {str(e)}")
            return False

    @classmethod
    def actualizar_status_global(cls, nuevo_status):
        try:
            filas_afectadas = db.session.query(cls).update({'habilitacion_gdd': nuevo_status})
            db.session.commit()
            print("Todo OK")
            return True, f"Se actualizaron {filas_afectadas} registros correctamente"
        except Exception as e:
            db.session.rollback()
            return False, f"Error al actualizar: {str(e)}"
        
    @classmethod
    def update(self, ficha,password=None, email=None, nivel=None, telefono = None):
        """
        Método de instancia para actualizar campos específicos.
        Actualiza solo los campos que recibe (no None).
        """
        usuario = User.get_by_ficha(ficha)
        if not usuario:
            return None
        if password is not None:
            usuario.encrypted_password = generate_password_hash(password)
        if email is not None:
            usuario.email = email
        if nivel is not None:
            usuario.nivel = nivel
        if telefono is not None:
            usuario.telefono = telefono
        
        db.session.commit()
        return usuario

class Indicadores(db.Model):
    __tablename__ = 'indicadores'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_indicador = db.Column(db.String(400), nullable=False)
    tendencia = db.Column(db.String(50))
    peso = db.Column(db.Float)
    real_af_antes = db.Column(db.Float)
    objetivo_af_actual = db.Column(db.Float)
    real_af_actual = db.Column(db.Float)
    cumplimiento = db.Column(db.Float)
    desempeno = db.Column(db.String(50))
    status = db.Column(db.String(50))#True, False
    status_aprobacion = db.Column(db.String(50))#True, False
    fecha_creacion = db.Column(db.DateTime, default=datetime.datetime.now)
    fecha_edicion = db.Column(db.DateTime, onupdate=datetime.datetime.now)
    fecha_aprobacion = db.Column(db.DateTime)
    # Clave foránea que referencia al usuario
    ficha_usuario = db.Column(db.Integer, db.ForeignKey('users.ficha'), nullable=False)
    año_fiscal = db.Column(db.Integer, nullable=False)
    # Relación muchos a uno con User
    usuario = db.relationship('User', back_populates='indicadores')
    
    # Relación uno-a-uno con HojaVida, se agrega delete on cascade
    hoja_de_vida = db.relationship('HojaVida', back_populates='indicador', uselist=False, cascade='all, delete-orphan')
    # Relación uno-a-muchos con Cronograma
    cronograma = db.relationship('Cronograma',back_populates='indicador', cascade='all, delete-orphan')


    @staticmethod
    def validar_limite_indicadores(ficha_trabajador, año_actual, limite=3):
        """Verifica si un usuario puede agregar un nuevo indicador en un año específico."""
        cantidad = Indicadores.query.filter_by(ficha_trabajador=ficha_trabajador, año=año_actual).count()
        return cantidad < limite
    
    @classmethod
    def create_indicador(cls,ficha_usuario,nombre_indicador,tendencia,peso,real_af_antes,objetivo_af_actual,año_fiscal):  
        indicador = Indicadores(nombre_indicador= nombre_indicador,
                                tendencia=tendencia,
                                peso=peso,
                                real_af_antes=real_af_antes,
                                objetivo_af_actual=objetivo_af_actual,
                                ficha_usuario = ficha_usuario,
                                status = "Abierto",
                                año_fiscal = año_fiscal)
        
        db.session.add(indicador)
        db.session.commit()
        return indicador


    @classmethod
    def obtener_indicador(cls, indicador_id):
        """Obtiene un indicador específico por su ID"""
        return Indicadores.query.filter_by(id=indicador_id).first()
    
    @classmethod
    def obtener_todos_indicadores(cls):
        """Obtiene todos los indicadores registrados"""
        return cls.query.all()
    
    @classmethod
    def obtener_indicador_usuario(cls, ficha_usuario):
        """Obtiene un indicador específico por ficha de usuario"""
        return Indicadores.query.filter_by(ficha_usuario=ficha_usuario).all()

    @classmethod
    def obtener_nombre_indicador(cls,indicador_id):
        indicador = Indicadores.query.filter_by(id = indicador_id).first()
        return indicador.nombre_indicador if indicador else None
    
    @classmethod
    def existe_indicador_abierto(cls) -> bool:
        """
        Verifica si existe al menos un indicador con status 'Abierto'. Retorna: True si existe al menos un indicador abierto, False en caso contrario.
        """
        return db.session.query(
            db.exists().where(cls.status == "Abierto")
        ).scalar()

    @classmethod
    def update_indicador(cls, id, nombre_indicador, tendencia, peso, real_af_antes, objetivo_af_actual, real_af_actual, cumplimiento, desempeno, ficha_usuario, año_fiscal):
        print(f"Recibido nombre_indicador: {nombre_indicador}")
        
        # Obtener el indicador existente
        indicador = Indicadores.obtener_indicador(id)
        
        if indicador is None:
            print("ERROR: Indicador no encontrado")
            return False
        
        print(f"Antes de actualizar - nombre_indicador actual: {indicador.nombre_indicador}")
        
        # Actualizar los valores
        indicador.nombre_indicador = nombre_indicador
        indicador.tendencia = tendencia
        indicador.peso = peso
        indicador.real_af_antes = real_af_antes
        indicador.objetivo_af_actual = objetivo_af_actual
        indicador.real_af_actual = real_af_actual
        indicador.cumplimiento = cumplimiento
        indicador.desempeno = desempeno
        
        
        try:
            db.session.commit()
            print("Commit exitoso")
            
            
        except Exception as e:
            print(f"Error en commit: {str(e)}")
            db.session.rollback()
            return False
        return indicador
    
    @classmethod
    def delete_element(cls,id):
        indicador =Indicadores.obtener_indicador(id)

        if indicador is None:
            return False
        
        db.session.delete(indicador)
        db.session.commit()
        return True

    @classmethod
    def actualizar_status_global(cls, nuevo_status):
        try:
            filas_afectadas = db.session.query(cls).update({'status': nuevo_status})
            db.session.commit()
            print("Todo OK")
            return True, f"Se actualizaron {filas_afectadas} registros correctamente"
        except Exception as e:
            db.session.rollback()
            return False, f"Error al actualizar: {str(e)}"

    @classmethod
    def actualizar_indicadores_usuario(cls, ficha_usuario, ids_indicadores, nuevo_status):
        """
        Actualiza el status de indicadores específicos de un usuario
        
        Args:
            ficha_usuario (str): Ficha del usuario
            ids_indicadores (list): Lista de IDs de indicadores a modificar
            nuevo_status (str): Nuevo valor para el campo status
            
        Returns:
            bool: True si la actualización fue exitosa
        """
        try:
            # Actualización en una sola consulta SQL eficiente
            print(f"asdasdna {nuevo_status}")
            db.session.query(cls).filter(
                cls.id.in_(ids_indicadores),
                cls.ficha_usuario == ficha_usuario
            ).update({'status': nuevo_status})
            
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error al actualizar: {str(e)}")
            return False
        
    @classmethod
    def actualizar_aprobacion_indicadores_usuario(cls, ficha_usuario, id_indicador, nuevo_status):
        """
        Actualiza el status de indicadores específicos de un usuario
        
        Args:
            ficha_usuario (str): Ficha del usuario
            ids_indicadores (list): Lista de IDs de indicadores a modificar
            nuevo_status (str): Nuevo valor para el campo status
            
        Returns:
            bool: True si la actualización fue exitosa
        """
        try:
            result = db.session.query(cls).filter(
                cls.id == id_indicador,
                cls.ficha_usuario == ficha_usuario
            ).update({'status_aprobacion': nuevo_status}, synchronize_session='fetch')
            
            if result == 0:
                print(f"No se encontró el indicador con ID {id_indicador} para el usuario {ficha_usuario}.")
                return False

            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error al actualizar: {str(e)}")
            return False

#Tabla Hoja de Vida
class HojaVida(db.Model):
    __tablename__ = 'hoja_vida'

    id = db.Column(db.Integer, primary_key=True)
    vigencia_inicio = db.Column(db.Date)#asegurar que viene con el formato indicado
    vigencia_fin = db.Column(db.Date)#asegurar que viene con el formato indicado
    nivel_generacion = db.Column(db.String(50))
    nivel_util = db.Column(db.String(50))
    unidad_medida = db.Column(db.String(50))
    naturaleza = db.Column(db.Text)
    calculo = db.Column(db.Text)
    definicion = db.Column(db.Text, nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.datetime.now)
    indicador_id = db.Column(db.Integer, db.ForeignKey('indicadores.id'), unique=True, nullable=False)
    
    # Relación uno-a-uno con Indicador
    indicador = db.relationship('Indicadores', back_populates='hoja_de_vida')

    @classmethod
    def get_by_id(cls, id):
        """Obtiene un indicador específico por su ID"""
        return HojaVida.query.filter_by(id=id).first()
    
    @classmethod
    def create_element(cls,indicador_id,vigencia_inicio, vigencia_fin, nivel_generacion, nivel_util, unidad_medida, naturaleza, definicion,calculo):
        id = indicador_id
        hoja_vida = HojaVida(id=indicador_id,
                            indicador_id=indicador_id,
                            vigencia_inicio=vigencia_inicio,
                            vigencia_fin=vigencia_fin,
                            nivel_generacion=nivel_generacion,
                            nivel_util=nivel_util,
                            unidad_medida=unidad_medida,
                            naturaleza=naturaleza,
                            definicion=definicion,
                            calculo=calculo)

        db.session.add(hoja_vida)
        db.session.commit()

        return hoja_vida

    @classmethod
    def update(cls,indicador_id,vigencia_inicio, vigencia_fin, nivel_generacion, nivel_util, unidad_medida, naturaleza, definicion,calculo):
        hoja = HojaVida.get_by_id(indicador_id)
        
        if hoja is None:
            return False
        
        hoja.vigencia_inicio = vigencia_inicio
        hoja.vigencia_fin = vigencia_fin
        hoja.nivel_generacion = nivel_generacion
        hoja.nivel_util = nivel_util
        hoja.unidad_medida = unidad_medida
        hoja.naturaleza = naturaleza
        hoja.definicion = definicion
        hoja.calculo = calculo

        db.session.add(hoja)
        db.session.commit()


        
# Tabla Cronograma
class Cronograma(db.Model):
    __tablename__ = 'cronograma'

    id = db.Column(db.Integer, primary_key=True)
    data_cronograma = db.Column(db.Text, nullable=False)
    """actividad = db.Column(db.String(80))
    fecha_inicio_prog = db.Column(db.Date, nullable=False)
    fecha_fin_prog = db.Column(db.Date, nullable=False)
    fecha_inicio_real = db.Column(db.Date, nullable=False)
    fecha_fin_real = db.Column(db.Date, nullable=False)
    avance_planificado = db.Column(db.Integer)
    desviacion = db.Column(db.Integer)"""
    indicador_id = db.Column(db.Integer, db.ForeignKey('indicadores.id'), nullable=False)
    
    # Relación muchos-a-uno con Indicador
    indicador = db.relationship('Indicadores', back_populates='cronograma')

    @classmethod
    def get_by_id(cls, id):

        return Cronograma.query.filter_by(id=id).first()
    
    @classmethod
    def get_by_indicador(cls, id):

        return Cronograma.query.filter_by(indicador_id=id).first()
    
    
    @classmethod
    def update(cls, id, lista):
        actividades = Cronograma.get_by_indicador(id)
        print('sisaaaaaaaaaaaaaaaaaaaa----------')

        if actividades is None:
            return False

        actividades.data_cronograma = json.dumps(lista)  
        db.session.add(actividades)
        db.session.commit()  

        return actividades  


    @classmethod
    def create_cronograma(cls, lista, indicador_id):
        existente = Cronograma.query.filter_by(indicador_id=indicador_id).first()
        print(f"existe? {existente}")
        if existente:
            print('ya existe')
            return cls.update(
                id=indicador_id,
                lista=lista
            )
        
        nuevo_cronograma = cls(
            indicador_id=indicador_id,
            data_cronograma=json.dumps(lista)
        )

        db.session.add(nuevo_cronograma)
        db.session.commit()

        return nuevo_cronograma


    



    @classmethod
    def delete(cls,id):
        actividades = Cronograma.get_by_id(id)

        if actividades is None:
            return False
        
        db.session.delete(actividades)
        db.session.commit()
        
        
        
class Cargos(db.Model):
    __tablename__ = 'cargos'

    id = db.Column(db.Integer, primary_key=True)
    ficha = db.Column(db.Integer, unique=True, nullable=False, index=True)
    departamento = db.Column(db.String(200), nullable=False)
    cargo = db.Column(db.String(200), nullable = False)
    
    
    def __repr__(self):
        return f"<Cargos ficha={self.ficha} departamento={self.departamento}>"
    
    @classmethod
    def insert_cargo(cls, ficha, departamento, cargo):
        """
            Inserta en la tabla de cargos
        """
        nuevo_cargo = cls(ficha=ficha, departamento=departamento, cargo= cargo)
        db.session.add(nuevo_cargo)
        db.session.commit()
        return nuevo_cargo
    
    @classmethod
    def select_by_ficha(cls, ficha):
        """
        Busca un cargo por número de ficha
        
        """
        return cls.query.filter_by(ficha=ficha).first()
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

"""
    @classmethod
    def create_element(cls, actividades_data):
        if not isinstance(actividades_data, list):
            raise ValueError("Se requiere una lista de actividades")
                
        nuevas_actividades = []
            
        for data in actividades_data:
            # Validar datos mínimos requeridos
            if 'actividad' not in data and 'fecha_inicio_prog' not in data and 'fecha_fin_prog' not in data and 'fecha_inicio_real' not in data and 'fecha_fin_real' not in data and 'avance_planificado' not in data and 'desviacion' not in data and 'indicador_id' not in data:
                raise ValueError("Cada actividad debe tener nombre y descripción")
                    
                
            # Crear la actividad

            actividad = cls(
                indicador_id=data['indicador_id'],
                actividad=data['actividad'],
                fecha_inicio_prog=data['fecha_inicio_prog'],
                fecha_fin_prog=data['fecha_fin_prog'],
                fecha_inicio_real=data['fecha_inicio_real'],
                avance_planificado=data['avance_planificado'],
                desviacion=data['desviacion'])
                
            nuevas_actividades.append(actividad)
            db.session.add(actividad)
            
        db.session.commit()
        return nuevas_actividades
    
    @classmethod
    def delete(cls, lista):

        if not lista:
            return False, "La lista de IDs está vacía"
        
        # Elimina en una sola operación con filter(TuModelo.id.in_(lista_ids))
        filas_eliminadas = db.session.query(Cronograma).filter(Cronograma.id.in_(lista)).delete()
        db.session.commit()
            
        return True, f"Se eliminaron {filas_eliminadas} filas correctamente"
"""
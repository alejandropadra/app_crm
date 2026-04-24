import datetime
from sqlalchemy import func, case, cast, Integer
from flask_login import UserMixin
from werkzeug.security import generate_password_hash,check_password_hash 
from sqlalchemy.exc import IntegrityError
import json
from .consts import ABREVIACIONES_FILIAL
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
    # Relación con Evaluaciones: Un usuario puede tener muchas evaluaciones (una por cada año fiscal).
    # Esta es la "colección de carpetas" de un usuario.
    evaluaciones = db.relationship('Evaluacion', back_populates='usuario', lazy='dynamic', cascade='all, delete-orphan')
    Retroalimentacion =db.relationship('Retroalimentacion', back_populates='usuario', lazy='dynamic', cascade='all, delete-orphan')
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
    def get_all(cls):
        """
        Devuelve una lista de todos los usuarios.
        """
        return cls.query.all()
    
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
            path_imagen_user = f"img/fotos_personal/{ficha}.png"  
            
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
    año_fiscal = db.Column(db.String(70), nullable=False)
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
    nivel_generacion = db.Column(db.String(3000))
    nivel_util = db.Column(db.String(3000))
    unidad_medida = db.Column(db.String(3000))
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


#======== Tabla de EVALUACION (La "Carpeta") =================================
class Evaluacion(db.Model):
    __tablename__ = 'evaluaciones'

    id = db.Column(db.Integer, primary_key=True)
    año_fiscal = db.Column(db.String(50), nullable=False)
    estado = db.Column(db.String(50), nullable=False, default='Abierta') 
    fecha_creacion = db.Column(db.DateTime, default=datetime.datetime.now)
    fecha_cierre = db.Column(db.DateTime)
    ficha_usuario = db.Column(db.Integer, db.ForeignKey('users.ficha'), nullable=False)
    supervisor_evaluador = db.Column(db.String(50), nullable=False)
    par_evaluador = db.Column(db.String(50), nullable=True)
    subordinado_evaluador = db.Column(db.String(50), nullable=True)
    total = db.Column(db.Integer)
    
    usuario = db.relationship('User', back_populates='evaluaciones')
    resultados = db.relationship('evaluacion_competencias', back_populates='evaluacion', cascade='all, delete-orphan')

    @classmethod
    def asignar_supervisor(cls, ficha_usuario, año_fiscal, ficha_supervisor):
        """
        Asigna o actualiza el supervisor evaluador de una evaluación específica.
        Crea la evaluación si no existe, pero SOLO maneja el campo supervisor_evaluador.
        
        :param ficha_usuario: La ficha del usuario a evaluar
        :param año_fiscal: El año fiscal de la evaluación
        :param ficha_supervisor: La ficha del supervisor que evaluará
        :return: El objeto Evaluacion actualizado o None si hay error
        """
        try:
            # --- Paso 1: Buscar evaluación existente ---
            evaluacion = cls.query.filter_by(
                ficha_usuario=ficha_usuario,
                año_fiscal=año_fiscal
            ).first()
            
            if evaluacion:
                return None
            else:
                # Si no existe, creamos la evaluación CON el supervisor
                print(f"Creando nueva evaluación con supervisor: Usuario {ficha_usuario} - {año_fiscal}")
                evaluacion = cls(
                    ficha_usuario=ficha_usuario,
                    año_fiscal=año_fiscal,
                    supervisor_evaluador=str(ficha_supervisor)
                )
                db.session.add(evaluacion)
                print(f"Nueva evaluación creada con supervisor: {ficha_supervisor}")
            
            # --- Paso 2: Guardar cambios ---
            db.session.commit()
            return evaluacion
            
        except Exception as e:
            db.session.rollback()
            print(f"Error al asignar supervisor: {e}")
            return None
    
    @classmethod
    def asignar_par_evaluador(cls, ficha_usuario, año_fiscal, ficha_par):
        """
        Asigna o actualiza el par evaluador de una evaluación específica.
        
        :param ficha_usuario: La ficha del usuario a evaluar
        :param año_fiscal: El año fiscal de la evaluación
        :param ficha_par: La ficha del par que evaluará
        :return: El objeto Evaluacion actualizado o None si hay error
        """
        try:
            evaluacion = cls.query.filter_by(
                ficha_usuario=ficha_usuario,
                año_fiscal=año_fiscal
            ).first()
            
            if not evaluacion:
                print(f"No se encontró evaluación para asignar par: Usuario {ficha_usuario} - {año_fiscal}")
                return None
            
            evaluacion.par_evaluador = str(ficha_par) if ficha_par else None
            print(f"Par evaluador asignado: {ficha_par} para Usuario {ficha_usuario}")
            
            db.session.commit()
            return evaluacion
            
        except Exception as e:
            db.session.rollback()
            print(f"Error al asignar par evaluador: {e}")
            return None
    
    @classmethod
    def asignar_subordinado_evaluador(cls, ficha_usuario, año_fiscal, ficha_subordinado):
        """
        Asigna o actualiza el subordinado evaluador de una evaluación específica.
        
        :param ficha_usuario: La ficha del usuario a evaluar
        :param año_fiscal: El año fiscal de la evaluación
        :param ficha_subordinado: La ficha del subordinado que evaluará
        :return: El objeto Evaluacion actualizado o None si hay error
        """
        try:
            evaluacion = cls.query.filter_by(
                ficha_usuario=ficha_usuario,
                año_fiscal=año_fiscal
            ).first()
        
            if not evaluacion:
                print(f" No se encontró evaluación para asignar subordinado: Usuario {ficha_usuario} - {año_fiscal}")
                return None
            
            evaluacion.subordinado_evaluador = str(ficha_subordinado) if ficha_subordinado else None
            print(f"Subordinado evaluador asignado: {ficha_subordinado} para Usuario {ficha_usuario}")
            
            db.session.commit()
            return evaluacion
            
        except Exception as e:
            db.session.rollback()
            print(f"Error al asignar subordinado evaluador: {e}")
            return None

    @classmethod
    def registrar_dato(cls, ficha_usuario, año_fiscal, nombre_competencia, datos_a_registrar):
        """
        Registra un dato en una evaluación, creando la estructura si no existe.
        Este es el método principal para cualquier CUD (Crear, Actualizar, Borrar) en la evaluación.
        
        NOTA: Este método REQUIERE que ya exista una evaluación con supervisor_evaluador asignado,
        o que se pase el supervisor_evaluador en datos_a_registrar para nuevas evaluaciones.

        :param ficha_usuario: La ficha del usuario a evaluar.
        :param año_fiscal: El año fiscal de la evaluación.
        :param nombre_competencia: El nombre de la competencia específica a modificar.
        :param datos_a_registrar: Un diccionario con los campos y valores a guardar. 
        :return: El objeto 'evaluacion_competencias' actualizado o None si hay un error.
        """
        try:
            # --- Paso 1: Obtener o Crear la "Carpeta" (Evaluacion) ---
            evaluacion = cls.query.filter_by(
                ficha_usuario=ficha_usuario, 
                año_fiscal=año_fiscal
            ).first()

            if not evaluacion:
                # Si no existe, verificamos si tenemos supervisor en los datos
                supervisor_req = datos_a_registrar.get('supervisor_evaluador')
                if not supervisor_req:
                    print(f"Error: Se requiere supervisor_evaluador para crear nueva evaluación")
                    print(f" Sugerencia: Use primero Evaluacion.asignar_supervisor() o incluya 'supervisor_evaluador' en datos_a_registrar")
                    return None
                
                print(f"No se encontró evaluación para {ficha_usuario} en {año_fiscal}. Creando una nueva.")
                evaluacion = cls(
                    ficha_usuario=ficha_usuario,
                    año_fiscal=año_fiscal,
                    supervisor_evaluador=str(supervisor_req)
                )
                db.session.add(evaluacion)
                db.session.flush()

            # --- Paso 2: Obtener o Crear el "Documento" (evaluacion_competencias) ---
            resultado = evaluacion_competencias.query.filter_by(
                evaluacion_id=evaluacion.id,
                nombre_competencia=nombre_competencia
            ).first()

            if not resultado:
                print(f"No se encontró la competencia '{nombre_competencia}'. Creando una nueva.")
                resultado = evaluacion_competencias(
                    evaluacion_id=evaluacion.id,
                    nombre_competencia=nombre_competencia
                )
                db.session.add(resultado)

            # --- Paso 3: Actualizar los campos del "Documento" ---
            # Filtramos los campos que pertenecen a evaluacion_competencias
            campos_competencia = {'autoeval', 'superv_eval', 'par_eval', 'subordinado_eval', 
                                'cumplimiento_eval', 'desempeno_eval', 'peso'}
            
            for campo, valor in datos_a_registrar.items():
                if campo in campos_competencia and hasattr(resultado, campo):
                    setattr(resultado, campo, valor)
                    print(f"Registrando en competencia '{nombre_competencia}': {campo} = {valor}")

            # --- Paso 4: Commit final ---
            db.session.commit()
            return resultado

        except Exception as e:
            db.session.rollback()
            print(f"Error al registrar dato en la evaluación: {e}")
            return None
    
    @classmethod
    def actualizar_total(cls, ficha_usuario, año_fiscal, nuevo_total):
        """
        Actualiza el campo 'total' de una evaluación existente.

        :param ficha_usuario: La ficha del usuario evaluado
        :param año_fiscal: Año fiscal
        :param nuevo_total: El nuevo valor a asignar a total
        :return: True si fue exitoso, False si no
        """
        try:
            evaluacion = cls.query.filter_by(
                ficha_usuario=ficha_usuario,
                año_fiscal=año_fiscal
            ).first()

            if not evaluacion:
                print(f"No se encontró evaluación para actualizar el total.")
                return False

            evaluacion.total = nuevo_total
            db.session.commit()
            print(f"Total actualizado a {nuevo_total} para {ficha_usuario} ({año_fiscal})")
            return True
        except Exception as e:
            db.session.rollback()
            print(f" Error actualizando total: {e}")
            return False
        
        
    @classmethod
    def obtener_resultados(cls, ficha_usuario, año_fiscal):
        """
        Retorna todos los resultados de competencias para una ficha y año fiscal dado.

        :param ficha_usuario: Número de ficha del usuario evaluado.
        :param año_fiscal: Año fiscal.
        :return: Lista de diccionarios con los resultados de competencias.
        """
        evaluacion = cls.query.filter_by(
            ficha_usuario=ficha_usuario,
            año_fiscal=año_fiscal
        ).first()

        if not evaluacion:
            return []

        resultados = []
        for resultado in evaluacion.resultados:
            resultados.append({
                'competencia': resultado.nombre_competencia,
                'peso': resultado.peso,
                'autoeval': resultado.autoeval,
                'superv_eval': resultado.superv_eval,
                'par_eval': resultado.par_eval,
                'subordinado_eval': resultado.subordinado_eval,
                'cumplimiento_eval': resultado.cumplimiento_eval,
                'desempeno_eval': resultado.desempeno_eval
            })

        return resultados
    
    @classmethod
    def obtener_evaluaciones_por_usuario(cls, ficha_usuario, año_fiscal=None):
        """
        Obtiene todas las evaluaciones asociadas a una ficha de usuario específica.

        :param ficha_usuario: La ficha del usuario cuyas evaluaciones se desean obtener.
        :param año_fiscal: El año fiscal para filtrar las evaluaciones (opcional).
        :return: Una lista de objetos Evaluacion o una lista vacía si no se encuentran evaluaciones.
        """
        try:
            # Construir la consulta base
            query = cls.query.filter_by(ficha_usuario=ficha_usuario)
            
            # Agregar filtro por año fiscal si se proporciona
            if año_fiscal:
                query = query.filter_by(año_fiscal=año_fiscal)
            
            # Obtener todas las evaluaciones que coincidan con los filtros
            evaluaciones = query.first()
            
            if not evaluaciones:
                mensaje = f"No se encontraron evaluaciones para la ficha de usuario: {ficha_usuario}"
                if año_fiscal:
                    mensaje += f" en el año fiscal: {año_fiscal}"
                print(mensaje)
            
            return evaluaciones
        except Exception as e:
            print(f"Error al obtener evaluaciones para el usuario {ficha_usuario}: {e}")
            return []
    
    @classmethod
    def obtener_evaluaciones_como_evaluador(cls, ficha_evaluador):
        """
        Retorna información de las evaluaciones donde una ficha aparece como evaluador
        (supervisor, par o subordinado).
        
        La comparación se hace por valor numérico (CAST a Integer) para manejar
        formatos inconsistentes en BD: '4', '004', '0004' todos se consideran
        iguales al valor 4. Esto es un parche defensivo mientras los datos estén
        mezclados — se puede eliminar el CAST cuando se normalice la tabla con LPAD.
        
        :param ficha_evaluador: La ficha del usuario que actúa como evaluador
        :return: Lista de diccionarios con información detallada
        """
        
        try:
            ficha_int = int(ficha_evaluador)

            # Comparación numérica para manejar padding inconsistente en BD
            evaluaciones = cls.query.filter(
                db.or_(
                    cast(cls.supervisor_evaluador, Integer) == ficha_int,
                    cast(cls.par_evaluador, Integer) == ficha_int,
                    cast(cls.subordinado_evaluador, Integer) == ficha_int
                )
            ).all()
            
            resultado = []
            for evaluacion in evaluaciones:
                # Determinar roles comparando como int también, para ser consistente
                roles = []
                
                try:
                    if evaluacion.supervisor_evaluador and int(evaluacion.supervisor_evaluador) == ficha_int:
                        roles.append('supervisor')
                except (ValueError, TypeError):
                    pass
                
                try:
                    if evaluacion.par_evaluador and int(evaluacion.par_evaluador) == ficha_int:
                        roles.append('par')
                except (ValueError, TypeError):
                    pass
                
                try:
                    if evaluacion.subordinado_evaluador and int(evaluacion.subordinado_evaluador) == ficha_int:
                        roles.append('subordinado')
                except (ValueError, TypeError):
                    pass
                
                resultado.append({
                    'ficha_evaluado': evaluacion.ficha_usuario,
                    'año_fiscal': evaluacion.año_fiscal,
                    'estado': evaluacion.estado,
                    'rol_evaluador': roles,
                    'evaluacion_id': evaluacion.id
                })
            
            return resultado
            
        except Exception as e:
            print(f"Error al obtener evaluaciones detalladas como evaluador: {e}")
            return []
        
    @classmethod
    def corregir_supervisores_masivo(cls, año_fiscal, participantes_gdd_fn, procesar_ficha_fn):
        # Construir ambos formatos equivalentes del año fiscal
        formatos_busqueda = [año_fiscal]
        if año_fiscal.startswith("AF"):
            año_num = int(año_fiscal[2:])
            año_numerico = f"20{año_num-1}20{año_num:02d}"
            formatos_busqueda.append(año_numerico)
        else:
            formatos_busqueda.append(f"AF{año_fiscal[6:8]}")

        # 1. UNA sola llamada a SAP 
        try:
            participantes = participantes_gdd_fn()
            if isinstance(participantes, str):  # si devolvió "Error 404"
                return {'success': False, 'error': 'No se pudo obtener participantes desde SAP'}
        except Exception as e:
            return {'success': False, 'error': f'Error consultando SAP: {str(e)}'}

        # 2. Construir diccionario {ficha_normalizada: fichaSuperv_raw} para lookups rápidos
        mapa_supervisores = {}
        for p in participantes:
            ficha_raw = p.get('pernr', '')
            ficha_superv_raw = p.get('fichaSuperv', '')
            if not ficha_raw:
                continue
            # Normalizamos la ficha del empleado (sin ceros a la izquierda) para usar como clave
            ficha_normalizada = int(ficha_raw.lstrip('0')) if ficha_raw.lstrip('0') else 0
            mapa_supervisores[ficha_normalizada] = ficha_superv_raw

        # 3. Traer evaluaciones de ambos formatos
        evaluaciones = cls.query.filter(
            cls.año_fiscal.in_(formatos_busqueda)
        ).all()

        exitosos = 0
        errores = []

        for evaluacion in evaluaciones:
            ficha = evaluacion.ficha_usuario
            try:
                # 4. Lookup en el diccionario, NO llamada a SAP
                ficha_superv_raw = mapa_supervisores.get(ficha)

                if ficha_superv_raw is None:
                    errores.append({
                        'ficha': ficha,
                        'error': 'Usuario no encontrado en la nómina de participantes GDD'
                    })
                    continue

                ficha_supervisor = procesar_ficha_fn(ficha_superv_raw)

                # Detectar supervisores inválidos (todos ceros o vacíos)
                if not ficha_supervisor or ficha_supervisor.strip('0') == '':
                    errores.append({
                        'ficha': ficha,
                        'error': f'Supervisor inválido en SAP: "{ficha_superv_raw}"'
                    })
                    continue

                evaluacion.supervisor_evaluador = str(ficha_supervisor)
                exitosos += 1
            except Exception as e:
                errores.append({'ficha': ficha, 'error': str(e)})

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

        return {
            'success': True,
            'resumen': {
                'total_evaluaciones': len(evaluaciones),
                'corregidos': exitosos,
                'errores': len(errores)
            },
            'errores_detalle': errores
        }
    
    @classmethod
    def eliminar_proceso_completo(cls, ficha_usuario, año_fiscal):
        """
        Elimina el proceso de EVALUACIÓN DE COMPETENCIAS de un usuario en un AF.
        """
        try:
            resumen = {
                'evaluaciones': 0,
                'competencias': 0,
                'retroalimentacion': 0,
                'resultado_final': 0,
            }
            
            # 1. Evaluación + competencias (cascade ORM)
            evaluaciones = cls.query.filter_by(
                ficha_usuario=ficha_usuario,
                año_fiscal=año_fiscal
            ).all()
            for ev in evaluaciones:
                resumen['competencias'] += len(ev.resultados)
                db.session.delete(ev)
                resumen['evaluaciones'] += 1
            
            # 2. Retroalimentación
            retros = Retroalimentacion.query.filter_by(
                ficha_usuario=ficha_usuario,
                año_fiscal=año_fiscal
            ).all()
            for r in retros:
                db.session.delete(r)
                resumen['retroalimentacion'] += 1
            
            # 3. Resultado Final
            resultados = ResultadoFinal.query.filter_by(
                ficha_usuario=ficha_usuario,
                año_fiscal=año_fiscal
            ).all()
            for rf in resultados:
                db.session.delete(rf)
                resumen['resultado_final'] += 1
            
            db.session.commit()
            return {'success': True, 'resumen': resumen}
        
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}    
        
    @classmethod
    def recalcular_nivel_i(cls, año_fiscal, dry_run=True):
        """
        Recalcula cumplimiento_eval, desempeno_eval y el total de la evaluación
        SOLO para evaluaciones Nivel I (las que tienen par_evaluador Y subordinado_evaluador).
        
        Corrige el bug donde calcularCumplimiento del frontend usaba umbrales
        incorrectos (2, 5, 7, 9) en vez de los del Excel (3, 6, 9, 12).
        
        Returns:
            dict: Reporte detallado con cambios por evaluación y totales.
        """
        # Tabla de puntajes
        PUNTOS = {"UP": 0, "FP-": 1, "FP": 2, "FP+": 3, "O": 4}
        SIGLAS = ["UP", "FP-", "FP", "FP+", "O"]
        
        def calcular(sup, par, sub):
            """Replica la lógica VLOOKUP del Excel con umbrales correctos."""
            vals = [v for v in (sup, par, sub) if v and v.strip()]
            S = sum(PUNTOS.get(v, 0) for v in vals)
            if S < 3:   idx = 0
            elif S < 6: idx = 1
            elif S < 9: idx = 2
            elif S < 12: idx = 3
            else:       idx = 4
            return idx, SIGLAS[idx]
        
        try:
            # Filtrar SOLO Nivel I: con par Y subordinado asignados
            evaluaciones_nivel_i = cls.query.filter(
                cls.año_fiscal == año_fiscal,
                cls.par_evaluador.isnot(None),
                cls.par_evaluador != '',
                cls.subordinado_evaluador.isnot(None),
                cls.subordinado_evaluador != ''
            ).all()
            
            reporte = {
                'año_fiscal': año_fiscal,
                'dry_run': dry_run,
                'evaluaciones_procesadas': 0,
                'evaluaciones_modificadas': 0,
                'competencias_modificadas': 0,
                'total_recalculado': 0,
                'detalles': []
            }
            
            for ev in evaluaciones_nivel_i:
                reporte['evaluaciones_procesadas'] += 1
                cambios_eval = []
                nuevo_total = 0
                hubo_cambios = False
                
                for comp in ev.resultados:
                    superv = (comp.superv_eval or '').strip()
                    par    = (comp.par_eval or '').strip()
                    sub    = (comp.subordinado_eval or '').strip()
                    
                    nuevo_cumpl, nuevo_desemp = calcular(superv, par, sub)
                    nuevo_total += nuevo_cumpl
                    
                    if (comp.cumplimiento_eval != nuevo_cumpl 
                        or comp.desempeno_eval != nuevo_desemp):
                        hubo_cambios = True
                        reporte['competencias_modificadas'] += 1
                        cambios_eval.append({
                            'competencia': comp.nombre_competencia,
                            'sup': superv, 'par': par, 'sub': sub,
                            'antes': {'cumpl': comp.cumplimiento_eval, 'desemp': comp.desempeno_eval},
                            'despues': {'cumpl': nuevo_cumpl, 'desemp': nuevo_desemp}
                        })
                        
                        if not dry_run:
                            comp.cumplimiento_eval = nuevo_cumpl
                            comp.desempeno_eval = nuevo_desemp
                
                # Recalcular total de la evaluación si cambió algo
                if hubo_cambios:
                    reporte['evaluaciones_modificadas'] += 1
                    total_anterior = ev.total
                    
                    if not dry_run:
                        ev.total = nuevo_total
                    
                    reporte['detalles'].append({
                        'evaluacion_id': ev.id,
                        'ficha_usuario': ev.ficha_usuario,
                        'total_antes': total_anterior,
                        'total_despues': nuevo_total,
                        'competencias_cambiadas': cambios_eval
                    })
            
            if not dry_run:
                db.session.commit()
                reporte['total_recalculado'] = reporte['competencias_modificadas']
            
            return {'success': True, 'reporte': reporte}
        
        except Exception as e:
            if not dry_run:
                db.session.rollback()
            return {'success': False, 'error': str(e)}


# Tabla del resultado de las evaluaciones
class evaluacion_competencias(db.Model):
    __tablename__ = 'evaluacion_competencias'

    id = db.Column(db.Integer, primary_key=True)
    nombre_competencia = db.Column(db.String(100), nullable=False)
    peso= db.Column(db.Integer)
    autoeval= db.Column(db.String(50))
    superv_eval= db.Column(db.String(50))
    par_eval= db.Column(db.String(50))
    subordinado_eval =db.Column(db.String(50))
    cumplimiento_eval= db.Column(db.String(50))
    desempeno_eval = db.Column(db.String(50))
    # Llave foránea que conecta este resultado con su "carpeta" de evaluación.
    evaluacion_id = db.Column(db.Integer, db.ForeignKey('evaluaciones.id'), nullable=False)
    evaluacion = db.relationship('Evaluacion', back_populates='resultados')
    
    
class Configuracion(db.Model):
    __tablename__ = 'configuraciones'

    id = db.Column(db.Integer, primary_key=True)  
    año_fiscal = db.Column(db.String(20), nullable=False)
    etapa_actual = db.Column(db.String(20), nullable=False)

    @classmethod
    def get_data(cls):
        """
        Retorna la única fila de la tabla 'configuraciones'.
        Si no hay fila, retorna None.
        """
        return cls.query.first()
    
    @classmethod
    def actualizar_configuracion(cls, año_fiscal=None, etapa_actual=None):
        """
        Actualiza la configuración existente. NO crea una nueva si no existe.
        
        Args:
            año_fiscal (str, optional): Nuevo año fiscal
            etapa_actual (str, optional): Nueva etapa actual
            
        Returns:
            bool: True si se actualizó correctamente, False en caso de error
        """
        try:
            config = cls.get_data()
            
            if config:
                # Actualizar los campos que se proporcionaron
                if año_fiscal is not None:
                    config.año_fiscal = año_fiscal
                if etapa_actual is not None:
                    config.etapa_actual = etapa_actual
                
                db.session.commit()
                return True
            else:
                # NO crear nueva configuración, solo retornar False
                print("Error: No existe configuración para actualizar")
                return False
                
        except Exception as e:
            db.session.rollback()
            print(f"Error al actualizar configuración: {e}")
            return False
    
    @classmethod
    def actualizar_solo_etapa(cls, nueva_etapa):
        """
        Actualiza solo la etapa actual.
        
        Args:
            nueva_etapa (str): Nueva etapa actual
            
        Returns:
            bool: True si se actualizó correctamente, False en caso de error
        """
        return cls.actualizar_configuracion(etapa_actual=nueva_etapa)

    @classmethod
    def actualizar_solo_año(cls, nuevo_año):
        """
        Actualiza solo el año fiscal.
        
        Args:
            nuevo_año (str): Nuevo año fiscal
            
        Returns:
            bool: True si se actualizó correctamente, False en caso de error
        """
        return cls.actualizar_configuracion(año_fiscal=nuevo_año)
    
    
    
    
    
class Retroalimentacion(db.Model):
    __tablename__ = 'Retroalimentacion'

    id = db.Column(db.Integer, primary_key=True)
    año_fiscal = db.Column(db.String(50), nullable=False, unique=False)
    ficha_usuario = db.Column(db.Integer, db.ForeignKey('users.ficha'), nullable=False)
    comentarios_supervisor = db.Column(db.Text, nullable=True)
    comentarios_colaborador = db.Column(db.Text, nullable=True)
    feedback = db.Column(db.String(50), nullable = True)
    usuario = db.relationship('User', back_populates='Retroalimentacion')

    @classmethod
    def crear_o_actualizar(cls, año_fiscal, ficha_usuario, 
                        comentarios_supervisor=None, 
                        comentarios_colaborador=None, 
                        feedback=None):
        """
        Crea una nueva retroalimentación o actualiza una existente SELECTIVAMENTE.
        Solo actualiza los campos que se pasen explícitamente (no None).
        Así un rol no sobrescribe los datos del otro.
        
        Args:
            año_fiscal (str): Año fiscal de la retroalimentación
            ficha_usuario (int): Ficha del usuario
            comentarios_supervisor (str, opcional): Comentarios del supervisor. Si es None, no se toca.
            comentarios_colaborador (str, opcional): Comentarios del colaborador. Si es None, no se toca.
            feedback (str, opcional): Feedback del colaborador. Si es None, no se toca.
            
        Returns:
            tuple: (retroalimentacion_instance, created)
        """
        try:
            retroalimentacion = cls.query.filter_by(
                año_fiscal=año_fiscal,
                ficha_usuario=ficha_usuario  
            ).first()
            
            if retroalimentacion:
                # Actualización SELECTIVA: solo tocar los campos que llegaron (no None)
                if comentarios_supervisor is not None:
                    retroalimentacion.comentarios_supervisor = comentarios_supervisor
                if comentarios_colaborador is not None:
                    retroalimentacion.comentarios_colaborador = comentarios_colaborador
                if feedback is not None:
                    retroalimentacion.feedback = feedback
                created = False
            else:
                # Creación: los campos que no llegaron quedan como NULL en la BD
                retroalimentacion = cls(
                    año_fiscal=año_fiscal,
                    ficha_usuario=ficha_usuario,
                    comentarios_supervisor=comentarios_supervisor,
                    comentarios_colaborador=comentarios_colaborador,
                    feedback=feedback
                )
                db.session.add(retroalimentacion)
                created = True
            
            db.session.commit()
            return retroalimentacion, created
            
        except Exception as e:
            db.session.rollback()
            raise e
    @classmethod
    def obtener_por_ficha_y_año(cls, ficha_usuario, año_fiscal):
        """
        Obtiene una retroalimentación específica por ficha de usuario y año fiscal.
        
        Args:
            ficha_usuario (int): Ficha del usuario
            año_fiscal (str): Año fiscal
            
        Returns:
            Retroalimentacion or None: La retroalimentación encontrada o None si no existe
        """
        try:
            retroalimentacion = cls.query.filter_by(
                ficha_usuario=ficha_usuario,
                año_fiscal=año_fiscal
            ).first()
            return retroalimentacion
        except Exception as e:
            raise e



class GestionCorreos(db.Model):
    __tablename__ = 'gestion_correos'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), nullable=False)
    tipo_correo = db.Column(db.String(100), nullable=False)
    asunto = db.Column(db.String(255), nullable=False)
    estado = db.Column(db.String(50), nullable=False)
    intentos = db.Column(db.Integer, default=0)
    mensaje_error = db.Column(db.Text, nullable=True)
    fecha_envio = db.Column(db.Date, default=datetime.date.today)  
    fecha_ultimo_intento = db.Column(db.Date, nullable=True)
    enviado_por = db.Column(db.String(100), nullable=True)
    
    @classmethod
    def ya_enviado_hoy(cls, email, tipo_correo):
        """Verifica si ya se envió este correo hoy"""
        hoy = datetime.date.today()
        registro = cls.query.filter_by(
            email=email,
            tipo_correo=tipo_correo,
            fecha_envio=hoy
        ).first()
        return registro is not None
    

    @classmethod
    def registrar_envio(cls, email, tipo_correo, asunto, estado='pendiente', enviado_por=None):
        """Registra un nuevo intento de envío de correo"""
        try:

            if cls.ya_enviado_hoy(email, tipo_correo):
                print(f"Email {email} ya fue enviado hoy para {tipo_correo}")
                return None
            
            nuevo_registro = cls(
                email=email,
                tipo_correo=tipo_correo,
                asunto=asunto,
                estado=estado,
                intentos=1,
                enviado_por=enviado_por,
                fecha_ultimo_intento=datetime.date.today()
            )
            db.session.add(nuevo_registro)
            db.session.commit()
            return nuevo_registro
        except Exception as e:
            db.session.rollback()
            print(f"Error al registrar envío: {e}")
            return None
    
    @classmethod
    def registrar_envios_bulk(cls, envios):
        """Registra múltiples envíos en una sola transacción"""
        try:
            hoy = datetime.date.today()
            registros = []
            emails_omitidos = []
            
            for envio in envios:
                email = envio['email']
                tipo_correo = envio['tipo_correo']
                

                if cls.ya_enviado_hoy(email, tipo_correo):
                    emails_omitidos.append(email)
                    continue
                
                nuevo_registro = cls(
                    email=email,
                    tipo_correo=tipo_correo,
                    asunto=envio['asunto'],
                    estado=envio.get('estado', 'pendiente'),
                    intentos=1,
                    enviado_por=envio.get('enviado_por', 'sistema'),
                    fecha_ultimo_intento=hoy
                )
                registros.append(nuevo_registro)
            
            if registros:
                db.session.bulk_save_objects(registros)
                db.session.commit()
            
            if emails_omitidos:
                print(f" {len(emails_omitidos)} emails ya fueron enviados hoy y se omitieron")
            
            return len(registros)
        except Exception as e:
            db.session.rollback()
            print(f"Error al registrar envíos en bulk: {e}")
            return 0
        
    @classmethod
    def actualizar_estado(cls, registro_id, estado, mensaje_error=None):
        """Actualiza el estado de un registro de correo"""
        try:
            registro = cls.query.get(registro_id)
            if registro:
                registro.estado = estado
                registro.fecha_ultimo_intento = datetime.date.today()
                if mensaje_error:
                    registro.mensaje_error = mensaje_error
                if estado == 'enviado':
                    registro.intentos += 1
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            print(f"Error al actualizar estado: {e}")
            return False

    @classmethod
    def marcar_como_enviado(cls, email, tipo_correo):
        """Marca un correo como enviado exitosamente"""
        try:
            hoy = datetime.date.today()
            registro = cls.query.filter_by(
                email=email, 
                tipo_correo=tipo_correo,
                fecha_envio=hoy  
            ).order_by(cls.fecha_envio.desc()).first()
            
            if registro:
                registro.estado = 'enviado'
                registro.intentos += 1
                registro.fecha_ultimo_intento = hoy
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            print(f"Error al marcar como enviado: {e}")
            return False

    @classmethod
    def marcar_como_fallido(cls, email, tipo_correo, mensaje_error):
        """Marca un correo como fallido y registra el error"""
        try:
            hoy = datetime.date.today()
            registro = cls.query.filter_by(
                email=email, 
                tipo_correo=tipo_correo,
                fecha_envio=hoy  
            ).order_by(cls.fecha_envio.desc()).first()
            
            if registro:
                registro.estado = 'fallido'
                registro.intentos += 1
                registro.mensaje_error = mensaje_error
                registro.fecha_ultimo_intento = hoy
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            print(f"Error al marcar como fallido: {e}")
            return False

class ResultadoFinal(db.Model):
    __tablename__ = 'resultados_finales'

    id = db.Column(db.Integer, primary_key=True)
    ficha_usuario = db.Column(db.Integer, db.ForeignKey('users.ficha'), nullable=False)
    filial = db.Column(db.String(50), nullable=True)
    nivel = db.Column(db.String(10), nullable=True)
    año_fiscal = db.Column(db.String(50), nullable=False)
    
    
    total_competencias= db.Column(db.Float)
    total_indicadores = db.Column(db.Float)
    total_final = db.Column(db.Float)
    clasificacion = db.Column(db.String(50))
    
    enviado_sap = db.Column(db.Boolean, default=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.datetime.now)
    __table_args__ = (
        db.UniqueConstraint('ficha_usuario', 'año_fiscal', name='uq_resultado_usuario_año'),
    )
    
    @classmethod
    def _clasificar(cls, total):
        if total <= 80:
            return 'UP'
        elif total <= 99:
            return 'FP-'
        elif total <= 109:
            return 'FP'
        elif total <= 119:
            return 'FP+'
        else:
            return 'O'

    @classmethod
    def guardar(cls, ficha_usuario, año_fiscal, total_competencias, total_indicadores, total_final, filial=None, nivel=None, enviado_sap=False):
        try:
            registro = cls.query.filter_by(
                ficha_usuario=ficha_usuario,
                año_fiscal=año_fiscal
            ).first()

            clasificacion = cls._clasificar(total_final)

            if registro:
                registro.total_competencias = total_competencias
                registro.total_indicadores  = total_indicadores
                registro.total_final        = total_final
                registro.clasificacion      = clasificacion
                registro.filial             = filial
                registro.nivel              = nivel

                registro.enviado_sap        = enviado_sap
            else:
                registro = cls(
                    ficha_usuario      = int(ficha_usuario),
                    año_fiscal         = año_fiscal,
                    filial             = filial,
                    nivel              = nivel,
                    total_competencias = total_competencias,
                    total_indicadores  = total_indicadores,
                    total_final        = total_final,
                    clasificacion      = clasificacion,
                    enviado_sap        = enviado_sap
                )
                db.session.add(registro)

            db.session.commit()
            return registro

        except Exception as e:
            db.session.rollback()
            print(f"Error al guardar ResultadoFinal: {e}")
            return None

    @classmethod
    def distribucion_performance(cls, año_fiscal, filial=None, nivel=None):

        distribucion_base = {
            'O':   {'cantidad': 0, 'porcentaje': 0.0},
            'FP+': {'cantidad': 0, 'porcentaje': 0.0},
            'FP':  {'cantidad': 0, 'porcentaje': 0.0},
            'FP-': {'cantidad': 0, 'porcentaje': 0.0},
            'UP':  {'cantidad': 0, 'porcentaje': 0.0},
        }

        query = (
            db.session.query(
                cls.clasificacion,
                func.count().label('cantidad')
            )
            .filter(cls.año_fiscal == año_fiscal)
        )

        if filial:
            query = query.filter(cls.filial == filial)
        if nivel:                                      
            query = query.filter(cls.nivel == nivel)

        resultados = query.group_by(cls.clasificacion).all()

        total_usuarios = sum(cantidad for _, cantidad in resultados)
        print(f"Total de usuarios: {total_usuarios}")
        if total_usuarios == 0:
            return distribucion_base

        for categoria, cantidad in resultados:
            if categoria in distribucion_base:
                distribucion_base[categoria] = {
                    'cantidad': cantidad,
                    'porcentaje': round((cantidad / total_usuarios) * 100, 1)
                }

        return distribucion_base
    
    @classmethod
    def get_filiales_disponibles(cls, año_fiscal):
        resultados = (
            db.session.query(cls.filial)
            .filter(cls.año_fiscal == año_fiscal)
            .filter(cls.filial.isnot(None))
            .distinct()
            .all()
        )
        return [filial for (filial,) in resultados]



    @classmethod
    def promedio_por_filial(cls, año_fiscal, nivel=None):
        query = (
            db.session.query(
                cls.filial,
                func.round(func.avg(cls.total_final), 1).label('promedio')
            )
            .filter(cls.año_fiscal == año_fiscal)
            .filter(cls.filial.isnot(None))
        )
        if nivel:                                     
            query = query.filter(cls.nivel == nivel)

        resultados = query.group_by(cls.filial).all()
        return {filial: promedio for filial, promedio in resultados}


    @classmethod
    def obtener_promedio_global(cls, año_fiscal, filial=None, nivel=None):
        query = db.session.query(
            func.round(func.avg(cls.total_final), 2)
        ).filter(cls.año_fiscal == año_fiscal)

        if filial:
            query = query.filter(cls.filial == filial)
        if nivel:                                     
            query = query.filter(cls.nivel == nivel)

        resultado = query.scalar()
        return resultado or 0


    @classmethod
    def promedio_por_nivel_y_filial(cls, año_fiscal, nivel=None):
        query = (
            db.session.query(
                cls.nivel,
                cls.filial,
                func.round(func.avg(cls.total_final), 1).label('promedio')
            )
            .filter(cls.año_fiscal == año_fiscal)
            .filter(cls.nivel.isnot(None))
            .filter(cls.filial.isnot(None))
        )
        if nivel:                                     
            query = query.filter(cls.nivel == nivel)

        resultados = query.group_by(cls.nivel, cls.filial).all()

        output = {}
        for niv, filial, promedio in resultados:
            if niv not in output:
                output[niv] = {}
            output[niv][filial] = promedio
        return output
    

    @classmethod
    def obtener_datos_tabla_reporte(cls, año_fiscal, filial=None, nivel=None):
        ORDEN_COMPETENCIAS = [
            'Demostración Valores Corporativos',
            'Foco en Resultados',
            'Influencia Organizacional',
            'Liderazgo',
            'Desarrollo del Equipo de Trabajo',
        ]
    
        if año_fiscal.startswith("AF"):
            año_anterior = "AF" + str(int(año_fiscal[2:]) - 1)
        else:
            año_anterior = str(int(año_fiscal) - 1)
        # ── 1. Query principal: ResultadoFinal + User + Cargos ──
        query = (
            db.session.query(cls, User, Cargos)
            .join(User, User.ficha == cls.ficha_usuario)
            .outerjoin(Cargos, Cargos.ficha == cls.ficha_usuario)
            .filter(cls.año_fiscal == año_fiscal)
        )
    
        if filial:
            query = query.filter(cls.filial == filial)
        if nivel:
            query = query.filter(cls.nivel == nivel)
    
        registros = query.all()

    
        datos = []
    
        for resultado, usuario, cargo in registros:
            # ── 2. Indicadores del usuario para este año fiscal ──
            años_equivalentes = ['AF26', '20252026'] if año_fiscal in ('AF26', '20252026') else [año_fiscal]
            indicadores_db = Indicadores.query.filter(
                Indicadores.ficha_usuario == usuario.ficha,
                Indicadores.año_fiscal.in_(años_equivalentes)
            ).all()

            lista_indicadores = []
            for ind in indicadores_db:
                lista_indicadores.append({
                    'nombre':       ind.nombre_indicador,
                    'tendencia':    ind.tendencia or '',
                    'peso':         ind.peso or 0,
                    'real_af_antes':    ind.real_af_antes,      
                    'obj_af_actual':    ind.objetivo_af_actual, 
                    'real_af_actual':   ind.real_af_actual,     
                    'cumplimiento': ind.cumplimiento or 0,
                    'desempeno':    ind.desempeno or '',
                })
            
            total_ind = resultado.total_indicadores
            if not total_ind:
                total_ind = sum(ind.cumplimiento or 0 for ind in indicadores_db)

            evaluacion = Evaluacion.query.filter(
                Evaluacion.ficha_usuario == usuario.ficha,
                Evaluacion.año_fiscal.in_(años_equivalentes)
            ).first()

            competencias_map = {}
            if evaluacion:
                for comp in evaluacion.resultados:
                    competencias_map[comp.nombre_competencia] = comp.desempeno_eval or ''

            competencias_lista = [
                competencias_map.get(nombre, '')
                for nombre in ORDEN_COMPETENCIAS
            ]
            
            status = 'CULMINADO' if resultado.enviado_sap else 'NO CULMINADO'

            # ── Formatear valores como porcentaje ──
            def fmt_pct(valor):
                if valor is None:
                    return '0%'
                return f"{round(valor)}%"
            
            # ── Construir dict del participante ──
            datos.append({
                'filial':             resultado.filial or usuario.filial or '',
                'nivel':             resultado.nivel or usuario.nivel_usuario or '',
                'nombre':            f"{usuario.nombre} {usuario.apellido}",
                'status':            status,
                'valor_indicadores': fmt_pct(resultado.total_indicadores or total_ind),
                'valor_evaluacion':  fmt_pct(resultado.total_competencias),
                'valor_total':       fmt_pct(resultado.total_final),
                'valor_clasificacion': resultado.clasificacion or '',
                'competencias':      competencias_lista,
                'indicadores':       lista_indicadores,
                'ficha':             usuario.ficha,
                'año_fiscal':        resultado.año_fiscal,  
                'año_anterior':      año_anterior,
            })
    
        return datos
    
    @classmethod
    def actualizar_columna(cls, ficha_usuario, año_fiscal, columna, valor, filial=None, nivel=None):
        """
        Actualiza SOLO una columna específica del registro en resultados_finales.
        
        Si no existe el registro, lo crea con las demás columnas en 0.
        
        Args:
            columna: 'total_indicadores' | 'total_competencias'
            valor: valor numérico a guardar en esa columna
        """
        columnas_validas = ('total_indicadores', 'total_competencias')
        if columna not in columnas_validas:
            print(f" Columna no válida: {columna}")
            return None
        
        try:
            registro = cls.query.filter_by(
                ficha_usuario=ficha_usuario,
                año_fiscal=año_fiscal
            ).first()
            
            if registro:
                setattr(registro, columna, valor)
                # Recalcular total_final con la suma de las dos columnas
                comp = registro.total_competencias or 0
                ind  = registro.total_indicadores or 0
                registro.total_final = round(comp + ind, 1)
                registro.clasificacion = cls._clasificar(registro.total_final)
                if filial:
                    registro.filial = filial
                if nivel:
                    registro.nivel = nivel
            else:
                # No existe → crearlo con esta columna y las demás en 0
                nuevo_reg = {
                    'ficha_usuario':      int(ficha_usuario),
                    'año_fiscal':         año_fiscal,
                    'filial':             filial,
                    'nivel':              nivel,
                    'total_competencias': 0,
                    'total_indicadores':  0,
                    'total_final':        0,
                    'clasificacion':      cls._clasificar(0),
                    'enviado_sap':        False,
                }
                nuevo_reg[columna] = valor
                nuevo_reg['total_final'] = round(valor, 1)
                nuevo_reg['clasificacion'] = cls._clasificar(valor)
                registro = cls(**nuevo_reg)
                db.session.add(registro)
            
            db.session.commit()
            return registro
        
        except Exception as e:
            db.session.rollback()
            print(f"Error al actualizar columna {columna}: {e}")
            return None
















        
        
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
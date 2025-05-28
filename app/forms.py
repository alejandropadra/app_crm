from flask_wtf import FlaskForm
from wtforms import StringField,DateField, TextAreaField, SelectField, EmailField, PasswordField, RadioField, SubmitField, FileField, BooleanField, IntegerField
from wtforms.validators import DataRequired,  Length, NumberRange
from flask_wtf.file import FileField, FileAllowed, FileRequired


class LoginForm(FlaskForm):
    ficha = IntegerField('', validators=[DataRequired(), Length(min=4, max=25)])
    password = PasswordField('', validators=[DataRequired()])
    submit = SubmitField('Iniciar sesión')

class GestionUsers(FlaskForm):
    password = PasswordField('', validators=[ Length(min=6, max=25)])
    Confirmarpassword = PasswordField('', validators=[ Length(min=6, max=25)])
    username = StringField('', validators=[DataRequired(), Length(min=4, max=25)])
    telefono = IntegerField('', validators=[ Length(min=4, max=25)])
    
    
class RegistrarUsuarios(FlaskForm):
    telefono = IntegerField('', validators=[DataRequired(), Length(min=4, max=25)])
    nombre = StringField('', validators=[DataRequired(), Length(min=4, max=50)])
    apellido = StringField('', validators=[DataRequired(), Length(min=4, max=50)])
    password = PasswordField('', validators=[DataRequired(), Length(min=4, max=100)])
    email = EmailField('', validators=[DataRequired()])
    departamento = StringField(
        '',
        validators=[
            DataRequired()
        ]
    )
    cargo = StringField("")
    supervisor = StringField("")
    documento_texto = StringField('')
    n_ficha = IntegerField('', validators=[NumberRange(min=1, max=10000)])
    nivel_corp = StringField(
        '',
    )
    
    filial = StringField(
        '',
        validators=[
            DataRequired()
        ]
    )
    
    documento = FileField(
        '',
        render_kw={'multiple': False}, 
        validators=[FileAllowed(['jpg', 'jpeg', 'png'], 'Solo imágenes')]
    )
    nivel = SelectField("", 
                        choices=[("Administrador","Administrador"),
                                    ("Alto","Alto"),
                                    ("Medio","Medio"),
                                    ("Bajo","Bajo")])
    
class formgdi(FlaskForm):
    submit = SubmitField('Submit')



class RegistrarHojaVida(FlaskForm):
    vigencia_inicio = DateField('', format='%Y-%m-%d', validators=[DataRequired()])
    vigencia_fin = DateField('', format='%Y-%m-%d', validators=[DataRequired()])
    nivel_generacion = StringField("")
    nivel_util = StringField("")
    unidad_medida = StringField("")
    naturaleza = StringField("")
    definicion = TextAreaField("")
    calculo = TextAreaField("")
    tipo_indicador = SelectField("", 
                        choices=[("Eficacia (resultado)","Eficacia (resultado)"),
                                    ("Eficiencia (recursos)","Eficiencia (recursos)"),
                                    ("Calidad","Calidad"),
                                    ("Productividad","Productividad"),
                                    ("Seguridad", "Seguridad"),
                                    ("Cumplimiento", "Cumplimiento")
                                ])
    
    
    
    
    

from wtforms import Form
from wtforms import validators
from wtforms import StringField,PasswordField, SelectField, HiddenField,BooleanField, EmailField
from wtforms import DateField,FileField,IntegerField,RadioField,FloatField,TextAreaField
from wtforms.validators import DataRequired, Length

from .models import User

def length_honeypot(form, field):
    if len(field.data) > 0:
        raise validators.ValidationError('Solo los humanos pueden completar el registro!')
    
class LoginForm(Form):
    rif = SelectField("", choices=[("J","J"),("G","G"),("V","V")])
    n_rif = StringField("",[ validators.length(min=4,max=10),
                            validators.DataRequired()])
    clave = PasswordField("",[validators.length(min=4,max=20),
                            validators.DataRequired()])
    honeypot = HiddenField("", [ length_honeypot])

class ContactForm(Form):
    nombre= StringField("",[validators.DataRequired()])
    telefono_contacto= StringField("",[validators.DataRequired()])
    email = EmailField("", [validators.DataRequired(message='El email es requerido.'),
        validators.Email(message='Ingre un email valido.')
    ])
    motivo =SelectField("", [validators.DataRequired()], choices=[("",""), 
                                                ("Ventas", "Quiero vender sus productos"),
                                                ("Particular", "Quiero comprar pinturas"),
                                                ("Compras", "Quiero ofrecer mis productos o servicios"),
                                                ("Empleo", "Quiero unirme a su equipo de trabajo")])

class RegisterForm(Form):
    rif = SelectField("", choices=[("J","J"),("G","G"),("V","V")])
    n_rif = StringField("",[ validators.length(min=5,max=10),
                            validators.DataRequired()])
    username = StringField("",[ validators.length(min=2,max=50),
                            validators.DataRequired()])
    email = EmailField('', [
        validators.length(min=6, max=100),
        validators.DataRequired(message='El email es requerido.'),
        validators.Email(message='Ingre un email valido.')
    ])
    password = PasswordField('', [
        validators.DataRequired('El password es requerido.'),
        validators.EqualTo('confirm_password', message='La contraseña no coincide.')
    ])
    confirm_password = PasswordField('', [validators.DataRequired()],)
    '''accept = BooleanField('', [
        validators.DataRequired()
    ])'''
    zona = SelectField("",[validators.DataRequired()], choices = [("",""),("Occidente","Occidente"),("Oriente","Oriente"),("Centro","Centro"),("all","all"),("Capital","Capital")])
    nivel = SelectField("", choices=[("cliente","Cliente"),("corimon","Corimon"),("administrador","Administrador")])
    codigo = StringField("",[validators.DataRequired('El codigo es requerido.')])
    vendedor = StringField("",[validators.DataRequired('El vendedor es requerido.')])
    
    def validate_username(self, username):
        if User.get_by_username(username.data):
            raise validators.ValidationError('El username ya se encuentra en uso.')

    def validate_email(self, email):
        if User.get_by_email(email.data):
            raise validators.ValidationError('El email ya se encuentra en uso.')
        

    def validate(self):
        if not Form.validate(self):
            return False

        if len(self.password.data) < 3:
            self.password.errors.append('El password es demasiado corto.')
            return False

        return True
    
class EditForm(Form):
    rif = StringField("")
    username = StringField("",[ validators.length(min=2,max=50),
                            validators.DataRequired()])
    email = EmailField('', [
        validators.length(min=6, max=100),
        validators.DataRequired(message='El email es requerido.'),
        validators.Email(message='Ingre un email valido.')
    ])
    zona = SelectField("",[validators.DataRequired()], choices = [("",""),("Occidente","Occidente"),("Oriente","Oriente"),("Centro","Centro"),("all","all"),("Capital","Capital")])
    nivel = SelectField("", choices=[("cliente","Cliente"),("corimon","Corimon"),("administrador","Administrador")])
    codigo = StringField("")
    seller = StringField("")
    password = StringField("")

class PerfilForm(Form):
    password = PasswordField('', [
        validators.EqualTo('confirm_password', message='La contraseña no coincide.')
    ])
    confirm_password = PasswordField('')
    email = EmailField('', [
        validators.length(min=6, max=100),
        validators.Email(message='Ingre un email valido.')
    ])
    verify_email = EmailField('', [
        validators.length(min=6, max=100),
        validators.Email(message='Ingre un email valido.')
    ])
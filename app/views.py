from flask import Blueprint
from flask import render_template, request, flash, redirect, url_for, abort
from werkzeug.utils import secure_filename
from flask import jsonify
from flask_login import login_user,logout_user,login_required, current_user
from .forms import LoginForm, RegisterForm, RegistroPagoForm,EditForm,PerfilForm,ContactForm, Retenciones
from .models import User, Cobranza
from . import login_manager
from .consts import *
from .email import welcome_mail, pago_crm_mail, pago_mail, comprobante_mail, comprobante_crm_mail, pago_iva_mail,pago_iva_crm_mail
from flask import session
from datetime import datetime
#from .promo import participantes
from .funciones import cadena_md5,obtener_hora_minutos_segundos_fecha,fecha_sap
from requests.auth import HTTPBasicAuth

import json
import collections
import random

import requests
from bs4 import BeautifulSoup

import os
local_adj = 'app\\static\\adj\\{}'
server_adj = 'app/static/adj/{}'

user_fuente = U_FUENTE
contra_fuente = C_FUENTE
ip_fuente = URL_FUENTE

#sdfsdf
page = Blueprint('page', __name__)

@login_manager.user_loader
def load_user(rif):
    return User.get_by_rif(rif)

@page.route('/logout')
def logout():
    logout_user()
    flash(LOGOUT)
    return redirect(url_for('.login'))

@page.app_errorhandler(500)
def internar_error_server(error):
    flash(ERROR_500,'error')
    return render_template('/errors/500.html'),500

@page.app_errorhandler(404)
def page_not_found(error):
    flash(ERROR_404)
    return render_template('/errors/404.html'),404


@page.route("/login", methods = ["GET","POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('.dashboard'))
    
    login_form = LoginForm(request.form)
    if request.method == "POST":
        rif = login_form.rif.data
        n_rif =login_form.n_rif.data
        usuario = rif+""+n_rif
        clave = login_form.clave.data
        user = User.get_by_rif(usuario)
        if user and user.verify_password(clave):
            login_user(user)
            flash(LOGIN)
            return redirect(url_for('.modulos'))
        else:
            flash(ERROR_USER_PASSWORD ,'error')
    return render_template("auth/login.html", form = login_form, titulo = "Login")

@page.route("/registro", methods = ["GET", "POST"])
@login_required
def registroUsuario():
    if current_user.nivel == "cliente":
        return redirect(url_for(".panel"))
    registro_form = RegisterForm(request.form)
    if request.method == "POST" and registro_form.validate():
        rif = registro_form.rif.data
        n_rif = registro_form.n_rif.data
        empresa = registro_form.username.data
        correo = registro_form.email.data
        password = registro_form.password.data
        zona = registro_form.zona.data
        nivel = registro_form.nivel.data
        codigo = registro_form.codigo.data
        vendedor = registro_form.vendedor.data
        argumentos = (rif+""+n_rif,empresa, password,correo,zona)
        #print(argumentos)
        registro = User.create_element(rif+""+n_rif,empresa, password,correo,zona,nivel,codigo,vendedor)
        try:
            mensaje = USER_CREATED
            flash(mensaje)
            welcome_mail(registro)
        except:
            mensaje = "No se registro usuario"
            flash(mensaje)
    return render_template("auth/register_user.html", form = registro_form, titulo = "Registro usuario")

@page.route("/usuario/perfil", methods=['POST','GET'])
@login_required
def perfil():
    rif = current_user.rif
    form = PerfilForm(request.form)
    if request.method == 'POST':
        password = form.password.data
        confirm_password = form.confirm_password.data
        email = form.email.data
        verify_email = form.verify_email.data
        if password:
            if password==confirm_password:
                print("contra")
                update = User.update_password(rif,password)
                flash(USER_EDIT)
            elif password!=confirm_password:
                flash(USER_ERROR,'error')
        
        if email:
            if email== verify_email:
                flash(USER_EDIT)
                update_email = User.update_email(rif,email)
            elif email != verify_email:
                flash(USER_ERROR, 'error')

    return render_template("auth/perfil.html",titulo="Cambiar clave",form = form) 

@page.route("/usuarios")
@login_required
def usuarios():
    if current_user.nivel == "Cliente":
        return redirect(url_for('.dashboard'))
    users = User.query.all()
    return render_template("auth/list_users.html",titulo="Lista usuarios",users=users)

@page.route("/usuario/<rif>", methods = ["GET","POST"])
@login_required
def usuario(rif):
    datos = User.get_by_rif(rif)
    edit_form = EditForm(request.form,obj=datos)
    if request.method == "POST" and edit_form.validate():
        rif = edit_form.rif.data
        empresa = edit_form.username.data
        correo = edit_form.email.data
        zona = edit_form.zona.data
        nivel = edit_form.nivel.data
        codigo = edit_form.codigo.data
        vendedor = edit_form.seller.data
        password = edit_form.password.data
        edit = User.update_user(rif,empresa,correo,zona,nivel,codigo,vendedor)
        if password:
            update = User.update_password(rif,password)
            flash("Contraseña actualizada")
        mensaje = USER_EDIT
        flash(mensaje)
    return render_template("auth/edit_user.html",titulo="Info usuario", form=edit_form)

@page.route("/")
def index():

    return render_template("/landing/index.html",titulo = "Inicio")






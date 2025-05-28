from flask import Flask
from flask_mail import Mail
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
from flask_sqlalchemy import SQLAlchemy
import os
from .consts import LOGIN_REQUIRED

# Quita esta línea global
# app = Flask(__name__)

mail = Mail()
csrf = CSRFProtect()

db = SQLAlchemy()
login_manager = LoginManager()

from .views import page
from .models import User

def create_app(config):
    # Usa el parámetro directamente
    app = Flask(__name__, 
                static_url_path='/app_crm/static',  
                static_folder='static')
    app.config.from_object(config)
    
    app.config['UPLOAD_FOLDER'] = os.path.abspath('./static/adj')

    csrf.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = ".login"
    login_manager.login_message = LOGIN_REQUIRED

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    mail.init_app(app)
    app.register_blueprint(page)

    with app.app_context():
        db.init_app(app)
        db.create_all()

    return app
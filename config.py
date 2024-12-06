server = 'mysql://Di:DiIoT4.0@localhost/app_MGR'

class Config:
    SECRET_KEY = 'codigo_secreto'

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = server

    MAIL_SERVER = 'smtp.office365.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'ejemplo@ejemplo.com'
    MAIL_PASSWORD = 'clave secreta'
    MAIL_TEST = ''

class ProductionConfig(DevelopmentConfig):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig,
    'production':ProductionConfig
}
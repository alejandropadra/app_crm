server = 'mysql://Di:DiIoT4.0@localhost/app_crm'

class Config:
    SECRET_KEY = 'codigo_secreto'
    APPLICATION_ROOT = '/app_crm'

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = server
    APPLICATION_ROOT = '/app_crm'
    
    MAIL_SERVER = 'smtp.office365.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'alejandro_padra@corimon.com'#'noreply@corimon.com'
    MAIL_PASSWORD = 'flqlgksndjffxyqn'#'yxjtrjppvwgjqmld'
    MAIL_TEST = ''

class ProductionConfig(DevelopmentConfig):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig,
    'production':ProductionConfig
}
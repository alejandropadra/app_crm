LOGIN_REQUIRED = 'Es necesario iniciar sesión.'

USER_CREATED = 'Usuario creado exitosamente.'
USER_EDIT = 'Usuario editado exitosamente.'
USER_ERROR = 'Error, verifique la información.'

LOGIN = 'Usuario autenticado exitosamente.'
LOGOUT = 'Cerraste sesión exitosamente.'
ERROR_USER_PASSWORD = 'Usuario o contraseña incorrectos.'

TASK_UPDATED =  'Tarea actualizada exitosamente.'
TASK_DELETED = 'Tarea eliminada exitosamente.'

ERROR_404 = 'Error 404'
ERROR_500 = 'Error en consulta de origen de datos.'

ABREVIACIONES_FILIAL = {
    'CERDEX C.A.':                     'CER',
    'CORIMON PINTURAS C.A.':           'CRP',
    'MONTANA GRÁFICA C.A.':            'MGR',
    'RESIMON C.A.':                    'RES',
    'TIENDAS MONTANA C.A.':            'TMO',
    'PURAS PINTURAS VENEZOLANAS C.A.': 'PPV',
    'ENVACA C.A.':                     'EEE',
    'CORIMON C.A.':                    'CRM',
}

# Crear diccionario inverso
FILIAL_POR_ABR = {v: k for k, v in ABREVIACIONES_FILIAL.items()}

USRL_SAP_PARTICIPANTES_FICHA ="http://10.207.4.66:8000/sap/bc/zhr_rest/zhrgestiondes"
URL_SAP_PARTICIPANTES = "http://10.207.4.66:8000/sap/bc/zhr_rest/zhrgestiondes_2"


URL_SAP_PRUEBAS= "10.207.4.68:8000/sap/bc/ind_pbi/zcrp_estatus"

#URL PARA SAP EN CALIDAD
#http://10.207.4.68:8000

#↓↓↓ PARA PRODUCCIÓN ↓↓↓
U_FUENTE ='000-020'
C_FUENTE = 'C0r1mon.202502$$'
#↑↑↑ PARA PRODUCCIÓN ↑↑↑




#↓↓↓ PARA CALIDAD ↓↓↓
#U_FUENTE ='RFCUSER
#C_FUENTE = 'C0rimon.0724$'
#↑↑↑ PARA CALIDAD ↑↑↑


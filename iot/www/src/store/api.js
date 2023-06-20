'use strict';

define(function () {
	return {
		// index
		"check_wan2lan": "/cgi-bin/api/wan/lan/switch",
		// "router": "/api/router/status",
		"router": "/cgi-bin/api/router/running/state",
		"router_mini": "/cgi-bin/api/router/running/state_mini",
		"routersinfo": "/cgi-bin/api/router/network/state",

		'router_ddns': '/cgi-bin/api/router/info',
		'getmcu': '/cgi-bin/api/mcu/get',
		'getmcu_config': '/cgi-bin/api/mcu/get_config',
		'setmcu_config': '/cgi-bin/api/mcu/set_config',

		'getsiderouter_config': '/cgi-bin/api/siderouter/get_config',
		'setsiderouter_config': '/cgi-bin/api/siderouter/set_config',

		'getmudial_config': '/cgi-bin/api/mudial/get_config',
		'setmudial_config': '/cgi-bin/api/mudial/set_config',

		'router_clients': '/cgi-bin/api/client/statistics',
		// WAN
		'waninfo': '/cgi-bin/api/wan/info',
		'wantype': '/cgi-bin/api/wan/access/get',
		'wanset': '/cgi-bin/api/wan/access/set',
		// TetheringF
		'teinfo': '/cgi-bin/api/tethering/info',
		'tetget': '/cgi-bin/api/tethering/get',
		'teset': '/cgi-bin/api/tethering/set',
		"teDelete": "/cgi-bin/api/tethering/disconnect",
		// Repeater wifi
		'stainfo': '/cgi-bin/api/repeater/info',
		'scanwifi': '/cgi-bin/api/repeater/scan',
		'joinwifi': '/cgi-bin/api/repeater/join',
		'setoption': '/cgi-bin/api/repeater/set',
		'getoption': '/cgi-bin/api/repeater/get',
		'savedwifi': '/cgi-bin/api/repeater/manager/list',
		'removewifi': '/cgi-bin/api/repeater/manager/remove',
		'disconnectwifi': '/cgi-bin/api/repeater/enable',
		"bridge_set": "/cgi-bin/api/router/bridge/set",
		"bridge_get": "/cgi-bin/api/router/bridge/get",
		"protal_set": "/cgi-bin/api/router/protal/set",
		"protal_get": "/cgi-bin/api/router/protal/get",
		
		// Internet
		'internetreachable': '/cgi-bin/api/internet/reachable',
		'getserverip': '/cgi-bin/api/internet/public_ip/get',
		// 3/4G Modem
		'moAuto': '/cgi-bin/api/modem/auto',
		'moSet': '/cgi-bin/api/modem/set',
		'moCarrier': '/cgi-bin/api/modem/carrier',
		'moEnable': '/cgi-bin/api/modem/enable',
		'moGet': '/cgi-bin/api/modem/get',
		'moInfo': '/cgi-bin/api/modem/info',
		'moReset': '/cgi-bin/api/modem/reset',
		'moStatus': '/cgi-bin/api/modem/status',
		'smslist': '/cgi-bin/api/modem/sms/list',
		'smsremove': '/cgi-bin/api/modem/sms/delete',
		'smssend': '/cgi-bin/api/modem/sms/send',
		'smsstatus': '/cgi-bin/api/modem/sms/status',
		'smscode': '/cgi-bin/api/modem/sms/code',
		'atsend': '/cgi-bin/api/modem/at',
		'simcells': '/cgi-bin/api/modem/cells/get',
		'simswitch': '/cgi-bin/api/modem/sim/switch',
		// AP
		'getaps': '/cgi-bin/api/ap/config', // get
		'enableap': '/cgi-bin/api/ap/enable', // post
		'updateap': '/cgi-bin/api/ap/update', // post
		'channel': '/cgi-bin/api/ap/channel_optimize', // post
		// Radio
		'settxpower': '/cgi-bin/api/radio/txpower/set', // post
		// Client
		'getclients': '/cgi-bin/api/client/list', // get
		'clientblock': '/cgi-bin/api/client/block',
		"setqos": '/cgi-bin/api/client/qos/set',
		"settraffic": "/cgi-bin/api/client/traffic/set",
		"gettraffic": "/cgi-bin/api/client/traffic/get",
		// Router
		'getlanguage': '/cgi-bin/api/router/language/get', // get
		'setlanguage': '/cgi-bin/api/router/language/set', // post
		'logout': '/cgi-bin/api/router/logout', // get
		'login': '/cgi-bin/api/router/login', // get
		'laninfo': '/cgi-bin/api/router/laninfo',
		'guestinfo': '/cgi-bin/api/router/guestinfo',
		'setlanip': '/cgi-bin/api/router/setlanip',
		'setguestip': '/cgi-bin/api/router/setguestip',
		'getmacsinfo': '/cgi-bin/api/router/mac/get',
		'resetfactorymac': '/cgi-bin/api/router/mac/resetfactory',
		'clonemac': '/cgi-bin/api/router/mac/clone',
		'changeadminpwd': '/cgi-bin/api/router/changeadminpwd',
		'gettimezone': '/cgi-bin/api/router/timezone/get',
		'settimezone': '/cgi-bin/api/router/timezone/set',
		'isconnected': '/cgi-bin/api/router/hello', //无需登录即可调用
		'reboot': '/cgi-bin/api/router/reboot',
		'routerinfo': '/cgi-bin/api/router/model',
		'initpwd': '/cgi-bin/api/router/initpwd',
		'ovpnfiledownload': '/api/router/file/download',
		'getapplist': '/cgi-bin/api/router/getapplist',
		// Not login
		'getap4config': '/cgi-bin/api/router/nologin/apinfo', //无需登录即可调用

		// Firmware
		'readautoupgrade': '/api/firmware/autoupgrade/get', // get
		'firmwareinfo': '/api/firmware/info', // get
		'firmwareinfo_b2200': '/cgi-bin/api/firmware/info', // b2200 get
		'checkfirmware': '/api/firmware/onlinecheck', // get
		'setautoupgrade': '/api/firmware/autoupgrade/set', // post
		'prepareupgrade': '/api/firmware/prepareupgrade',
		'uploadfirmware': '/api/firmware/upload',
		'verifyfirmware': '/api/firmware/verify',
		'downloadfirmware': '/api/firmware/download',
		'firmdownloadprogress': '/api/firmware/downloadprogress',
		'revertfirmware': '/api/firmware/reset',
		'flashfirmware': '/api/firmware/upgrade',
		'flashfirmware_b2200': '/cgi-bin/api/firmware/upgrade',
		'firmtfrun': '/api/firmware/autoupkg/run',
		'firmtfstatus': '/api/firmware/autoupkg/status',

		// DNS
		'getdnsinfo': '/cgi-bin/api/dns/get',
		'setdnsinfo': '/cgi-bin/api/dns/set',

		// Ovpnclient
		'ovpngetclientstatus': '/cgi-bin/api/ovpn/client/status',
		'ovpnGetClients': '/cgi-bin/api/ovpn/client/list',
		'ovpnsetclient': '/cgi-bin/api/ovpn/client/set',
		'ovpngetserverlist': '/cgi-bin/api/ovpn/client/serverlist',
		'ovpnremoveclient': '/cgi-bin/api/ovpn/client/remove',
		'ovpnrmall': '/cgi-bin/api/ovpn/client/clear',
		'ovpnuploadconfigpack': '/api/ovpn/client/upload',
		'ovpncheckconfigpack': '/cgi-bin/api/ovpn/client/uploadcheck',
		'ovpngenerateclient': '/cgi-bin/api/ovpn/client/addnew',
		'ovpnmodifyclient': '/cgi-bin/api/ovpn/client/modify',

		// Ovpnserver
		'getovpnconfig': '/cgi-bin/api/ovpn/server/get',
		'setovpnconfig': '/cgi-bin/api/ovpn/server/set',
		'createovpncertificate': '/cgi-bin/api/ovpn/server/generate_cert',
		'getovpnfilestatus': '/cgi-bin/api/ovpn/server/cert/status',
		'ovpnstatus': '/cgi-bin/api/ovpn/server/status',
		'ovpnstart': '/cgi-bin/api/ovpn/server/start',
		'ovpnstop': '/cgi-bin/api/ovpn/server/stop',
		'ovpnblock': '/cgi-bin/api/ovpn/server/access',
		"ovpnfile": '/cgi-bin/api/router/file/download',
		// shadowsocks Client
		'ssclientstatus': '/cgi-bin/api/shadowsocks/client/status',
		'ssclientconfig': '/cgi-bin/api/shadowsocks/client/get',
		'ssmodifyclient': '/cgi-bin/api/shadowsocks/client/modify',
		'ssremoveclient': '/cgi-bin/api/shadowsocks/client/remove',
		'ssstopclient': '/cgi-bin/api/shadowsocks/client/stop',
		'startssclient': '/cgi-bin/api/shadowsocks/client/start',
		'ssaddclient': '/cgi-bin/api/shadowsocks/client/add',

		// shadowsocks Server
		'getserverconfig': '/cgi-bin/api/shadowsocks/server/get',
		'getserverstatus': '/cgi-bin/api/shadowsocks/server/status',
		'startserver': '/cgi-bin/api/shadowsocks/server/start',
		'setserver': '/cgi-bin/api/shadowsocks/server/set',
		'stopserver': '/cgi-bin/api/shadowsocks/server/stop',

		// software
		'software': '/cgi-bin/api/software/list',
		'installedsoftware': '/cgi-bin/api/software/installed',
		'updatesofeware': '/cgi-bin/api/software/update',
		'installsofeware': '/cgi-bin/api/software/install',
		'removesoftware': '/cgi-bin/api/software/remove',
		'findsoftwarebykey': '/cgi-bin/api/software/keyword',
		'findsoftwarebyletter': '/cgi-bin/api/software/letter',
		'findsoftwareapplist': '/cgi-bin/api/software/user_apps_list',
		'findsoftwarereinstall': '/cgi-bin/api/software/user_apps_reinstall',
		'softwareStatus': '/cgi-bin/api/software/status',


		// wireguard server
		'wgsCheckKey': '/cgi-bin/api/wireguard/server/checkkey',
		'wgsCreateKey': '/cgi-bin/api/wireguard/server/createkey',
		'wgsGetKey': '/cgi-bin/api/wireguard/server/getkey',
		'wgsifget': '/cgi-bin/api/wireguard/server/get',
		'wgsifset': '/cgi-bin/api/wireguard/server/set',
		'wgspadd': '/cgi-bin/api/wireguard/server/peer/add',
		'wgsplist': '/cgi-bin/api/wireguard/server/peer/list',
		'wgspset': '/cgi-bin/api/wireguard/server/peer/modify',
		'wgallow': '/cgi-bin/api/wireguard/server/peer/allow',
		'wgspremove': '/cgi-bin/api/wireguard/server/peer/delete',
		'wgspestatus': '/cgi-bin/api/wireguard/server/peer/status',
		'wgsstatus': '/cgi-bin/api/wireguard/server/status',
		'wgsstart': '/cgi-bin/api/wireguard/server/start',
		'wgsstop': '/cgi-bin/api/wireguard/server/stop',
		'wgsCopy': '/cgi-bin/api/wireguard/server/peer/generate',
		'wgsblock': '/cgi-bin/api/wireguard/server/access',

		// wireguard client
		'wgccheckKey': '/cgi-bin/api/wireguard/client/checkkey',
		'wgccreateKey': '/cgi-bin/api/wireguard/client/createkey',
		'wgcgetKey': '/cgi-bin/api/wireguard/client/getkey',
		'wgcset': '/cgi-bin/api/wireguard/client/set',
		'wgcadd': '/cgi-bin/api/wireguard/client/add',
		'wrthirdadd': '/cgi-bin/api/wireguard/client/thirdadd',
		'wgcremove': '/cgi-bin/api/wireguard/client/delete',
		"wgrmall": '/cgi-bin/api/wireguard/client/alldelete',
		'wgcstatus': '/cgi-bin/api/wireguard/client/status',
		'wgcstart': '/cgi-bin/api/wireguard/client/start',
		'wgcstop': '/cgi-bin/api/wireguard/client/stop',
		'wgclist': '/cgi-bin/api/wireguard/client/list',

		// samba share
		'shareget': '/cgi-bin/api/files/samba/get',
		'shareset': '/cgi-bin/api/files/samba/set',

		// button settings
		'switchset': '/cgi-bin/api/router/switch/set',
		'switchget': '/cgi-bin/api/router/switch/get',

		// Firewall port
		"fwadd": "/cgi-bin/api/firewall/port_forwarding/add",
		"fwremove": "/cgi-bin/api/firewall/port_forwarding/del",
		"fwlist": "/cgi-bin/api/firewall/port_forwarding/list",
		"setfw": "/cgi-bin/api/firewall/port_forwarding/set",
		//firawall
		'fwzonelist':'/cgi-bin/api/firewall/port_forwarding/list_zone',
		// Firewall port_opening
		"fwadd_open": "/cgi-bin/api/firewall/port_opening/add",
		"fwremove_open": "/cgi-bin/api/firewall/port_opening/del",
		"fwlist_list": "/cgi-bin/api/firewall/port_opening/list",
		"setfw_open": "/cgi-bin/api/firewall/port_opening/set",
		"fwdel_all": "/cgi-bin/api/firewall/port_all/del",
		"fwapple": "/cgi-bin/api/firewall/dmz/set",
		"fwget": "/cgi-bin/api/firewall/dmz/get",
		//lan ip 
		"leases_del": "/cgi-bin/api/router/static_leases/del",
		"leases_delall": "/cgi-bin/api/router/static_leases/delall",
		"leases_get": "/cgi-bin/api/router/static_leases/get",
		"leases_list": "/cgi-bin/api/router/static_leases/list",
		"leases_set": "/cgi-bin/api/router/static_leases/set",
		//cloud
		"cloudgets": "/cgi-bin/api/cloud/goodcloud/get",
		"cloudsets": "/cgi-bin/api/cloud/goodcloud/set",
		"cloudunbind": "/cgi-bin/api/cloud/goodcloud/unbind",
		"ddnsset": "/cgi-bin/api/cloud/ddns/set",
		"ddnsget": "/cgi-bin/api/cloud/ddns/get",
		"ddnscheck": "/cgi-bin/api/cloud/ddns/check_status",
		"cloudlog": "/cgi-bin/api/cloud/goodcloud/log",

		// zbee
		'zbSetscan': '/cgi-bin/api/smarthome/ble/setscan', //设置搜索区间
		'zbStartscan': '/cgi-bin/api/smarthome/ble/scan', // 开始蓝牙搜索
		'zbStopscan': '/cgi-bin/api/smarthome/ble/stopscan', // 停止蓝牙搜索
		'zbGetscan': '/cgi-bin/api/smarthome/ble/getscan', // 获取蓝牙列表
		'zbSetconnpara': '/cgi-bin/api/smarthome/ble/setconnpara', //设置连接蓝牙参数
		'zbConnect': '/cgi-bin/api/smarthome/ble/connect', // 连接蓝牙
		'zbPrimary': '/cgi-bin/api/smarthome/ble/primary', // 获取已连接蓝牙支持的服务
		'zbGetservice': '/cgi-bin/api/smarthome/ble/getservice', //已连接蓝牙支持的服务列表
		'zbGetdev': '/cgi-bin/api/smarthome/ble/getdev', //已连接蓝牙设备列表
		'zbDisconnect': '/cgi-bin/api/smarthome/ble/disconnect', // 断开蓝牙连接
		'zbReadallchar': '/cgi-bin/api/smarthome/ble/readallchar', // 读取uuid下所有对应的特征值
		'zbReadchar': '/cgi-bin/api/smarthome/ble/readchar', // 读取uuid下指定对应的特征值
		'zbGetchar': '/cgi-bin/api/smarthome/ble/getchar', //  获取uuid下对应的特征值列表
		'zbGetcharval': '/cgi-bin/api/smarthome/ble/getcharvalue', // 获取uuid下对应的特征值的value
		'zbSettxpower': '/cgi-bin/api/smarthome/ble/settxpower', // 设置蓝牙发射功率
		'zbDescread': '/cgi-bin/api/smarthome/ble/descread', // 获取uuid下对应的特征值的描述
		'zbWritechar': '/cgi-bin/api/smarthome/ble/writechar', // 写入特征值
		'zbConnect_mipow': '/cgi-bin/api/smarthome/ble/mipowconnect', // 连接mipow型号
		'zbGetscan_mipow': '/cgi-bin/api/smarthome/ble/mipowget', // 连接mipow型号
		'zbWrite_mipow': '/cgi-bin/api/smarthome/ble/mipowwrite', // 写入mipow型号-特征值
		'zbgetStatus': '/cgi-bin/api/smarthome/ble/getstatus', // 写入mipow型号-特征值
		'zbReboot': '/cgi-bin/api/smarthome/ble/reset', // 重启蓝牙模块
		'zbUploadCloud':'/cgi-bin/api/smarthome/ble/openupload',
		//ntp
		"ntpget":"/cgi-bin/api/router/ntp/get",
		"ntpset":"/cgi-bin/api/router/ntp/set",

		//GPS
		'gpsget': '/cgi-bin/api/gps/info/get',
		'reportget': '/cgi-bin/api/gps/report/get',
		'reportset': '/cgi-bin/api/gps/report/set',
		
		//Mesh
		"gettopo": "/cgi-bin/api/wifison/get_topo",

		//portal
		"getportal": "/cgi-bin/api/router/portal/get",
		"setportal": "/cgi-bin/api/router/portal/set",
		//policy router
		'getpolicy':'/cgi-bin/api/policy/get',
		'setpolicy':'/cgi-bin/api/policy/set',
		'setlocal':'/cgi-bin/api/policy/local',
		'enablepolicy':'/cgi-bin/api/policy/enable',
		'uploadpolicy':'/cgi-bin/api/policy/upload',
		'submitpolicy':'/cgi-bin/api/policy/submitupload',
		//tor
		'gettor':'/cgi-bin/api/tor/get',
		'settor':'/cgi-bin/api/tor/set',
		'torstatus':'/cgi-bin/api/tor/status',

		//adblock
		'getadblock':'/cgi-bin/api/adblock/get',
		'setadblock':'/cgi-bin/api/adblock/set',
		'adblockstatus':'/cgi-bin/api/adblock/status',

		//safe mode
		'setsafe':'/cgi-bin/api/safe_mode/set',
		'getsafe':'/cgi-bin/api/safe_mode/get',

		// /ipv6/info
		// /ipv6/set
		// /ipv6/get
		//ipv6 
		'ipv6info':'/cgi-bin/api/ipv6/info',
		'ipv6set':'/cgi-bin/api/ipv6/set',
		'ipv6get':'/cgi-bin/api/ipv6/get',
		
		//ping
		'pingip':'/cgi-bin/api/internet/ping',
		'traceroute':'/cgi-bin/api/internet/traceroute',

		//igmp snooping
		'get_snooping':'/cgi-bin/api/router/igmpsnooping/get',
		'set_snooping':'/cgi-bin/api/router/igmpsnooping/set',

		'agh_stats':'/control/stats',
		'agh_stats_info':'/control/stats_info',
		'agh_get_config':'/cgi-bin/api/agh/get_config',
		'agh_set_config':'/cgi-bin/api/agh/set_config',
		// dlna
		'getdlna':'/cgi-bin/api/router/dlna/get',
		'setdlna':'/cgi-bin/api/router/dlna/set',

		'app_install':'/cgi-bin/api/router/app/install',
		
		//sms
		'setSms':'/cgi-bin/api/modem/sms/forward',
		'getSms':'/cgi-bin/api/modem/sms/flist',
		'sendaccount': '/cgi-bin/api/modem/sms/account',

		// init wifi
		'get_wifi_init':'/cgi-bin/api/router/wifistatus',
		'set_wifi_init':'/cgi-bin/api/router/wifiinit',

		// xwf
		'get_portal_xwf': '/cgi-bin/api/router/portal-xwf/get',
		'set_portal_xwf': '/cgi-bin/api/router/portal-xwf/set',

		// remove offline client
		'delete_offline_client': '/cgi-bin/api/client/offline_client/del',

		// rs485
    "getrs485_config": "/cgi-bin/api/rs485/attr/get",
    "setrs485_config": "/cgi-bin/api/rs485/attr/set",
    "readrs485_data": "/cgi-bin/api/rs485/data/read",
    "writers485_data": "/cgi-bin/api/rs485/data/write",
    "getrs485_temp_humi": "/cgi-bin/api/rs485/temp_humi/get",
    "setrs485_temp_humi": "/cgi-bin/api/rs485/temp_humi_id/set",
    "send_read_message": "/cgi-bin/api/rs485/terminal/send_read",
    "get_socket": "/cgi-bin/api/rs485/socket/get",
    "set_socket": "/cgi-bin/api/rs485/socket/set",
    "start_socket": "/cgi-bin/api/rs485/socket/start",
    "stop_socket": "/cgi-bin/api/rs485/socket/stop",
    "status_socket": "/cgi-bin/api/rs485/socket/status",
    "get_mqtt": "/cgi-bin/api/rs485/mqtt/get",
    "set_mqtt": "/cgi-bin/api/rs485/mqtt/set",
    "start_mqtt": "/cgi-bin/api/rs485/mqtt/start",
    "stop_mqtt": "/cgi-bin/api/rs485/mqtt/stop",
    "status_mqtt": "/cgi-bin/api/rs485/mqtt/status",

		// delete all message
		"delete_all_message": "/cgi-bin/api/modem/sms/delete_all",

		// wg client block 
		"wgcblock": "/cgi-bin/api/wireguard/client/access",
		"ovpncblock": "/cgi-bin/api/ovpn/client/access",

		//log
		"get_log_status":"/cgi-bin/api/log/status",
		"set_log_enable":"/cgi-bin/api/log/enable",
		"get_log_file":"/cgi-bin/api/log/file",
	};
});

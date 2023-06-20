#!/bin/sh

[ -n "$INCLUDE_ONLY" ] || {
	. /lib/functions.sh
	. ../netifd-proto.sh
	init_proto "$@"
}

proto_qcm_init_config() {
	available=1
	proto_config_add_string "device:device"
	proto_config_add_string "ifname"
	proto_config_add_string "apn"
	proto_config_add_string "pincode"
	proto_config_add_string "auth"
	proto_config_add_string "username"
	proto_config_add_string "password"
	proto_config_add_string "node"
	proto_config_add_int mtu
	proto_config_add_defaults
}

proto_qcm_setup() {
	local interface="$1"
	local devpath=""
	local devname=""

	local device ifname  apn  mtu pincode ifname auth username password  node $PROTO_DEFAULT_OPTIONS
	json_get_vars device ifname apn mtu pincode auth username password  node $PROTO_DEFAULT_OPTIONS

        case $auth in
        "PAP") auth=1;;
        "CHAP") auth=2;;
	"PAP or CHAP") auth=3;;
	*) auth=0;;
        esac

	if [ -n "$node" ];then
		devpath="$(find  /sys/devices/ -name "$node")"
		devname="$(find "$devpath" -name  "cdc-wdm*" )"
		devname="$(basename "$devname")"
	else
 		devname="$(basename "$device")"
   		devpath="$(readlink -f /sys/class/usbmisc/$devname/device/)"
	fi
	
	if [ -n "$node" ];then
		#fix config
		[ "$devname" = "$(basename "$device")" ] || {
			[ -n "$devname" ] && uci set network."$interface".device="/dev/${devname}" && uci commit
		}
	fi

	[ -n "$mtu" ] && {
		echo "Setting MTU to $mtu"
		ip link set dev $ifname mtu $mtu
	}

	#fix t-mobile
	/usr/bin/fix_tmobile

	# operator
	/usr/bin/amend_operator_apn

	ifname="$( ls "$devpath"/net )"
	bus="$(basename "$devpath"|cut -d ':' -f 1)"

	[ -n "$bus" ] && {
		# gl_modem -B "$bus"  AT 'AT+CGDCONT=1,"IPV4V6",""'
		# sleep 2
		gl_modem -B "$bus"  AT 'AT+CFUN=4'
		sleep 2
		gl_modem -B "$bus"  AT 'AT+CFUN=1'
		sleep 5
	}

	[ -z "$username" ] && {
		password=""
		auth=""
	}

	if [ `cat /tmp/sim_type` = "verizon" ]; then
		proto_run_command "$interface" qcm ${pdp_type:=-4 -6} \
			${cid:=-n 3} \
			${apn:+-s $apn} \
			${username:+ $username} \
			${password:+ $password} \
			${auth:+ $auth} \
			${pincode:+-p $pincode}
	else
		proto_run_command "$interface" qcm ${pdp_type:=-4 -6} \
			${apn:+-s $apn} \
			${username:+ $username} \
			${password:+ $password} \
			${auth:+ $auth} \
			${pincode:+-p $pincode}
	fi

	proto_init_update "$ifname" 1
	proto_set_keep 1
	proto_send_update "$interface"

	json_init
	json_add_string name "${interface}_4"
	json_add_string ifname "@$interface"
	json_add_string proto "dhcp"
	proto_add_dynamic_defaults
	ubus call network add_dynamic "$(json_dump)"

	return 0
}

proto_qcm_teardown() {
	local interface="$1"
	proto_kill_command "$interface"
}

[ -n "$INCLUDE_ONLY" ] || {
	add_protocol qcm
}

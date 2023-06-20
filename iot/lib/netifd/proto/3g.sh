#!/bin/sh
[ -n "$INCLUDE_ONLY" ] || {
	NOT_INCLUDED=1
	INCLUDE_ONLY=1

	. ../netifd-proto.sh
	. ./ppp.sh
	init_proto "$@"
}


handle_2G_mode() {
	local count=0
	local dev=$(echo $1|cut -d '/' -f 3)
	local dir=modem.$(find /sys/devices/platform/  -name $dev |tail -n 1|cut -d '/' -f 8|cut -d ':' -f 1)
	local mode=$(cat /tmp/$dir/signal |cut -d '"' -f 4)
	[ -f /tmp/$dir/fail_count ] && {
		count=$(cat /tmp/$dir/fail_count)
	}
	[ "$mode" = "gsm" -o "$mode" = "cdma" -o "$mode" = "tdma" ] && {
		let count=count+1
		echo $count >/tmp/$dir/fail_count
		[ $count -gt 10 ] && {
			logger modem delay dial,120s
			sleep 120
		}
		return
	}
	[ -f /tmp/$dir/fail_count ] && {
		rm /tmp/$dir/fail_count
	}
}

proto_3g_init_config() {
	no_device=1
	available=1
	ppp_generic_init_config
	proto_config_add_string "device:device"
	proto_config_add_string "apn"
	proto_config_add_string "service"
	proto_config_add_string "pincode"
	proto_config_add_string "dialnumber"
	proto_config_add_int mtu
}

proto_3g_setup() {
	local interface="$1"
	local chat
	local mtu

	json_get_var device device
	json_get_var apn apn
	json_get_var service service
	json_get_var pincode pincode
	json_get_var dialnumber dialnumber
	json_get_var mtu mtu

	[ -n "$dat_device" ] && device=$dat_device

	device="$(readlink -f $device)"
	[ -e "$device" ] || {
		proto_set_available "$interface" 0
		return 1
	}

	[ -n "$mtu" ] && {
		echo "Setting MTU to $mtu"
		ip link set dev $ifname mtu $mtu
	}

	ipv6_enabled=`uci get glipv6.globals.enabled 2>/dev/null`
	ipv6_wan_interface=`uci get glipv6.wan.interface 2>/dev/null`
	[ -e "/tmp/sim_type" -a -e "/tmp/sim_status" ] || check_verizon

	case "$service" in
		cdma|evdo)
			if [ "$ipv6_enabled" = "1" -a "$ipv6_wan_interface" = "$interface" ];then
				chat="/etc/chatscripts/evdoipv6.chat"
				[ `cat /tmp/sim_type` = "verizon" ] && chat="/etc/chatscripts/csg_evdoipv6.chat"
			else
				chat="/etc/chatscripts/evdo.chat"
			fi
		;;
		*)
			if [ "$ipv6_enabled" = "1" -a "$ipv6_wan_interface" = "$interface" ];then
				chat="/etc/chatscripts/3gipv6.chat"
				[ `cat /tmp/sim_type` = "verizon" ] && chat="/etc/chatscripts/csg_3gipv6.chat"
			else
				chat="/etc/chatscripts/3g.chat"
				[ `cat /tmp/sim_type` = "verizon" ] && chat="/etc/chatscripts/csg_3g.chat"
			fi
			cardinfo=$(gcom -d "$device" -s /etc/gcom/getcardinfo.gcom)
			if echo "$cardinfo" | grep -q Novatel; then
				case "$service" in
					umts_only) CODE=2;;
					gprs_only) CODE=1;;
					*) CODE=0;;
				esac
				export MODE="AT\$NWRAT=${CODE},2"
			elif echo "$cardinfo" | grep -q Option; then
				case "$service" in
					umts_only) CODE=1;;
					gprs_only) CODE=0;;
					*) CODE=3;;
				esac
				export MODE="AT_OPSYS=${CODE}"
			elif echo "$cardinfo" | grep -q "Sierra Wireless"; then
				SIERRA=1
			elif echo "$cardinfo" | grep -qi huawei; then
				case "$service" in
					umts_only) CODE="14,2";;
					gprs_only) CODE="13,1";;
					*) CODE="2,2";;
				esac
				export MODE="AT^SYSCFG=${CODE},3FFFFFFF,2,4"
			fi

			if [ -n "$pincode" ]; then
				PINCODE="$pincode" gcom -d "$device" -s /etc/gcom/setpin.gcom || {
					proto_notify_error "$interface" PIN_FAILED
					proto_block_restart "$interface"
					return 1
				}
			fi
			[ -n "$MODE" ] && gcom -d "$device" -s /etc/gcom/setmode.gcom

			# wait for carrier to avoid firmware stability bugs
			[ -n "$SIERRA" ] && {
				gcom -d "$device" -s /etc/gcom/getcarrier.gcom || return 1
			}

			if [ -z "$dialnumber" ]; then
				dialnumber="*99***1#"
				[ `cat /tmp/sim_type` = "verizon" ] && dialnumber="*99***3#"
			fi

		;;
	esac
	handle_2G_mode $device

	#fix t-mobile
	/usr/bin/fix_tmobile

	# operator
	/usr/bin/amend_operator_apn

	connect="${apn:+USE_APN=$apn }DIALNUMBER=$dialnumber /usr/sbin/chat -t5 -v -E -f $chat"

	ppp_generic_setup "$interface" \
		noaccomp \
		nopcomp \
		novj \
		nobsdcomp \
		noauth \
		maxfail 1 \
		set EXTENDPREFIX=1 \
		lock \
		crtscts \
		115200 "$device"
	
	return 0
}

proto_3g_teardown() {
	proto_kill_command "$interface"
}

[ -z "$NOT_INCLUDED" ] || add_protocol 3g

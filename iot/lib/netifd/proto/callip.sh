#!/bin/sh

[ -n "$INCLUDE_ONLY" ] || {
	. /lib/functions.sh
	. ../netifd-proto.sh
	init_proto "$@"
}

proto_callip_init_config() {
	available=1
	no_device=1
	proto_config_add_string device
	proto_config_add_string apn
	proto_config_add_string pincode
	proto_config_add_string ifname
	proto_config_add_string username
	proto_config_add_string password
	proto_config_add_defaults
}

proto_callip_setup() { echo "wwan[$$] callip proto is missing"; }

[ -f ./dhcp.sh ] && . ./dhcp.sh

proto_callip_setup() {
	local interface="$1"
	local device apn pincode ifname username password 
	json_get_vars device apn pincode ifname  username password

	[ -n "$device" ] || {
		echo "device not exist"
		return 1
	}

	[ -c "$device" ] || {
		echo "device not exist"
		return 1
	}

	if [ -n "$pincode" ]; then
		PINCODE="$pincode" gcom -d "$device" -s /etc/gcom/setpin.gcom || {
			proto_notify_error "$interface" PIN_FAILED
			proto_block_restart "$interface"
			return 1
		}
	fi

	gcom -d ${device} -s /etc/gcom/callip.gcom
	proto_dhcp_setup $1 $ifname

	return 0
}

proto_callip_teardown() {
	local interface="$1"
	local device
	json_get_vars device

	gcom -d ${device} -s /etc/gcom/callip-stop.gcom
	proto_dhcp_teardown $@
}

[ -n "$INCLUDE_ONLY" ] || {
	add_protocol callip
}

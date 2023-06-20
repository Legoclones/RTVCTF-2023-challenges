#!/bin/sh

# ######################
# Function Declaration #
# ######################
# 
# check_guest_network_exist()
# get_model()
# is_nand()
# is_sysupgrade_tgz_exist()
# is_gl_init_complete()
# get_wifi_device_count()
# get_default_mac()
# get_default_ddns()
# get_default_sn()
# get_country_code()
# get_host_by_name()
# get_firmware_download_url()
# get_ssid_suffix()
# set_lan_mac()
# guest_network_init()
# restart_all_vpn()
# disable_all_vpn()
# stop_all_vpn()
# restart_nodogsplash()
# stop_nodogsplash()


check_guest_network_exist() {
	local exist
	exist=$(uci get dhcp.guest 2>/dev/null)
	echo "$exist"
}

check_support_save_installed_pkgs () {
	local exist
	exist=$(cat /sbin/sysupgrade | grep "export SAVE_INSTALLED_PKGS=1")
	echo "$exist"
}

get_model() {
	local board boardname

	. /lib/functions.sh
	
	board=$(board_name)
	boardname="${board#*-}"

	[ -n "$boardname" ] || {
		loger "Unsupported model (model not in support-list)"
		echo ""
		return
	}
	
	case "$boardname" in
		ar300m-nor|\
		ar300m-nand)
			echo "ar300m"
			;;
		ar750s-nor|\
		ar750s-nor-nand)
			echo "ar750s"
			;;
		e750-nor|\
		e750-nor-nand)
			echo "e750"
			;;
		x750-nor|\
		x750-nor-nand)
			echo "x750"
			;;
		x300b-nor|\
		x300b-nor-nand)
			echo "x300b"
			;;
		xe300-iot|\
		xe300-nor|\
		xe300-nor-nand)
			echo "xe300"
			;;
		x1200-nor|\
		x1200-nor-nand)
			echo "x1200"
			;;
		s200-nor|\
		s200-nor-nand)
			echo "s200"
			;;
		*)
			echo "$boardname"
			;;
	esac

}

is_nand() {
	local nand
	nand=$(cat /proc/mounts |grep 'ubi0_1.*overlay')
	[ -n "$nand" ] && echo "yes"
}

is_sysupgrade_tgz_exist() {
	[ -f /sysupgrade.tgz ] && {
		echo "yes"
		return
	}
	echo "no"
}

is_gl_init_complete() {
	[ ! -f /etc/rc.d/S10gl_init ] && {
	    echo "yes"
	    return
	}
	echo "no"
}

get_wifi_device_count() {
	local model devicenum 
		
	model=$(get_model)
	case $model in
	"x750"|\
	"ar750s"|\
	"ar750"|\
	"b1300"|\
	"x1200"|\
	"mt1300"|\
	"s200"|\
	"s1300")
		devicenum="2"
		;;
	"usb150"|\
	"ar150"|\
	"mifi"|\
	"mt300a"|\
	"x300b"|\
	"xe300"|\
	"mt300n"|\
	"vixmini"|\
	"n300"|\
	"mt300n-v2")
		devicenum="1"
		;;
	"ar300m")
		devicenum=$(ls /sys/class/ieee80211/ | wc -l)
		;;
	"b2200")
		devicenum="3"
		;;
	*)
		;;
	esac

	echo "$devicenum"
}

get_default_mac() {
	local mac model skip mtd
	
	skip=0x0;
	
	model=$(get_model)
	case $model in
	"b1300"|\
	"b2200"|\
	"s1300")
		mtd="mtd7"
		skip=0x0;
		;;
	"usb150"|\
	"ar150"|\
	"ar300m"|\
	"x300b"|\
	"xe300"|\
	"mifi"|\
	"ar750"|\
	"ar750s"|\
	"x750"|\
	"e750"|\
	"s200"|\
	"x1200")
		mtd=$(cat /proc/mtd | awk -F: '/art/{print $1}')
		skip=0x0;
		;;
	"mt300a"|\
	"mt300n"|\
	"vixmini"|\
	"n300"|\
	"mt300n-v2")
		mtd="mtd2"
		skip=0x4
		;;
	"mt1300")
		mtd="mtd2"
		skip=0x4000
		;;
	"mv1000")
		mtd="mtd2"
		skip=0x0
		;;
	*)
		mtd="mtd6"
		skip=0x0;
		;;
	esac

	mac=$(hexdump -v -n 6 -s $((0x0+$skip)) -e '6/1 "%02x"' /dev/$mtd)

	echo "$mac"
}

get_default_mac_with_colon() {
	local mac model skip mtd
	
	skip=0x0;
	
	model=$(get_model)
	case $model in
	"b1300"|\
	"b2200"|\
	"s1300")
		mtd="mtd7"
		skip=0x0;
		;;
	"usb150"|\
	"ar150"|\
	"ar300m"|\
	"x300b"|\
	"xe300"|\
	"mifi"|\
	"ar750"|\
	"ar750s"|\
	"x750"|\
	"e750"|\
	"s200"|\
	"x1200")
		mtd=$(cat /proc/mtd | awk -F: '/art/{print $1}')
		skip=0x0;
		;;
	"mt300a"|\
	"mt300n"|\
	"vixmini"|\
	"n300"|\
	"mt300n-v2")
		mtd="mtd2"
		skip=0x4
		;;
	"mt1300")
		mtd="mtd2"
		skip=0x4000
		;;
	"mv1000")
		mtd="mtd2"
		skip=0x0
		;;
	*)
		mtd="mtd6"
		skip=0x0;
		;;
	esac

	mac=$(hexdump -v -n 6 -s $((0x0+$skip)) -e '6/1 "%02x:"' /dev/$mtd)

	echo ${mac%?}
}

get_default_ddns() {
	local ddns model mtd skip

	skip=0x0;

	model=$(get_model)
	case $model in
	"connect inet v1")
		mtd="mtd0"
		skip=skip=$((0x1fc10))
		;;
	"b1300"|\
	"b2200"|\
	"s1300")
		mtd="mtd7"
		skip=$((0x10))
		;;
	"domino"|\
	"usb150"|\
	"ar150"|\
	"ar300m"|\
	"x300b"|\
	"xe300"|\
	"mifi"|\
	"ar750"|\
	"ar750s"|\
	"x750"|\
	"e750"|\
	"s200"|\
	"x1200")
		mtd=$(cat /proc/mtd | awk -F: '/art/{print $1}')
		skip=0x10
		;;
	"mt300a"|\
	"mt300n"|\
	"mt1300"|\
	"vixmini"|\
	"n300"|\
	"mt300n-v2")
		mtd="mtd2"
		skip=0x4010
		;;
	"mv1000")
		mtd="mtd2"
		skip=0x10
		;;
	*)
		mtd="mtd6"
		;;
	esac

	ddns=$(hexdump -v -n 7 -s $((0x0+$skip)) -e '7/7 "%s"' /dev/$mtd)

	echo "$ddns"
}

get_default_sn() {
	local sn model mtd skip

	skip=0x0;

	model=$(get_model)
	case $model in
	"b1300"|\
	"b2200"|\
	"s1300")
		mtd="mtd7"
		skip=0x30
		;;
	"usb150"|\
	"ar150"|\
	"ar300m"|\
	"x300b"|\
	"xe300"|\
	"e750"|\
	"mifi"|\
	"ar750"|\
	"ar750s"|\
	"x750"|\
	"s200"|\
	"x1200")
		mtd=$(cat /proc/mtd | awk -F: '/art/{print $1}')
		skip=0x30
		;;
	"mt300a"|\
	"mt300n"|\
	"vixmini"|\
	"n300"|\
	"mt300n-v2"|\
	"mt1300")
		mtd="mtd2"
		skip=0x4030
		;;
	"mv1000")
		mtd="mtd2"
		skip=0x30
		;;
	*)
		mtd="mtd6"
		;;
	esac

	sn=$(hexdump -v -n 16 -s $((0x0+$skip)) -e '16/16 "%s"' /dev/$mtd)

	echo "$sn"
}

get_country_code() {
	local country model mtd skip

	skip=0x0;

	model=$(get_model)
	case $model in
	"connect inet v1")
		mtd="mtd0"
		skip=skip=$((0x1fc10))
		;;
	"b1300"|\
	"b2200"|\
	"s1300")
		mtd="mtd7"
		skip=$((0x88))
		;;
	"domino"|\
	"usb150"|\
	"ar150"|\
	"ar300m"|\
	"x300b"|\
	"xe300"|\
	"mifi"|\
	"ar750"|\
	"ar750s"|\
	"x750"|\
	"e750"|\
	"s200"|\
	"x1200")
		mtd=$(cat /proc/mtd | awk -F: '/art/{print $1}')
		skip=$((0x88))
		;;
	"mt300a"|\
	"mt300n"|\
	"vixmini"|\
	"n300"|\
	"mt300n-v2")
		mtd="mtd2"
		skip=$((0x4088))
		;;
	"mv1000")
		mtd="mtd2"
		skip=0x10
		;;
	*)
		mtd="mtd6"
		;;
	esac

	country=$(hexdump -v -n 2 -s $((0x0+$skip)) -e '2/2 "%s"' /dev/$mtd)
	if [ -n "$(grep "^$country" /lib/wifi/qcawifi_countrycode.txt)" ]; then
		echo "$country"
	else
		echo "US"
	fi
}

get_host_by_name() {
	local host
	host=$(curl -s --connect-timeout 5 http://checkip.dyndns.org | grep -m 1 -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}')
	[ -z "$host" ] && host=$(curl -s --connect-timeout 5 http://myip.com.tw/ | grep -m 1 -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}')
	[ -z "$host" ] && host=$(curl -s --connect-timeout 5 ifconfig.me/ip | grep -m 1 -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}')
	echo "$host"
}

get_firmware_download_url() {
	local firmware_path model

	firmware_path=$(uci get glconfig.autoupdate.firmware_path 2>/dev/null)
	[ -n "$firmware_path" ] && {
		echo "$firmware_path"
		return
	}

	#firmware_path="http://download.gl-inet.com/firmware/"
	local language=$(uci get glconfig.general.language 2>/dev/null)
	[ -n "$language" ] && {
		if [ "$language" = "CN" ]; then
			firmware_path="https://fw.gl-inet.cn/firmware/"
		else
			firmware_path="https://fw.gl-inet.com/firmware/"
		fi
	}

	model=$(get_model)
	case "$model" in
	"connect inet v1")
		model="6416"
		firmware_path="${firmware_path}${model}/v1/"
		;;
	"ar150"|\
	"ar300"|\
	"ar750"|\
	"b1300"|\
	"mifi"|\
	"mt300a"|\
	"mt300n"|\
	"mt300n-v2"|\
	"mt750"|\
	"s200"|\
	"usb150")
		firmware_path="${firmware_path}${model}/v1/"
		;;
	"s1300"|\
	"b2200"|\
	"ar750s"|\
	"x1200"|\
	"x750"|\
	"x300b"|\
	"xe300"|\
	"e750"|\
	"vixmini")
		firmware_path="${firmware_path}${model}/release/"
		;;
	"ar300m")
		nand=$(cat /proc/mounts |grep 'ubi0_1.*overlay')
		if [ -n "$nand" ]; then
			firmware_path="${firmware_path}${model}/nand/v1/"
		else
			firmware_path="${firmware_path}${model}/v1/"
		fi
		;;
	*)	############# default ################
		firmware_path="${firmware_path}${model}/release/"
		;;
	esac

	echo "$firmware_path"
}

get_ssid_suffix() {
	local suffix mac

	mac=$(get_default_mac)

	echo ${mac:9:3}
}

set_lan_mac() {
	local wan=$(get_default_mac)
	local wan_mac="${wan:0:2}:${wan:2:2}:${wan:4:2}:${wan:6:2}:${wan:8:2}:${wan:10:2}"
	if [ "$1" = "MT1300" -o "$1" = "MT300N-V2" ]; then
		uci -q delete network.wan_eth0_2_dev
		uci set network.wan_dev=device
		uci set network.wan_dev.name="eth0.2"
		uci set network.wan_dev.macaddr="$wan_mac"
	fi


	local tlan=$(((0x$wan)+1))
	local lan=`printf "%.x\n" $tlan`
	local lan_mac="${lan:0:2}:${lan:2:2}:${lan:4:2}:${lan:6:2}:${lan:8:2}:${lan:10:2}"
	if [ "$1" = "MT300N-V2" -o "$1" = "MT1300" ]; then
		uci -q delete network.lan_eth0_1_dev
		uci set network.lan_dev=device
		uci set network.lan_dev.name='eth0.1'
		uci set network.lan_dev.macaddr="$lan_mac"
	elif [ "$1" = "mv1000" ]; then
		local lan0_mac=`uci -q get network.lan0.macaddr`
		[ "$lan0_mac" != "$lan_mac" ] && {
			uci set network.lan0=interface
			uci set network.lan0.ifname='lan0'
			uci set network.lan0.macaddr="$lan_mac"
		}
		local lan1_mac=`uci -q get network.lan1.macaddr`
		[ "$lan1_mac" != "$lan_mac" ] && {
			uci set network.lan1=interface
			uci set network.lan1.ifname='lan1'
			uci set network.lan1.macaddr="$lan_mac"
		}
	else
		uci set network.lan.macaddr="$lan_mac"
		uci set network.lan.default_macaddr="$lan_mac"
	fi
}

guest_network_init() {
	local model suffix dual_band

	model=$(echo $(get_model) | awk '{ print toupper($1); }')	
	[ "$model" = "VIXMINI" ] && return
	
	[ "$model" = "AR300M" -a "$(ls /sys/class/ieee80211/ | wc -l)" = "2" ] && model="AR300MD"
	
	#set_lan_mac $model

	suffix=$(get_ssid_suffix)
	
	#add wireless config
	pssid="GL-"${model}"-"${suffix}
	dual_band=$(uci get wireless.radio1 2>/dev/null)

	if [ "$model" = "X1200" -o "$model" = "AR750" -o "$model" = "AR750S" -o "$model" = "S200" -o "$model" = "X750" -o "$model" = "AR300MD" -o \
	   "$model" = "E750" ] && [ "$dual_band" = "wifi-device" ] ;then
		#5G guest wifi
		ssid5g=${pssid}-Guest-5G
		#index5g=0
		#tindex5g=`expr $index5g + 2`
		uci set wireless.guest5g=wifi-iface
		uci set wireless.guest5g.device=radio0
		uci set wireless.guest5g.network=guest
		uci set wireless.guest5g.mode=ap
		uci set wireless.guest5g.wds=1
		uci set wireless.guest5g.ssid=$ssid5g
		uci set wireless.guest5g.encryption=psk2
		uci set wireless.guest5g.key=goodlife
		uci set wireless.guest5g.ifname=wlan2
		uci set wireless.guest5g.disabled=1
		uci set wireless.guest5g.guest=1
		uci set wireless.guest5g.disassoc_low_ack=0
		
		#2.4G guest wifi
		ssid2g=${pssid}-Guest
		#index2g=1
		#tindex2g=`expr $index2g + 2`
		uci set wireless.guest2g=wifi-iface
		uci set wireless.guest2g.device=radio1
		uci set wireless.guest2g.network=guest
		uci set wireless.guest2g.mode=ap
		uci set wireless.guest2g.wds=1
		uci set wireless.guest2g.ssid=$ssid2g
		uci set wireless.guest2g.encryption=psk2
		uci set wireless.guest2g.key=goodlife
		uci set wireless.guest2g.ifname=wlan3
		uci set wireless.guest2g.disabled=1
		uci set wireless.guest2g.guest=1
		uci set wireless.guest2g.disassoc_low_ack=0
	elif [ "$model" = "B1300" -o "$model" = "S1300" ]; then
		#5G guest wifi
		ssid5g=${pssid}-Guest-5G
		uci set wireless.guest5g=wifi-iface
		uci set wireless.guest5g.device=wifi1
		uci set wireless.guest5g.network=guest
		uci set wireless.guest5g.mode=ap
		uci set wireless.guest5g.wds=1
		uci set wireless.guest5g.ssid=$ssid5g
		uci set wireless.guest5g.encryption=psk2
		uci set wireless.guest5g.key=goodlife
		uci set wireless.guest5g.ifname=ath2
		uci set wireless.guest5g.disabled=1
		uci set wireless.guest5g.guest=1
		uci set wireless.guest5g.disassoc_low_ack=0
		
		#2.4G guest wifi
		ssid2g=${pssid}-Guest
		uci set wireless.guest2g=wifi-iface
		uci set wireless.guest2g.device=wifi0
		uci set wireless.guest2g.network=guest
		uci set wireless.guest2g.mode=ap
		uci set wireless.guest2g.wds=1
		uci set wireless.guest2g.ssid=$ssid2g
		uci set wireless.guest2g.encryption=psk2
		uci set wireless.guest2g.key=goodlife
		uci set wireless.guest2g.ifname=ath3
		uci set wireless.guest2g.disabled=1
		uci set wireless.guest2g.guest=1
		uci set wireless.guest2g.disassoc_low_ack=0
	elif [ "$model" = "B2200" ]; then
		#5G guest wifi
		ssid5g=${pssid}-Guest-5G
		uci set wireless.guest5g=wifi-iface
		uci set wireless.guest5g.device=wifi1
		uci set wireless.guest5g.network=guest
		uci set wireless.guest5g.mode=ap
		uci set wireless.guest5g.wds=1
		uci set wireless.guest5g.ssid=$ssid5g
		uci set wireless.guest5g.encryption=psk2
		uci set wireless.guest5g.key=goodlife
		uci set wireless.guest5g.ifname=ath3
		uci set wireless.guest5g.disabled=1
		uci set wireless.guest5g.guest=1
		uci set wireless.guest5g.disassoc_low_ack=0

		#2.4G guest wifi
		ssid2g=${pssid}-Guest
		uci set wireless.guest2g=wifi-iface
		uci set wireless.guest2g.device=wifi0
		uci set wireless.guest2g.network=guest
		uci set wireless.guest2g.mode=ap
		uci set wireless.guest2g.wds=1
		uci set wireless.guest2g.ssid=$ssid2g
		uci set wireless.guest2g.encryption=psk2
		uci set wireless.guest2g.key=goodlife
		uci set wireless.guest2g.ifname=ath4
		uci set wireless.guest2g.disabled=1
		uci set wireless.guest2g.guest=1
		uci set wireless.guest2g.disassoc_low_ack=0
	elif [ "$model" = "MT300N-V2" -o "$model" = "VIXMINI" -o "$model" = "N300" ]; then
		[ "$model" = "VIXMINI" ] && {
			ssid_prefix="VIXMINI"
			pssid=${ssid_prefix}"-"${suffix}
		}
		[ "$model" = "N300" ] && {
			ssid_prefix="microuter"
			pssid=${ssid_prefix}"-"${suffix}
		}
		ssid2g=${pssid}-Guest
		uci set wireless.guest2g=wifi-iface
		uci set wireless.guest2g.device=mt7628
		uci set wireless.guest2g.network=guest
		uci set wireless.guest2g.mode=ap
		uci set wireless.guest2g.wds=1
		uci set wireless.guest2g.ssid=$ssid2g
		uci set wireless.guest2g.encryption=psk2
		uci set wireless.guest2g.key=goodlife
		uci set wireless.guest2g.ifname=ra1
		uci set wireless.guest2g.disabled=1
		uci set wireless.guest2g.guest=1
		uci set wireless.guest2g.disassoc_low_ack=0
		uci commit wireless
		ifconfig ra0 down
		rmmod mt7628
		kversion=`uname -r`
		insmod /lib/modules/${kversion}/mt7628.ko 
	elif [ "$model" = "X300B" -o "$model" = "XE300" ]; then
		#2.4G guest wifi
		ssid_prefix="GL-"${model}                                                                                                                   
		pssid=${ssid_prefix}"-"${suffix}			
		ssid2g=${pssid}-Guest
		#index2g=1
		#tindex2g=`expr $index2g + 2`
		uci set wireless.guest2g=wifi-iface
		uci set wireless.guest2g.device=radio0
		uci set wireless.guest2g.network=guest
		uci set wireless.guest2g.mode=ap
		uci set wireless.guest2g.wds=1
		uci set wireless.guest2g.ssid=$ssid2g
		uci set wireless.guest2g.encryption=psk2
		uci set wireless.guest2g.key=goodlife
		uci set wireless.guest2g.ifname=wlan1
		uci set wireless.guest2g.disabled=1
		uci set wireless.guest2g.guest=1
		uci set wireless.guest2g.disassoc_low_ack=0 
	elif [ "$model" = "MT1300" ]; then
		ssid5g=${pssid}-Guest-5G
		uci set wireless.guest5g=wifi-iface
		uci set wireless.guest5g.device=mt7615e5
		uci set wireless.guest5g.network=guest
		uci set wireless.guest5g.mode=ap
		uci set wireless.guest5g.wds=1
		uci set wireless.guest5g.ssid=$ssid5g
		uci set wireless.guest5g.encryption=psk2
		uci set wireless.guest5g.key=goodlife
		uci set wireless.guest5g.ifname=ra1
		uci set wireless.guest5g.disabled=1
		uci set wireless.guest5g.guest=1

		ssid2g=${pssid}-Guest
		uci set wireless.guest2g=wifi-iface
		uci set wireless.guest2g.device=mt7615e2
		uci set wireless.guest2g.network=guest
		uci set wireless.guest2g.mode=ap
		uci set wireless.guest2g.wds=1
		uci set wireless.guest2g.ssid=$ssid2g
		uci set wireless.guest2g.encryption=psk2
		uci set wireless.guest2g.key=goodlife
		uci set wireless.guest2g.ifname=rax1
		uci set wireless.guest2g.disabled=1
		uci set wireless.guest2g.guest=1
		uci commit wireless
	elif [ "$model" = "MV1000" ];then
		ssid2g=${pssid}-Guest
		uci rename wireless.@wifi-iface[1]=guest2g
		uci set wireless.guest2g.device=radio1
		uci set wireless.guest2g.network=guest
		uci set wireless.guest2g.mode=ap
		uci set wireless.guest2g.wds=1
		uci set wireless.guest2g.ssid=$ssid2g
		uci set wireless.guest2g.encryption=psk2
		uci set wireless.guest2g.key=goodlife
		uci set wireless.guest2g.ifname=wlan1
		uci set wireless.guest2g.disabled=1
		uci set wireless.guest2g.guest=1
	else
		#2.4G guest wifi
		ssid2g=${pssid}-Guest
		[ "$model" = "AR300M" ] && [ -z $(is_nand) ] && ssid2g=${pssid}-NOR-Guest
		#index2g=1
		#tindex2g=`expr $index2g + 2`
		uci set wireless.guest2g=wifi-iface
		uci set wireless.guest2g.device=radio0
		uci set wireless.guest2g.network=guest
		uci set wireless.guest2g.mode=ap
		uci set wireless.guest2g.wds=1
		uci set wireless.guest2g.ssid=$ssid2g
		uci set wireless.guest2g.encryption=psk2
		uci set wireless.guest2g.key=goodlife
		uci set wireless.guest2g.ifname=wlan1
		uci set wireless.guest2g.disabled=1
		uci set wireless.guest2g.guest=1
	fi

	NETWORKID=guest
	FIREWALLZONE=guestzone
	uci set network.${NETWORKID}=interface
	uci set network.${NETWORKID}.ifname=${NETWORKID}
	uci set network.${NETWORKID}.type=bridge
	uci set network.${NETWORKID}.proto=static
	uci set network.${NETWORKID}.ipaddr=192.168.9.1
	uci set network.${NETWORKID}.netmask=255.255.255.0
	uci set network.${NETWORKID}.ip6assign='60'
	[ "$model" = "MT1300" ] && uci set network.${NETWORKID}.bridge_empty='1'
	uci set dhcp.${NETWORKID}=dhcp
	uci set dhcp.${NETWORKID}.interface=${NETWORKID}
	uci set dhcp.${NETWORKID}.start=100
	uci set dhcp.${NETWORKID}.leasetime=12h
	uci set dhcp.${NETWORKID}.limit=150
	uci set dhcp.${NETWORKID}.dhcpv6=server
	uci set dhcp.${NETWORKID}.ra=server
	uci set firewall.${FIREWALLZONE}=zone
	uci set firewall.${FIREWALLZONE}.name=${FIREWALLZONE}
	uci set firewall.${FIREWALLZONE}.network=${NETWORKID}
	uci set firewall.${FIREWALLZONE}.forward=REJECT
	uci set firewall.${FIREWALLZONE}.output=ACCEPT
	uci set firewall.${FIREWALLZONE}.input=REJECT 
	uci set firewall.${FIREWALLZONE}_fwd=forwarding
	uci set firewall.${FIREWALLZONE}_fwd.src=${FIREWALLZONE}
	uci set firewall.${FIREWALLZONE}_fwd.dest=wan
	uci set firewall.${FIREWALLZONE}_dhcp=rule
	uci set firewall.${FIREWALLZONE}_dhcp.name=${FIREWALLZONE}_DHCP
	uci set firewall.${FIREWALLZONE}_dhcp.src=${FIREWALLZONE}
	uci set firewall.${FIREWALLZONE}_dhcp.target=ACCEPT
	uci set firewall.${FIREWALLZONE}_dhcp.proto=udp
	uci set firewall.${FIREWALLZONE}_dhcp.dest_port=67-68
	uci set firewall.${FIREWALLZONE}_dns=rule
	uci set firewall.${FIREWALLZONE}_dns.name=${FIREWALLZONE}_DNS
	uci set firewall.${FIREWALLZONE}_dns.src=${FIREWALLZONE}
	uci set firewall.${FIREWALLZONE}_dns.target=ACCEPT
	uci set firewall.${FIREWALLZONE}_dns.proto='tcp udp'
	uci set firewall.${FIREWALLZONE}_dns.dest_port=53

	uci commit wireless
	uci commit firewall
	uci commit dhcp
	uci commit network
}

restart_all_vpn() {
	[ "`uci get glconfig.openvpn.enable`" = "1" ] && /etc/init.d/startvpn restart
	[ "`uci get vpn_service.global.enable`" = "1" ] && /etc/init.d/vpn-service restart
	[ "`uci get wireguard.@proxy[0].enable`" = "1" ] && /etc/init.d/wireguard restart
	[ "`uci get wireguard_server.@servers[0].enable`" = "1" ] && /etc/init.d/wireguard_server restart
	[ "`uci get shadowsocks.@transparent_proxy[0].main_server`" != "nil" ] && /etc/init.d/shadowsocks restart
	[ "`uci get ss-service.host.enable`" = "1" ] && /etc/init.d/ss-service restart
}

disable_all_vpn() {
	uci set glconfig.openvpn.force='0'
	uci set glconfig.openvpn.enable='0'
	uci commit glconfig

	uci set vpn_service.global.enable='0'
	uci commit vpn_service

	uci set wireguard.@proxy[0].enable='0'
	uci commit wireguard

	uci set wireguard_server.@servers[0].enable='0'
	uci commit wireguard_server

	uci -q set shadowsocks.@transparent_proxy[0].main_server='nil'
	uci commit shadowsocks

	uci -q set ss-service.host.enable='0'
	uci commit ss-service
}

stop_all_vpn() {
	[ -n "$(pidof openvpn)" ] && {
		/etc/init.d/startvpn stop
		/etc/init.d/vpn-service stop
	}

	[ -n "$(pidof wg-crypt-wg0)" ] && {
		/etc/init.d/wireguard stop
		/etc/init.d/wireguard_server stop
	}
	
	[ -n "$(pidof ss-redir)" ] && {
		/etc/init.d/shadowsocks stop
	}
	
	[ -n "$(pidof ss-server)" ] && {
		/etc/init.d/ss-service stop
	}
}

restart_nodogsplash() {
	[ "`uci get nodogsplash.@nodogsplash[0].enabled`" = "1" ] && /etc/init.d/nodogsplash restart
}

stop_nodogsplash() {
	[ ! -f /etc/config/nodogsplash ] && return
	
	uci set nodogsplash.@nodogsplash[0].enabled='0'
	uci commit nodogsplash
	/etc/init.d/nodogsplash stop
	/etc/init.d/nodogsplash disable
}

get_user_apps() {
	local FILE_OPKG_STATUS="/usr/lib/opkg/status"
	local FILE_ROM_OPKG_STATUS="/rom/usr/lib/opkg/status"
	
    local apps="$(awk "BEGIN{ORS=\" \";RS=\"\"};!/Auto-Installed/{print \$2}" "$FILE_OPKG_STATUS")"
    
    local app res filed_apps
    for app in $apps; do
		res=$(sed -n "/^Package: ${app}$/,/^$/p" "$FILE_ROM_OPKG_STATUS")
    	[ -z "$res" ] && filed_apps="$filed_apps $app"
    done

    filed_apps=`echo $filed_apps | sed 's/(.*)//g;s/[, ]/\n/g' | sort -u`

    echo $filed_apps
}

check_tethering_device_insert() {
	local model devices

	model=$(get_model)
	case $model in
	"ar750s"|\
	"e750"|\
	"x1200"|\
	"mt1300"|\
	"mt300n-v2"|\
	"mt300n"|\
	"mt300a")
		devices=$(cat /proc/net/dev| awk -F':' '/usb*|eth1|eth2|eth3/ {print $1}'|sed 's/ //g')	
		;;
	"mv1000")
		devices=$(cat /proc/net/dev| awk -F':' '/usb*|eth1|eth2|eth3/ {print $1}'| grep -v usb0 | sed 's/ //g')
		;;
	*)
		devices=$(cat /proc/net/dev| awk -F':' '/usb*|eth2|eth3|eth4/ {print $1}'|sed 's/ //g')
		;;
	esac
	echo "$devices"
}

update_tethering_device_list() {
	local model devices

	model=$(get_model)
	case $model in
	"ar750s"|\
	"x1200"|\
	"e750"|\
	"mt1300"|\
	"mt300n-v2"|\
	"mt300n"|\
	"mt300a")
		cat /proc/net/dev| awk -F':' '/usb*|eth1|eth2|eth3/ {print $1}'|sed 's/ //g' > /tmp/tethering_device_list	
		;;
	"mv1000")
		cat /proc/net/dev| awk -F':' '/usb*|eth1|eth2|eth3/ {print $1}'| grep -v usb0 | sed 's/ //g' > /tmp/tethering_device_list
		;;
	*)
		cat /proc/net/dev| awk -F':' '/usb*|eth2|eth3|eth4/ {print $1}'|sed 's/ //g'  > /tmp/tethering_device_list
		;;
	esac	
}



disable_flow_offload() {
	local model
	model=$(get_model)
	case $model in
	"mv1000"|\
	"mt300n-v2"|\
	"mt1300")
		uci set firewall.@defaults[0].flow_offloading='0'
		uci set firewall.@defaults[0].flow_offloading_hw='0'
		uci commit
		/etc/init.d/firewall reload
		;;
	"ar750s")
		/etc/init.d/shortcut-fe stop
		/etc/init.d/shortcut-fe disable
		;;
	*)
		;;
	esac
}

condition_enable_flow_offload() {
	local model policy_en qos_en wg_en
	model="$(get_model)"
	policy_en="$(uci -q  get glconfig.route_policy.enable)"
	qos_en="$(uci -q  get glconfig.traffic_control.enable)"
	wg_en="$(uci -q  get wireguard.@proxy[0].enable)"
	#任意其他功能与offload互斥都直接返回，除非所有相关互斥功能已经关闭
	[ "$wg_en" = "1" -o "$qos_en" = "1" -o "$policy_en" = "1" ] && return

	case $model in
	"mv1000"|\
	"mt300n-v2"|\
	"mt1300")
		uci set firewall.@defaults[0].flow_offloading='1'
		uci set firewall.@defaults[0].flow_offloading_hw='1'
		uci commit
		/etc/init.d/firewall reload
		;;
	"ar750s")
		/etc/init.d/shortcut-fe enable
		/etc/init.d/shortcut-fe start
		;;
	*)
		;;
	esac
}





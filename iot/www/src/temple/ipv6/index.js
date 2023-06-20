"use strict";

define(["text!temple/ipv6/index.html", "css!temple/ipv6/index.css", "vue", "component/gl-toggle-btn/index", "component/gl-tooltip/index", "component/gl-btn/index", "component/gl-loading/index", "component/gl-select/index", "component/gl-label/index", "component/gl-input/index", "component/modal/modal"], function (stpl, css, Vue, gl_switch, gl_tooltip, gl_btn, gl_loading, gl_select, gl_label, gl_input, modal) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                networkInterfaceList: [],
                addressTypeList: ['Automatic', 'Manual'],
                wandnsList: ['Automatic', 'Manual'],
                modeList: ['Native', 'NAT6', 'Static IPv6'],
                dnsReg: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/,
                ipv4Reg:/^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}$/,
                // ipv6 CIDR 正则
                ipv6cidrReg: /^(([0-9a-fA-F]{1,4}:){7,7}([0-9a-fA-F]{1,4}|:)|([0-9a-fA-F]{1,4}:){1,6}(:[0-9a-fA-F]{1,4}|:)|([0-9a-fA-F]{1,4}:){1,5}((:[0-9a-fA-F]{1,4}){1,2}|:)|([0-9a-fA-F]{1,4}:){1,4}((:[0-9a-fA-F]{1,4}){1,3}|:)|([0-9a-fA-F]{1,4}:){1,3}((:[0-9a-fA-F]{1,4}){1,4}|:)|([0-9a-fA-F]{1,4}:){1,2}((:[0-9a-fA-F]{1,4}){1,5}|:)|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6}|:)|:((:[0-9a-fA-F]{1,4}){1,7}|:))|\/((?:[0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))$/,
                dnsInputStatus1: false,
                dnsInputStatus2: false,
                dnsInputVal1: "",
                dnsInputVal2: "",
                wanDnsInputStatus1: false,
                wanDnsInputStatus2: false,
                wanDnsInputVal1: "",
                wanDnsInputVal2: "",
                lanDnsSelect: 'Automatic',
                wanDnsSelect: 'Automatic',
                addressVal: 'Automatic',
                enabled: false,
                mode: 'Native',
                interfaceVal: '',
                wanIp: '',
                wanGateway: '',
                lanIpv6Val: '',
                loadingStatus: false,
                enabledStatus: false,
                disabledIpv6: false,
                ipv6Info: {},
                isModemReadOnly: false

            };
        },
        components: {
            "gl-switch": gl_switch,
            "gl-select": gl_select,
            "gl-tooltip": gl_tooltip,
            "gl-btn": gl_btn,
            "gl-loading": gl_loading,
            "gl-label": gl_label,
            "gl-input": gl_input,
            "gl-modal": modal
        },
        computed: {},
        mounted: function mounted() {
            var that = this;
            that.$store.dispatch('call', {
                api: 'ipv6get',
            }).then(function (result) {
                if (result.success) {
                    that.networkInterfaceList = result.wan_ifs;
                    that.interfaceVal = result.wan_if;
                    that.enabled = result.enable;
                    if (!result.wan_addrmode) {
                        that.addressVal = 'Manual';
                    } else {
                        that.addressVal = 'Automatic';
                    }
                    that.wanIp = result.wan_ip6addr;
                    that.wanGateway = result.wan_ip6gw;
                    if (!result.wan_dnsmode) {
                        that.wanDnsSelect = 'Manual';
                    } else {
                        that.wanDnsSelect = 'Automatic';
                    }
                    if (that.interfaceVal.includes('modem')) {
                        that.addressVal = 'Automatic';
                        that.wanDnsSelect = 'Automatic';
                        that.isModemReadOnly = true;
                    } else {
                        that.isModemReadOnly = false;
                    }
                    that.wanDnsInputVal2 = result.wan_dns2;
                    that.wanDnsInputVal1 = result.wan_dns1;
                    that.dnsInputVal1 = result.lan_dns1;
                    that.dnsInputVal2 = result.lan_dns2;
                    switch (result.lan_mode) {
                        case 'static':
                            that.mode = 'Static IPv6';
                            break;
                        case 'nat6':
                            that.mode = 'NAT6';
                            break;
                        default:
                            that.mode = 'Native';
                            break;
                    }
                    that.lanIpv6Val = result.lan_ip6addr;
                    if (!result.lan_dnsmode) {
                        that.lanDnsSelect = 'Manual';
                    } else {
                        that.lanDnsSelect = 'Automatic';
                    }
                }

            });

        },
        watch: {
            dnsInputVal1: function dnsInputVal1(newval) {
                if (!newval) {
                    this.dnsInputStatus1 = false;
                } else {
                    if (this.dnsReg.test(newval)) {
                        this.dnsInputStatus1 = true;
                        if (this.ipv4Reg.test(newval)) this.dnsInputStatus1 = false
                    } else {
                        this.dnsInputStatus1 = false;
                    }
                }
            },
            dnsInputVal2: function dnsInputVal2(newval) {
                if (!newval) {
                    this.dnsInputStatus2 = false;
                } else {
                    if (this.dnsReg.test(newval)) {
                        this.dnsInputStatus2 = true;
                        if (this.ipv4Reg.test(newval)) this.dnsInputStatus2 = false
                    } else {
                        this.dnsInputStatus2 = false;
                    }
                }
            },
            wanDnsInputVal1: function wanDnsInputVal1(newval) {
                if (!newval) {
                    this.wanDnsInputStatus1 = false;
                } else {
                    if (this.dnsReg.test(newval)) {
                        this.wanDnsInputStatus1 = true;
                        if (this.ipv4Reg.test(newval)) this.wanDnsInputStatus1 = false
                    } else {
                        this.wanDnsInputStatus1 = false;
                    }
                }
            },
            wanDnsInputVal2: function wanDnsInputVal2(newval) {
                if (!newval) {
                    this.wanDnsInputStatus2 = false;
                } else {
                    if (this.dnsReg.test(newval)) {
                        this.wanDnsInputStatus2 = true;
                        if (this.ipv4Reg.test(newval)) this.wanDnsInputStatus2 = false
                    } else {
                        this.wanDnsInputStatus2 = false;
                    }
                }
            }
        },
        methods: {
            changeType: function changeType(val) {
                if (val == 'Manual') {
                    this.wandnsList = ['Manual'];
                    this.wanDnsSelect = 'Manual'
                } else {
                    this.wandnsList = ['Automatic', 'Manual'];
                    this.wanDnsSelect = 'Manual'
                }
            },
            getwaninfo: function getwaninfo() {
                var that = this;
                that.$store.dispatch('call', {
                    api: 'ipv6info',
                }).then(function (result) {
                    that.ipv6Info = result;
                });
            },
            setIpv6Config: function setIpv6Config() {
                var that = this;
                var mode = 'relay';
                switch (that.mode) {
                    case 'Static IPv6':
                        mode = 'static'
                        break;
                    case 'NAT6':
                        mode = 'nat6'
                        break;
                    default:
                        mode = 'relay';
                        break;
                }
                if (that.addressVal == 'Manual') {
                    if (!this.ipv6cidrReg.test(this.wanIp)||!this.dnsReg.test(this.wanGateway)|| this.ipv4Reg.test(this.wanGateway)) {
                        that.$message({
                            "type": "error",
                            "msg": -4
                        });
                        return;
                    }
                }
                if (that.mode == 'Static IPv6') {
                    if (this.lanIpv6Val.indexOf('/') != -1) {
                        var ipvpseparation = this.lanIpv6Val.split('/');
                        if (!this.dnsReg.test(ipvpseparation[0])) {
                            that.$message({
                                "type": "error",
                                "msg": -4
                            });
                            return;
                        }
                        if (ipvpseparation[1]<1 || ipvpseparation[1]>128) {
                            that.$message({
                                "type": "error",
                                "msg": -4
                            });
                            return;
                        }
                    } else {
                        if (!this.dnsReg.test(this.lanIpv6Val) || this.ipv4Reg.test(this.lanIpv6Val)) {
                            that.$message({
                                "type": "error",
                                "msg": -4
                            });
                            return;
                        }
                    }
                }

                if (that.wanDnsSelect == 'Manual') {
                    if (!this.wanDnsInputStatus1 && !this.wanDnsInputStatus2) {
                        that.$message({
                            "type": "error",
                            "msg": that.t('DNS Server At least one item is not empty')
                        });
                        return;
                    }
                    if (this.wanDnsInputVal1 && !this.wanDnsInputStatus1 || this.wanDnsInputVal2 && !this.wanDnsInputStatus2) {
                        that.$message({
                            "type": "error",
                            "msg": -4
                        });
                        return;
                    }
                }
                if (that.lanDnsSelect == 'Manual') {
                    if (!this.dnsInputStatus1 && !this.dnsInputStatus2) {
                        that.$message({
                            "type": "error",
                            "msg": that.t('DNS Server At least one item is not empty')
                        });
                        return;
                    }
                    if (this.dnsInputVal1 && !this.dnsInputStatus1 ||this.dnsInputVal2 && !this.dnsInputStatus2) {
                        that.$message({
                            "type": "error",
                            "msg": -4
                        });
                        return;
                    }
                }
                var wanIp = that.wanIp
                if (that.addressVal == 'Manual' && this.wanIp.indexOf('/') == -1) {
                    wanIp = that.wanIp + '/64'
                }
                that.loadingStatus = true;
                that.$store.dispatch("call", {
                    api: 'ipv6set',
                    timeOut: 30000,
                    data: {
                        enable: that.enabled,
                        wan_if: that.interfaceVal,
                        wan_addrmode: that.addressVal == 'Manual' ? false : true,
                        wan_ip6addr: wanIp,
                        wan_ip6gw: that.wanGateway,
                        wan_dnsmode: that.wanDnsSelect == 'Manual' ? false : true,
                        wan_dns1: that.wanDnsInputVal1,
                        wan_dns2: that.wanDnsInputVal2,
                        lan_mode: mode,
                        lan_ip6addr: that.lanIpv6Val,
                        lan_dns1: that.dnsInputVal1,
                        lan_dns2: that.dnsInputVal2,
                        lan_dnsmode: that.lanDnsSelect == 'Manual' ? false : true,

                    }
                }).then(function (result) {
                    if (result.success) {
                        that.$message({
                            "type": "info",
                            "api": "ipv6set",
                            "msg": that.t('waiting'),
                            "duration": 8000
                        });
                        that.setTimeoutInfo = setTimeout(function() {
                            that.loadingStatus = false;
                            that.$message({
                                "type": "success",
                                "api": 'ipv6set',
                                "msg": result.code
                            });
                            clearTimeout(that.setTimeoutInfo);
                        }, 8000);
                    } else {
                        that.loadingStatus = false;
                        that.$message({
                            "type": "error",
                            "api": 'ipv6set',
                            "msg": result.code
                        });
                    }
                })
            },
            enableIPv6: function enableIPv6() {
                var that = this;
                that.disabledIpv6 = true;
                that.enabledStatus = true;
                that.$store.dispatch("call", {
                    api: 'ipv6set',
                    data: {
                        enable: that.enabled,
                    }
                }).then(function (result) {
                    if (result.success) {
                        that.disabledIpv6 = false;
                        that.enabledStatus = false;
                        that.$message({
                            "type": "success",
                            "api": 'ipv6set',
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": 'ipv6set',
                            "msg": result.code
                        });
                    }
                })
            },
            getEnableIPv6Val: function getEnableIPv6Val(val) {
                if (val.includes('modem')) {
                    this.addressVal = 'Automatic';
                    this.wanDnsSelect = 'Automatic';
                    this.isModemReadOnly = true;
                } else {
                    this.isModemReadOnly = false;
                }
            }

        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if(!this.loadingStatus) {
                next();
            } else {
                this.$message({
                    "type": "warning",
                    "msg": -2800,
                    "duration": 1000
                });
            }
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                $(".bar.active").removeClass("active");
                // $(".clsLink2applications").addClass("active");
                setTimeout(function () {
                    if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                        $("#vpn").collapse("hide");
                        $("#moresetting").collapse("show");
                        $("#applications").collapse("hide");
                        $("#system").collapse("hide");
                    }
                }, 50);
            });
        },
    });
    return vueComponent;
});
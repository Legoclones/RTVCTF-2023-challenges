"use strict";

define(["text!temple/dns/index.html", "css!temple/dns/index.css", "vue", "component/gl-btn/index", "component/gl-toggle-btn/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index"], function (temp, css, Vue, gl_btn, gl_toggle, gl_input, gl_tooltip, gl_select) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                dnsInputVal1: "",
                dnsInputVal2: "",
                dnsInputStatus1: false,
                dnsInputStatus2: false,
                dnsReg: /(?:(^|\.)(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){4}$/,
                btnMove: false,
                manual_dns: false,
                cloudflare_dns: false,
                applystatus: true,
                checkDns1: false,
                checkDns2: false,
                proxy_serverlist: [],
                quad9_dns: false,
                proxy_server: '',
                dnscrypt_proxy: false,
                macs:"NextDNS",
                macList:["NextDNS","Cloudflare"],
                selectShow:false,
                nextdns_id: '',
                isShowNext_id: false
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-tg-btn": gl_toggle,
            "gl-input": gl_input,
            "gl-select": gl_select,
            "gl-tooltip": gl_tooltip
        },
        watch: {
            dnsInputVal1: function dnsInputVal1(newval) {
                if (!newval) {
                    this.dnsInputStatus1 = false;
                } else {
                    if (this.dnsReg.test(newval)) {
                        this.dnsInputStatus1 = true;
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
                    } else {
                        this.dnsInputStatus2 = false;
                    }
                }
            }
        },
        computed: {
            getdnsinfo: function getdnsinfo() {
                return this.$store.getters.apiData["getdnsinfo"];
            },
            router: function router() {
                return this.$store.getters.apiData["router_mini"];
            },
            auto_dns: function auto_dns() {
                if (this.manual_dns || this.cloudflare_dns || this.quad9_dns || this.dnscrypt_proxy) {
                    return false;
                }
                return true;
            }
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                    $("#vpn").collapse("hide");
                    $("#moresetting").collapse("show");
                    $("#applications").collapse("hide");
                    $("#system").collapse("hide");
                }
            });
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnMove) {
                next();
                return;
            }
            this.$message({
                "type": "warning",
                "msg": -1200,
                "duration": 1000
            });
        },
        created: function created() {
            this.getDNSInfo();
        },
        methods: {
            changState: function changState(val) {
                this.applystatus = true
            },
            getValue: function getValue() {
                this.applystatus = false;
            },
            checkBtn: function checkBtn() {
                this.applystatus = false;
            },
            checkbutton: function checkbutton() {
                this.applystatus = false;
            },
            dnsServerChange: function dnsServerChange(val) {
                this.isShowNext_id = val == 'NextDNS' ? true : false;
            },
            getDNSInfo: function getDNSInfo() {
                var that = this;
                this.$store.dispatch("call", {
                    api: "getdnsinfo"
                }).then(function (result) {
                    var splitArr = [];
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "getdnsinfo",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.manual_dns = that.getdnsinfo.manual_dns;
                        that.cloudflare_dns = result.cloudflare_dns;
                        that.proxy_serverlist = result.proxy_serverlist
                        that.quad9_dns = result.quad9_dns;
                        that.dnscrypt_proxy = result.dnscrypt_proxy;
                        that.proxy_server = result.proxy_server;
                        that.macs = result.dns_name;
                        that.nextdns_id = result.nextdns_id
                        that.isShowNext_id = result.dns_name == 'NextDNS' ? true : false;
                        // 字符串分割为数组 分割线为空格
                        var splitArr = that.getdnsinfo.custom_dns.trim().split(" ");
                        if (splitArr) {
                            if (splitArr.length == 1) {
                                that.dnsInputVal1 = splitArr[0];
                                that.dnsInputVal2 = "";
                            } else {
                                that.dnsInputVal1 = splitArr[0];
                                that.dnsInputVal2 = splitArr[1];
                            }
                        } else {
                            that.dnsInputVal1 = "";
                            that.dnsInputVal2 = "";
                        }
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "getdnsinfo",
                            "msg": result.code
                        });
                    }
                });
            },
            applyDNS: function applyDNS() {
                var that = this;
                var valDNS1 = this.dnsInputVal1;
                var valDNS2 = this.dnsInputVal2;
                var rebind = this.getdnsinfo.rebind_protection;
                var manual_dns = this.manual_dns; // 手动
                var cloudflare_dns = this.cloudflare_dns; // cloudflare
                var force_dns = this.getdnsinfo.force_dns; // 覆盖所有dns设置
                var quad9_dns = that.quad9_dns;
                var proxy_server = that.proxy_server;
                var dnscrypt_proxy = that.dnscrypt_proxy;
                var dns_name = this.macs;
                if (that.isShowNext_id) {
                    if (that.nextdns_id && that.nextdns_id.length > 32) {
                        that.$message({
                            type: 'error',
                            msg: 'NextDNS ID length cannot exceed 32 characters'
                        });
                        return;
                    }
                    that.nextdns_id = that.nextdns_id ? that.nextdns_id : '';
                } else that.nextdns_id = '';
                this.applystatus = true; // 应用后Apply按钮禁用;
                if (manual_dns) {
                    this.checkDns1 = !valDNS1 ? true : this.dnsReg.test(valDNS1);
                    this.checkDns2 = !valDNS2 ? true : this.dnsReg.test(valDNS2);
                    if (!valDNS1 && !valDNS2) {
                        this.checkDns1 = false;
                        this.checkDns2 = false;
                    }
                    if (!this.checkDns1 || !this.checkDns2) {
                        this.$message({
                            "type": "error",
                            "msg": -218
                        });
                        return;
                    }
                } else {
                    this.dnsInputVal1 = '';
                    this.dnsInputVal2 = '';
                }
                that.btnMove = true;
                this.$store.dispatch("call", {
                    api: "setdnsinfo",
                    data: {
                        dns1: valDNS1,
                        dns2: valDNS2,
                        force_dns: force_dns,
                        cloudflare_dns: cloudflare_dns,
                        manual_dns: manual_dns,
                        auto_dns: this.auto_dns,
                        rebind_protection: rebind,
                        quad9_dns: quad9_dns,
                        proxy_server: proxy_server,
                        dnscrypt_proxy: dnscrypt_proxy,
                        dns_name : dns_name,
                        nextdns_id: that.nextdns_id
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.btnMove = false;
                        that.$message({
                            "type": "error",
                            "api": "setdnsinfo",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "setdnsinfo",
                            "msg": result.code
                        });
                        // console.log(result);
                        that.btnMove = false;
                    } else {
                        that.btnMove = false;
                        that.$message({
                            "type": "error",
                            "api": "setdnsinfo",
                            "msg": result.code
                        });
                    }
                    that.getDNSInfo();
                });
            }
        }
    });
    return vueComponent;
});
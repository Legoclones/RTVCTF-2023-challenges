"use strict";

define(["text!temple/bridge/index.html", "css!temple/bridge/index.css", "vue", "component/gl-toggle-btn/index", "component/gl-tooltip/index", "component/gl-btn/index", "component/gl-loading/index", "component/gl-select/index", "component/gl-label/index", "component/gl-input/index", "component/modal/modal"], function (stpl, css, Vue, gl_switch, gl_tooltip, gl_btn, gl_loading, gl_select, gl_label, gl_input, modal) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                mode: "",
                page: "one",
                wifiload: false,
                wifidata: [],
                joinStatus: false,
                curSelect: [],
                modeState: "",
                usname: "",
                psw: "",
                lanip: "",
                startModalWDS: false,
                startModalEXT: false,
                msgModal: true,
                timer: '',
                nextStatus: false,
                portalStatus:false
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
        computed: {
            bridgeMode: function bridgeMode() {
                return this.$store.getters.apiData["bridge_get"];
            },
            stainfo: function stainfo() {
                return this.$store.getters.apiData["stainfo"];
            },
            waninfo: function waninfo() {
                return this.$store.getters.apiData['waninfo'];
            },
            router: function router() {
                return this.$store.getters.apiData['router_mini'];
            },
            // isNext: function isNext() {
            //     if (this.mode == 'wds' || this.mode == 'relay') {
            //         return true
            //     } else {
            //         return false
            //     }
            // },
            isSft1200: function isSft1200() {
                return this.router.model === 'sft1200' || this.router.model === 'sf1200'
            },
            apmode: function apmode() {
                return this.router.model != 'vixmini' && this.router.model != 'usb150' && this.bridgeMode.bridge != 'wds' && this.bridgeMode.bridge != 'relay';
            },
            wdsmode: function wdsmode() {
                return this.router.model != 'vixmini' && this.bridgeMode.bridge != 'ap' && this.bridgeMode.bridge != 'relay';
            },
            relaymode: function relaymode() {
                return this.bridgeMode.bridge != 'ap' && this.bridgeMode.bridge != 'wds';
            },
            vpnstatus: function vpnstatus() {
                return this.$store.getters.apiData['ovpngetclientstatus'];
            },
            getportal: function getportal() {
                return this.$store.getters.apiData['getportal'];
            },
            ssstatus: function ssstatus() {
                return this.$store.getters.apiData['ssclientstatus'];
            },
            wrstatus: function wrstatus() {
                return this.$store.getters.apiData['wgcstatus'];
            },
            disabled_vpn: function disabled_vpn() {
                if (this.vpnstatus.status == 'connecting' || this.vpnstatus.status == 'connected' || this.wrstatus.code == -203 || this.wrstatus.code == 0 || this.ssstatus.status == 'connected' || this.ssstatus.status == 'connecting') {
                    return true;
                } else {
                    return false;
                }
            },
            disabled_portal: function disabled_portal(){
                if (this.portalStatus) {
                    return true
                }
                return false
            },
            btnName: function btnName() {
                var item = 'Apply';
                if (this.page == 'one') {
                    if (this.mode == 'wds' || this.mode == 'relay') {
                        item = 'Next';
                    } else {
                        item = 'Apply';
                    }
                } else {
                    item = 'Apply';
                }
                return item;
            },
            timeout: function timeout() {
                var item = 30000;
                if (this.router.model == 'ax1800' || this.router.model == 'mt1300') {
                    item = 60000;
                }
                return item;
            },
        },
        mounted: function mounted() {
            var that = this;
            that.$store.dispatch("call", { api: 'wgcstatus' });
            that.$store.dispatch("call", { api: 'getportal' }).then(function(result){that.portalStatus = result.portal_enable});
            that.$store.dispatch("call", { api: 'ovpngetclientstatus' });
            that.$store.dispatch("call", { api: 'ssclientstatus' });
            if (that.bridgeMode && that.bridgeMode.bridge) {
                that.mode = that.bridgeMode.bridge;
            } else {
                that.$store.dispatch("call", {
                    api: "bridge_get"
                }).then(function (result) {
                    if (result.bridge == 'wds' || result.bridge == 'relay') {
                        that.nextStatus = true;
                    } else {
                        that.nextStatus = false;
                    }
                    if (result.success) {
                        if (result.bridge) {
                            that.mode = result.bridge;
                        }
                    }
                });
            }
        },
        methods: {
            changeMode: function changeMode(page) {
                if (page == 'extender' || page == 'wds') {
                    this.nextStatus = true;
                } else {
                    this.nextStatus = false;
                }
            },

            checkMode: function checkMode() {
                var that = this;
                if (this.page == 'two') {
                    this.joinWifi();
                    return;
                }
                // router ap模式
                if (this.mode == "router" || this.mode == "ap") {
                    if (this.mode == 'ap') {
                        // 网络 mac地址检查
                        this.$store.dispatch("call", {
                            api: "waninfo"
                        }).then(function (result) {
                            if (result.cableinwan) {
                                if (result.macclone) {
                                    that.$message({
                                        type: "warning",
                                        msg: -6001
                                    });
                                } else {
                                    that.checkBridge();
                                }
                            } else {
                                that.$message({
                                    type: "warning",
                                    msg: -5002
                                });
                            }
                        });
                    } else {
                        that.checkBridge();
                    }
                } else {
                    //无限桥接模式
                    this.$store.dispatch("call", {
                        api: "waninfo"
                    }).then(function (result) {
                        if (result.cableinwan) {
                            that.$message({
                                type: "warning",
                                msg: -6000
                            });
                        } else {
                            if (result.macclone) {
                                that.$message({
                                    type: "warning",
                                    msg: -6001
                                });
                            } else {
                                that.page = 'two';
                                that.scanwifi();
                            }
                        }
                    });
                }
            },
            // 切换为ap router模式
            checkBridge: function checkBridge() {
                var that = this;
                that.joinStatus = true;
                clearTimeout(that.timer);
                that.$store.dispatch("call", {
                    api: "bridge_set",
                    data: {
                        mode: this.mode
                    },
                    timeOut: 32000
                }).then(function (result) {
                    if (result.success) {
                        if (that.mode == 'router') {
                            that.$message({
                                type: "info",
                                msg: that.t("You are being redirected to the new IP") + '：http://' + result.ip,
                                duration: 15000
                            });
                            that.timer = setTimeout(function () {
                                that.joinStatus = false;
                                window.location.href = "http://" + result.ip;
                            }, 15000);
                        } else {
                            that.timer = setTimeout(function () {
                                that.joinStatus = false;
                                that.startModalWDS = true;
                            }, 15000);
                        }
                    } else {
                        that.$message({
                            type: "error",
                            msg: result.code
                        });
                        that.joinStatus = false;
                    }
                });
            },
            // 扫描wifi
            scanwifi: function scanwifi() {
                var that = this;
                that.wifiload = true;
                that.$store.dispatch("call", {
                    api: "scanwifi",
                    timeOut: this.timeout
                }).then(function (result) {
                    that.wifiload = false;
                    if (result.timeout) {
                        that.page = 'one';
                    }
                    if (result.success) {
                        // wifi排序
                        that.$store.dispatch("getWifi").then(function (data) {
                            if (data.success) {
                                that.wifidata = data.wifis;
                                // if (that.wifidata[0].type == 'dfs') {
                                //     var dfs = that.wifidata[0];
                                //     that.wifidata.splice(0, 1);
                                //     that.wifidata.splice(1, 0, dfs);
                                // }
                            }
                        });
                    }
                });
            },
            // 加入wifi
            joinWifi: function joinWifi() {
                var that = this;
                if (!this.psw && this.modeState != 'none') {
                    that.$message({
                        type: "error",
                        msg: -1309
                    });
                    return;
                }
                var data ={
                    ssid: this.curSelect.ssid,
                    key: this.psw,
                    channel: this.curSelect.channel,
                    device: this.curSelect.device,
                    encrypt: this.curSelect.encrypt,
                    issaved: false,
                    mac: this.curSelect.mac,
                    // 是否存到已知网络
                    save2uci: false,
                    identity: this.usname,
                    // lanip不需要传，为防止错误暂不删除
                    ipaddr: this.lanip,
                    mode: this.mode,
                    caps: this.curSelect.caps
                }
                if (this.modeState == "EAP") {
                    if (that.psw.length > 64 || this.usname.length > 64) {
                        this.$message({
                            type: 'warning',
                            msg: 'User name or password length is incorrect'
                        });
                        return;
                    }
                    data.key = "";
                    data.password = this.psw
                }
                that.joinStatus = true;
                clearTimeout(that.timer);
                that.$store.dispatch("call", {
                    api: "joinwifi",
                    data: data,
                    timeOut: 120000
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                        that.joinStatus = false;
                        return;
                    }
                    if (result.success) {
                        that.timer = setTimeout(function () {
                            if (that.mode == 'wds') {
                                that.startModalWDS = true;
                            } else {
                                that.startModalEXT = true;
                            }
                            that.joinStatus = false;
                            that.page = "one";
                            that.psw = "";
                            that.usname = "";
                        }, 15000);
                    } else {
                        that.joinStatus = false;
                        let msg = result.code
                        if (result.code === -6) {
                            msg = result.msg
                        }
                        that.$message({
                            type: 'error',
                            msg: msg
                        });
                    }
                });
            },
            resetPage: function resetPage() {
                this.startModalWDS = false;
                this.startModalEXT = false;
                window.location.href = "/";
            },
            // 判断wifi模式
            changeWifi: function changeWifi(data) {
                // 两种模式 psk-mixed 
                if (data.encrypt) {
                    if (data.encrypt == 'none') {
                        this.modeState = "none";
                    } else {
                        if (data.encrypt.toLowerCase().indexOf("wpa") != -1) {
                            this.modeState = "EAP";
                        } else {
                            // wap-mode
                            this.modeState = "WISP";
                        }
                    }
                }
                this.curSelect = data;
            },
            back: function back() {
                this.page = "one";
            }
        }
    });
    return vueComponent;
});
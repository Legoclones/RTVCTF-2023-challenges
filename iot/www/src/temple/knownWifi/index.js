"use strict";

define(["text!temple/knownWifi/index.html", "vue", "css!temple/knownWifi/index.css", "component/gl-btn/index", "component/gl-input/index", "component/gl-tooltip/index"], function (stpl, Vue, css, gl_btn, gl_input, gl_tooltip) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                wifiData: [],
                alertStatus: null,
                alertInfo: "",
                checked: false,
                connectWifiIcon: "fa fa-check",
                noConnectWifiIcon: "fa fa-circle-o-notch opacity0",
                sLodingIconCls: "fa fa-spinner fa-pulse",
                connectingIndex: null,
                isConnecting: false,
                iProgress: -9,
                scanDone: false,
                signalList: [],
                rangeList: [],
                working: []

            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip
        },
        computed: {
            stainfo: function stainfo() {
                return this.$store.getters.apiData["stainfo"];
            },
            knownWifis: function knownWifis() {
                return this.$store.getters.apiData['savedwifi'];
            },
            router: function router() {
                return this.$store.getters.apiData['router_mini'];
            },
            wifilist: function wifilist() {
                return this.knownWifis.wifis;
            },
            progressWidthObj: function progressWidthObj() {
                return {
                    width: this.iProgress + "%"
                };
            },
            meshjudge: function meshjudge(){
                if (this.router.mode == 'mesh') {
                    return true
                }
                return false
            }
        },
        mounted: function mounted() {
            // this.wifiData = this.wifilist || [];
            this.$store.dispatch("getInfo_repeater"); // 全局一直调用定时器 repeater vpnlist reachable
            this.getWifiList();
        },
        methods: {
            changeIProgress: function changeIProgress() {
                if (this.scanDone || this.iProgress > 90) {} else {
                    setTimeout(this.changeIProgress, 650);
                    this.iProgress = this.iProgress + parseInt(9);
                }
            },
            hide: function hide() {
                $(".collapse").collapse("hide");
                this.checked = false;
            },
            generateId: function generateId(name, id) {
                return name + "_" + id;
            },
            compare: function compare(name, num) {
                return function (o, p) {
                    var a = a && a.toLowerCase();
                    var b = b && b.toLowerCase();
                    if (o && p && typeof o === 'object' && typeof p === 'object') {
                        a = o[name];
                        b = p[name];
                        if (a === b) {
                            return typeof num === 'function' ? num(o, p) : 0;
                        }
                        if (typeof a === typeof b) {
                            return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
                        }
                        return typeof a < typeof b ? -1 : 1;
                    } else {
                        thro("error");
                    }
                }
            },
            getWifiList: function getWifiList() {
                var _this = this;
                var that = this;
                this.changeIProgress();
                this.$store.dispatch("call", {
                    api: "savedwifi"
                }).then(function (result) {
                    // setTimeout(() => {
                    that.scanDone = true;
                    // }, 3000);
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "savedwifi",
                            "msg": result.code
                        });
                        that.alertStatus = "error";
                        that.alertMsg = result.code;
                        return;
                    }
                    if (result.success) {
                        that.wifiData = result.wifis.sort(that.compare('ssid'));
                        for (var i = 0; i < that.wifiData.length; i++) {
                            if (that.wifiData[i].ssid == that.stainfo.ssid && that.wifiData[i].encryption == that.stainfo.encryp) {
                                that.working = that.wifiData[i];
                                that.wifiData.splice(i, 1);
                                that.wifiData.unshift(that.working);
                                break;
                            }
                        }
                        for (var i in that.wifiData) {
                            if (that.wifiData[i]['encryption'] && that.wifiData[i]['encryption'].indexOf('wpa') != -1) {
                                that.wifiData[i]["newKey"] = that.wifiData[i].password;
                            } else {
                                that.wifiData[i]["newKey"] = that.wifiData[i].key;
                            }
                            that.wifiData[i]["checked"] = false;
                            that.wifiData[i]["hasError"] = false;
                            that.wifiData[i]["icon"] = _this.noConnectWifiIcon;
                        }
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "savedwifi",
                            "msg": result.code
                        });
                    }
                });
            },
            forgetWifi: function forgetWifi(index) {
                var that = this;
                this.$store.commit("showModal", {
                    show: true,
                    title: "Caution",
                    message: that.$lang.modal.forgetWifiMsg,
                    cb: function cb() {
                        that.forget(index);
                    }
                });
            },
            forget: function forget(index) {
                var that = this;
                this.hide();
                this.$store.dispatch("call", {
                    api: "removewifi",
                    data: {
                        ssid: that.wifiData[index].ssid,
                        key: that.wifiData[index].key,
                        id: that.wifiData[index].id,
                    },
                    timeOut: 20000
                }).then(function (result) {
                    that.getWifiList();
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "removewifi",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "removewifi",
                            "msg": result.code
                        });
                        that.wifiData.splice(index, 1);
                        // setTimeout(function () {
                        // that.getWifiList();
                        // }, 2000);
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "removewifi",
                            "msg": result.code
                        });
                        return;
                    }
                }).then(function () {
                    that.$store.dispatch("call", {
                        api: "stainfo"
                    });
                });
            },
            joinWifi: function joinWifi(index) {
                var that = this;
                var password = this.wifiData[index].key || "";
                if (this.wifiData[index].encrypt != "none" && this.wifiData[index].issaved == false) {
                    if (password == null || that.VerifyWifiKeyLen(this.wifiData[index].encrypt, password) == false) {
                        this.$set(this.wifiData[index], "hasError", true);
                        $("#known_" + index).find(".clsSetWifiKeyInput").focus();
                        return;
                    }
                }
                that.alertStatus = "info";
                this.isConnecting = true;
                this.connectingIndex = index;
                this.hide();
                // 这里的参数全部是通过savedwifi返回
                var data;
                data = {
                    ssid: this.wifiData[index].ssid,
                    mac: this.wifiData[index].bssid,
                    channel: this.wifiData[index].channel,
                    key: password,
                    encrypt: this.wifiData[index].encryption,
                    device: this.wifiData[index].device,
                    issaved: true,
                    save2uci: true,
                    identity: this.wifiData[index].identity,
                    // lanip不需要传，为防止错误暂不删除
                    ipaddr: this.wifiData[index].ipaddr,
                    mode: "",
                    caps: this.wifiData[index].caps,
                    hidden: this.wifiData[index].hidden,
                };
                if (this.wifiData[index].encryption && this.wifiData[index].encryption.indexOf('wpa') != -1 || this.wifiData[index].encryption.indexOf('wpa2') != -1) {
                    data.key = '';
                    data.password = this.wifiData[index].password;
                }
                this.$store.dispatch("call", {
                    api: "joinwifi",
                    data: data,
                    timeOut: 120000
                }).then(function (result) {
                    if (result.failed) {
                        that.isConnecting = false;
                        that.$message({
                            "type": "warning",
                            "api": "joinwifi",
                            "msg": result.code
                        });
                    } else {
                        if (result.success) {
                            that.$message({
                                "type": "success",
                                "api": "joinwifi",
                                "msg": result.code
                            });
                            setTimeout(function () {
                                that.isConnecting = false;
                                that.$router.push("internet");
                            }, 2000);
                        } else {
                            that.isConnecting = false;
                            that.alertStatus = "error";
                            that.$message({
                                "type": "warning",
                                "api": "joinwifi",
                                "msg": result.code
                            });
                            if (result.code == -100) {
                                that.$set(that.wifiData[index], "hasError", true);
                                $("#known_" + index).collapse("show");
                                $("#known_" + index).find(".clsSetWifiKeyInput").focus();
                            }
                        }
                    }
                });
            },
            KeyMinLengthMsg: function KeyMinLengthMsg(encrypt) {
                var result = null;
                if (encrypt == "wep") {
                    result = that.$lang.knownWifi.characters;
                } else if (encrypt != "none") {
                    result = that.$lang.knownWifi.lest_8;
                }
                return result;
            }
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            this.$store.commit('clearTimer_sta');
            next();
        },

        beforeRouteEnter: function beforeEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                    $("#moreapps").collapse("hide");
                    $("#moresetting").collapse("hide");
                    $("#tool").collapse("hide");
                }
            });
        }
    });
    return vueComponent;
});
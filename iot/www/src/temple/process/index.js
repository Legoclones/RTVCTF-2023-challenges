"use strict";

define(["text!temple/process/index.html", "css!temple/process/index.css", "vue", 'Cookie', "component/modal/modal", "component/gl-btn/index"], function (stpl, css, Vue, Cookies, modal, gl_btn) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                UIStatus: null,
                gl_ip: this.$lang.process.ip,
                gl_sSSID: '-',
                gl_sKey: '********',
                gl_sDefaultSSID: this.$lang.process.dafaultSsid,
                gl_sDefaultKey: this.$lang.process.dafaultKey,
                bFlag: false,
                bFlag2: true,
                fInterval: null,
                showModal: false,
                showStatus: false,
                time: 240000
            };
        },
        components: {
            "gl-modal": modal,
            "gl-btn": gl_btn
        },
        created: function created() {
            var that = this;
            this.$store.dispatch("call", { api: "getaps" }).then(function (result) {
                var objAp = [];
                if (result.success) {
                    var radio =[]
                    radio.push(result['wifi_2g']);
                    radio.push(result['wifi_5g']);
                    for (var i = 0; i < radio.length; i++) {
                        for (var k = 0; k < radio[i].interfaces.length; k++) {
                            if (radio[i].interfaces[k].mode == "ap") {
                                objAp = radio[i].interfaces[k];
                                break;
                            }
                        }
                    }
                    if (objAp != null) {
                        that.gl_sSSID = objAp.ssid;
                        that.gl_sKey = objAp.key;
                    }
                } else {
                    that.$message({
                        "type": "error",
                        "api": "getaps",
                        "msg": result.code
                    });
                }
            });
            that.$store.dispatch('call', {
                api: 'router'
            });
            if (window.caniuse) {
                var sCallFunction = sessionStorage.getItem("callfunction");
                if (sCallFunction) {
                    if (sCallFunction == "reboot") {
                        this.reBootDevice();
                    } else if (sCallFunction == "revertfirmware") {
                        this.revertFirmware();
                    } else if (sCallFunction == "upgradefirmware") {
                        this.upgradeFirmware();
                    }
                } else {
                    var rebootHref = location.href;
                    var rebootFunction = rebootHref.split("&")[0].split("=")[1];
                    if (rebootFunction) {
                        if (rebootFunction == "reboot") {
                            this.reBootDevice();
                        } else if (rebootFunction == "revertfirmware") {
                            this.revertFirmware();
                        } else if (rebootFunction == "upgradefirmware") {
                            this.upgradeFirmware();
                        }
                    }
                }
            } else {
                var href = location.href;
                var sCallFunction1 = href.split("&")[0].split("=")[1];
                if (sCallFunction1 == "reboot") {
                    this.reBootDevice();
                } else if (sCallFunction1 == "revertfirmware") {
                    this.revertFirmware();
                } else if (sCallFunction1 == "upgradefirmware") {
                    this.upgradeFirmware();
                }
            }
        },
        methods: {
            reBootDevice: function reBootDevice() {
                var that = this;
                if (window.caniuse) {
                    sessionStorage.removeItem("callfunction");
                }
                this.UIStatus = "reboot";
                this.$store.dispatch("call", {
                    api: "reboot",
                    data: {
                        "reboot": true
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "reboot",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.SetProcessSpeed(120000); //设置滚动条
                        that.CheckRouterConnect(that.gl_sSSID, that.gl_sKey);
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "reboot",
                            "msg": result.code
                        });
                    }
                });
            },
            revertFirmware: function revertFirmware() {
                var that = this;
                if (window.caniuse) {
                    sessionStorage.removeItem("callfunction");
                }
                this.UIStatus = 'revert';
                this.$store.dispatch("call", {
                    api: "revertfirmware",
                    data: {
                        "revert": true
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "revertfirmware",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$store.dispatch('call', {
                            api: 'router'
                        }).then(function (result) {
                            if (result.model == 's1300' || result.model == 'b1300') {
                                that.time = 240000;
                            }
                        });
                        that.SetProcessSpeed(that.time);
                        that.CheckRouterConnect(that.gl_sSSID, that.gl_sKey, that.gl_ip);
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "revertfirmware",
                            "msg": result.code
                        });
                    }
                });
            },
            upgradeFirmware: function upgradeFirmware() {
                var bKeepSetting = "";
                var keepapps = "";
                var sIP = null;
                var that = this;
                if (window.caniuse) {
                    sessionStorage.removeItem("callfunction");
                }
                this.UIStatus = 'upgrade';
                if (window.caniuse) {
                    if (sessionStorage.getItem("keepapps")) {
                        keepapps = sessionStorage.getItem("keepapps");
                        if (keepapps == "false") {
                            keepapps = false;
                        } else {
                            keepapps = true;
                        }
                        sessionStorage.removeItem("keepapps");
                    }
                    if (sessionStorage.getItem("keepsetting")) {
                        bKeepSetting = sessionStorage.getItem("keepsetting");

                        if (bKeepSetting == "false") {
                            bKeepSetting = false;
                        } else {
                            bKeepSetting = true;
                        }
                        sessionStorage.removeItem("keepsetting");
                    }
                } else {
                    var href = location.href;
                    bKeepSetting = href.split("&")[1].split("=")[1];
                    if (bKeepSetting == "false") {
                        bKeepSetting = false;
                    } else {
                        bKeepSetting = true;
                    }
                }
                this.$store.dispatch("call", {
                    api: "laninfo"
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "laninfo",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        sIP = result.ip;
                        that.gl_ip = result.ip;
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "laninfo",
                            "msg": result.code
                        });
                    }
                    if (bKeepSetting) {
                        if (bKeepSetting) {
                            that.CheckRouterConnect(that.gl_sSSID, that.gl_sKey, that.gl_ip);
                        } else {
                            that.CheckRouterConnect(that.gl_sDefaultSSID, that.gl_sDefaultKey, that.gl_ip);
                        }
                    } else {
                        that.CheckRouterConnect(that.gl_sDefaultSSID, that.gl_sDefaultKey, that.gl_ip);
                    }
                    that.$store.dispatch("call", {
                        api: "flashfirmware",
                        data: {
                            keepconfig: bKeepSetting,
                            keepapps: keepapps
                        }
                    }).then(function (result) {
                        if (result.failed) {
                            that.$message({
                                "type": "error",
                                "api": "flashfirmware",
                                "msg": result.code
                            });
                            return;
                        }
                        if (result.success) {
                            that.$store.dispatch('call', {
                                api: 'router'
                            }).then(function (result) {
                                if (result.model == 'x1200' || result.model == 'mt300n-v2') {
                                    that.time = 240000;
                                } else if (result.model == 'b1300' || result.model == 's1300') {
                                    that.time = 480000;
                                } else if (result.model == 'mifi') {
                                    that.time = 640000;
                                }
                                that.SetProcessSpeed(that.time);
                            });
                        } else {
                            that.$message({
                                "type": "error",
                                "api": "flashfirmware",
                                "msg": result.code
                            });
                        }
                    });
                });
            },
            SetProcessValue: function SetProcessValue(iProcess) {
                $("#idUpgradeProcessing").attr("style", "width:" + iProcess + "%").attr("aria-valuenow", iProcess).text(iProcess + "%");
            },
            goWelcome: function goWelcome() {
                this.showModal = false;
                Cookies.remove('Admin-Token');
                if (window.location.href.indexOf('chrome-extension') == -1) {
                    window.location.href = "/";
                } else {
                    this.$router.push({
                        path: this.redirect || '/'
                    });
                }
            },
            closeModal: function closeModal() {
                this.showStatus = false;
                Cookies.remove('Admin-Token');
                window.location.href = "http://" + this.gl_ip;
            },
            CheckRouterConnect: function CheckRouterConnect(ssid, key, ip) {
                var that = this;
                var fCheckRouterInterval = null;
                var bFlag = false;
                var bFlag2 = true;
                // $("#router-wifi-ssid-txt").text(ssid);
                // $("#router-wifi-key-txt").text(key);
                // 30s之后开启
                setTimeout(function () {
                    // 3s一次定时器
                    fCheckRouterInterval = setInterval(function () {
                        that.$store.dispatch("call", {
                            api: "isconnected",
                            ip: ip
                        }).then(function (result) {
                            if (result.failed) {
                                bFlag = true;
                                if (bFlag2 && that.GetProgressValue() == 100) {
                                    bFlag2 = false;
                                    that.showModal = true;
                                }
                                return;
                            }
                            if (result.connected) {
                                that.showModal = false;
                                if (ip) {
                                    setTimeout(function () {
                                        Cookies.remove('Admin-Token');
                                        clearInterval(fCheckRouterInterval);
                                        window.location.href = "http://" + ip;
                                    }, 2000);
                                } else {
                                    that.SetProcessValue(100);
                                    setTimeout(function () {
                                        clearInterval(fCheckRouterInterval);
                                        Cookies.remove('Admin-Token');
                                        location.reload(true)
                                    }, 2000);
                                }
                            }
                        });
                    }, 3000);
                }, 30000);
            },
            SetProcessSpeed: function SetProcessSpeed(totalTime) {
                var avgTime = parseInt(totalTime) / 100;
                var iProgress = 0;
                var iStep = 1;
                var that = this;
                if (avgTime < 1000) {
                    avgTime = avgTime * 2;
                    iStep = 2;
                }
                that.fInterval = setInterval(function () {
                    iProgress = $("#idUpgradeProcessing").attr("aria-valuenow");
                    if (iProgress == 100) {
                        clearInterval(that.fInterval);
                    } else if (iProgress > 100) {
                        iProgress = 100;
                    } else {
                        iProgress = parseInt(iProgress) + parseInt(iStep);
                    }
                    that.SetProcessValue(iProgress);
                }, avgTime);
            },
            GetProgressValue: function GetProgressValue() {
                return parseInt($("#idUpgradeProcessing").attr("aria-valuenow"));
            }
        }
    });
    return vueComponent;
});
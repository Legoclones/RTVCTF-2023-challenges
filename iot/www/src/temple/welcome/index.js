"use strict";

define(["text!temple/welcome/index.html", "vue", "css!temple/welcome/index.css", "component/gl-btn/index", "component/gl-select/index", 'Cookie'], function (stpl, Vue, css, gl_btn, gl_select, Cookies) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                sNewPwd: "",
                sConfPwd: "",
                page2NewStatus: null,
                iMinPwdLength: 5,
                iMinSSIDPwdLength: 8,
                ssidTooltipMsg: null,
                page3SSIDStatus: "success",
                page3PwdStatus: "success",
                sSSIDVal: "",
                sDfltKey: "goodlife",
                newPwdObj: null,
                statusCls: null,
                statusText: "Min 5 characters",
                statusCls2: null,
                statusText2: "Min 8 characters",
                checked: true,
                tooltipMargin: "0px",
                language: [{
                    'type': 'EN',
                    'item': "English"
                }, {
                    'type': 'CN',
                    'item': "简体中文"
                }, {
                    'type': 'TC',
                    'item': "繁體中文"
                }, {
                    'type': 'DE',
                    'item': "Deutsch"
                }, {
                    'type': 'FR',
                    'item': "Français"
                }, {
                    'type': 'SP',
                    'item': "Español"
                }, {
                    'type': 'IT',
                    'item': "Italiano"
                }, {
                    'type': 'JP',
                    'item': "日本語"
                }, {
                    'type': 'KR',
                    'item': "한국어"
                }, {
                    'type': 'RU',
                    'item': "Русский"
                }],
                item: "",
                wifiMode: "",
                isOriginHei: true,
                screenHeight: document.documentElement.clientHeight, //此处也可能是其他获取方法
                originHeight: document.documentElement.clientHeight
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-select": gl_select
        },
        computed: {
            routerInfo: function routerInfo() {
                return this.$store.getters.apiData["routerinfo"];
            },
            getap4Config: function getap4Config() {
                return this.$store.getters.apiData["getap4config"];
            },
            page2ConfirmStatus: function page2ConfirmStatus() {
                if (this.sConfPwd.length == 0) {
                    return null;
                } else if (this.sConfPwd == this.sNewPwd) {
                    return "success";
                }
                return "error";
            },
            appIcon: function appIcon() {
                if (this.routerInfo.model) {
                    var model = this.routerInfo.model;
                    if (model.toLowerCase().indexOf('usb') !== -1) {
                        return "adminpw-usb-router";
                    } else if (model == 'ar750') {
                        return "adminpw-mv1000-router";
                    } else if (model == 'ar750s') {
                        return "adminpw-ar750s-router";
                    } else if (model == 'e750') {
                        return "adminpw-e750-router";
                    } else if (model == 'b2200') {
                        return "adminpw-b2200-router";
                    } else if (model.toLowerCase().indexOf('ar300m') !== -1) {
                        return "adminpw-ar300m-router";
                    } else if (model.toLowerCase().indexOf('ar150') !== -1) {
                        return "adminpw-ar300m-router";
                    } else if (model.toLowerCase().indexOf('mt300n-v2') !== -1) {
                        return "adminpw-ar300m-router";
                    } else if (model.toLowerCase().indexOf('mt300n') !== -1) {
                        return "adminpw-ar300m-router";
                    } else if (model.toLowerCase().indexOf('n300') !== -1) {
                        return "adminpw-mt300n-router";
                    } else if (model.toLowerCase().indexOf('mt300a') !== -1) {
                        return "adminpw-ar300m-router";
                    } else if (model.toLowerCase().indexOf('x750') !== -1) {
                        return "adminpw-x750-router";
                    } else if (model.toLowerCase().indexOf('s1300') !== -1) {
                        return "adminpw-b1300-router";
                    } else if (model.toLowerCase().indexOf('b1300') !== -1) {
                        return "adminpw-b1300-router";
                    } else if (model.toLowerCase().indexOf('ap1300') !== -1) {
                        return "adminpw-ap1300-router";
                    } else if (model.toLowerCase().indexOf('x1200') !== -1) {
                        return "adminpw-x1200-router";
                    } else if (model.toLowerCase().indexOf('mv1000') !== -1) {
                        return 'adminpw-mv1000-router'
                    } else if (model.toLowerCase().indexOf('x300b') !== -1) {
                        return 'adminpw-x300b-router'
                    } else if (model.toLowerCase().indexOf('mt1300') !== -1 || model.toLowerCase().indexOf('sft1200') !== -1 || model.toLowerCase().indexOf('s200') !== -1) {
                        return 'adminpw-mt1300-router'
                    } else if (model.toLowerCase().indexOf('xe300') !== -1) {
                        return 'adminpw-xe300-router'
                    } else if (model.toLowerCase().indexOf('ax1800') !== -1 ) {
                        return 'adminpw-ax1800-router'
                    } else if (model.toLowerCase().indexOf('sf1200') !== -1) {
                        return 'adminpw-sf1200-router'
                    } else {
                        return "adminpw-mini-router";
                    }
                }
            },
            errNewPwdForLength: function errNewPwdForLength() {
                return this.getLen(this.sNewPwd) > 32 || escape(this.sNewPwd).indexOf("%u") != -1
                // 包含中文
            },
            errConfPwdForLength: function errConfPwdForLength() {
                return this.getLen(this.sConfPwd) > 32 || escape(this.sConfPwd).indexOf("%u") != -1
            },
            isNewPwdErr: function isNewPwdErr() {
                return this.page2NewStatus == 'error' || this.errNewPwdForLength
            },
            isConfPwdErr: function isConfPwdErr() {
                return this.page2ConfirmStatus == 'error' || this.errConfPwdForLength
            }
        },
        mounted: function mounted() {
            this.getData();
            var that = this;
            window.onresize = function () {
                return function () {
                    that.screenHeight = document.documentElement.clientHeight;
                }();
            };
        },
        methods: {
            getlanguage: function getlanguage(data) {
                var that = this;
                this.item = data.type;
                this.lang = this.item;
                that.$translate.setLang(this.item);
                this.$store.dispatch("call", {
                    api: "setlanguage",
                    data: {
                        language: this.item
                    }
                }).then(function (result) {
                    if (result.success) {
                        that.$store.commit("setLang", {
                            lang: that.lang
                        });
                    } else {
                        that.$store.commit("setLang", {
                            lang: "EN"
                        });
                    }
                });
            },
            chooseLanguage: function chooseLanguage() {
                $("#welcomeCarousel").carousel(1);
            },
            getData: function getData() {
                var that = this;
                this.$store.dispatch("call", {
                    api: "routerinfo"
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "routerinfo",
                            "msg": result.code
                        });
                        return;
                    };
                    if (result.success) {
                        that.wifiMode = result.model.toUpperCase();
                        if (result.model == 'n300') {
                            that.wifiMode = "microuter-" + that.wifiMode;
                        } else {
                            that.wifiMode = "GL-" + that.wifiMode;
                        }
                    }
                });
            },
            next: function next(ID) {
                $(ID).focus();
            },
            submit: function submit() {
                var that = this;
                if ((this.page2NewStatus == "success" && this.page2ConfirmStatus == "success") == false) {
                    return;
                }
                if (this.errNewPwdForLength || this.errConfPwdForLength) {
                    return
                }
                if (this.sNewPwd == "goodlife") {
                    this.$message({
                        type: 'warning',
                        msg: -2500
                    });
                    return;
                }
                that.$store.dispatch("call", {
                    api: "initpwd",
                    data: {
                        newpwd: this.sNewPwd
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "initpwd",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        Cookies.set('Admin-Token', result.token)
                        $("#welcomeCarousel").carousel(2);
                        location.reload(true)
                        // that.$router.push({
                        //     path: that.redirect || '/'
                        // });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "initpwd",
                            "msg": result.code
                        });
                    }
                });
            },
            reset: function reset() {
                $("#welcomeCarousel").carousel(0);
            },
            submit2: function submit2() {
                var that = this;
                var newKey = this.sDfltKey;
                var newKeyTrim = newKey.trim();
                // console.log(newKeyTrim, that.sSSIDVal);
                if (newKeyTrim.length < newKey.length) {
                    $("#myModalSubmitCaution").modal("show");
                    this.sDfltKey = newKeyTrim;
                    return;
                }
                this.sDfltKey = newKey;
                this.$store.dispatch("call", {
                    api: "updateap",
                    data: {
                        ssid: that.getap4Config.ssid,
                        key: newKey,
                        encrypt: "psk",
                        newssid: that.sSSIDVal ? that.sSSIDVal : that.getap4Config.ssid
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "updateap",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        window.location.href = "/index";
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "updateap",
                            "msg": result.code
                        });
                    }
                });
            },
            check: function check(minChar, val) {
                var secureTotal = 0,
                    chars = 0,
                    capitals = 0,
                    lowers = 0,
                    special = 0,
                    upperCase = new RegExp("[A-Z]"),
                    lowerCase = new RegExp("[a-z]"),
                    numbers = new RegExp("[0-9]"),
                    specialchars = new RegExp("([!,%,&,@,#,$,^,*,?,_,~])");
                if (val.length >= minChar) {
                    chars = 1;
                } else {
                    chars = -4;
                }
                if (val.match(upperCase)) {
                    capitals = 1;
                } else {
                    capitals = 0;
                }
                if (val.match(lowerCase)) {
                    lowers = 1;
                } else {
                    lowers = 0;
                }
                if (val.match(numbers)) {
                    numbers = 1;
                } else {
                    numbers = 0;
                }
                if (val.match(specialchars)) {
                    special = 1;
                } else {
                    special = 0;
                }
                secureTotal = chars + capitals + numbers + special + lowers;
                var securePercentage = secureTotal / 5 * 100; //5 security grade
                return this.addStatus(securePercentage, minChar);
            },
            addStatus: function addStatus(percentage, minChar) {
                var statusText = "Min " + minChar + " characters";
                var statusCls = null;
                if (percentage >= 25) {
                    statusCls = "weak";
                    statusText = "weak";
                }
                if (percentage >= 50) {
                    statusCls = "medium";
                    statusText = "medium";
                }
                if (percentage >= 75) {
                    statusCls = "strong";
                    statusText = "strong";
                }
                if (percentage >= 100) {
                    statusCls = "very-strong";
                    statusText = "very strong";
                }
                return [statusText, statusCls];
            },       
            getLen: function getLen(data) {
                var realLength = 0;
                var charCode = -1;
                if (data) {
                    var len = data.length;
                    for (var i = 0; i < len; i++) {
                        charCode = data.charCodeAt(i);
                        if (charCode > 0 && charCode <= 128) {
                            realLength += 1;
                        } else {
                            realLength += 3;
                        }
                    }
                }
                return realLength;
            }
        },
        watch: {
            screenHeight: function screenHeight(val) {
                if (this.originHeight > val + 100) {
                    //加100为了兼容华为的返回键
                    this.isOriginHei = false;
                } else {
                    this.isOriginHei = true;
                }
            },

            sNewPwd: function sNewPwd() {
                var result = this.check(this.iMinPwdLength, this.sNewPwd);
                this.statusText = result[0];
                this.statusCls = result[1];
                if (this.sNewPwd.length == 0) {
                    this.page2NewStatus = null;
                } else if (this.sNewPwd.length >= this.iMinPwdLength) {
                    this.page2NewStatus = "success";
                } else {
                    this.page2NewStatus = "error";
                }
            },
            sSSIDVal: function sSSIDVal() {
                if (this.sSSIDVal.length == 0) {
                    this.ssidTooltipMsg = "Can't be empty!";
                    this.page3SSIDStatus = "error";
                } else {
                    this.ssidTooltipMsg = null;
                    this.page3SSIDStatus = "success";
                }
            },
            sDfltKey: function sDfltKey() {
                var result = this.check(this.iMinSSIDPwdLength, this.sDfltKey);
                this.statusText2 = result[0];
                this.statusCls2 = result[1];
                if (this.sDfltKey.length < this.iMinSSIDPwdLength) {
                    this.page3PwdStatus = "error";
                } else {
                    this.page3PwdStatus = "success";
                }
            }
        }
    });
    return vueComponent;
});
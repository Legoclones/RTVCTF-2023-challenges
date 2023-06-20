"use strict";
define(["text!temple/tor/index.html", "css!temple/timezone/index.css", "vue", "component/gl-btn/index", "component/gl-select/index", 'lib/country_code', "component/gl-toggle-btn/index"], function (temp, css, Vue, gl_btn, gl_select, Country, gl_toggle) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                countryCode: "",
                torEnable: false,
                code: '',
                timer: null,
                torTimer: null,
                statusLog: '',
                btnMove: false,
                applyDisabled: true,
                activeStatus: false

            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-select": gl_select,
            "gl-tg-btn": gl_toggle,
        },

        mounted: function mounted() {
            $("#router-visual").slideUp();
            if ($(".clsLink2" + this.$route.path.split("/")[1]).hasClass("bar")) {
                $(".bar.active").removeClass("active");
                $(".clsLink2" + this.$route.path.split("/")[1]).addClass("active");
                $("#vpn").collapse("show");
                $("#moresetting").collapse("hide");
                $("#applications").collapse("hide");
                $("#system").collapse("hide");
            }
            this.timerTorStatus();
            this.timerData();
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            clearInterval(this.timer);
            clearInterval(this.torTimer);
            next();
        },
        computed: {
            dialCode: function dialCode() {
                var list = Country.filter(function (val) {
                    return val['dial_code'] != '' && val['dial_code'] != null;
                });
                list.sort(this.compare('name'));
                var listDialCode = [{ "name": "Random", "dial_code": "+9027", "code": "all" }]
                listDialCode =  listDialCode.concat(list);
                return listDialCode
            },
        },
        // watch: {
        //     torEnable:function torEnable(val,oval){
        //         torEnable = val ;
        //     }
        // },
        watch: {
            activeStatus: {
                handler: function(val, oldVal) {
                    var status = 'off';
                    if (val) status = 'connected';
                    this.$bus.$emit('vpnCircleStatus', 'tor', status);
                },
                deep: true
            }
        },
        methods: {
            checkStatus: function checkStatus() {
                this.applyDisabled = false;
                clearInterval(this.torTimer);
            },
            getModel: function getModel() {
                this.applyDisabled = false;
                clearInterval(this.torTimer);
            },
            gettor: function gettor() {
                var that = this;
                this.$store.dispatch('call', {
                    api: 'gettor',
                }).then(function (result) {
                    if (result.success) {
                        that.torEnable = result.enable
                        that.activeStatus = result.enable
                        var status = 'off';
                        if (result.enable) status = 'connected';
                        that.$bus.$emit('vpnCircleStatus', 'tor', status);
                        for (var i = 0; i < that.dialCode.length; i++) {
                            if (that.dialCode[i].code == result.country) {
                                that.countryCode = that.dialCode[i].name
                            }
                        }
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "settor",
                            "msg": result.code,
                        });
                    }
                });
            },
            timerData: function timerData() {
                var _this = this;
                _this.gettor();
                clearInterval(this.torTimer);
                    _this.torTimer = setInterval(function () {
                        _this.gettor();
                    }, 5000);
            },
            getTorStatus: function getTorStatus() {
                var that = this;
                that.$store.dispatch('call', {
                    api: 'torstatus'
                }).then(function (result) {
                    if (result.success) {
                        that.statusLog = result.log
                        if (result.done) {
                            that.statusLog = 'The router is accessing the Internet through tor';
                            clearInterval(that.timer);
                        }
                    }
                })
            },
            timerTorStatus: function timerTorStatus() {
                var that = this;
                this.getTorStatus();
                clearInterval(this.timer);
                this.timer = setInterval(function () {
                    that.getTorStatus();
                }, 5000);
            },
            settor: function settor() {
                var that = this;
                for (var i = 0; i < that.dialCode.length; i++) {
                    if (that.dialCode[i].name == that.countryCode) {
                    that.code = that.dialCode[i].code
                    }
                }
                clearInterval(that.timer);
                clearInterval(that.torTimer);
                this.btnMove = true;
                this.applyDisabled = true;
                this.$store.dispatch('call', {
                    api: 'settor',
                    data: {
                        enable: that.torEnable,
                        country: that.code
                    }
                }).then(function (result) {
                    that.btnMove = false;
                    that.timerData();
                    that.timerTorStatus();
                    if (result.success) {
                        that.activeStatus = true;
                        if (!that.torEnable) {
                            that.activeStatus = false
                            clearInterval(that.timer);
                        }
                        that.$message({
                            "type": "success",
                            "api": "settor",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "settor",
                            "msg": result.code,
                        });
                    }

                });
            },
            
            compare: function compare(name, num) {
                return function (o, p) {
                    var a, b;
                    if (o && p && typeof o === 'object' && typeof p === 'object') {
                        a = o[name];
                        b = p[name];
                        if (a === b) {
                            return typeof num === 'function' ? num(o, p) : 0;
                        }
                        if (typeof a === typeof b) {
                            return a < b ? -1 : 1;
                        }
                        return typeof a < typeof b ? -1 : 1;
                    } else {
                        thro("error");
                    }
                }
            },

        },
    });
    return vueComponent;
});
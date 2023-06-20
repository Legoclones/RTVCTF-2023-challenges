"use strict";
define(["text!temple/safemode/index.html", "css!temple/timezone/index.css", "vue", "component/gl-btn/index", "component/gl-select/index", "component/gl-toggle-btn/index"], function (temp, css, Vue, gl_btn, gl_select, gl_toggle) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                safeEnabled: false,
                applyDisabled: true,
                activeStatus: false,
                btnMove: false,
                isEnabled:false
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
            this.getsafe();
            this.getEnable()
        },
        methods: {
            getEnable: function () {
                var that= this
                this.$store.dispatch("call", {
                    api: "getpolicy"
                }).then(function (result) {
                    if (result.success) {
                       that.isEnabled = result.enable
                    }    
                })
            },
            getsafe: function getsafe() {
                var that = this;
                that.$store.dispatch("call", {
                    'api': 'getsafe'
                }).then(function (result) {
                    if (result.success) {
                        that.safeEnabled = result.enable;
                        that.activeStatus = result.enable;
                    }
                });
            },
            setsafe: function setsafe() {
                var that = this;
                that.btnMove = true;
                that.$store.dispatch("call", {
                    'api': 'setsafe',
                    data: {
                        'enable': this.safeEnabled
                    }
                }).then(function (result) {
                    that.btnMove = false;
                    if (result.success) {
                        that.activeStatus = true;
                        var status = 'off';
                        if (that.safeEnabled == true) status = 'connected';
                        that.$bus.$emit('vpnCircleStatus', 'internetKillSwitch', status);
                        that.$message({
                            "type": "success",
                            "api": "setsafe",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "setsafe",
                            "msg": result.code,
                        });
                    }
                });
            },

            checkStatus: function checkStatus() {
                this.applyDisabled = false;
            },


        },
    });
    return vueComponent;
});
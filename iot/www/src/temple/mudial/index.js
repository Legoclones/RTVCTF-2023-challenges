"use strict";

define(["text!temple/mudial/index.html", "css!temple/dns/index.css", "vue", "component/gl-btn/index", "component/gl-toggle-btn/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index"], function (temp, css, Vue, gl_btn, gl_toggle, gl_input, gl_tooltip, gl_select) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                disapply: true,
                Enable: false,
                Mode: "clone",
                Mode_zh: "克隆模式",
                Proto: "pppoe",
                Modes: ["克隆模式", "手动模式"],
                Protos: ["pppoe", "dhcp", "static"],
                username: "",
                password: "",
                ipaddr: "",
                netmask: "",
                gateway: "",
                dns1: "",
                dns2: "",
                inputerror: false,
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-tg-btn": gl_toggle,
            "gl-input": gl_input,
            "gl-select": gl_select,
            "gl-tooltip": gl_tooltip

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
        created: function created() {
            var that = this;
            that.$store.dispatch('call', {
                api: 'getmudial_config'
            }).then(function (result) {
                console.log(result);
                if (result.success) {
                    that.Enable = result.enabled;
                    that.Mode = result.mode;
                    if (result.mode == "clone") {
                        that.Mode_zh = that.Modes[0];
                    } else {
                        that.Mode_zh = that.Modes[1];
                    }
                    that.Proto = result.proto;
                    that.username = result.username;
                    that.password = result.password;
                    that.ipaddr = result.ipaddr;
                    that.netmask = result.netmask;
                    that.gateway = result.gateway;
                    that.dns1 = result.dns1;
                    that.dns2 = result.dns2;
                    that.disapply = true;
                }
            })
        },
        methods: {
            checkBtn: function checkBtn() {
                this.disapply = false;
            },
            checkstatic: function checkstatic(item) {
                var pattern = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
                console.log(pattern.test(item));
                this.disapply = false;
            },
            checkpppoe: function checkpppoe(item) {
                this.disapply = false;
            },
            selectMode: function selectMode(item) {
                console.log(item);
                if (item == '克隆模式') {
                    this.Mode = "clone"
                } else {
                    this.Mode = "manul"
                }
                this.disapply = false;
            },
            selectProto: function selectProto(item) {
                this.Proto = item
                this.disapply = false;
            },
            applymudial: function applymudial() {
                var that = this;
                this.disapply = true;
                this.$store.dispatch("call", {
                    api: "setmudial_config", data: {
                        enabled: that.Enable,
                        mode: that.Mode,
                        proto: that.Proto,
                        username: that.username,
                        password: that.password,
                        ipaddr: that.ipaddr,
                        netmask: that.netmask,
                        gateway: that.gateway,
                        dns1: that.dns1,
                        dns2: that.dns2,
                    }
                }).then(function (result) {
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "setmudial_config",
                            "msg": result.code
                        });
                    }

                });
            }

        }
    });
    return vueComponent;
});

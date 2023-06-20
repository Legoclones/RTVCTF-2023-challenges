"use strict";

define(["text!temple/siderouter/index.html", "css!temple/dns/index.css", "vue", "component/gl-btn/index", "component/gl-toggle-btn/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index"], function (temp, css, Vue, gl_btn, gl_toggle, gl_input, gl_tooltip, gl_select) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                applystatus: true,
                Enable: false,
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
                api: 'getsiderouter_config'
            }).then(function (result) {
                if (result.success) {
                    that.Enable = result.enabled; 
                }
            })
        },
        methods: {
            checkBtn: function checkBtn() {
                if(!this.ContentErr){
                    this.applystatus = false;
                }
            },
            applysiderouter: function applySiderouter() {
                var that = this;
                that.btnMove = true;
                this.applystatus = true;
                this.$store.dispatch("call", {
                    api: "setsiderouter_config", data: {
                        enabled: that.Enable,
                    }
                }).then(function (result) {
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "setadblock",
                            "msg": result.code
                        });
                    } 

                });
            }
 
        }
    });
    return vueComponent;
});

"use strict";

define(["text!temple/mcu/index.html", "css!temple/dns/index.css", "vue", "component/gl-btn/index", "component/gl-toggle-btn/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index"], function (temp, css, Vue, gl_btn, gl_toggle, gl_input, gl_tooltip, gl_select) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                applystatus: true,
                ShowPsd: false,
                ShowMain: false,
                Show24: false,
                Show5: false,
                ShowGw: false,
                ShowVPN: false,
                ShowCust: false,
                ContentErr: false,
                Content: "",
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
                api: 'getmcu_config'
            }).then(function (result) {
                if (result.success) {
                    that.ShowPsd = !result.hide_psk; 
                    that.ShowMain = result.screen1_en;
                    that.Show24 = result.screen2_en;
                    that.Show5 = result.screen3_en;
                    that.ShowGw = result.screen4_en;
                    that.ShowVPN = result.screen5_en;
                    that.ShowCust = result.custom_en;
                    that.Content = result.content;
                }
            })
        },
        methods: {
            checkBtn: function checkBtn() {
                if(!this.ContentErr){
                    this.applystatus = false;
                }
            },
            ContentCheck: function ContentCheck(val){
                if (val.length > 0 && val.length < 65){
                    this.ContentErr = false;
                    this.applystatus = false;
                 }
                 else{
                    this.ContentErr = true;
                    this.applystatus = true;
                }
            },
            applyMCU: function applyMCU() {
                var that = this;
                that.btnMove = true;
                this.$store.dispatch("call", {
                    api: "setmcu_config", data: {
                        hide_psk: !that.ShowPsd,
                        screen1_en: that.ShowMain,
                        screen2_en: that.Show24,
                        screen3_en: that.Show5,
                        screen4_en: that.ShowGw,
                        screen5_en: that.ShowVPN,
                        custom_en: that.ShowCust,
                        content: that.Content,
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

"use strict";
define(["text!temple/snooping/index.html", "vue", "component/gl-btn/index", "component/gl-select/index", "component/gl-toggle-btn/index"], function (temp, Vue, gl_btn, gl_select, gl_toggle) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                versionList: [1, 2, 3],
                version: 1,
                enable: false,
                isDisabled: false,
                applyStatus:true,
                activeStatus: false

            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-select": gl_select,
            "gl-tg-btn": gl_toggle,
        },
        mounted: function mounted() {
            this.getSnooping();
        },

        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                    $("#vpn").collapse("hide");
                    $("#moresetting").collapse("hide");
                    $("#applications").collapse("hide");
                    $("#system").collapse("show");
                }
            });
        },
        methods: {
            checkBtn: function checkBtn(){
                this.applyStatus = false;
            },
            setSnooping: function setSnooping() {
                var _this = this;
                _this.isDisabled = true;
                _this.$store.dispatch("call", {
                    api: 'set_snooping',
                    data: {
                        enabled:_this.enable,
                        version: _this.version,
                    }
                }).then(function(result){
                    _this.isDisabled = false;
                    if (result.success) {
                        _this.$message({
                            "type": "info",
                            "api": "set_snooping",
                            "msg": _this.t('waiting'),
                            "duration": 8000
                        });
                        _this.setTimeoutInfo = setTimeout(function() {
                            _this.$message({
                                "type": "success",
                                "api": "set_snooping",
                                "msg": result.code
                            });
                            _this.getSnooping();
                            clearTimeout(_this.setTimeoutInfo);
                        }, 8000);
                    } else {
                        _this.$message({
                            "type": "error",
                            "api": "set_snooping",
                            "msg": result.code,
                        });
                    }
                })
            },
            getSnooping: function getSnooping() {
                var _this = this;
                _this.$store.dispatch('call', {
                    api: 'get_snooping'
                }).then(function (result) {
                    if (result.success) {
                        _this.version = result.version;
                        _this.enable = result.enabled;
                        _this.activeStatus = result.enabled;
                    }
                })
            }
        },
    });
    return vueComponent;
});
"use strict";

define(["text!temple/portal/index.html", "css!temple/portal/index.css", "vue", "component/gl-btn/index", "component/gl-toggle-btn/index", "component/gl-input/index", "component/gl-tooltip/index", "component/select/index"], function (temp, css, Vue, gl_btn, gl_toggle, gl_input, gl_tooltip, gl_select) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                openPortal: false,
                onLineTime: '1440',
                getway: "Guest",
                applystatus: false,
                cretification: "",
                activeStatus: false,
                disabledSelcet:false,
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-tg-btn": gl_toggle,
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip,
            "gl-select": gl_select
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            next();
        },
        computed: {
            getportal: function getportal() {
                return this.$store.getters.apiData["getportal"];
            },
            router: function router() {
                return this.$store.getters.apiData['router_mini'];
            },
            meshjudge: function meshjudge() {
                if (this.router.mode == 'mesh') {
                    return true
                }
                return false
            },
            networkList: function networkList() {
                var item = ["Guest"];
                return item
            }
        },
        mounted:function mounted() {
            var that = this;
            that.getdata();
        },
        methods: {
            getdata: function getdata(){
                var that = this;
                this.$store.dispatch("call", {
                    api: "getportal",
                }).then(function (result) {
                    if (result.success) {
                        that.openPortal = result.portal_enable;
                        that.activeStatus = result.portal_enable;
                        that.onLineTime = result.client_force_time;
                        that.cretification = that.getportal.redir_url;
                        if (result.gw_if == "guest") {
                            that.getway = 'Guest';
                        }
                    }
                })
            },
            portalSetting: function portalSetting() {
                var that = this;
                var Regular = /^\d+$/
                if (this.cretification) {
                    if (this.cretification.substr(0, 8).toLowerCase() != "https://" && this.cretification.substr(0, 7).toLowerCase() != "http://") {
                        this.$message({
                            type: "error",
                            msg: this.t("Forward URLs starting with 'http://' or 'https://'")
                        })
                        return
                    }
                }
                if (!Regular.test(this.onLineTime)) {
                    this.$message({
                        type: "error",
                        msg: this.t('Data format error')
                    })
                    return
                }
                if (!this.onLineTime) {
                    this.$message({
                        type: "warning",
                        msg: this.t('WARNING: Cannot be empty!')
                    })
                    return
                }
                if (this.onLineTime > 1440) {
                    this.$message({
                        type: "error",
                        msg: this.t('Please set Lease time minutes between 1 and 1440')
                    })
                    return
                }
                if (this.cretification.length > 255) {
                    this.$message({
                        type: "error",
                        msg: this.t('Maximum length cannot exceed 255 characters')
                    })
                    return
                }
                this.applystatus = true;
                var getway = "guest";
                if (this.getway == "LAN") {
                    getway = "lan"
                }
                this.$store.dispatch("call", {
                    api: "setportal",
                    data: {
                        portal_enable: this.openPortal,
                        client_force_time: this.onLineTime,
                        gw_if: getway,
                        redir_url: this.cretification
                    }
                }).then(function (result) {
                    
                    if (result.success) {
                        that.$message({
                            type: "success",
                            msg: result.code
                        })
                        that.applystatus = false;
                        that.getdata();
                    } else {
                        that.applystatus = false;
                        that.$message({
                            type: "error",
                            msg: result.code
                        })
                    }
                })
            }
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
                        $("#moresetting").collapse("hide");
                        $("#applications").collapse("hide");
                        $("#system").collapse("show");
                    }
                }, 50);
            });
        },
    });
    return vueComponent;
});
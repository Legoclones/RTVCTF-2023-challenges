"use strict";

define(["text!temple/ping/index.html", "css!temple/ping/index.css", "vue", "component/gl-toggle-btn/index", "component/gl-tooltip/index", "component/gl-btn/index", "component/gl-input/index", "component/gl-loading/index",], function (stpl, css, Vue, gl_switch, gl_tooltip, gl_btn, gl_input,gl_loading) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                pingResult:'',
                pingValue:'',
                traceValue:'',
                isDisabled: false,
                urlReg:/^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
                ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
            };
        },
        components: {
            "gl-switch": gl_switch,
            "gl-tooltip": gl_tooltip,
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-loading": gl_loading,
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
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
        mounted: function mounted() {

        },
        computed: {

        },
        methods: {
            pingIp: function pingIp() {
                var that = this;
                if (this.isDisabled )return;
                if (!this.urlReg.test(this.pingValue) && !this.ipReg.test(this.pingValue)) {
                    this.$message({
                        type: 'error',
                        msg: -4
                    });
                    return
                }
                this.isDisabled = true;
                that.$store.dispatch('call', {
                    'api': 'pingip',
                    data: {
                        'ping_addr':that.pingValue
                    }
                }).then(function (result) {
                    that.isDisabled = false;
                    if (result.success) {
                        that.pingResult = '\n' + result.ping_result;
                        that.$message({
                            "type": "success",
                            "api": "pingip",
                            "msg": result.code
                        });
                    }else{
                        that.$message({
                            "type": "error",
                            "api": "pingip",
                            "msg": result.code
                        });
                    }
                })
            },
            pingTraceRoute: function pingTraceRoute(){
                var that = this;
                if (this.isDisabled )return;
                if (!this.urlReg.test(this.traceValue) && !this.ipReg.test(this.traceValue)) {
                    this.$message({
                        type: 'error',
                        msg: -4
                    });
                    return
                }
                this.isDisabled = true;
                that.$store.dispatch('call', {
                    'api': 'traceroute',
                    timeOut: 60000,
                    data: {
                        'trace_addr':that.traceValue
                    }
                }).then(function (result) {
                    that.isDisabled = false;
                    if (result.success) {
                        that.pingResult = '\n'+ result.trace_result;
                        that.$message({
                            "type": "success",
                            "api": "pingip",
                            "msg": result.code
                        });
                    }else{
                        that.$message({
                            "type": "error",
                            "api": "pingip",
                            "msg": result.code
                        });
                    }
                })
            }
        }
    });
    return vueComponent;
});
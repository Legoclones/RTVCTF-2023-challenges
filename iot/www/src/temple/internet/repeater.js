"use strict";

define(["vue", "text!temple/internet/repeater.html", "css!temple/internet/index.css", "component/gl-dropdown/index", "component/gl-btn/index", "component/gl-comfirm-btn/index", "component/gl-input/index", "component/gl-label/index", "component/gl-select/index", "component/gl-loading/index", "component/modal/modal", "component/gl-toggle-btn/index"], function (Vue, stpl, css, gl_dropdown, gl_btn, gl_cf_btn, gl_input, gl_label, gl_select, gl_loading, gl_modal, gl_toggle_btn) {
    var vueComponent = Vue.extend({
        template: stpl,
        components: {
            "gl-dropdown": gl_dropdown,
            "gl-cf-btn": gl_cf_btn,
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-label": gl_label,
            "gl-select": gl_select,
            "gl-loading": gl_loading,
            "gl-modal": gl_modal,
            "gl-toggle-btn": gl_toggle_btn
        },
        data: function data() {
            return {
                timer: "",
                know_network: false,
                disconnectstatus: false,
                protal: false,
                connect: false,
                showModal: false
            };
        },
        beforeDestroy: function beforeDestroy() {
            clearInterval(this.timer);
            // console.log("beforeDestroy repeater");
        },
        computed: {
            stainfo: function stainfo() {
                return this.$store.getters.apiData["stainfo"];
            },
            router: function router() {
                return this.$store.getters.apiData['router_mini'];
            },
            // 中继 ssid显示
            stassid: function stassid() {
                return this.stainfo.success && this.stainfo.ip ? this.stainfo.ssid : this.t(this.$lang.internet.repeater);
            },
            // 中继后 wifi强度
            stachannel: function stachannel() {
                return this.stainfo.success && this.stainfo.ip && this.stainfo.channel >= 36;
            },
            // 中级后 ip冲突
            ipconflict: function ipconflict() {
                var item;
                if (this.stainfo.success && this.stainfo.gateway && this.router.ip_addr == this.stainfo.gateway) {
                    return item = 'lanipconflict';
                } else if (this.stainfo.success && this.stainfo.gateway && this.router.guest_addr == this.stainfo.gateway) {
                    return item = 'guestipconflict';
                } else {
                    return false;
                }
            },
            // scan按钮显示
            stascan: function stascan() {
                return this.stainfo.success && this.stainfo.ip;
            },
            // 是否中继
            staconnect: function staconnect() {
                return this.stainfo.success && this.stainfo.ip;
            },
            circleClass: function circleClass() {
                var circle = "";
                if (this.know_network) {
                    // 存在已知网络
                    circle = "waiting";
                    // 联网成功
                    if (this.staconnect) {
                        circle = "active";
                    }
                } else {
                    if (this.staconnect) {
                        circle = "active";
                    } else {
                        circle = "";
                    }
                }
                return circle;
            },
            meshjudge: function meshjudge(){
                if (this.router.mode == 'mesh') {
                    return true
                }
                return false
            }
        },
        mounted: function mounted() {
            var that = this;
            this.$store.dispatch('call', {
                api: 'getoption'
            }).then(function (result) {
                that.connect = result.autoconnect;
                that.protal = result.portal;
            });
        },
        methods: {
            isprotal: function isprotal(data) {
                this.protal = data;
            },
            isconnect: function isconnect(data) {
                this.connect = data;
            },
            submitOptino: function submitOptino() {
                var that = this;
                this.$store.dispatch("call", {
                    api: 'setoption',
                    data: {
                        portal: this.protal,
                        autoconnect: this.connect
                    }
                }).then(function (result) {
                    that.showModal = false;
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "setoption",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "setoption",
                            "msg": result.code
                        });
                    }
                });
            },

            disconnectwifi: function disconnectwifi() {
                var that = this;
                this.$store.commit("showModal", {
                    show: true,
                    title: 'Caution',
                    message: that.$lang.modal.disconWifiMsg,
                    cb: function cb() {
                        that.disconnect();
                    }
                });
            },
            showModalFuc: function showModalFuc() {
                //model 
                if (this.meshjudge) {
                    return
                }
                this.showModal = true;
            },
            linkKnownWifi: function linkKnownWifi(){
                if (this.meshjudge) {
                    return
                }
                this.$router.push('knownwifi')
            },
            linkSetWifi: function linkSetWifi(){
                if (this.meshjudge) {
                    return
                }
                this.$router.push('setWifi')
            },
            disconnect: function disconnect() {
                var that = this;
                that.disconnectstatus = true;
                that.$store.commit('clearTimer_sta');
                that.$store.dispatch("call", {
                    api: "disconnectwifi", data: {
                        ssid: this.stainfo.ssid,
                        enable: false
                    }
                }).then(function (result) {
                    setTimeout(function () {
                        that.disconnectstatus = false;
                    }, 5000);
                    that.$store.dispatch('getInfo_repeater');
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "removewifi",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "removewifi",
                            "msg": result.code
                        });
                        return;
                    }
                });
            }
        }
    });
    return vueComponent;
});
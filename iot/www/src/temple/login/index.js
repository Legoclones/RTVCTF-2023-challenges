"use strict";

define(["text!temple/login/index.html", "vue", "css!temple/login/index.css", "component/gl-btn/index", "component/gl-input/index", "component/modal/modal", 'Cookie'], function (stpl, Vue, css, gl_btn, gl_input, modal, Cookies) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                password: "",
                isPwdWrong: false,
                isForgetPwd: false,
                checked: true,
                productName: "",
                msgModal: false,
                checkSta:false
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-modal": modal
        },
        mounted: function mounted() {
            var that = this;
            this.$store.dispatch("call", { api: "routerinfo" });
            this.$store.dispatch("call", { api: "getap4config" }).then(function (result) {
                if (result.success) {

                    that.productName = result.model.toUpperCase();
                    if (result.model == 'n300') {
                        that.productName = "microuter-"+that.productName;
                    }else {
                        that.productName ="GL-"+ that.productName;
                    }

                }
            });
        },
        computed: {
            router: function router() {
                return this.$store.getters.apiData["routerinfo"];
            },
            getap4Config: function getap4Config() {
                return this.$store.getters.apiData["getap4config"];
            },
            appIcon: function appIcon() {
                if (this.router.model) {
                    var model = this.router.model;
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
                    } else  if (model.toLowerCase().indexOf('ar300m') !== -1) {
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
                    } else if (model.toLowerCase().indexOf('mv1000') !== -1 ) {
                        return 'adminpw-mv1000-router'
                    } else if (model.toLowerCase().indexOf('x300b') !== -1 ) {
                        return 'adminpw-x300b-router'
                    } else if (model.toLowerCase().indexOf('mt1300') !== -1 || model.toLowerCase().indexOf('sft1200') !== -1 || model.toLowerCase().indexOf('s200') !== -1 ) {
                        return 'adminpw-mt1300-router'
                    } else if (model.toLowerCase().indexOf('xe300') !== -1 ) {
                        return 'adminpw-xe300-router'
                    } else if (model.toLowerCase().indexOf('ax1800') !== -1 ) {
                        return 'adminpw-ax1800-router'
                    } else if (model.toLowerCase().indexOf('sf1200') !== -1 ) {
                        return 'adminpw-sf1200-router'
                    } else {
                        return "adminpw-mini-router";
                    }
                }
            }           
        },
        methods: {
            generateId: function generateId(name) {
                return name + "mini-router";
            },
            login: function login() {
                var that = this;
                if (!this.password) {
                    this.$message({
                        type: "warning",
                        msg: -1602
                    });
                    return
                }
                this.$store.dispatch("call", {
                    api: "login",
                    data: {
                        pwd: that.password
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "login",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        Cookies.set('Admin-Token', result.token);
                        that.$message({
                            "type": "success",
                            "api": "login",
                            "msg": result.code
                        });
                        location.reload(true)
                        // that.$router.push({
                        //     path: that.redirect || '/'
                        // });
                    } else {
                        if (result.code == -6) {
                            that.$message({
                                "type": "error",
                                "api": "login",
                                "msg": that.t('You have input wrong password too many times, please wait 5 minutes and try again.')
                            });
                        } else {
                            that.$message({
                                "type": "error",
                                "api": "login",
                                "msg": result.code
                            });
                        }
                        that.isForgetPwd = true;
                        $(".password").focus();
                    }
                });
            },
            closeModal: function closeModal() {
                this.msgModal = false;
            },
            modalClose: function modalClose() {
                this.msgModal = true;
                this.isForgetPwd = true;
                this.isPwdWrong = false;
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
        }
    });
    return vueComponent;
});
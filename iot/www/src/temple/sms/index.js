"use strict";

define(["text!temple/sms/index.html", "vue", "component/gl-btn/index", "component/gl-input/index", "component/gl-select/index", "clipboard", "component/modal/modal", "css!temple/sms/index.css", "component/gl-tooltip/index"], function (stpl, Vue, gl_btn, gl_input, gl_select, clipboardJS, modal, css, gl_tooltip) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                tel: '',
                email: '',
                loadingStatus: false,
                applyStatus: true,
                applyAccountStatus: true,
                accountLoadingStatus: false,
                accountApplyStatus: true,
                account: '',
                password: '',
                smtp: '(Gmail)smtp.gmail.com:465',
                showModal: false,
                localTel: '',
                SMTPList: ['(Gmail)smtp.gmail.com:465', '(Yahoo)smtp.mail.yahoo.com:465', '(Gmail)smtp.gmail.com:587', '(OutLook)smtp.office365.com:587', '(iCloud)smtp.mail.me.com:587', '(Yahoo)smtp.mail.yahoo.com:587']
            }
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-select": gl_select,
            "gl-modal": modal,
            "gl-tooltip": gl_tooltip
        },
        mounted: function mounted() {
            this.getSmsFlist();
        },
        methods: {
            setApplyStatus: function setApplyStatus() {
                this.applyStatus = false;
            },
            setApplyAccountStatus: function setApplyAccountStatus() {
                this.applyAccountStatus = false;
            },
            setSmsForward: function setSmsForward() {
                var _this = this;
                var telStr = ''
                var emailStr = ''
                var phoneReg = this.commonRegFn(/^\+?[0-9]{6,16}$/);
                /*
                 邮箱校验规则:
                    1. 以字母数字开头，中间可以是多个数字字母下划线或-
                    2. @符号后面是数字或字母
                    3. .符号后面是2-4个字母结尾
                */
                var emailReg = this.commonRegFn(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                _this.tel = _this.tel.replace(/\s*/g,'');
                _this.email = _this.email.replace(/\s*/g,'');
                var phoneFlag = false,
                    phoneItem = null,
                    emailFlag = false,
                    emailItem = null;
                // phone 校验
                if (_this.tel && _this.tel.indexOf('|') != -1) {
                    var telList = _this.tel.split('|');
                    telList.forEach(function(item) {
                        if (!phoneReg(item)) {
                            phoneFlag = true;
                            phoneItem = item;
                            return;
                        }
                    })
                    if (phoneFlag) {
                        _this.messageFn('error', _this.t('Phone Number') + '(' + phoneItem + '):' + _this.t('should be more than 6 and less than 16 characters in length'));
                        return;
                    }
                    if (_this.tel.length > 128) {
                        _this.messageFn('error', _this.t('Phone Number') + ':' + _this.t('should be more than 1 and less than 128 characters in length'));
                        return;
                    }
                } else if (_this.tel) {
                    if ((!phoneReg(_this.tel))) {
                        _this.messageFn('error', _this.t('Phone Number') + ':' + _this.t('should be more than 6 and less than 16 characters in length'));
                        return;
                    }
                }
                // email 校验
                if (_this.email && _this.email.indexOf('|') != -1) {
                    var emailList = _this.email.split('|');
                    emailList.forEach(function(item) {
                        if (!emailReg(item)) {
                            emailFlag = true;
                            emailItem = item;
                            return;
                        }
                    })
                    if (emailFlag) {
                        _this.messageFn('error', _this.t('Email format error') + ':' + emailItem);
                        return;
                    }
                    if (_this.email.length > 200) {
                        _this.messageFn('error', _this.t('Email') + ':' + _this.t('should be more than 1 and less than 128 characters in length'));
                        return;
                    }
                } else if (_this.email) {
                    if (!emailReg(_this.email)) {
                        _this.messageFn('error', _this.t('Email format error'));
                        return;
                    }
                }
                telStr = _this.tel.replace(/\|/g,' ');
                emailStr = _this.email.replace(/\|/g,',');
                _this.applyStatus = true;
                _this.loadingStatus = true;
                _this.$store.dispatch('call', {
                    api: 'setSms',
                    data: {
                        modem_id: _this.$route.query.id,
                        bus: _this.$route.query.bus,
                        tel: telStr,
                        email: emailStr
                    }
                }).then(function (result) {
                    _this.applyStatus = false;
                    _this.loadingStatus = false;
                    if (result.success) {
                        _this.tel = '';
                        _this.email = '';
                        _this.$message({
                            type: "success",
                            api: "setSms",
                            msg: result.code
                        });
                        _this.getSmsFlist()
                    } else {
                        var message = result.code == -7 ? _this.t("sms forward config missing") : '';
                        _this.$message({
                            type: "error",
                            api: "setSms",
                            msg: message ? message : result.code
                        });
                    }
                });
            },
            getSmsFlist: function getSmsFlist() {
                var _this = this
                _this.$store.dispatch('call', {
                    api: 'getSms'
                }).then(function(res) {
                    if(res.code == 0) {
                        _this.tel = res.tel_list.replace(/\s/g, '|');
                        _this.email = res.email_list.replace(/,/g, '|');
                        _this.smtp = res.smtp;
                        _this.account = res.account;
                        _this.password = res.password;
                        _this.localTel = res.local_tel 
                    }
                })
            },
            setAccountInfo: function setAccountInfo() {
                var _this = this;
                var emailReg = this.commonRegFn(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
               
                if (!emailReg(this.account)) {
                    _this.messageFn('error', _this.t('Email format error'));
                    return;
                }
                if (this.password.length <= 0 || this.password.length > 128) {
                    _this.messageFn('error',  _this.t('Password') + ':' + _this.t('should be more than 1 and less than 128 characters in length'));
                    return;
                }
                if (this.smtp.length <= 0 || this.smtp.length > 128) {
                    _this.messageFn('error', _this.t('SMTP Server and Port') + ':' + _this.t('should be more than 1 and less than 128 characters in length'));
                    return;
                }
                if (this.localTel.length <= 0 || this.localTel.length > 128) {
                    _this.messageFn('error', _this.t('Subject') + ':' + _this.t('should be more than 1 and less than 128 characters in length'));
                    return;
                }
                _this.applyAccountStatus = true;
                _this.accountLoadingStatus = true;
                _this.$message({
                    "type": 'info',
                    "msg": _this.t('A verification mail is sending to your email'),
                    "duration": 10000
                });
                _this.$store.dispatch('call', {
                    api: 'sendaccount',
                    data: {
                        account: _this.account,
                        password: _this.password,
                        smtp: _this.smtp.indexOf(')') != -1 ? _this.smtp.split(')')[1] : _this.smtp,
                        local_tel: _this.localTel
                    }
                }).then(function (result) {
                    if (result.success) {
                        _this.applyAccountStatus = false;
                        _this.accountLoadingStatus = false;
                        _this.$message({
                            type: "success",
                            api: "sendaccount",
                            msg: result.code
                        });
                        _this.showModal = true;
                        _this.getSmsFlist();
                    } else {
                        _this.applyAccountStatus = false;
                        _this.accountLoadingStatus = false;
                        var message = result.code == -17 ? _this.t("ssmtp doesn't exist") : '';
                        _this.$message({
                            type: "error",
                            api: "sendaccount",
                            msg: message ? message : result.code
                        });
                    }
                });
            },
            commonRegFn: function commonRegFn(reg) {
                return function(str) {
                    return reg.test(str)
                }
            },
            messageFn: function messageFn(type, message) {
                this.$message({
                    "type": type,
                    "msg": message
                })
            },
            getSMTPSelectVal: function getSMTPSelectVal(val) {
                // this.isSclect = true;
            },
            inputVal: function inputVal(val) {
                var that = this;
                this.applyAccountStatus = false;
            }
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                if ($(".clsLink2internet").hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2internet").addClass("active");
                    $("#applications").collapse("hide");
                    $("#moresetting").collapse("hide");
                    $("#system").collapse("hide");
                    $("#vpn").collapse("hide");
                };
            });
        }
    });
    return vueComponent;
});
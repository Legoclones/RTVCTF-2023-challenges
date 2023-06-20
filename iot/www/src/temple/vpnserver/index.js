"use strict";

define(["vue", "text!temple/vpnserver/index.html", "css!temple/vpnserver/index.css", "component/gl-btn/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index", "component/gl-toggle-btn/index",'Cookie', "component/modal/modal"], function (Vue, temp, css, gl_btn, gl_input, gl_tooltip, gl_select, gl_toggle,Cookies, modal) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                timer: "",
                fileTimer: "",
                status: true,
                btname: "Modify",
                btnapy: false,
                btnstatus: false,
                enableManual: false,
                portTooltipMsg: null,
                maskTooltipMsg: null,
                subnetTooltipMsg: null,
                generate: false,
                typename: "default",
                encryptArray: ["AES-256-GCM", "AES-128-GCM", "AES-128-CBC", "CHACHA20-POLY1305"],
                authentocationArray: ["SHA256", "SHA512"],
                ProtoArray: ["UDP", "TCP"],
                KeepSettingBtn: false,
                circleClass: "",
                btnmfy: false,
                btnstart: false,
                btnserver: 'init',
                modifyStat: true, //点击start隐藏modify
                timeout: null,
                access: false,
                blockStatus: false,
                msgOf_dmz: false,
                exportConfig: false,
                TypeArr: ['Router', 'Bridge'],
                IpAddress:'',
                Ipv6Address: '',
                lanstart: '',
                lanend: '',
                inputStatus: null,
                inputV6Status: null,
                lanStartInputStatus: null,
                lanEndInputStatus: null,
                methodType: '',
                ipv6EnabledTooltip: null,
                ipv6AddressDisabled: false,
                judgeShowModal: false
            };
        },
        watch: {
            "ovpnstatus.status": {
                handler: function(val, oldVal) {
                    var status = "off";
                    if (val == 'started') status = 'connected';
                    this.$bus.$emit('vpnCircleStatus', 'vpnserver', status);
                },
                deep: true
            },
            "ovpnconfig.dev": {
                handler: function(val, oldVal) {
                    var that = this;
                    if (val == 'Bridge') {
                        that.methodType = 'tap'
                        that.ovpnconfig.access = true
                        that.$store.dispatch("call", {
                            api: 'ovpnblock',
                            data: {
                                "enable": true
                            }
                        }).then(function(result) {
                            if(result.success){
                                that.access = true;
                                that.blockStatus = true
                            }
                        })
                    } else if (val == 'Router') {
                        that.blockStatus = false
                        this.methodType = 'tun'
                    }
                },
                deep: true
            }
        },
        computed: {
            modifyBtn: function modifyBtn() {
                if (this.ovpnstatus.status == 'started') {
                    return false;
                }
                return true;
            },
            // 配置文件
            ovpnconfig: function ovpnconfig() {
                var typeStr = this.$store.getters.apiData["getovpnconfig"]
                if(typeStr.dev == 'tap') {
                    typeStr.dev = 'Bridge'
                }else if(typeStr.dev == 'tun-SERVER') {
                    typeStr.dev = 'Router'
                }
                if (typeStr.ipv6 == 0) {
                    this.ipv6EnabledTooltip = this.t('Please enable ipv6 first if you want to configure ipv6 vpn tunnel');
                    this.ipv6AddressDisabled = true;
                } else if (typeStr.mode6 == 'Native') {
                    this.ipv6EnabledTooltip = this.t('The ipv6 tunnel for VPN is disabled when using ipv6 Native mode and this may cause data leak, please change ipv6 mode then restart vpn server/client.');
                    this.ipv6AddressDisabled = true;
                } else {
                    this.ipv6AddressDisabled = false;
                }
                return typeStr;
            },
            getovpnfilestatus: function getovpnfilestatus() {
                return this.$store.getters.apiData['getovpnfilestatus'];
            },
            ovpnstatus: function ovpnstatus() {
                return this.$store.getters.apiData["ovpnstatus"];
            },
            btnName: function btnName() {
                var name = "";
                switch (this.ovpnstatus.status) {
                    case "started":
                        name = "Stop";
                        this.typename = "danger";
                        this.circleClass = "active";
                        break;
                    default:
                        name = "Start";
                        this.circleClass = "";
                        this.typename = "default";
                        break;
                }
                return name;
            },
            checkServer: function checkServer() {
                if (this.btnserver != 'init') {
                    if (this.btnserver == this.ovpnstatus.status) {
                        this.btnserver = 'init';
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip,
            "gl-select": gl_select,
            "gl-tg-btn": gl_toggle,
            "gl-modal": modal
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                $(".bar.active").removeClass("active");
                // $(".clsLink2vpn").addClass("active");
                setTimeout(function () {
                    if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                        $("#vpn").collapse("show");
                        $("#moresetting").collapse("hide");
                        $("#applications").collapse("hide");
                        $("#system").collapse("hide");
                    }
                }, 250);
            });
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnapy) {
                clearInterval(this.timer);
                next();
            } else {
                this.$message({
                    "type": "warning",
                    "msg": -2400
                });
            }
        },
        mounted: function mounted() {
            this.generate = this.getovpnfilestatus.success;
            var that = this;
            $("#router-visual").slideUp();
            $("#idEnableChange").change(function () {
                that.enableChange();
            });
            $("[data-toggle=\"tooltip\"]").tooltip();
            that.checkfile(false);
            that.$store.dispatch("call", {
                api: 'fwget'
            }).then(function (result) {
                if (result.status == 'Enabled') {
                    that.msgOf_dmz = true;
                }
            });
            this.$store.dispatch('call', {
                api: 'getovpnconfig'
            }).then(function(result) {
                if(result.code == 0) {
                    that.lanstart = result.start
                    that.lanend = result.end
                    that.methodType = result.dev
                    that.IpAddress = result.subnet.substring(0, result.subnet.lastIndexOf('.')),
                    that.Ipv6Address =  result.subnetv6.substring(0, result.subnetv6.lastIndexOf('.'))
                }
            })
        },
        methods: {
            // Apply => Modify
            checkBtn: function checkBtn() {
                this.timerData();
                if(this.ovpnconfig.dev == 'Bridge') {
                    this.methodType = 'tap'
                }else if( this.ovpnconfig.dev == 'Router') {
                    this.methodType = 'tun'
                }
                this.inputStatus = null,
                this.lanStartInputStatus = null,
                this.lanEndInputStatus = null,
                this.btname = "Modify";
            },
            getFlow: function getFlow(flowVlueBytes) {
                var flow = "";
                if (flowVlueBytes / 1024 < 1024) {
                    flow = (Math.round(flowVlueBytes / 1024) > 0 ? Math.round(flowVlueBytes / 1024) : 0) + "KB";
                } else if (flowVlueBytes / 1024 >= 1024 && flowVlueBytes / 1024 / 1024 < 1024) {
                    flow = (Math.round(flowVlueBytes / 1024 / 1024) > 0 ? Math.round(flowVlueBytes / 1024 / 1024) : 0) + "MB";
                } else if (flowVlueBytes / 1024 / 1024 >= 1024) {
                    var gb_Flow = flowVlueBytes / 1024 / 1024 / 1024;
                    flow = gb_Flow.toFixed(1) + "GB";
                } else {
                    flow = "0KB";
                }
                return flow;
            },
            checkfile: function checkfile(target) {
                var that = this;
                this.$store.dispatch("call", {
                    api: "getovpnfilestatus"
                }).then(function (result) {
                    if (result.success) {
                        that.generate = true;
                    } else {
                        that.generate = false;
                    }
                    that.getconfig(target);
                });
            },
            generateing: function generateing() {
                var that = this;
                this.btnapy = true;
                // 创建证书
                that.$store.dispatch("call", {
                    api: "createovpncertificate",
                    data: {
                        force: 1
                    },
                    timeOut: 120000
                }).then(function (result) {
                    that.btnapy = false;
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "createovpncertificate",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        setTimeout(function () {
                            that.$store.dispatch("call", {
                                api: "getovpnfilestatus"
                            });
                        }, 3000);
                        that.generate = true;
                        that.getconfig(true);
                        // 保险措施 将Access按钮默认改为false
                        that.$store.dispatch("call", {
                            api: "ovpnblock",
                            data: {
                                enable: false
                            }
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "createovpncertificate",
                            "msg": result.code
                        });
                    }
                });
            },
            startOvpn: function startOvpn() {
                this.modifyStat = false;
                var that = this;
                clearInterval(this.timer);
                clearTimeout(this.timeout);
                if (this.ovpnstatus.status == "stopped") {
                    this.btnserver = 'started';
                    this.$store.dispatch("call", {
                        api: "ovpnstart",
                        timeOut: 30000
                    }).then(function (result) {
                        if (result.failed) {
                            that.$message({
                                "type": "error",
                                "api": "ovpnstart",
                                "msg": result.code
                            });
                            that.btnserver = 'init';
                            return;
                        }
                        if (result.success) {
                            // that.$message({
                            //     "type": "success",
                            //     "api": "ovpnstart",
                            //     "msg": result.code
                            // });
                        } else {
                            that.$message({
                                "type": "error",
                                "api": "ovpnstart",
                                "msg": result.code
                            });
                            that.btnserver = 'init';
                        }
                        that.timerData();
                        that.modifyStat = true;
                        that.timeout = setTimeout(function () {
                            if (that.btnserver != 'init') {
                                that.btnserver = 'init';
                            }
                        }, 5000);
                    });
                } else {
                    this.btnserver = 'stopped';
                    this.stopOvpn();
                }
            },
            stopOvpn: function stopOvpn() {
                var that = this;
                clearTimeout(this.timeout);
                this.$store.dispatch("call", {
                    api: "ovpnstop"
                }).then(function (result) {
                    if (result.success) {
                        // that.$message({
                        //     "type": "success",
                        //     "api": "ovpnstop",
                        //     "msg": result.code
                        // });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "ovpnstop",
                            "msg": result.code
                        });
                        that.btnserver = 'init';
                    }
                    that.timerData();
                    that.modifyStat = true;
                    that.timeout = setTimeout(function () {
                        if (that.btnserver != 'init') {
                            that.btnserver = 'init';
                        }
                    }, 5000);
                });
            },
            getconfig: function getconfig(reset) {
                var that = this;
                this.$store.dispatch("call", {
                    api: "getovpnconfig"
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "getovpnconfig",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.access = result.access;
                        if (reset) {
                            // 发送配置后台生成配置文件
                            that.$store.dispatch("call", {
                                api: "setovpnconfig",
                                data: {
                                    auth: that.ovpnconfig.auth,
                                    proto: that.ovpnconfig.proto.toLowerCase(),
                                    port: that.ovpnconfig.port,
                                    subnet: that.ovpnconfig.subnet,
                                    subnetv6: that.ovpnconfig.subnetv6,
                                    mask: that.ovpnconfig.mask,
                                    cipher: that.ovpnconfig.cipher,
                                    method: that.methodType,
                                    start: that.lanstart,
                                    end: that.lanend
                                }
                            }).then(function (result) {
                                if (result.success) {
                                    that.$message({
                                        "type": "success",
                                        "api": "setovpnconfig",
                                        "msg": result.code
                                    });
                                } else {
                                    that.$message({
                                        "type": "error",
                                        "api": "setovpnconfig",
                                        "msg": result.code
                                    });
                                }
                            });
                        }
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "getovpnconfig",
                            "msg": result.code
                        });
                    }
                });
                that.timerData();
            },
            timerData: function timerData() {
                var that = this;
                this.$store.dispatch("call", {
                    api: "ovpnstatus"
                });
                this.$store.dispatch("call", {
                    api: "getovpnconfig"
                }).then(function (result) {
                    that.access = result.access;
                });
                clearInterval(this.timer);
                if (that.generate) {
                    this.timer = setInterval(function () {
                        // that.$store.dispatch("call", {
                        //     api: "getovpnconfig"
                        // }).then(function (result) {
                        //     that.access = result.access;
                        // });
                        that.$store.dispatch("call", {
                            api: "ovpnstatus"
                        }).then(function(res) {
                            // 在这里才能拿到最新的状态
                            var status = "off";
                            if (res.status == 'started') status = 'connected';
                            that.$bus.$emit('vpnCircleStatus', 'vpnserver', status);
                        });;
                    }, 5000);
                }
            },
            blockclient: function blockclient() {
                var that = this;
                clearInterval(this.timer);
                var access = that.ovpnconfig.access;
                if (access) {
                    that.block(false);
                } else {
                    this.$store.commit("showModal", {
                        show: true,
                        message: this.$lang.modal.isOpen,
                        title: this.$lang.modal.access,
                        cb: function cb() {
                            that.block(true);
                        },
                        cancel: function cancel() {
                            that.timerData();
                            that.access = that.ovpnconfig.access;
                        }
                    });
                }
            },
            block: function block(item) {
                var that = this;
                that.blockStatus = true;
                that.$store.dispatch("call", {
                    api: 'ovpnblock',
                    data: {
                        "enable": item
                    }
                }).then(function (result) {
                    that.blockStatus = false;
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpnblock",
                            "msg": result.code
                        });
                        that.timerData();
                        return;
                    }
                    if (result.success) {
                        that.access = item;
                        that.$message({
                            "type": "success",
                            "api": "ovpnblock",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "ovpnblock",
                            "msg": result.code
                        });
                    }
                    that.timerData();
                });
            },
            // Apply vpn
            applyConfig: function applyConfig() {
                var that = this;
                clearInterval(this.timer);
                if (this.btname == "Modify") {
                    this.btnstatus = !this.btnstatus;
                    this.btname = "Apply";
                } else if (this.btname == "Apply") {
                    if (that.methodType == 'tun') {
                        if (!that.ovpnconfig.subnetv6) {
                            that.$message({
                                type: "warning",
                                msg: -2401
                            });
                            return;
                        }
                    }
                    if (!that.ovpnconfig.subnet || !that.ovpnconfig.port || !that.ovpnconfig.mask) {
                        that.$message({
                            type: "warning",
                            msg: -2401
                        });
                        return;
                    }
                    // 端口校验
                    var port = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
                    var status = port.test(this.ovpnconfig.port);
                    if (!status) {
                        that.$message({
                            type: "error",
                            msg: -216
                        });
                        this.btname = "Modify";
                        that.timerData();
                        return;
                    } // 端口校验
                    this.btnstatus = !this.btnstatus;
                    this.btnmfy = true;
                    that.btnapy = true;
                    that.$store.dispatch("call", {
                        api: "setovpnconfig",
                        data: {
                            auth: that.ovpnconfig.auth,
                            proto: that.ovpnconfig.proto.toLowerCase(),
                            port: that.ovpnconfig.port,
                            subnet: that.ovpnconfig.subnet,
                            subnetv6: that.ovpnconfig.subnetv6,
                            mask: that.ovpnconfig.mask,
                            cipher: that.ovpnconfig.cipher,
                            method: that.methodType,
                            start: that.lanstart,
                            end: that.lanend
                        }
                    }).then(function (result) {
                        if (result.success) {
                            that.btnapy = false;
                            that.$store.commit("showModal", {
                                show: true,
                                type: "success",
                                yes: "Export",
                                message: that.$lang.modal.isExportConfig,
                                no: "Cancel",
                                cb: function cb() {
                                    that.timerData();
                                    that.exportfile();
                                },
                                cancel: function cancel() {
                                    that.timerData();
                                }
                            });
                        } else {
                            that.timerData();
                            that.btnstatus = !that.btnstatus;
                            that.btnapy = false;
                            if (result.code == -223) {
                                that.$message({
                                    "type": "error",
                                    "msg": -223
                                });
                            } else  {
                                that.$message({
                                    "type": "error",
                                    "api": "setovpnconfig",
                                    "msg": result.code
                                });
                            }
                        }
                        that.btname = "Modify";
                        that.btnmfy = false;
                    });
                }
            },
            exportfile: function exportfile() {
                var token = Cookies.get('Admin-Token');
                var getTime = new Date().getTime();
                window.location = "/api/ovpn/server/export?token="+token+"&_="+ getTime
            },
            validate: function validate() {
                var ipReg1 = /^10(?:\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
                    ipReg2 = /^172\.(1[6-9]|2\d|3[01])(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){2}$/,
                    ipReg3 = /^192\.168(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){2}$/;
                var isValid = ipReg1.test(this.ovpnconfig.subnet) || ipReg2.test(this.ovpnconfig.subnet) || ipReg3.test(this.ovpnconfig.subnet);
                if (isValid) {
                    this.inputStatus = "success";
                    this.IpAddress = this.ovpnconfig.subnet.substring(0, this.ovpnconfig.subnet.lastIndexOf('.'))
                } else {
                    this.inputStatus = "error";
                }
            },
            validatev6: function validatev6() {
                var ipReg = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/
                var isValid = ipReg.test(this.ovpnconfig.subnetv6);
                if (isValid) {
                    this.inputV6Status = "success";
                    this.Ipv6Address = this.ovpnconfig.subnetv6.substring(0, this.ovpnconfig.subnetv6.lastIndexOf('.'))
                } else {
                    this.inputV6Status = "error";
                }
            },
            lanStartVaildate: function lanStartVaildate() {
                var reg = /^\d+$/
                if (reg.test(this.lanstart)) {
                    if (parseInt(this.lanstart) && parseInt(this.lanstart) > 254 || parseInt(this.lanstart) <= 1) {
                        this.lanStartInputStatus = "error"
                    } else {
                        if (!this.lanstart) {
                            this.lanStartInputStatus = "error"
                        } else {
                            if (parseInt(this.lanstart) >= parseInt(this.lanend)) {
                                this.lanStartInputStatus = "error"
                            } else {
                                this.lanStartInputStatus = "success"
                                this.lanEndInputStatus = "success"
                            }
                        }
                    }
                } else {
                    this.lanStartInputStatus = "error"
                }
            },
            lanEndVaildate: function lanEndVaildate() {
                var reg1 = /^\d+$/
                this.initialStutas = false
                if (reg1.test(this.lanend)) {
                    if (parseInt(this.lanend) && parseInt(this.lanend) > 254 || parseInt(this.lanend) <= 1) {
                        this.lanEndInputStatus = "error"
                    } else {
                        if (!this.lanend) {
                            this.lanEndInputStatus = "error"
                        } else {
                            if (parseInt(this.lanstart) >= parseInt(this.lanend)) {
                                this.lanEndInputStatus = "error"
                            } else {
                                if (parseInt(this.lanstart) <= 1) {
                                    this.lanEndInputStatus = "error"
                                }else{
                                    this.lanEndInputStatus = "success"
                                    this.lanStartInputStatus = "success"
                                }
                            }
                        }
                    }
                } else {
                    this.lanEndInputStatus = "error"
                }
            },
            changeType: function changeType(val) {
                var that = this
                if(val == 'Bridge') {
                    this.methodType = 'tap'
                    that.ovpnconfig.access = true
                    this.$store.dispatch("call", {
                        api: 'ovpnblock',
                        data: {
                            "enable": true
                        }
                    }).then(function(result) {
                        if(result.success){
                            that.access = true;
                            that.blockStatus = true
                        }
                    })
                }else if(val == 'Router') {
                    that.blockStatus = false
                    this.methodType = 'tun'
                }
            },
            selectEncryption: function selectEncryption(val) {
                var that = this;
                if (val == 'CHACHA20-POLY1305' && this.judgeShowModal) {
                    that.$store.commit("showModal", {
                        show: true,
                        title: "Caution",
                        type: "warning",
                        message: that.t("Please don't use a GL router with firmware version below 3.105 to connect to this server when using this cipher(This cipher is only supported since firmware version 3.105)."),
                        yes: "OK",
                        showCancelBtn: false,
                        cancel: function cancel() {
                            // that.KeepPackagesBtn = false;
                        }
                    })
                    this.judgeShowModal = false;
                } else {
                    this.judgeShowModal = true;
                }
            }
        }
    });
    return vueComponent;
});
"use strict";

define(["text!temple/vpnclient/index.html", "component/gl-btn/index", "component/modal/modal", "component/gl-upload-file/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index", "vue", "component/gl-toggle-btn/index"], function (tmple, gl_btn, modal, gl_upload, gl_input, gl_tooltip, gl_select, Vue, gl_toggle) {
    var vueComponent = Vue.extend({
        template: tmple,
        components: {
            "gl-btn": gl_btn,
            "gl-modal": modal,
            "gl-upload": gl_upload,
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip,
            "gl-select": gl_select,
            "gl-tg-btn": gl_toggle
        },
        data: function data() {
            return {
                timer: "",
                isOnly: false,
                curClientIndex: 0, //the current config client index in clients Array
                curStatusIndex: null, //the index of client which has status
                // isResetConnect: false, //is reset the loading status of connect button
                clients: [], //the data of clients, including others js add on,
                curServerIndex: 0, //which client's config server button is click
                curServerList: null, //the serverlist of the curConfigClientIndex
                curserverName: null,
                btnName: "",
                showModal: false,
                pageState: true,
                sta: "",
                code: "",
                vpnNumHtml: 0,
                dspText: "",
                usText: "",
                pswText: "",
                passText:'',
                // stxt: "",
                vpnState: true,
                addState: false,
                showvpnlist: false,
                btnStatus: "default",
                pswInfo: false,
                needauth: false,
                needInfo: false,
                connectStatus: false,
                id: "",
                vpnstatus: 'init',
                vpnsuccess: "init",
                timeOut: null,
                rmStatus: false,
                checkServer: false,
                errorMsg: '',
                currentVpn: '',
                defaultName: '',
                defaultIndex: 0,
                serverChange: false,
                serverIndex: 0,
                settingStatus: false,
                removeStatus: false,
                index: 0,
                Admin: false,
                policyStatus:false,
                msgModal: false,
                isEnable: false,
                showIpv6Mode6Info: false,
                blockStatus: false,
                access: false
            };
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
            clearInterval(this.timer);
            clearTimeout(this.timeOut);
            next();
        },
        computed: {
            ovpnGetClients: function ovpnGetClients() {
                return this.$store.getters.apiData["ovpnGetClients"];
            },
            getclientstatus: function getclientstatus() {
                var ovpnclientStatus = this.$store.getters.apiData["ovpngetclientstatus"];
                this.showIpv6Mode6Info = ovpnclientStatus.mode6 == 'Native' ? true : false;
                this.access = ovpnclientStatus.access;
                return this.$store.getters.apiData["ovpngetclientstatus"];
            },
            showClientPanel: function showClientPanel() {
                return this.ovpnGetClients.clients && this.ovpnGetClients.clients.length != 0;
            },
            disableConfig: function disableConfig() {
                return this.getclientstatus && this.getclientstatus.enable && this.getclientstatus.status != "off";
            },
            status: function status() {
                var config = this.getclientstatus ? this.getclientstatus.config : null;
                var clientID = config ? config.split("/")[3] : null;
                if (this.getclientstatus && this.getclientstatus.enable && this.getclientstatus.status == "connected") {
                    this.curStatusIndex = this.getClientIndex(clientID);
                    this.curClientIndex = this.curStatusIndex;
                    this.btnName = "Disconnect";
                    this.btnStatus = "danger";
                    return "connected";
                }
                if (this.getclientstatus && this.getclientstatus.enable && this.getclientstatus.status == "connecting") {
                    this.curStatusIndex = this.getClientIndex(clientID);
                    this.curClientIndex = this.curStatusIndex;
                    this.btnName = "Abort";
                    this.btnStatus = "danger";
                    return "connecting";
                }
                // if (this.getclientstatus && this.getclientstatus.enable && this.getclientstatus.status == "off") {
                //     this.curStatusIndex = this.getClientIndex(clientID);
                //     this.btnName = "Connect";
                //     this.btnStatus = "default";
                //     return "failed";
                // }
                if (this.getclientstatus && this.getclientstatus.enable && this.getclientstatus.status == "off") {
                    this.curStatusIndex = this.getClientIndex(clientID);
                    this.btnName = "Abort";
                    this.btnStatus = "danger";
                    return "connecting";
                }
                this.btnName = "Connect";
                this.btnStatus = "default";
                return "off";
            },
            circleClass: function circleClass() {
                if (this.status == "connected") {
                    return "active";
                }
                if (this.status == "connecting") {
                    return "waiting";
                }
                if (this.status == "failed" && this.getclientstatus.config) {
                    return "failed";
                }
                return null;
            },
            errMsgs: function errMsgs() {
                return this.getclientstatus && this.getclientstatus.errormsg && this.getclientstatus.errormsg.replace(/\s|\xA0/g, "") ? this.getclientstatus.errormsg.split("\n") : [];
            },
            msgList: function msgList() {
                return this.errMsgs.filter(function (val) {
                    return val != '';
                }) || [];
            },
            ipAdr: function ipAdr() {
                return this.getclientstatus && this.getclientstatus.data ? this.getclientstatus.data.ipaddr : "";
            },
            ipAdrv6:function ipAdrv6() {
                return this.getclientstatus && this.getclientstatus.data ? this.getclientstatus.data.ipaddrv6 : "";
            },
            dataRC: function dataRC() {
                if (this.getclientstatus && this.getclientstatus.data) {
                    var sent = this.getclientstatus.data.tx_bytes;
                    var recv = this.getclientstatus.data.rx_bytes;
                    sent = this.getFlow(sent);
                    recv = this.getFlow(recv);
                    return recv + " / " + sent;
                }
            },
            vpnadState: function vpnadState() {
                if (!this.dspText || this.getLen(this.dspText) > 32) {
                    return true;
                }
                if (this.pswInfo) {
                    if (this.needauth) {
                        if (!this.usText || !this.pswText || this.getLen(this.usText) > 512 || this.getLen(this.pswText) > 512) {
                            return true;
                        }
                    }
                    if (this.needInfo) {
                        if (!this.passText || this.getLen(this.passText) > 512) {
                            return true;
                        }
                    }
                }
                return false;
            },
            // 动态改变当前连接的client
            currSel: function currSel() {
                var item = "";
                if (this.status != "off" && this.status != "failed") {
                    if (this.getclientstatus && this.getclientstatus.config) {
                        var vpnIndex = this.getclientstatus.config.split("/")[3];
                        
                        if (this.clients && this.clients.length > 0 && this.ovpnGetClients.clients && this.ovpnGetClients.clients.length > 0) {
                            var len = this.ovpnGetClients.clients.length;
                            for (var i = 0; i < len; i++) {
                                if (this.index == 0) {
                                    this.getId(vpnIndex);
                                }
                                this.index = 1;
                                
                                if (vpnIndex == this.clients[i].id) {
                                    item = this.clients[i]['newDescription'];
                                    break;
                                }
                            }
                        }
                    }
                }
                this.currentVpn = item || this.currentVpn;
                return item;
            },
            checkVpn: function checkVpn() {
                if (this.vpnstatus != 'init') {
                    // this.vpnstatus == this.getclientstatus.status || this.vpnsuccess == this.getclientstatus.status
                    if (this.vpnstatus == this.getclientstatus.enable) {
                        this.vpnstatus = 'init';
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            },
            router: function router() {
                return this.$store.getters.apiData['router_mini'];
            }
        },
        watch: {
            currSel: function currSel(data) {
                // console.log(data)
            },
            status: {
                handler: function(val, oldVal) {
                    this.$bus.$emit('vpnCircleStatus', 'vpnclient', val);
                }
            }
        },
        created: function created() {
            var that = this;
            this.getData();
            that.$store.dispatch("call", {
                api: "getpolicy"
            }).then(function (result) {
                if (result.success) {
                    that.policyStatus = result.enable;
                }
            });
            if (this.status != "off") {
                this.currentVpn = this.currSel;
            }
            if (!this.showClientPanel) {
                clearInterval(this.timer);
            }
        },
        methods: {
            setClient: function setClient(target) {
                var that = this;
                var enable = false;
                this.checkServer = false;
                if (this.btnName == "Connect" || target == 'check') {
                    that.connectStatus = true;
                    that.settingStatus = true;
                    if (this.defaultName != this.clients[this.defaultIndex].defaultserver) {
                        this.modifyClient(this.defaultIndex, 'change');
                        setTimeout(function () {
                            that.timeout(enable, target);
                        }, 3000);
                    } else {
                        that.timeout(enable, target);
                    }
                } else {
                    that.checkClient(enable);
                }
            },
            timeout: function timeout(enable, target) {
                var that = this;
                var enable = enable;
                enable = true;
                if (target == 'check') {
                    that.checkClient(enable);
                    setTimeout(function () {
                        that.connectStatus = false;
                        that.settingStatus = false;
                    }, 10000);
                } else {
                    // that.$store.dispatch("call", {
                    //     api: 'internetreachable',
                    //     async: true
                    // }).then(function (result) {
                    //     if (!result.reachable) {
                    //         that.$message({
                    //             type: 'warning',
                    //             msg: -210
                    //         });
                        // } else {
                            that.checkClient(enable);
                        // }
                        that.connectStatus = false;
                        that.settingStatus = false;
                    // });
                }
            },
            handleClose: function handleClose() {
                this.msgModal = false
                var code = 0
                var that = this
                var enable = this.isEnable
                if (enable) {
                    code = -206;
                    this.vpnstatus = true;
                    // this.vpnstatus = 'connecting';
                    // this.vpnsuccess = 'connected';
                } else {
                    if (this.status == 'connecting') {
                        that.connectStatus = true;
                    }
                    code = -205;
                    // this.vpnstatus = 'off';
                    this.vpnstatus = false;
                }
                clearInterval(that.timer);
                clearTimeout(that.timeOut);
                this.$store.dispatch("call", {
                    api: "ovpnsetclient",
                    data: {
                        enableovpn: enable,
                        ovpnclientid: this.id,
                        force_client: this.getclientstatus.force
                    },
                    timeOut: 10000
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpnsetclient",
                            "msg": result.code
                        });
                        that.vpnstatus = 'init';
                        that.vpnsuccess = 'init';
                        return;
                    }
                    if (result.success) {
                        // that.$message({
                        //     "type": "success",
                        //     "api": "ovpnsetclient",
                        //     "msg": result.code
                        // });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "ovpnsetclient",
                            "msg": result.code
                        });
                        that.vpnstatus = 'init';
                        that.vpnsuccess = 'init';
                    }
                    that.timeOut = setTimeout(function () {
                        if (that.vpnstatus != 'init' || that.vpnsuccess != 'init') {
                            that.vpnstatus = 'init';
                            that.vpnsuccess = 'init';
                        }
                    }, 16000);
                    setTimeout(function () {
                        that.$store.dispatch("call", {
                            api: "ovpngetclientstatus"
                        }).then(function(result){
                            if (result.enable && result.code == 0) {
                                that.timer = setInterval(function () {
                                    that.$store.dispatch("call", {
                                        api: "ovpngetclientstatus"
                                    });
                                }, 1000);
                            }
                        })
                        that.connectStatus = false;
                    }, 5000);
                });
            },
            // open or close ovpnclient
            checkClient: function checkClient(enable) {
                var clientsList = this.clients
                var isBridge = ''
                var that = this;
                for (var i = 0; i< clientsList.length; i++) {
                    if (clientsList[i].id == this.id) {
                        isBridge = clientsList[i].bridge
                    }
                }
                if (isBridge == 'tap' && this.btnName == 'Connect') {
                    // 这里出现弹窗
                    that.msgModal = true,
                    that.isEnable = enable
                } else {
                    var code = 0;
                    if (enable) {
                        code = -206;
                        this.vpnstatus = true;
                        // this.vpnstatus = 'connecting';
                        // this.vpnsuccess = 'connected';
                    } else {
                        if (this.status == 'connecting') {
                            that.connectStatus = true;
                        }
                        code = -205;
                        // this.vpnstatus = 'off';
                        this.vpnstatus = false;
                    }
                    clearInterval(that.timer);
                    clearTimeout(that.timeOut);
                    this.$store.dispatch("call", {
                        api: "ovpnsetclient",
                        data: {
                            enableovpn: enable,
                            ovpnclientid: this.id,
                            force_client: this.getclientstatus.force
                        },
                        timeOut: 10000
                    }).then(function (result) {
                        if (result.failed) {
                            that.$message({
                                "type": "error",
                                "api": "ovpnsetclient",
                                "msg": result.code
                            });
                            that.vpnstatus = 'init';
                            that.vpnsuccess = 'init';
                            return;
                        }
                        if (result.success) {
                            // that.$message({
                            //     "type": "success",
                            //     "api": "ovpnsetclient",
                            //     "msg": result.code
                            // });
                        } else {
                            that.$message({
                                "type": "error",
                                "api": "ovpnsetclient",
                                "msg": result.code
                            });
                            that.vpnstatus = 'init';
                            that.vpnsuccess = 'init';
                        }
                        that.timeOut = setTimeout(function () {
                            if (that.vpnstatus != 'init' || that.vpnsuccess != 'init') {
                                that.vpnstatus = 'init';
                                that.vpnsuccess = 'init';
                            }
                        }, 16000);
                        setTimeout(function () {
                            that.$store.dispatch("call", {
                                api: "ovpngetclientstatus"
                            }).then(function(result){
                                that.$bus.$emit('vpnCircleStatus', 'vpnclient', result.status);
                                if (result.enable && result.code == 0) {
                                    that.timer = setInterval(function () {
                                        that.$store.dispatch("call", {
                                            api: "ovpngetclientstatus"
                                        });
                                    }, 1000);
                                }
                            })
                            that.connectStatus = false;
                        }, 5000);
                    });
                }
            },
            getservers: function getservers(data) {
                var that = this;
                this.$store.dispatch("call", {
                    api: "ovpngetserverlist",
                    data: {
                        ovpnclientid: data.id
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpngetserverlist",
                            "msg": result.code
                        });
                        return;
                    }
                    data.serverlist = result.serverlist;
                    if (result.serverlist) {
                        data.serverCount = result.serverlist.length;
                    } else {
                        data.serverCount = 0;
                    }
                });
            },
            getRunningState: function getRunningState() {
                var that = this;
                this.$store.dispatch('call', {
                    api: 'router_mini'
                });
            },
            removeClient: function removeClient(index) {
                var _this = this;
                var msg = this.t(this.$lang.modal.delConfig) + "?";
                var isAll = false;
                if (index == 'all') {
                    msg = this.$lang.modal.delProfiles_all;
                    isAll = true;
                    this.$store.commit("showModal", {
                        show: true,
                        title: "Caution",
                        message: msg,
                        messageTwo: this.$lang.modal.dela,
                        cb: function cb() {
                            isAll ? _this.rmAll() : _this.remove(index);
                            setTimeout(function() {
                                _this.getRunningState();
                            }, 5000);
                        }
                    });
                } else {
                    this.$store.commit("showModal", {
                        show: true,
                        title: "Caution",
                        message: msg,
                        cb: function cb() {
                            isAll ? _this.rmAll() : _this.remove(index);
                            setTimeout(function() {
                                _this.getRunningState();
                            }, 5000);
                        }
                    });
                }
            },
            rmAll: function rmAll() {
                var that = this;
                that.rmStatus = true;
                that.$store.dispatch("call", {
                    api: 'ovpnrmall'
                }).then(function (result) {
                    that.rmStatus = false;
                    if (result.failed) {
                        that.$message({
                            type: "error",
                            msg: result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            type: "success",
                            msg: result.code
                        });
                        that.currentVpn = '';
                        that.getData();
                    } else {
                        var type = 'error';
                        if (result.code == '-302') {
                            that.currentVpn = '';
                            type = "warning";
                            that.getData();
                        }
                        that.$message({
                            type: type,
                            msg: result.code
                        });
                    }
                });
            },
            remove: function remove(index) {
                var that = this;
                this.$store.dispatch("call", {
                    api: "ovpnremoveclient",
                    data: {
                        clientid: this.clients[index].id
                    }
                }).then(function (result) {
                    $(".vpn-manage-body").collapse("hide");
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpnremoveclient",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        if (that.clients[index]['description'] == that.currentVpn) {
                            that.currentVpn = '';
                        }
                        that.clients.splice(index, 1);
                        that.getData();
                        if (that.curClientIndex > index) {
                            that.curClientIndex = that.curClientIndex - 1;
                            return;
                        }
                        if ((that.status == "off" || that.status == "failed") && that.curClientIndex == index) {
                            that.curClientIndex = 0;
                            return;
                        }
                    } else {
                        var type = 'error';
                        if (result.code == -302) {
                            if (that.clients[index]['description'] == that.currentVpn) {
                                that.currentVpn = '';
                            }
                            that.getData();
                            type = 'warning';
                        }
                        that.$message({
                            type: type,
                            api: "ovpnremoveclient",
                            msg: result.code
                        });
                    }
                });
            },
            modifyClient: function modifyClient(index, target) {
                var that = this;
                if (target == "change") {
                    clearInterval(that.timer);
                    clearTimeout(that.timeOut);
                }
                var id = this.clients[index].id;
                var server = target == "change" ? this.defaultName : this.clients[index].newServer;
                var description = this.clients[index].newDescription ? this.clients[index].newDescription.replace(/\s|\xA0/g, "") : null;
                var username = this.clients[index].newUsername ? this.clients[index].newUsername.replace(/\s|\xA0/g, "") : null;
                var password = this.clients[index].newPassword ? this.clients[index].newPassword : null;
                var isDescriptionValid = this.isDescriptionValid(index, description);
                if (/\s|\xA0/g.test(password)) {
                    this.$message({
                        type: 'warning',
                        msg: -4
                    });
                    return;
                }
                if (!description) {
                    this.$message({
                        type: 'warning',
                        msg: -2300
                    });
                    return;
                }
                if (this.getLen(description) > 32 || this.getLen(username) > 512 || this.getLen(password) > 512) {
                    this.$message({
                        type: "error",
                        msg: -22
                    });
                    return;
                }
                if (description != null && description.length == 0) {
                    this.clients[index].desTooltipMsg = this.$lang.vpnclient.dontEmpty + "!";
                } else if (isDescriptionValid == false) {
                    this.clients[index].desTooltipMsg = this.$lang.vpnclient.alreadyExists + "!";
                } else if (username != null && username.length == 0) {
                    this.clients[index].userTooltipMsg = this.$lang.vpnclient.dontEmpty + "!";
                } else if (password != null && password.length == 0) {
                    this.clients[index].pwdTooltipMsg = this.$lang.vpnclient.dontEmpty + "!";
                } else {
                    var data;
                    if (this.clients[index].passphrase) {
                        data = {
                            clientid: id,
                            defaultserver: server,
                            description: description,
                            passphrase: password == null ? "" : password
                        };
                    } else {
                        data = {
                            clientid: id,
                            defaultserver: server,
                            description: description,
                            username: username == null ? "" : username,
                            password: password == null ? "" : password
                        };
                    }
                    this.$store.dispatch("call", {
                        api: "ovpnmodifyclient",
                        data: data
                    }).then(function (result) {
                        if (result.failed) {
                            that.$message({
                                "type": "error",
                                "api": "ovpnmodifyclient",
                                "msg": result.code
                            });
                            return;
                        }
                        if (result.success) {
                            if (target !== 'change') {
                                that.$message({
                                    "type": "success",
                                    "api": "ovpnmodifyclient",
                                    "msg": result.code
                                });
                            }
                            if (that.clients[index]['description'] == that.currentVpn) {
                                that.currentVpn = description;
                                that.defaultName = server;
                            }
                            that.$set(that.clients[index], "description", description);
                            that.$set(that.clients[index], "newDescription", description);
                            that.$set(that.clients[index], "newUsername", username);
                            that.$set(that.clients[index], "newPassword", password);
                            that.$set(that.clients[index], "defaultserver", server);
                            that.$set(that.clients[index], "newServer", server);
                            // that.getData();
                        } else {
                            that.$message({
                                "type": "error",
                                "api": "ovpnmodifyclient",
                                "msg": result.code
                            });
                        }
                    });
                }
            },
            onupload: function onupload(ajaxData) {
                var that = this;
                that.sta = "uploading";
                that.vpnState = true;
                that.vpnNumHtml = 0;
                that.getRunningState()
                // 2097152 = 2M
                if (ajaxData.size / 1024 >= this.router.flash.flash_free) {
                    that.sta = "error";
                    that.$message({
                        type: 'error',
                        msg: -3002
                    });
                    that.errorMsg = 'Not Enough Space';
                    return;
                }
                if (ajaxData.errMsg) {
                    that.sta = "error";
                    that.errorMsg = ajaxData.errMsg;
                    return;
                }
                this.$store.dispatch("call", {
                    api: "ovpnuploadconfigpack",
                    data: ajaxData.ajaxData,
                    timeOut: 240000
                }).then(function (result) {
                    if (result.success) {
                        // that.vpnState = false;
                        // if (that.vpnNumHtml == 0) {
                        //     that.sta = "error";
                        //     return
                        // }

                        that.resetSta();
                        that.getRunningState();
                        that.verifyFirmware();
                    } else {
                        that.code = result.code;
                        that.sta = "error";
                        that.errorMsg = that.$lang.errorcode[result.code];
                    }
                });
            },
            addVpnClient: function addVpnClient() {
                // 配置名去重校验
                if (this.clients) {
                    for (var k in Object.keys(this.clients)) {
                        if (this.dspText == this.clients[k].newDescription) {
                            this.$message({
                                type: "error",
                                msg: -15
                            });
                            return;
                        }
                    }
                }
                var that = this;
                // var name = that.usText.replace(/\s|\xA0/g, "");
                // var description = that.dspText.replace(/\s|\xA0/g, "");
                // var password = that.pswText.replace(/\s|\xA0/g, "");
                if (this.getLen(that.dspText) > 32 || this.getLen(that.usText) > 512 || this.getLen(that.pswText) > 512 || this.getLen(that.passText) > 512) {
                    this.$message({
                        type: "error",
                        msg: -22
                    });
                    return;
                }
                var data = {}
                data.description = that.dspText
                if (that.needauth) {
                    data.username = that.usText
                    data.password = that.pswText
                }
                if (that.needInfo) {
                    data.passphrase = that.passText
                }
                that.addState = true;
                that.showModal = false;
                that.$store.dispatch("call", {
                    api: "ovpngenerateclient",
                    data: data,
                    timeOut: 600000
                }).then(function (result) {
                    that.closeModal("add");
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpngenerateclient",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.checkServer = false;
                        that.$message({
                            "type": "success",
                            "api": "ovpngenerateclient",
                            "msg": result.code
                        });
                        that.getData();
                        that.$store.dispatch("call",{
                            api : "router_mini"
                        })
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "ovpngenerateclient",
                            "msg": result.code
                        });
                    }
                });
            },
            verifyFirmware: function verifyFirmware() {
                var that = this;
                that.pswInfo = false;
                that.needauth = false;
                that.needInfo = false;
                this.$store.dispatch("call", {
                    api: "ovpncheckconfigpack",
                    timeOut: 30000
                }).then(function (result) {
                    if (result.failed) {
                        that.vpnNumHtml = 0;
                        that.$message({
                            "type": "error",
                            "api": "ovpncheckconfigpack",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.errorMsg = '';
                        that.sta = "success";
                        // that.$message({
                        //     "type": "success",
                        //     "api": "ovpncheckconfigpack",
                        //     "msg": result.code

                        // });
                        var iPassedNum = result.passed.length;
                        // var iFailedNum = that.getJsonObjLen(result.unpassed);
                        var iNeedAuthNum = that.getJsonObjLen(result.needauth);
                        var iNeedInfoNum = that.getJsonObjLen(result.needinfo);
                        that.vpnNumHtml = iPassedNum + iNeedAuthNum + iNeedInfoNum;
                        if (that.vpnNumHtml == 0) {
                                that.sta = "error";
                                return
                            }
                        that.vpnState = false;
                        if (iNeedAuthNum == 0 && iNeedInfoNum == 0) {
                            that.pswInfo = false;
                        } else {
                            if (iNeedInfoNum != 0) {
                                that.needInfo = true;
                            }
                            if (iNeedAuthNum != 0) {
                                that.needauth = true;
                            }
                            that.pswInfo = true;
                        }
                    } else {
                        that.vpnNumHtml = 0;
                    }
                });
            },
            getJsonObjLen: function getJsonObjLen(obj) {
                return Object.keys(obj).length;
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
            getData: function getData() {
                var that = this;
                that.clients = [];
                this.$store.dispatch("call", {
                    api: "ovpnGetClients"
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpnGetClients",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        var clients = result.clients;
                        var len = clients.length;
                        if (clients && len > 0) {
                            for (var i = 0; i < len; i++) {
                                clients[i].collapseItemID = "item" + i;
                                clients[i]["serverCount"] = 0;
                                clients[i]["newDescription"] = clients[i].description;
                                clients[i]["newUsername"] = clients[i].username;
                                clients[i]["newPassword"] = clients[i].password ? clients[i].password : clients[i].passphrase;
                                clients[i]["passphrase"] = clients[i].password ? false : true;
                                clients[i]["checked"] = false;
                                clients[i]["newServer"] = clients[i].defaultserver;
                                // 获取对应的子配置
                                that.clients.push(clients[i]);
                                that.getservers(that.clients[i]);
                                if (result.current_server && that.clients[i]['description'] == result.current_server) {
                                    var description = that.clients[i];
                                    that.clients.splice(i,1);
                                    that.clients.unshift(description)
                                }
                                
                            }
                        }
                        that.$store.dispatch("call", {
                            api: "ovpngetclientstatus"
                        }).then(function (result) {
                            that.$bus.$emit('vpnCircleStatus', 'vpnclient', result.status);
                            if (result.enable) {
                                that.timer = setInterval(function () {
                                    that.$store.dispatch("call", {
                                        api: "ovpngetclientstatus"
                                    });
                                }, 5000);
                            }
                        });
                    } else {
                        // console.log("getclients success " + result.success + " ," + result.error);
                    }
                });
            },
            // 删除配置中的 server 齿轮
            removeList: function removeList(index) {
                var that = this;
                var curserver = this.clients[this.curServerIndex];
                var serverfilename = this.curServerList[index];
                that.$message({
                    "duration": 3000
                });
                this.$store.dispatch("call", {
                    api: "ovpnremoveclient",
                    data: {
                        clientid: curserver.id,
                        serverfilename: serverfilename
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpnremoveclient",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "ovpnremoveclient",
                            "msg": result.code
                        });
                        that.getData();
                        that.showvpnlist = false;
                        $(".vpn-manage-body").collapse("hide");
                    }
                });
            },
            // 列表排序
            mySorter: function mySorter(a, b) {
                if (/^\d/.test(a) ^ /^\D/.test(b)) return a > b ? 1 : a == b ? 0 : -1;
                return a < b ? -1 : a == b ? 0 : 1;
            },

            // 显示当前vpn配置列表
            showServerList: function showServerList(index, page) {
                if (page == "Admin") {
                    this.Admin = true;
                }
                this.clients[this.defaultIndex].serverlist = this.clients[this.defaultIndex].serverlist.sort(this.mySorter);
                if (this.settingStatus) return;
                this.showvpnlist = true;
                if (index == 'change') {
                    this.Admin = false;
                    this.removeStatus = true;
                    this.curServerList = this.clients[this.defaultIndex].serverlist.sort(this.mySorter);
                    this.curserverName = this.defaultName;
                } else {
                    this.removeStatus = false;
                    this.curServerList = this.clients[index].serverlist.sort(this.mySorter);
                    this.curServerIndex = index;
                    this.curserverName = this.clients[index].newServer;
                }
            },
            // 设置当前vpn配置选择的配置
            setlist: function setlist(index) {
                this.serverIndex = index;
                if (this.Admin) {
                    // this.checkServer = false;
                    this.$set(this.clients[this.curServerIndex], "newServer", this.curServerList[index]);
                } else {
                    this.defaultName = this.curServerList[index];
                    if (this.defaultName == this.clients[this.defaultIndex].defaultserver) {
                        this.checkServer = false;
                    } else {
                        this.checkServer = true;
                    }
                }
                this.curserverName = this.curServerList[index];
                // this.$set(this.clients[this.curServerIndex], "defaultserver", this.curserverName);
                $(".vpnlistcollapse").collapse("hide");
            },
            chooseClient: function chooseClient(clientIndex) {
                this.curClientIndex = clientIndex;
            },
            getCheck: function getCheck() {
                var that = this;
                if (this.status == "connected" || this.status == "connecting") {
                    var vpnIndex = this.getclientstatus.config.split("/")[3];
                    if (this.id == vpnIndex) {
                        this.checkServer = false;
                        clearInterval(that.timer);
                        that.timer = setInterval(function () {
                            that.$store.dispatch("call", {
                                api: "ovpngetclientstatus"
                            });                            
                        }, 5000);
                    } else {
                        clearInterval(that.timer);
                        this.checkServer = true;
                    }
                }
            },
            getId: function getId(id) {
                for (var key in this.clients) {
                    if (this.clients[key].id == id) {
                        this.defaultName = this.clients[key].defaultserver;
                        this.defaultIndex = key;
                        break;
                    }
                }
                return this.id = id;
            },
            generateId: function generateId(name, id) {
                return name + "_" + id;
            },
            openModal: function openModal(item) {
                if (item == "add") {
                    this.showModal = true;
                } else {
                    this.showvpnlist = true;
                }
            },
            closeModal: function closeModal(item) {
                var that = this;
                if (item == "add") {
                    this.showModal = false;
                    that.sta = "";
                    that.pageState = true;
                    that.vpnState = true;
                    that.addState = false;
                    that.resetSta();
                } else {
                    this.showvpnlist = false;
                }
            },
            resetSta: function resetSta() {
                var that = this;
                that.dspText = "";
                that.pswText = "";
                that.passText = "";
                that.usText = "";
                that.vpnNumHtml = 0;
            },
            getBack: function getBack() {
                this.pageState = true;
            },
            isDescriptionValid: function isDescriptionValid(clientIndex, description) {
                for (var x in this.clients) {
                    if (clientIndex == x) {
                        continue;
                    }
                    if (description == this.clients[x].description) {
                        return false;
                    }
                }
                return true;
            },
            getClientIndex: function getClientIndex(clientID) {
                if (clientID) {
                    for (var x in this.clients) {
                        var id = this.clients[x].id;
                        if (id == clientID) {
                            return x;
                        }
                    }
                }
                return null;
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
            },
            checkCollapse: function checkCollapse(data) {
                // for(var i = 0; i < this.clients.length; i++) {
                //     var id = 'item' + i
                //     $('#' + id).collapse('hide')
                // }
                // $('#' + data).collapse("show")
            },
            blockclient: function blockclient() {
                var that = this;
                clearInterval(this.timer);
                var access = that.getclientstatus.access;
                if (access) {
                    that.block(false);
                } else {
                    this.$store.commit("showModal", {
                        show: true,
                        message: this.t('If you turn on this function, server will be able to access your local files. Do you want to turn on this option?'),
                        title: this.$lang.modal.access,
                        cb: function cb() {
                            that.block(true);
                        },
                        cancel: function cancel() {
                            that.$store.dispatch("call", {
                                api: "ovpngetclientstatus"
                            });
                            that.access = that.getclientstatus.access;
                        }
                    });
                }
            },
            block: function block(item) {
                var that = this;
                that.blockStatus = true;
                that.$store.dispatch("call", {
                    api: 'ovpncblock',
                    data: {
                        "enable": item
                    }
                }).then(function (result) {
                    that.blockStatus = false;
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "ovpncblock",
                            "msg": result.code
                        });
                        that.timerData();
                        return;
                    }
                    if (result.success) {
                        that.access = item;
                        that.$message({
                            "type": "success",
                            "api": "ovpncblock",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "ovpncblock",
                            "msg": result.code
                        });
                    }
                    that.$store.dispatch("call", {
                        api: "ovpngetclientstatus"
                    });
                });
            }
        }
    });
    return vueComponent;
});
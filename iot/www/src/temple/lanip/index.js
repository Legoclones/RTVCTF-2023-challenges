"use strict";

define(["text!temple/lanip/index.html", "vue", "component/gl-btn/index", "css!temple/lanip/index.css", "component/gl-select/index", "component/gl-input/index", "component/select/index", "component/modal/modal"], function (stpl, Vue, gl_btn, css, gl_select, gl_input, select, gl_modal) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                timer: "",
                disableBtn: true,
                inputStatus: null,
                lanStartInputStatus: null,
                lanEndInputStatus: null,
                guestStartInputStatus: null,
                guestEndInputStatus: null,
                GuestStatus: null,
                newIP: null,
                oldIP: null,
                guestoldIP: null,
                guestnewIP: null,
                alertMsg: this.$lang.lanip.alertMsg,
                btnMove: false,
                applyMove: false,
                initialStutas: true,
                guestinitialStutas: true,
                leasesList: [],
                receive: [],
                nameList: [],
                mac: "",
                mobilemac: '',
                ip: "",
                names: '',
                macREG: /^[A-Fa-f0-9]{1,2}\:[A-Fa-f0-9]{1,2}\:[A-Fa-f0-9]{1,2}\:[A-Fa-f0-9]{1,2}\:[A-Fa-f0-9]{1,2}\:[A-Fa-f0-9]{1,2}$/,
                ipREG: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
                currentIndex: -1,
                addStatus: false, //add禁用其他
                modifyStatus: false, //修改状态 
                modifyIndex: -1, //修改索引
                delStatus: false, //删除状态
                delIndex: -1, //删除索引
                modal: false,
                deleteAllStatus: false, //删除全部状态
                wlaninfoIp: "",
                wlaninfoMask: "",
                isValip: false,
                staticValMask: "",
                staticGuestValMask: "",
                lanstart: "",
                lanlimit: "",
                gueststart: "",
                gueslimit: "",
                laninfoIPAdress: "",
                guestinfoIPAdress: "",
                receiveList: []
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-select": gl_select,
            "gl-input": gl_input,
            "select": select,
            "gl-modal": gl_modal
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
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnMove) {
                next();
                return;
            }
            this.$message({
                "type": "warning",
                "msg": -1500,
                "duration": 1000
            });
        },
        mounted: function mounted() {
            var that = this;
            that.$store.dispatch("call", {
                api: "laninfo"
            }).then(function (result) {
                if (result.success) {
                    that.oldIP = result.ip;
                    that.staticValMask = result.netmask
                    that.lanstart = result.start
                    that.lanlimit = result.limit
                    that.laninfoIPAdress = result.ip.substring(0, result.ip.lastIndexOf('.'))
                }
            });
            that.$store.dispatch("call", {
                api: "guestinfo"
            }).then(function (result) {
                if (result.success) {
                    that.guestoldIP = result.ip;
                    that.staticGuestValMask = result.netmask
                    that.gueststart = result.start
                    that.gueslimit = result.limit
                    that.guestinfoIPAdress = result.ip.substring(0, result.ip.lastIndexOf('.'))
                }
            });
            that.$store.dispatch("call", {
                api: "waninfo"
            }).then(function (result) {
                that.wlaninfoMask = result.mask;
                that.wlaninfoIp = result.ip;
            })
            that.$store.dispatch("call", {
                api: "getclients"
            }).then(function (result) {
                that.receive = result.clients;
                if (result.success) {
                    for (var i = 0; i < that.receive.length; i++) {
                        that.nameList.push(that.receive[i].mac);
                    }
                    that.receiveList = that.nameList
                } else {
                    that.nameList = [];
                }
            });
            that.getData();
        },
        watch: {
            mac: function mac(val) {
                var array = []
                if (val) {
                    for (var i = 0; i < this.nameList.length; i++) {
                        if (this.nameList[i].toLowerCase().indexOf(val) >= 0) {
                            array.push(this.nameList[i])
                        }
                    }
                    this.nameList = array.length != 0 ? array : this.receiveList
                } else {
                    this.nameList = this.receiveList
                }
            },
            mobilemac: function mobilemac(val) {
                var array = []
                if (val) {
                    for (var i = 0; i < this.nameList.length; i++) {
                        if (this.nameList[i].toLowerCase().indexOf(val) >= 0) {
                            array.push(this.nameList[i])
                        }
                    }
                    this.nameList = array.length != 0 ? array : this.receiveList
                } else {
                    this.nameList = this.receiveList
                }
            }

        },
        computed: {
            laninfo: function laninfo() {
                return this.$store.getters.apiData["laninfo"];
            },
            guestinfo: function guestinfo() {
                return this.$store.getters.apiData["guestinfo"];
            },
            router: function router() {
                return this.$store.getters.apiData['router_mini'];
            },
            meshjudge: function meshjudge(){
                if (this.router.mode == 'mesh') {
                    return true
                }
                return false
            }
        },
        methods: {
            cancelmodify: function cancelmodify() {
                //取消显示修改框
                if (this.addStatus || this.modifyStatus) {
                    //true的话不允许点击
                    return;
                };
                this.currentIndex = -1;
                this.getData();
            },
            savemodify: function savemodify(item, index) {

                //保存修改的ip
                if (this.addStatus || this.delStatus) {
                    //true的话不允许点击
                    return;
                };
                var that = this;
                var judgeIsLan = that.isEqualIPAddress(item.ip, this.oldIP, this.staticValMask)
                // 检查静态IP是否和局域网IP或访客IP在同一个网段
                if (this.guestoldIP && this.oldIP) {
                    var judgeIsGuest = that.isEqualIPAddress(item.ip, this.guestoldIP, this.staticGuestValMask)
                    if (!judgeIsLan && !judgeIsGuest) {
                        that.$message({
                            type: "error",
                            msg: that.$lang.lanip.staticip
                        });
                        that.addStatus = false;
                        return;
                    }
                } else {
                    if (!judgeIsLan) {
                        that.$message({
                            type: "error",
                            msg: that.$lang.lanip.staticip
                        });
                        that.addStatus = false;
                        return;
                    }
                }
                that.modifyIndex = index;
                that.modifyStatus = true;
                for (var i = 0; i < that.leasesList.length; i++) {
                    if (index != i) {
                        if (item.ip == that.leasesList[i].ip) {
                            that.$message({
                                type: 'error',
                                msg: that.$lang.lanip.IPExisted
                            });
                            that.modifyStatus = false;
                            return;
                        }
                    }
                }
                if (!that.ipREG.test(item.ip)) {
                    that.$message({
                        type: 'error',
                        msg: 'IP' + ' ' + this.t(this.$lang.clients.Dataerror)
                    });
                    that.modifyStatus = false;
                    return;
                }
                that.currentIndex = -1;


                that.$store.dispatch('call', {
                    api: "leases_set",
                    data: {
                        mac: item.mac,
                        ip: item.ip,
                        name: item.name
                    }
                }).then(function (result) {
                    if (result.success) {
                        that.getData();
                        that.$message({
                            type: 'success',
                            msg: result.code
                        });
                        that.modifyStatus = false;
                    } else {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                        that.modifyStatus = false;
                    }
                });
            },
            checkConfig: function checkConfig(index) {
                //显示修改框
                if (this.addStatus || this.modifyStatus) {
                    //true的话不允许点击
                    return;
                };
                this.currentIndex = index;
            },
            deleteAll: function deleteAll() {
                //删除全部
                if (this.addStatus || this.modifyStatus || this.delStatus) {
                    //true的话不允许点击
                    return;
                };
                var that = this;

                that.$store.commit("showModal", {
                    show: true,
                    title: 'Caution',
                    message: that.$lang.lanip.Whether,
                    cb: function cb() {
                        that.deleteAllStatus = true;
                        that.$store.dispatch("call", {
                            api: 'leases_delall'
                        }).then(function (result) {
                            if (result.success) {
                                that.$message({
                                    type: 'success',
                                    msg: result.code
                                });
                                that.getData();
                                that.deleteAllStatus = false;
                            } else {
                                that.$message({
                                    type: 'error',
                                    msg: result.code
                                });
                                that.deleteAllStatus = false;
                            }
                        });
                    }
                });
            },
            leasesDel: function leasesDel(mac, index) {
                //删除单个
                if (this.addStatus || this.modifyStatus) {
                    //true的话不允许点击
                    return;
                };
                var that = this;
                that.delIndex = index;
                that.$store.commit("showModal", {
                    show: true,
                    title: 'Caution',
                    message: that.t(that.$lang.firewall.deletion) + '?',
                    cb: function cb() {
                        that.delStatus = true;
                        that.$store.dispatch("call", {
                            api: 'leases_del',
                            data: {
                                mac: mac
                            }
                        }).then(function (result) {
                            if (result.success) {
                                that.$message({
                                    type: 'success',
                                    msg: result.code
                                });
                                that.getData();
                                that.delStatus = false;
                            } else {
                                that.$message({
                                    type: 'error',
                                    msg: result.code
                                });
                                that.delStatus = false;
                            }
                        });
                    },
                    cancel: function cancel() {}
                });
            },
            getData: function getData() {
                var that = this;
                that.$store.dispatch("call", {
                    api: 'leases_list'
                }).then(function (result) {
                    that.leasesList = result.list;
                });
                that.$store.dispatch("call", {
                    api: "guestinfo"
                }).then(function (result) {
                    if (result.success) {
                        that.guestoldIP = result.ip;
                    }
                });
            },
            getDateGuest: function getDateGuest() {
                var that = this;
                that.$store.dispatch("call", {
                    api: "guestinfo"
                }).then(function (result) {
                    if (result.success) {
                        that.guestoldIP = result.ip;
                        that.guestinfoIPAdress = result.ip.substring(0, result.ip.lastIndexOf('.'))
                        that.gueststart = result.start
                        that.gueslimit = result.limit
                    }
                });
                that.$store.dispatch("call", {
                    api: "laninfo"
                }).then(function (result) {
                    if (result.success) {
                        that.laninfoIPAdress = result.ip.substring(0, result.ip.lastIndexOf('.'))
                        that.oldIP = result.ip;
                        that.lanstart = result.start
                        that.lanlimit = result.limit
                    }
                });
            },
            addListIp: function addListIp() {
                //add提交新的绑定
                var mac = this.mac
                if (this.mobilemac) {
                    mac = this.mobilemac
                }
                if (this.modifyStatus || this.delStatus) {
                    return;
                }
                var that = this;
                that.addStatus = true;
                for (var i = 0; i < that.leasesList.length; i++) {
                    if (mac.toLowerCase() != that.leasesList[i].mac.toLowerCase()) {
                        for (var k = 0; k < that.receive.length; k++) {
                            if (that.receive[k].mac.toLowerCase() == mac.toLowerCase()) {
                                that.names = that.receive[k].name;
                                break;
                            } else {
                                that.names = '*';
                            }
                        }
                    }
                    if (mac.toLowerCase() == that.leasesList[i].mac.toLowerCase()) {
                        that.$message({
                            type: 'error',
                            msg: that.$lang.lanip.MACExisted
                        });
                    }
                    if (that.ip == that.leasesList[i].ip) {
                        that.$message({
                            type: 'error',
                            msg: that.$lang.lanip.IPExisted
                        });
                    }
                    if (that.ip == that.leasesList[i].ip || mac.toLowerCase() == that.leasesList[i].mac.toLowerCase()) {
                        that.addStatus = false;
                        return;
                    }
                }
                if (!that.macREG.test(mac)) {
                    that.$message({
                        type: 'error',
                        msg: 'MAC' + ' ' + this.t(this.$lang.clients.Dataerror)
                    });
                }
                if (!that.ipREG.test(that.ip)) {
                    that.$message({
                        type: 'error',
                        msg: 'IP' + ' ' + this.t(this.$lang.clients.Dataerror)
                    });
                }
                if (!that.ipREG.test(that.ip) || !that.macREG.test(mac)) {
                    that.addStatus = false;
                    return;
                }
                var judgeIsLan = that.isEqualIPAddress(this.ip, this.oldIP, this.staticValMask)
                // 检查静态IP是否和局域网IP或访客IP在同一个网段
                if (this.guestoldIP && this.oldIP) {
                    var judgeIsGuest = that.isEqualIPAddress(this.ip, this.guestoldIP, this.staticGuestValMask)
                    if (!judgeIsLan && !judgeIsGuest) {
                        that.$message({
                            type: "error",
                            msg: that.$lang.lanip.staticip
                        });
                        that.addStatus = false;
                        return;
                    }
                } else {
                    if (!judgeIsLan) {
                        that.$message({
                            type: "error",
                            msg: that.$lang.lanip.staticip
                        });
                        that.addStatus = false;
                        return;
                    }
                }
                that.modal = false;
                that.$store.dispatch('call', {
                    api: "leases_set",
                    data: {
                        mac: mac,
                        ip: that.ip,
                        name: that.names
                    }
                }).then(function (result) {
                    that.mac = '';
                    $('.inputuppercase input').val('')
                    $('#mobileMac input').val('')
                    that.ip = '';
                    that.names = '';
                    that.mobilemac = "";
                    if (result.success) {
                        that.getData();
                        that.$message({
                            type: 'success',
                            msg: result.code
                        });
                        that.addStatus = false; //不管成功或者失败都移除禁用
                    } else {
                        
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                        that.addStatus = false;
                    }
                });
            },
            showmodal: function showmodal() {
                //显示modal
                this.modal = true;
            },
            hideModal: function hideModal() {
                //隐藏modal
                this.modal = false;
            },
            getmoInner_name: function getmoInner_name(data) {
                //选择mac拿到对应的name和ip
                for (var i = 0; i < this.receive.length; i++) {
                    if (this.receive[i].mac == data) {
                        this.names = this.receive[i].name;
                        this.ip = this.receive[i].ip;
                        break;
                    }
                }
            },
            validate: function validate() {
                var ipReg1 = /^10(?:\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
                    ipReg2 = /^172\.(1[6-9]|2\d|3[01])(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){2}$/,
                    ipReg3 = /^192\.168.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4])$/;
                var isValid = ipReg1.test(this.laninfo.ip) || ipReg2.test(this.laninfo.ip) || ipReg3.test(this.laninfo.ip);
                if (isValid) {
                    this.inputStatus = "success";
                    this.laninfoIPAdress = this.laninfo.ip.substring(0, this.laninfo.ip.lastIndexOf('.'))
                } else {
                    this.inputStatus = "error";
                }
                this.initialStutas = false
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
                            if (parseInt(this.lanstart) >= parseInt(this.lanlimit)) {
                                this.lanStartInputStatus = "error"
                            } else {
                                this.lanStartInputStatus = "success"
                                this.lanEndVaildate();
                            }
                        }
                    }
                } else {
                    this.lanStartInputStatus = "error"
                }
                this.initialStutas = false

            },
            lanEndVaildate: function lanEndVaildate() {
                var reg1 = /^\d+$/
                this.initialStutas = false
                if (reg1.test(this.lanlimit)) {
                    if (parseInt(this.lanlimit) && parseInt(this.lanlimit) > 254 || parseInt(this.lanlimit) <= 1) {
                        this.lanEndInputStatus = "error"
                    } else {
                        if (!this.lanlimit) {
                            this.lanEndInputStatus = "error"
                        } else {
                            if (parseInt(this.lanstart) >= parseInt(this.lanlimit)) {
                                this.lanEndInputStatus = "error"
                            } else {
                                if (parseInt(this.lanstart) <= 1) {
                                    this.lanEndInputStatus = "error"
                                }else{
                                    this.lanStartInputStatus = "success"
                                    this.lanEndInputStatus = "success"
                                }
                            }
                        }
                    }
                } else {
                    this.lanEndInputStatus = "error"
                }
            },
            guestStartVaildate: function guestStartVaildate() {
                var reg2 = /^\d+$/
                if (reg2.test(this.gueststart)) {
                    if (parseInt(this.gueststart) && parseInt(this.gueststart) > 254 || parseInt(this.gueststart) <= 1) {
                        this.guestStartInputStatus = "error"
                    } else {
                        if (!this.gueststart) {
                            this.guestStartInputStatus = "error"
                        } else {
                            if (parseInt(this.gueststart) >= parseInt(this.gueslimit)) {
                                this.guestStartInputStatus = "error"
                            } else {
                                this.guestStartInputStatus = "success"
                                this.guestEndVaildate();
                            }
                        }
                    }
                } else {
                    this.guestStartInputStatus = "error"
                }
                this.guestinitialStutas = false
            },
            guestEndVaildate: function guestEndVaildate() {
                var reg3 = /^\d+$/
                this.guestinitialStutas = false
                if (reg3.test(this.gueslimit)) {
                    if (parseInt(this.gueslimit) && parseInt(this.gueslimit) > 254 || parseInt(this.gueslimit) <= 1) {
                        this.guestEndInputStatus = "error"
                    } else {
                        if (!this.gueslimit) {
                            this.guestEndInputStatus = "error"
                        } else {
                            if (parseInt(this.gueststart) >= parseInt(this.gueslimit)) {
                                this.guestEndInputStatus = "error"
                            } else {
                                if (parseInt(this.gueststart) <= 1) {
                                    this.guestStartInputStatus = "error"
                                }else{
                                    this.guestEndInputStatus = "success"
                                    this.guestStartInputStatus = "success"
                                }
                            }
                        }
                    }
                } else {
                    this.guestEndInputStatus = "error"
                }
            },
            setLanIP: function setLanIP() {
                var that = this;
                if (that.guestoldIP && that.guestinfo.netmask) {
                    var isValip2 = that.isEqualIPAddress(that.guestoldIP, that.laninfo.ip, that.guestinfo.netmask);
                    if (isValip2) {
                        that.$message({
                            type: "error",
                            msg: this.$lang.lanip.Subnet2
                        });
                        this.inputStatus = "error";
                        return;
                    }
                }
                if (that.wlaninfoMask && that.wlaninfoIp) {
                    that.isValip = that.isEqualIPAddress(that.laninfo.ip, that.wlaninfoIp, that.wlaninfoMask);
                    if (that.isValip) {
                        that.$message({
                            type: "error",
                            msg: that.$lang.internet.subnetConflict
                        });

                        return;
                    }
                    
                }
                
                that.btnMove = true;
                this.$store.dispatch("call", {
                    api: "setlanip",
                    data: {
                        newip: that.laninfo.ip,
                        start: parseInt(this.lanstart),
                        end: parseInt(this.lanlimit)
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "setlanip",
                            "msg": result.code
                        });
                        return;
                    }
                    setTimeout(function(){
                        if (result.success) {
                            if (that.oldIP != that.laninfo.ip) {
                                that.$message({
                                    "type": "info",
                                    "api": "setlanip",
                                    "msg": that.t("The ip address of the router was changed successfully to") + ': ' + that.laninfo.ip,
                                    // The IP address of router has been changed successfully as
                                    "duration": 15000
                                });
                                setTimeout(function () {
                                    that.$message({
                                        "type": "success",
                                        "msg": that.t("You are being redirected to the new IP") + '：http://' + that.laninfo.ip,
                                        "duration": 5000
                                    });
                                    that.btnMove = false;
                                    window.location.href = "http://" + that.laninfo.ip;
                                }, 8000);
                            } else {
                                that.initialStutas = true;
                                that.$message({
                                    type: "success",
                                    api: "setlanip",
                                    msg: result.code
                                })
                            }
                            that.lanStartInputStatus = null;
                            that.lanEndInputStatus = null
                            that.btnMove = false;
                        } else {
                            that.$message({
                                "type": "error",
                                "api": "setlanip",
                                "msg": result.code
                            });
                            that.btnMove = false;
                        }
                    },8000)
                });
            },
            setGuestIP: function setGuestIP(data) {
                var that = this;
                // if (this.guestinfo.ip == this.guestoldIP) {
                //     this.GuestStatus = "error";
                //     that.$message({
                //         type: "warning",
                //         msg: this.$lang.lanip.modified
                //     });
                //     that.GuestStatus = null;
                //     return;
                // }
                var isValip2 = that.isEqualIPAddress(that.guestinfo.ip, that.oldIP, that.laninfo.netmask);
                if (isValip2) {
                    that.$message({
                        type: "error",
                        msg: this.$lang.lanip.Subnet2
                    });
                    this.GuestStatus = "error";
                    return;
                }
                if (that.wlaninfoMask && that.wlaninfoIp) {
                    var isValip1 = that.isEqualIPAddress(that.guestinfo.ip, that.wlaninfoIp, that.wlaninfoMask);
                    if (isValip1) {
                        that.$message({
                            type: "error",
                            msg: this.$lang.lanip.Subnet1
                        });
                        this.GuestStatus = "error";
                        return;
                    }
                }
                this.applyMove = true;
                this.$store.dispatch("call", {
                    api: "setguestip",
                    data: {
                        newip: that.guestinfo.ip,
                        start: parseInt(this.gueststart),
                        end: parseInt(this.gueslimit)
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "setguestip",
                            "msg": result.code
                        });
                        return;
                    }
                   setTimeout(function() {
                    if (result.success) {
                        that.guestinitialStutas = true;
                        that.$message({
                            "type": "success",
                            "api": "setguestip",
                            "msg": result.code,
                            "duration": 12000
                        });
                        that.GuestStatus = null;
                        that.guestStartInputStatus = null;
                        that.guestEndInputStatus = null;
                        that.getDateGuest();
                        that.applyMove = false;
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "setguestip",
                            "msg": result.code
                        });
                        that.applyMove = false;
                        that.getDateGuest();
                    }
                   }, 8000);
                });
            },
            validates: function validates() {
                var ipReg1 = /^10(?:\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
                    ipReg2 = /^172\.(1[6-9]|2\d|3[01])(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){2}$/,
                    ipReg3 = /^192\.168.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4])$/;
                var isGuest = ipReg1.test(this.guestinfo.ip) || ipReg2.test(this.guestinfo.ip) || ipReg3.test(this.guestinfo.ip);
                if (isGuest) {
                    this.GuestStatus = "success";
                    this.guestinfoIPAdress = this.guestinfo.ip.substring(0, this.guestinfo.ip.lastIndexOf('.'))
                } else {
                    this.GuestStatus = "error";
                }
                this.guestinitialStutas = false
            },

            isEqualIPAddress: function isEqualIPAddress(value1, value2, netmask) {
                var ip1 = new Array();
                var ip2 = new Array();
                var nm = new Array();
                ip1 = value1.split(".");
                ip2 = value2.split(".");
                nm = netmask.split(".");
                var ip1_2s = "";
                var ip2_2s = "";
                var inm2s = "";
                var index = 0;
                for (index = 0; index < 4; index++) {
                    var ip_1 = new Array();
                    var ip_2 = new Array();
                    var n_m = new Array();
                    ip_1 = parseInt(ip1[index]).toString(2);
                    ip_2 = parseInt(ip2[index]).toString(2);
                    n_m = parseInt(nm[index]).toString(2);
                    var tindex;
                    for (tindex = 0; tindex < 8 - ip_1.length; tindex++) {
                        ip1_2s += "0";
                    }
                    ip1_2s += ip_1;
                    for (tindex = 0; tindex < 8 - ip_2.length; tindex++) {
                        ip2_2s += "0";
                    }
                    ip2_2s += ip_2;
                    for (tindex = 0; tindex < 8 - n_m.length; tindex++) {
                        inm2s += "0";
                    }
                    inm2s += n_m;
                }
                var len = inm2s.length;
                var ip_12 = new Array();
                var ip_22 = new Array();
                var n_m_2 = new Array();
                ip_12 = ip1_2s.split("");
                ip_22 = ip2_2s.split("");
                n_m_2 = inm2s.split("");
                for (index = 0; index < len; index++) {
                    if (n_m_2[index] == "1") {
                        if (ip_12[index] != ip_22[index]) {
                            return false;;
                        }
                    }
                }
                return true;
            },
            Refresh: function Refresh() {
                this.inputStatus = null;
                this.GuestStatus = null;
                this.lanStartInputStatus = null;
                this.lanEndInputStatus = null
                this.guestStartInputStatus = null;
                this.guestEndInputStatus = null;
                this.getDateGuest();
            }
        }
    });
    return vueComponent;
});
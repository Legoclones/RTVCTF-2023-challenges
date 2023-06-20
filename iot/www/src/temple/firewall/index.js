"use strict";

define(["text!temple/firewall/index.html", "css!temple/firewall/index.css", "component/gl-toggle-btn/index", "component/gl-select/index", "component/select/index", "component/gl-btn/index", "component/modal/modal", "component/gl-input/index", "vue", "component/gl-toggle-btn/index", "component/gl-tooltip/index"], function (stpl, css, gl_toggle, gl_select, select, gl_btn, gl_modal, gl_input, Vue, gl_toggle_btn, gl_tooltip) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                list: [],
                open_list: [],
                protolist: ['TCP/UDP', 'TCP', 'UDP'],
                statuslist: ['Enabled', 'Disabled'],
                isEnabledSelectList: [
                    { label: 'Enabled', value: '1'},
                    { label: 'Disabled', value: '0'}
                ],
                externalZoneList: [],
                internalZoneList: [],
                externalZone: '',
                internalZone: '',
                fwname: '',
                iplist: [],
                outer_port: '',
                inner_port: '',
                inner_ip: '',
                port: '',
                proto: '',
                fwstatus: '',
                modalTitle: '',
                dmz_ip: '',
                page: '',
                modal: false,
                ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
                portReg: /^([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                checkName: true, // 校验 name
                checkInerPort: true, //校验inner-port
                checkOuterPort: true, // 校验 outer-port
                checkIPs: true, // 校验 IPs
                checkport: true, //校验PORT
                disabledShow: true,
                dmzStatus: false,
                btnStatus: false,
                openfwname: '',
                checkOpenPort: true,
                checkOpenName: true,
                openListPort: '',
                modeminner_ip: '',
                dmzBtn: true,
                currentIndex: -1,
                currIndex: -1,
                checkBtn: true,
                modifyIp: '',
                modifyStatus: false,
                addStatus: false,
                btnIndex: 0,
                btnIndex1: 0,
                appStatus: false,
                blockStatus: false,
                delStatus: false,
                RouteStatus: false,
                pcShow: false,
                moblieShow: false,
                tipStatus: false,
                portAddStatus: false,
                modifyAddStatus: false
            };
        },
        computed: {
            fwlist: function fwlist() {
                return this.$store.getters.apiData['fwlist'];
            },
            fwlist_list: function fwlist_list() {
                return this.$store.getters.apiData['fwlist_list'];
            },

            dmzValue: function dmzValue() {
                var item = '';
                if (this.dmzStatus) {
                    item = 'Enabled';
                } else {
                    item = 'Disabled';
                }
                return item;
            }

        },
        mounted: function mounted() {
            var that = this;
            that.getData();
            that.getZoneList();

            that.$store.dispatch("call", {
                api: "getclients"
            }).then(function (result) {
                var receive = result.clients;
                if (result.success) {
                    for (var i = 0; i < receive.length; i++) {
                        that.iplist.push(receive[i].ip);
                    }
                } else {
                    that.iplist = [];
                }
            });
            this.windowWidth();
        },
        methods: {
            windowWidth: function windowWidth() {
                if (window.document.body.offsetWidth <= 1288) {
                    this.moblieShow = true;
                } else {
                    this.moblieShow = false;
                }
                $(window).resize(function () {
                    var Width = $(window).width();
                    if (Width <= 1288) {
                        this.moblieShow = true;
                    } else {
                        this.moblieShow = false;
                    }
                });
            },

            getModemIp: function getModemIp(data) {
                this.modeminner_ip = data;
            },
            getInner_ip: function getInner_ip(data) {
                this.inner_ip = data;
            },

            getData: function getData() {
                var that = this;
                that.$store.dispatch("call", {
                    api: 'fwlist'
                }).then(function (result) {
                    if (result.success) {
                        that.list = result.rules;
                        for(var list in that.list) {
                            var item = that.list[list]
                            for (var key in item){
                                if (key === 'enabled') {
                                    item[key] = item[key] === '1' ? 'Enabled' : 'Disabled'
                                }
                            }
                        }
                    } else {
                        that.list = [];
                    }
                });
                that.$store.dispatch("call", {
                    api: 'fwlist_list'
                }).then(function (result) {
                    if (result.success) {
                        that.open_list = result.rules;
                    } else {
                        that.open_list = [];
                    }
                });
                that.$store.dispatch("call", {
                    api: 'fwget'
                }).then(function (result) {
                    if (result.success) {
                        that.dmzStatus = result.status == "Enabled" ? true : false;
                        if (that.dmzStatus) {
                            that.tipStatus = true;
                        } else {
                            that.tipStatus = false;
                        }
                        that.dmz_ip = result.dmzip;
                    }
                });
            },
            getZoneList: function getZoneList() {
                var that = this
                this.$store.dispatch('call', { api: 'fwzonelist' }).then(function(response) {
                    if (response.success) {
                        that.externalZoneList = response.zone[0]['external_zone']
                        that.internalZoneList = response.zone[0]['internal_zone']
                    }
                })
            },
            openport: function openport() {
                var that = this;
                if (!this.ipReg.test(that.dmz_ip)) {
                    that.$message({
                        type: 'error',
                        msg: -214
                    });
                    return;
                }
                that.btnStatus = true;
                that.$store.dispatch("call", {
                    api: "fwapple",
                    data: {
                        status: that.dmzValue,
                        dmzip: that.dmz_ip
                    }
                }).then(function (result) {
                    if (result.success) {
                        if (that.dmzStatus) {
                            that.tipStatus = true;
                        } else {
                            that.tipStatus = false;
                        }
                        setTimeout(function () {
                            that.btnStatus = false;
                            that.$message({
                                type: 'success',
                                msg: result.code
                            });
                        }, 2000);
                    } else {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                });
            },
            addListProto: function addListProto() {
                if (this.blockStatus) return;
                var that = this;
                that.addStatus = true;
                that.blockStatus = true;
                that.delStatus = true;
                // if (that.fwname.length >= 20) {
                //     that.fwname = that.fwname.substring(0, 8) + '...';
                // }
                var api = 'fwadd';
                var data = {
                    name: that.fwname,
                    /* inner_port: that.inner_port,
                    outer_port: that.outer_port,
                    inner_ip: that.inner_ip,
                    proto: that.proto,
                    status: that.fwstatus */
                    dest_port: that.inner_port,
                    src_dport: that.outer_port,
                    dest_ip: that.inner_ip,
                    proto: that.proto,
                    enabled: that.fwstatus === 'Enabled' ? '1' : '0',
                    src: that.externalZone,
                    dest: that.internalZone
                };
                this.blurIp(that.inner_ip);
                if (!that.inner_ip) {
                    that.checkIPs = false;
                }
                if (!that.inner_port) {
                    that.checkInerPort = false;
                }
                if (!that.outer_port) {
                    that.checkOuterPort = false;
                }
                if (!that.fwname) {
                    that.checkName = false;
                }
                if (!that.checkIPs || !that.checkInerPort || !that.checkOuterPort || !that.checkName) {
                    that.addStatus = false;
                    that.delStatus = false;
                    that.blockStatus = false;
                    if (!that.checkIPs) {
                        this.animation($('.inner_ip > .select-drop-down'));
                            that.$message({
                                type: 'error',
                                msg: this.t(this.$lang.firewall.InvalidInternal)
                            });
                    }
                    if (!that.checkInerPort) {
                        this.animation($('.inner_port>.gl-input'));
                            that.$message({
                                type: 'error',
                                msg: this.t('Invalid Internal Ports')
                            });
                    }
                    if (!that.checkOuterPort) {
                        this.animation($('.outer_port>.gl-input'));
                            that.$message({
                                type: 'error',
                                msg: this.t(this.$lang.firewall.InvalidExternal)
                            });
                    }
                    if (!that.checkName) {
                        this.animation($('.blurfwname>.gl-input'));
                            that.$message({
                                type: 'error',
                                msg: this.t(this.$lang.firewall.InvalidName) 
                            });
                    }
                    return;
                }
                that.$store.dispatch("call", {
                    api: api,
                    data: data
                }).then(function (result) {
                    that.fwname = "";
                    that.inner_port = "";
                    that.outer_port = "";
                    that.inner_ip = "";
                    if (result.success) {
                        that.modal = false;
                        that.$message({
                            type: 'success',
                            msg: result.code
                        });
                        that.addStatus = false;
                        that.blockStatus = false;
                        that.delStatus = false;
                        that.getData();
                    } else {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                        that.addStatus = false;
                        that.delStatus = false;
                        that.blockStatus = false;
                    }
                });
            },
            animation: function animation(data) {
                data.stop(true).animate({
                    left: "-10px"
                }, 100).animate({
                    left: "10px"
                }, 100).animate({
                    left: "-10px"
                }, 100).animate({
                    left: "10px"
                }, 100).animate({
                    left: "0px"
                }, 100);
            },
            addListRoute: function addListRoute() {
                if (this.RouteStatus) return;
                var that = this;
                that.RouteStatus = true;
                that.portAddStatus = true;
                var api = 'fwadd_open';
                data = {
                    name: that.openfwname,
                    port: that.openListPort,
                    proto: that.proto,
                    status: that.fwstatus
                };
                if (!that.openListPort) {
                    this.checkOpenPort = false;
                }
                if (!that.openfwname) {
                    this.checkOpenName = false;
                }
                if (!this.checkOpenName || !this.checkOpenPort) {
                    that.RouteStatus = false;
                    that.portAddStatus = false;
                    if (!this.checkOpenName) {
                        this.animation($('.openfwname>.gl-input'));
                            this.$message({
                                type: 'error',
                                msg: this.$lang.firewall.InvalidName
                            });
                    }
                    if (!this.checkOpenPort) {
                        this.animation($('.openListPort>.gl-input'));
                            this.$message({
                                type: 'error',
                                msg: this.$lang.firewall.InvalidPort
                            });
                    }
                    return;
                }
                that.$store.dispatch("call", {
                    api: api,
                    data: data
                }).then(function (result) {
                    that.RouteStatus = false;
                    that.modal = false;
                    that.openListPort = "";
                    that.openfwname = "";
                    that.portAddStatus = false;
                    if (result.success) {
                        that.$message({
                            type: 'success',
                            msg: result.code
                        });
                        that.getData();
                    } else {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                });
            },
            removefw: function removefw(name, target) {
                if (this.modifyStatus || this.delStatus || this.RouteStatus) return;
                var that = this;
                var api = 'fwremove';
                if (target == 'open') {
                    api = 'fwremove_open';
                }
                that.$store.commit("showModal", {
                    show: true,
                    title: 'Caution',
                    message: this.t(this.$lang.firewall.deletion) + '?',
                    cb: function cb() {
                        that.$store.dispatch("call", {
                            api: api,
                            data: {
                                name: name
                            }
                        }).then(function (result) {
                            if (result.success) {
                                that.$message({
                                    type: 'success',
                                    msg: result.code
                                });
                                that.getData();
                            } else {
                                that.$message({
                                    type: 'error',
                                    msg: result.code
                                });
                            }
                        });
                    }
                });
            },
            modifyfw: function modifyfw(index, item, target) {
                this.modifyStatus = true;
                this.btnIndex = index;
                this.btnIndex1 = index;
                if (target == 'right') {
                    this.modifyAddStatus = true;
                }
                this.blockStatus = true;
                this.RouteStatus = true;
                var that = this;
                that.appStatus = true;
                var api, data;
                if (target == 'left') {
                    api = 'setfw';
                    data = {
                        name: item.name,
                        // inner_port: item.inner_port,
                        // outer_port: item.outer_port,
                        dest_port: item.dest_port, // 内部端口
                        src_dport: item.src_dport, // 外部端口
                        src: item.src, // 外部zone
                        dest: item.dest, // 内部zone
                        dest_ip: this.modifyIp, // 内部ip=ip
                        proto: item.proto,
                        enabled: item.enabled === 'Enabled' ? '1' : '0', // 是否启用=status
                    };
                    // 内部端口
                    if (!item.dest_port || !this.blurInerPort(item.dest_port)) {
                        this.animation($(".firestPort .add_input").eq(index + 1).find(".fire-animate3"));
                        that.$message({
                            type: 'error',
                            msg: this.t('Invalid Internal Ports')
                        });
                    }
                    if (!this.ipReg.test(this.modifyIp)) {
                        this.animation($(".firestPort .add_input").eq(index + 1).find(".fire-animate1"));
                            that.$message({
                                type: 'error',
                                msg: this.t(this.$lang.firewall.InvalidInternal)
                            });
                    }
                    // 外部端口
                    if (!item.src_dport || !this.blurOuter(item.src_dport)) {
                        this.animation($(".firestPort .add_input").eq(index + 1).find(".fire-animate2"));
                            that.$message({
                                type: 'error',
                                msg: this.t(this.$lang.firewall.InvalidExternal)
                            });
                    }
                    if (!item.dest_port || !this.blurInerPort(item.dest_port) || !this.ipReg.test(this.modifyIp) || !item.src_dport || !this.blurOuter(item.src_dport)) {
                        that.appStatus = false;
                        that.RouteStatus = false;
                        that.modifyStatus = false;
                        that.blockStatus = false;
                        that.modifyAddStatus = false;
                        return;
                    }
                } else {
                    api = 'setfw_open';
                    data = {
                        name: item.name,
                        port: item.port,
                        proto: item.proto,
                        status: item.status
                    };
                    if (!this.portReg.test(item.port)) {
                            that.$message({
                                type: 'error',
                                msg: this.t(this.$lang.firewall.InvalidPort)
                            });
                        that.checkOpenPort = false;
                        that.appStatus = false;
                        that.RouteStatus = false;
                        that.modifyStatus = false;
                        that.blockStatus = false;
                        that.modifyAddStatus = false;
                        this.animation($(".secondPort .add_input").eq(index + 1).find(".fire-animate4"));
                        return;
                    }
                }
                // 还原checkInerPort、checkOuterPort状态,解决修改后添加时port不再进行验证问题
                that.checkInerPort = false
                that.checkOuterPort = false
                that.currentIndex = -1;
                that.currIndex = -1;
                this.$store.dispatch("call", {
                    api: api,
                    data: data
                }).then(function (result) {
                    that.modifyStatus = false;
                    that.blockStatus = false;
                    that.RouteStatus = false;
                    that.modifyAddStatus = false;
                    if (result.success) {
                        that.$message({
                            type: 'success',
                            msg: result.code
                        });
                        that.appStatus = false;
                        that.getData();
                    } else {
                        that.appStatus = false;
                    }
                });
            },
            deleteAll: function deleteAll(page) {
                if (page == 'four') {
                    var that = this;
                    that.$store.commit("showModal", {
                        show: true,
                        title: 'Caution',
                        message: that.$lang.firewall.portrules,
                        cb: function cb() {
                            that.$store.dispatch("call", {
                                api: 'fwdel_all',
                                data: {
                                    type: 'oport'
                                }
                            }).then(function (result) {
                                if (result.success) {
                                    that.getData();
                                    that.$message({
                                        type: 'success',
                                        msg: result.code
                                    });
                                }
                            });
                        }
                    });
                    return;
                }
                if (page == 'two') {
                    var that = this;
                    that.$store.commit("showModal", {
                        show: true,
                        title: 'Caution',
                        message: that.$lang.firewall.portrules,
                        cb: function cb() {
                            that.$store.dispatch("call", {
                                api: 'fwdel_all',
                                data: {
                                    type: 'fport'
                                }
                            }).then(function (result) {
                                if (result.success) {
                                    that.getData();
                                    that.$message({
                                        type: 'success',
                                        msg: result.code
                                    });
                                }
                            });
                        }
                    });
                    return;
                }
            },

            showmodal: function showmodal(page) {
                var that = this;
                that.modal = true;
                that.page = page;
                // 标题
                that.modalTitle = page == 'one' ? this.t(this.$lang.firewall.ForwardRule) : this.t(this.$lang.firewall.PortRule);
                that.disabledShow = true;
            },
            hideModal: function hideModal() {
                var that = this;
                that.modal = false;
                that.blockStatus = false;
                that.RouteStatus = false;
                that.fwname = "";
                that.outer_port = "";
                that.inner_port = "";
                that.inner_ip = "";
                that.port = '';
                that.modifyIp = '';
                that.modeminner_ip = '';
                that.proto = "TCP/UDP";
                that.fwstatus = "Enabled";
                that.checkName = true; // 校验 name
                that.checkInerPort = true; //校验inner-port
                that.checkOuterPort = true; // 校验 outer-port
                that.checkIPs = true; // 校验 IPscheckName: true, // 校验 name
                that.checkport = true; //校验PORT
            },
            blurOuter: function blurOuter(data) {
                if (data.indexOf('-') != -1) {
                    var list = [];
                    list = data.split('-');
                    if (list.length > 2) {
                        this.checkOuterPort = false;
                    } else {
                        if (parseInt(list[0]) <= parseInt(list[1])) {
                            !data ? this.checkOuterPort = false : this.checkOuterPort = this.portReg.test(list[0]) && this.portReg.test(list[1]);
                        } else {
                            this.checkOuterPort = false;
                        }
                    }
                } else {
                    this.checkOuterPort = !data ? true : this.portReg.test(data);
                }
                var item = this.checkOuterPort;
                return item;
            },
            blurfwname: function blurfwname() {
                this.fwname.length >= 32 ? this.checkName = false : this.checkName = true;
            },
            bluropenfwname: function bluropenfwname() {
                this.openfwname.length <= 32 ? this.checkOpenName = true : this.checkOpenName = false;
            },
            blurInerPort: function blurInerPort(data) {
                if (data.indexOf('-') != -1){
                    var list = [];
                    list =data.split("-");
                    if (list.length>2) {
                        this.checkInerPort = false;
                    }else {
                        if (parseInt(list[0]) <= parseInt(list[1])) {
                            !data ? this.checkInerPort = false : this.checkInerPort = this.portReg.test(list[0]) && this.portReg.test(list[1]);
                        } else {
                            this.checkInerPort = false;
                        }
                    }
                }else{
                    this.checkInerPort = !data ? true : this.portReg.test(data);
                }
                var item = this.checkInerPort;
                
                return item;
            },
            blurIp: function blurIp(data) {
                this.checkIPs = !data ? true : this.ipReg.test(data);
            },
            blurport: function blurport() {
                !this.port ? this.checkport = true : this.checkport = this.portReg.test(this.port);
            },
            bluropenListPort: function bluropenListPort() {
                !this.openListPort ? this.checkOpenPort = true : this.checkOpenPort = this.portReg.test(this.openListPort);
            },

            checkDmz: function checkDmz(data) {
                this.dmz_ip = data;
                this.dmzBtn = false;
            },
            checkConfig: function checkConfig(index, target) {
                if (this.modifyStatus || this.blockStatus || this.RouteStatus) return;
                if (target) {
                    this.currentIndex = index;
                } else {
                    this.currIndex = index;
                }
            },
            getmoInner_ip: function getmoInner_ip(data) {
                this.modifyIp = data;
            },
            cancelChange: function cancelChange() {
                this.currentIndex = -1;
                this.getData();
            },
            cancelModify: function cancelModify() {
                this.checkOpenPort = true;
                this.currIndex = -1;
                this.getData();
            }
        },
        components: {
            "gl-tg-btn": gl_toggle,
            "gl-select": gl_select,
            "select": select,
            "gl-btn": gl_btn,
            "gl-modal": gl_modal,
            "gl-input": gl_input,
            "gl-toggle-btn": gl_toggle_btn,
            "gl-tooltip": gl_tooltip
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                    $("#applications").collapse("hide");
                    $("#moresetting").collapse("hide");
                    $("#system").collapse("hide");
                    $("#vpn").collapse("hide");
                }
            });
        }
    });
    return vueComponent;
});
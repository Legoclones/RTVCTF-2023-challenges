"use strict";

define(["text!temple/clients/index.html", "css!temple/clients/index.css", "component/gl-toggle-btn/index", "component/gl-btn/index", "vue", "component/gl-tooltip/index", "component/modal/modal", "component/gl-input/index", "component/gl-toggle-btn/index"], function (stpl, css, gl_toggle, gl_btn, Vue, gl_tooltip, gl_modal, gl_input, gl_toggle_btn) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                timer: "",
                btnstatus: false,
                wlan5g: [],
                wlan24g: [],
                wire: [{
                    blocked: false,
                    down: "0",
                    iface: "",
                    ip: "一",
                    mac: "一",
                    name: "一",
                    qos_down: "0",
                    qos_up: "0",
                    remote: true,
                    total_down: "0",
                    total_up: "0",
                    up: "0"
                }],
                qosMange: false,
                quload: 0,
                qdload: 0,
                showModal: false,
                currmac: "",
                speedStatus: false,
                speedShow: false,
                showModalMoblie: false,
                responseDown: '',
                responseUp: '',
                responseTrafficUp: '',
                responseTrafficDown: '',
                speedUp: "",
                speedDown: "",
                responseMac: '',
                resetStatus: false,
                disableStatus: false,
                Regtext: /^\d+$/,
                quStatus: true,
                qdStatus: true,
                clientType: '',
                loadingIndex: null,
                loadStatus: false,
                loadReset: false,
                clientType1: '',
                loadingIndex1: null,
                bloakStatus: false,
                creatIndex: null,
                blockedStatus: false,
                onlineClientList: [], //离线列表
                productClass: ["Apple", "Samsung", "Amazon", "Asus", "ACER", "Google", "Lenovo", "HUAWEI", "Xiaomi", "OPPO", "LG", "Motorola", "TP-LINK", "Tenda", "DELL", "HTC", "MEIZU", "NETGEAR", "Nokia", "Nubia", "Skyworth", "Sony", "TCL", "zte", "HP", "Qualcomm", "MARVELL", "MediaTek", "REALTEK", "Intel", "Texas", "Toshiba", "Renesas", "Hynix", "NXP", "Freescale", "Panasonic", "Broadcom", "SHARP", "IBM", "NVIDIA", "Smartisan", "vivo", 'glinet'],
                offlineStatus: false,
                offlineReset: false,
                responsiveList: [],
                portalStatus: false,
                deleteAllStatus: false,
                disabledToggleBtn: false
            };
        },
        components: {
            "gl-tg-btn": gl_toggle,
            "gl-btn": gl_btn,
            "gl-tooltip": gl_tooltip,
            "gl-modal": gl_modal,
            "gl-input": gl_input,
            "gl-toggle-btn": gl_toggle_btn
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
                };
            });
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.disableStatus) {
                clearInterval(this.timer);
                var that = this;
                that.$store.dispatch('call', {
                    api: 'router_mini'
                });
                next();
            } else {
                this.$message({
                    "type": "warning",
                    "msg": -2800,
                    "duration": 1000
                });
            };
        },
        mounted: function mounted() {
            var that = this;
            this.getData()
            this.timerData();
            this.getTraffic()
            if (this.getclients.success) {
                if (this.clientList && this.clientList.clients && this.clientList.clients.length != 0) {
                    this.parseClient(this.clientList.clients);
                };
            };
            if (this.gettraffic.success) {
                this.speedShow = this.gettraffic.enable;
            }
            that.$store.dispatch("call", {
                api: 'getportal'
            }).then(function (result) {
                if (result.portal_enable) {
                    that.portalStatus = true;
                }
            });
        },
        computed: {
            router: function router() {
                return this.$store.getters.apiData["router_mini"];
            },
            gettraffic: function gettraffic() {
                var trafficInfo = this.$store.getters.apiData["gettraffic"];
                this.disabledToggleBtn = trafficInfo.bigdata_enable;
                return trafficInfo;
            },
            getclients: function getclients() {
                return this.$store.getters.apiData["getclients"];
            },
            clientList: function clientList() {
                return this.getclients;
            },
            activeQosBlock: function activeQosBlock() {
                return this.router.mode && (this.router.mode == 'ap' || this.router.mode == 'wds' || this.router.mode == 'relay') 
            },
            meshjudge: function meshjudge() {
                if (this.router.mode == 'mesh') {
                    return true
                }
                return false
            }
        },
        methods: {
            getContent: function getContent(item) {
                var html = "<span class='fa fa-arrow-up'>" + this.bytesToSizeNum(item.qos_up) + "</span><br/><span class='fa fa-arrow-down'>" + this.bytesToSizeNum(item.qos_down) + "</span>";
                return html;
            },
            merchant: function merchant(data) {
                var item = 'Unknown';
                if (data) {
                    for (var i = 0; i < this.productClass.length; i++) {
                        if (data.indexOf(this.productClass[i]) != -1) {
                            item = this.productClass[i]
                        }
                    }
                }
                return item;
            },
            product: function product(data) {
                var item = '?'
                if (data) {
                    for (var i = 0; i < this.productClass.length; i++) {
                        if (data.indexOf(this.productClass[i]) != -1) {
                            item = this.productClass[i].slice(0, 1)
                        }
                    }
                }
                return item.toUpperCase()
            },
            // colorList: ["#00c851","007e33","#33b5e5","#0099cc","#2bbbad","#00695c","#4285f4","#0d47a1","#aa66cc","#9933cc"]
            colorReturn: function colorReturn(data) {
                var color = "#2bbbad";
                var item = '?';
                if (data) {
                    for (var i = 0; i < this.productClass.length; i++) {
                        if (data.indexOf(this.productClass[i]) != -1) {
                            item = this.productClass[i].slice(0, 1)
                            if (item == "D" || item == "E" || item == "F") {
                                color = "#007e33"
                            } else if (item == "G" || item == "H" || item == "I") {
                                color = "#33b5e5"
                            } else if (item == "J" || item == "K" || item == "L") {
                                color = "#0099cc"
                            } else if (item == "N" || item == "M" || item == "O") {
                                color = "#9933cc"
                            } else if (item == "P" || item == "Q" || item == "R") {
                                color = "#00695c"
                            } else if (item == "S" || item == "T" || item == "U") {
                                color = "#00695c"
                            } else if (item == "V" || item == "W" || item == "X") {
                                color = "#4285f4"
                            } else if (item == "Y" || item == "Z" || item == "C") {
                                color = "#0d47a1"
                            } else if (item == "A" || item == "B") {
                                color = "#aa66cc"
                            }
                        }
                    }
                }
                return color
            },
            getTraffic: function getTraffic() {
                var that = this;
                that.$store.dispatch("call", {
                    api: "gettraffic"
                }).then(function (result) {
                    that.speedShow = result.enable;
                });
            },
            //开启速率
            openSpeed: function openSpeed(data) {
                    this.disabledToggleBtn = true;
                    var that = this;
                    that.disableStatus = true;
                    that.bloakStatus = true;
                    clearInterval(that.timer);
                    that.speedStatus = data;
                    that.$store.dispatch("call", {
                        api: 'settraffic',
                        data: {
                            enable: that.speedStatus
                        }
                    }).then(function (result) {
                        setTimeout(function () {
                            if (result.success) {
                                that.$message({
                                    "type": "success",
                                    "api": "clientblock",
                                    "msg": result.code
                                });
                            } else {
                                if (result.code == -600) {
                                    that.$store.commit("showModal", {
                                        show: true,
                                        type: "warning",
                                        title: "Caution",
                                        showfoot: false,
                                        message: that.t('Before turning off this feature, please turn off the wifi coverage function in the goodcloud management web.'),
                                    })
                                } else {
                                    that.$message({
                                        "type": "error",
                                        "api": "clientblock",
                                        "msg": result.code,
                                    });
                                }
                            }
                            if (that.speedStatus) {
                                that.speedShow = true;
                            } else {
                                that.speedShow = false;
                            }
                            that.disableStatus = false;
                            that.bloakStatus = false;
                            that.timerData();
                            that.getTraffic();
                            that.disabledToggleBtn = false;
                        }, 8000);

                    });
            },
            // 节流函数，规定在一定时间内只执行一次
            throttle: function throttle(fn,wait){
                var timer = null;
                return function(){
                    var context = this;
                    var args = arguments;
                    if(!timer){
                        timer = setTimeout(function(){
                            // fn.apply(context,args);
                            fn();
                            timer = null;
                        },wait)
                    }
                }
            },
            parseClient: function parseClient(target) {
                this.wlan5g = [];
                this.wlan24g = [];
                this.wire = [];
                this.onlineClientList = [];
                var list = target || [];
                var len = list.length;
                if (len == 0) {
                    this.wire = [{
                        blocked: false,
                        down: "0",
                        iface: "",
                        ip: "一",
                        mac: "一",
                        name: "一",
                        qos_down: "0",
                        qos_up: "0",
                        remote: true,
                        total_down: "0",
                        total_up: "0",
                        up: "0"
                    }];
                    return;
                }
                for (var i = 0; i < len; i++) {
                    if (list[i].iface == '2.4G' && list[i].online || list[i].iface == '2.4G_Guest' && list[i].online) {
                        this.wlan24g.push(list[i]);
                    } else if (list[i].iface == '5G' && list[i].online || list[i].iface == '5G_Guest' && list[i].online) {
                        this.wlan5g.push(list[i]);
                    } else if (list[i].iface == 'cable' && list[i].online) {
                        this.wire.push(list[i]);
                    }
                    if (!list[i].online) {
                        this.onlineClientList.push(list[i]);
                    }
                }

            },
            //实时获取屏幕
            windowWidth: function windowWidth() {
                if (window.screen.width <= 448) {
                    $('.Widthscreen').addClass('table-responsive');
                } else {
                    $('.Widthscreen').removeClass('table-responsive');
                }
                $(window).resize(function () {
                    var Width = $(window).width();
                    if (Width <= 448) {
                        $('.Widthscreen').addClass('table-responsive');
                    } else {
                        $('.Widthscreen').removeClass('table-responsive');
                    }
                });
            },
            timerData: function timerData() {
                var that = this;
                clearInterval(that.timer)
                that.timer = setInterval(function () {
                    that.getData();
                }, 8000);
            },
            getData: function getData() {
                var that = this;
                that.$store.dispatch("call", {
                    api: "getclients"
                }).then(function (result) {
                    if (result.clients) {
                        that.clientlist = result.clients.length === 0 ? that.clientlist : result.clients
                        that.parseClient(that.clientlist);
                    }
                });
            },
            bytesToSize: function bytesToSize(num) {
                if (num == 0 || !num) return '0 B/s';
                var k = 1024;
                var sizeStr = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s', 'EB/s', 'ZB/s', 'YB/s'];
                var i = 0;
                for (var l = 0; l < 8; l++) {
                    if (num / Math.pow(k, l) < 1) {
                        break;
                    }
                    i = l;
                }
                var item = (num / Math.pow(k, i)).toFixed(1) + ' ' + sizeStr[i];
                return item;
            },
            bytesToSizeNum: function bytesToSizeNum(num) {
                if (num == 0 || !num) return '0 KB/s';
                var k = 1024;
                var sizeStr = ['KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s', 'EB/s', 'ZB/s', 'YB/s'];
                var i = 0;
                for (var l = 0; l < 8; l++) {
                    if (num / Math.pow(k, l) < 1) {
                        break;
                    }
                    i = l;
                }
                var item = (num / Math.pow(k, i)).toFixed(1) + ' ' + sizeStr[i];
                return item;
            },
            //name超长截取
            truncation: function truncation(item, num) {
                if (item.length > num) {
                    item = item.substring(0, num) + '...';
                }
                return item;
            },
            // 禁止设备进入web页面
            block: function block(item, index, list) {
                if (this.bloakStatus) return;
                var that = this;
                clearInterval(that.timer);
                // 本机禁用出现弹框
                if (item.remote && item.blocked) {
                    that.$store.commit("showModal", {
                        show: true,
                        type: "warning",
                        title: "Caution",
                        message: this.$lang.modal.disableDevice,
                        cb: function cb() {
                            that.blockclient(item);
                        },
                        cancel: function cancel() {
                            that.timerData();
                            list[index].blocked = false;
                        }
                    });
                } else {
                    if (this.portalStatus && item.blocked) {
                        this.$store.commit("showModal", {
                            show: true,
                            type: "warning",
                            title: "Caution",
                            message: this.t('Conflict: Captival portal is enabled, block function will not work!'),
                            cb: function cb() {
                                that.blockclient(item);
                            },
                            cancel: function cancel() {
                                item.blocked = !item.blocked
                                that.timerData();
                            }
                        })
                    } else {
                        that.blockclient(item);
                    }
                }
            },
            blockclient: function blockclient(item) {
                var that = this;
                that.$message({
                    "type": "warning",
                    "msg": "In settings..."
                });
                this.blockedStatus = true;
                that.$store.dispatch("call", {
                    api: 'clientblock',
                    data: {
                        "mac": item.mac,
                        "disable": item.blocked
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.blockedStatus = false;
                        that.$message({
                            "type": "error",
                            "api": "clientblock",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.blockedStatus = false;
                        that.$message({
                            "type": "success",
                            "api": "clientblock",
                            "msg": result.code
                        });
                    } else {
                        that.blockedStatus = false;
                        that.$message({
                            "type": "error",
                            "api": "clientblock",
                            "msg": result.code
                        });
                    }
                    that.timerData();
                });
            },
            axiosCall: function axiosCall() {},
            //限速应用
            applyQos: function applyQos(page) {
                var that = this;
                clearInterval(that.timer);
                if (!that.Regtext.test(that.qdload) || !that.Regtext.test(that.quload)) {
                    that.$message({
                        type: 'error',
                        msg: this.$lang.clients.Dataerror
                    });
                    that.quStatus = false;
                }
                if (that.quload.length >= 2) {
                    if (that.quload.slice(0, 1) == 0) {
                        that.$message({
                            type: 'error',
                            msg: this.$lang.clients.Dataerror
                        });
                        that.quStatus = false;
                    }
                }
                if (that.qdload.length >= 2) {
                    if (that.qdload.slice(0, 1) == 0) {
                        that.$message({
                            type: 'error',
                            msg: this.$lang.clients.Dataerror
                        });
                        that.quStatus = false;
                    }
                }
                if (that.quload > 1048576 || that.quload < 0) {
                    that.$message({
                        type: 'error',
                        msg: this.$lang.clients.Exceed
                    });
                    that.quStatus = false;
                }
                if (that.qdload > 1048576 || that.qdload < 0) {
                    that.$message({
                        type: 'error',
                        msg: this.$lang.clients.Exceed
                    });
                    that.quStatus = false;
                }
                if (!that.quStatus) {
                    that.quStatus = true;
                    that.loadStatus = false;
                    return;
                }
                if (page == 'pc') {
                    that.showModalMoblie = false;
                } else {
                    that.showModal = false;
                }
                that.loadStatus = true;
                that.$store.dispatch('call', {
                    api: 'setqos',
                    data: {
                        mac: that.currmac,
                        upload: that.quload,
                        download: that.qdload
                    }
                }).then(function (result) {
                    that.timerData();
                    if (result.success) {
                        that.responsiveList.qos_down = that.qdload;
                        that.responsiveList.qos_up = that.quload;
                        that.loadStatus = false;
                        that.disableStatus = false;
                        that.$message({
                            type: 'success',
                            msg: result.code
                        });
                    } else {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                });
            },
            //取消限速
            cancelQos: function cancelQos(item, index) {
                if (this.btnstatus || this.disableStatus) return;
                this.disableStatus = true;
                var that = this;
                that.btnstatus = true;
                that.loadReset = true;
                that.offlineReset = item.online;
                this.clientType1 = item.iface;
                this.loadingIndex1 = index;
                clearInterval(that.timer);
                that.$store.dispatch('call', {
                    api: 'setqos',
                    data: {
                        mac: item.mac,
                        upload: 0,
                        download: 0
                    }
                }).then(function (result) {
                    that.timerData();
                    setTimeout(function () {
                        that.btnstatus = false;
                        that.loadReset = false;
                        that.disableStatus = false;
                    }, 500);
                    if (result.success) {
                        item.qos_up = 0
                        item.qos_down = 0
                        that.$message({
                            type: 'success',
                            msg: result.code
                        });
                    } else {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                });
            },
            bytesToSizeList: function bytesToSizeList(num) {
                if (num == 0 || !num) return '0 B';
                var k = 1024;
                var sizeStr = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                var i = 0;
                for (var l = 0; l < 8; l++) {
                    if (num / Math.pow(k, l) < 1) {
                        break;
                    }
                    i = l;
                }
                var item = (num / Math.pow(k, i)).toFixed(1) + ' ' + sizeStr[i];
                return item;
            },
            inputload: function inputload() {
                clearInterval(this.timer);
            },
            //弹出modal
            modifyClient: function modifyClient(index, target, type) {
                if (this.btnstatus || this.disableStatus) return;
                this.disableStatus = true;
                clearInterval(this.timer);
                this.qdload = target.qos_down;
                this.quload = target.qos_up;
                this.responseUp = target.qos_down;
                this.responseDown = target.qos_up;
                this.currmac = target.mac;
                this.responseTrafficUp = target.total_up;
                this.responseTrafficDown = target.total_down;
                this.speedDown = target.down;
                this.speedUp = target.up;
                this.responseMac = target.mac;
                this.clientType = target.iface;
                this.loadingIndex = index;
                this.offlineStatus = target.online
                this.responsiveList = target
                if (type) {
                    this.showModal = true;
                } else {
                    this.showModalMoblie = true;
                }
            },
            //关闭modal
            hideModal: function hideModal(page) {
                this.disableStatus = false;
                if (page == 'page') {
                    this.showModalMoblie = false;
                    this.timerData();
                } else {
                    this.showModal = false;
                    if (this.responseUp == 0 && this.responseDown == 0) {
                        return;
                    } else {
                        var that = this;
                        clearInterval(this.timer);
                        that.$store.dispatch('call', {
                            api: 'setqos',
                            data: {
                                mac: that.responseMac,
                                upload: 0,
                                download: 0
                            }
                        }).then(function (result) {
                            that.timerData();
                            setTimeout(function () {
                                if (result.success) {
                                    that.$message({
                                        type: 'success',
                                        msg: result.code
                                    });
                                } else {
                                    that.$message({
                                        type: 'error',
                                        msg: result.code
                                    });
                                }
                            }, 1000);
                        });
                    }
                }
            },
            // 删除离线客户端
            removeOfflineClient: function removeOfflineClient(mac) {
                var curMac = mac || 'ff:ff:ff:ff:ff:ff';
                var that = this;
                that.$store.commit("showModal", {
                    show: true,
                    title: 'Caution',
                    message: this.t('Confirm Delete') + '?',
                    cb: function cb() {
                        that.deleteAllStatus = true;
                        that.$store.dispatch("call", {
                            api: 'delete_offline_client',
                            data: {
                                mac: curMac
                            }
                        }).then(function (result) {
                            if (result.success) {
                                that.$message({
                                    type: 'success',
                                    msg: result.code
                                });
                                that.getData();
                            } else {
                                var message = '';
                                if (result.code === -1000) message = that.t('client not offline state');
                                else if (result.code === -1001) message = that.t('client no this mac');
                                else if (result.code === -1002) message = that.t('delete client node error');
                                that.$message({
                                    type: 'error',
                                    msg: message
                                });
                            }
                            that.deleteAllStatus = false;
                        });
                    }
                });
            },
            // 删除所有离线客户端
            removeAllOfflineClient: function removeAllOfflineClient() {

            }
        }
    });

    return vueComponent;
});
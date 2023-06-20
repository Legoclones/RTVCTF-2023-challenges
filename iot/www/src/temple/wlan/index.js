"use strict";

define(["text!temple/wlan/index.html", "css!temple/wlan/index.css", "component/gl-btn/index", "component/gl-toggle-btn/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-label/index", "component/gl-select/index", "component/gl-slider/index", "vue", "component/gl-loading/index"], function (stpl, css, gl_progress, gl_toggle, gl_input, gl_tooltip, gl_label, gl_select, gl_slider, Vue, gl_loading) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                timer: "",
                powerTimer: "",
                hostenableTimer: "",
                cTimer: false,
                newSsid: "",
                checked: false,
                btnStatus: false,
                btnAp: false,
                wifiKey: [],
                wifiName: [],
                apsBack: {},
                htmodeDefault: "",
                channelNum: "",
                inputValue: "", // input => password
                maxwidth: "90",
                btnName: {
                    "btn0": "Modify",
                    "btn1": "Modify",
                    "btn2": "Modify",
                    "btn3": "Modify"
                },
                modify: false,
                psw: /^(?:\d+|[a-zA-Z]+|[!@#$%^&*,.?/|]+)$/,
                pswmedium: /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&*,.?/|]+$)[a-zA-Z\d!@#$%^&*,.?/|]+$/,
                pswStrong: /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&*,.?/|]+$)(?![a-zA-z\d]+$)(?![a-zA-z!@#$%^&*,.?/|]+$)(?![\d!@#$%^&*,.?/|]+$)[a-zA-Z\d!@#$%^&*,.?/|]+$/,
                currentindex: 0,
                checkpassword: true,
                getaps: [],
                wifi5g: [],
                wifi2g: [],
                wifi5gGuest: [],
                wifi2gGuest: [],
                wifiType: '',
                wifiGuest: '',
                wifiId: undefined,
                wifiShow: false,
                SecurityList: ['OPEN', 'WPA2-PSK', 'WPA/WPA2-PSK'],
                SecurityListWpa3: ["WPA3-SAE","WPA2/WPA3-PSK/SAE"],
                itemThisList: null,
                cloaking: ['Shown', 'Hidden'],
                meshToodList: [],
                channelId: undefined,
                powerList: ['Max', 'High', 'Medium', 'Low'],
                regnum: /^\d+$/
            };
        },
        components: {
            "gl-btn": gl_progress,
            "gl-tg-btn": gl_toggle,
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip,
            "gl-label": gl_label,
            "gl-select": gl_select,
            "gl-slider": gl_slider,
            "gl-loading": gl_loading
        },
        computed: {
            wlanlist: function wlanlist() {
                return this.$store.getters.apiData["getaps"];
            },
            wlanaps: function wlanaps() {
                return this.wlanlist;
            },
            stainfo: function stainfo() {
                return this.$store.getters.apiData["stainfo"];
            },
            router: function router() {
                return this.$store.getters.apiData["router_mini"];
            },
            loading: function loading() {
                if (this.getaps.length == 0) {
                    return true;
                };
                return false;
            },
            meshjudge: function meshjudge() {
                if (this.router.mode == 'mesh') {
                    return true
                }
                return false
            },

        },
        mounted: function mounted() {
            var that = this;
            this.$store.dispatch("call", {
                api: "router_mini"
            });
            if (!this.meshjudge) {
                this.$store.dispatch("getInfo_repeater"); // 全局一直调用定时器 repeater vpnlist reachable
            }
            that.$store.dispatch("call", {
                api: "getaps"
            }).then(function (result) {
                if (result.success) {
                    that.getaps = JSON.parse(JSON.stringify(result));
                    that.getWlancache(that.getaps);
                }
            });
            if (this.meshjudge) {
                this.$store.dispatch("call", {
                    api: 'gettopo',
                }).then(function (result) {
                    if (result.topo !== null) {
                        that.meshToodList = result.topo.topos
                    }
                })
            }
        },
        methods: {
            changeHtmode: function changeHtmode(item) {
                setTimeout(function () {
                    switch (item.hwmode) {
                        case '802.11b/g/n':
                            item.htmodelist = ['20 MHz', '40 MHz', '20/40 MHz'];
                            item.htmode = '20 MHz'
                            break;
                        case '802.11a/n/ac':
                            item.htmodelist = ["20 MHz", '40 MHz', '80 MHz', '20/40/80 MHz'];
                            item.htmode = '20 MHz';
                            break;
                        default:
                            item.htmodelist = ["20 MHz"];
                            item.htmode = '20 MHz';
                            break;
                    }
                }, 100);
            },
            changeHtmodeForAx: function changeHtmodeForAx(item) {
                setTimeout(function () {
                    switch (item.hwmode) {
                        case '802.11b/g/n/ax':
                            item.htmodelist = ['20 MHz', '40 MHz', '20/40 MHz'];
                            item.htmode = '20 MHz'
                            break;
                        case '802.11a/n/ac/ax':
                            item.htmodelist = ["20 MHz", '40 MHz', '80 MHz', '20/40/80 MHz'];
                            item.htmode = '20 MHz';
                            break;    
                        case '802.11b/g/n':
                            item.htmodelist = ['20 MHz', '40 MHz', '20/40 MHz'];
                            item.htmode = '20 MHz'
                            break;
                        case '802.11a/n/ac':
                            item.htmodelist = ["20 MHz", '40 MHz', '80 MHz', '20/40/80 MHz'];
                            item.htmode = '20 MHz';
                            break;
                        default:
                            item.htmodelist = ["20 MHz"];
                            item.htmode = '20 MHz';
                            break;
                    }
                }, 100);
            },
            modifyChannel: function modifyChannel(item) {
                var that = this;
                this.btnStatus = true;
                this.channelId = item.id;
                this.$store.dispatch('call', {
                    api: 'channel',
                    data: {
                        'device': item.device,
                        'ifname': item.ifname
                    },
                    timeOut: 60000
                }).then(function (result) {
                    if (result.success) {
                        setTimeout(function () {
                            that.$message({
                                "type": "success",
                                "api": "channel",
                                "msg": result.code
                            });
                            that.btnStatus = false;
                            that.$store.dispatch("call", {
                                api: "getaps"
                            }).then(function (result) {
                                if (result.success) {
                                    that.getaps = JSON.parse(JSON.stringify(result));
                                    that.getWlancache(that.getaps);
                                }
                            });
                        }, 5000);
                    } else {
                        that.btnStatus = false;
                        that.$message({
                            "type": "error",
                            "api": "channel",
                            "msg": result.code
                        });
                    }
                });
            },
            getWlancache: function getWlancache(data) {
                var that = this;
                var radios = [];
                that.wifi5g = [];
                that.wifi2g = [];
                that.wifi5gGuest = [];
                that.wifi2gGuest = [];
                radios.push(data['wifi_2g'])
                if (data['wifi_5g']) {
                    radios.push(data['wifi_5g'])
                }
                // 数组初始化
                that.SecurityList = ['OPEN', 'WPA2-PSK', 'WPA/WPA2-PSK'];
                if (radios[0].encryptions.length == 5) {
                    that.SecurityList = that.SecurityList.concat(that.SecurityListWpa3);
                }
                for (var i = 0; i < radios.length; i++) {


                    var inter = radios[i].band
                    for (var k = 0; k < radios[i].interfaces.length; k++) {

                        if (radios[i].interfaces[k].encrypt == "psk-mixed") {
                            that.$set(radios[i].interfaces[k], 'encrypt', "WPA/WPA2-PSK")
                        } else if (radios[i].interfaces[k].encrypt == "psk2") {
                            that.$set(radios[i].interfaces[k], 'encrypt', 'WPA2-PSK');
                        } else if (radios[i].interfaces[k].encrypt == "none") {
                            that.$set(radios[i].interfaces[k], 'encrypt', 'OPEN');
                        } else if (radios[i].interfaces[k].encrypt == "sae") {
                            that.$set(radios[i].interfaces[k], 'encrypt', 'WPA3-SAE');
                        } else if (radios[i].interfaces[k].encrypt == "sae-mixed") {
                            that.$set(radios[i].interfaces[k], 'encrypt', 'WPA2/WPA3-PSK/SAE');
                        }

                        if (radios[i].interfaces[k].hidden) {

                            that.$set(radios[i].interfaces[k], 'hidden', 'Hidden');
                        } else {
                            that.$set(radios[i].interfaces[k], 'hidden', 'Shown');
                        }

                        if (inter == "2G") {
                            // 兼容ie(解决ie不兼容Object.assign问题)
                            if (typeof Object.assign != 'function') {
                                Object.assign = function(target) {
                                  'use strict';
                                  if (target == null) {
                                    throw new TypeError('Cannot convert undefined or null to object');
                                  }
                               
                                  target = Object(target);
                                  for (var index = 1; index < arguments.length; index++) {
                                    var source = arguments[index];
                                    if (source != null) {
                                      for (var key in source) {
                                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                                          target[key] = source[key];
                                        }
                                      }
                                    }
                                  }
                                  return target;
                                };
                            }
                            if (radios[i].interfaces[k].guest == '1') {
                                that.$set(radios[i].interfaces[k], 'wifissid', radios[i].interfaces[k].ssid);
                                var item = Object.assign({}, data['wifi_2g'], radios[i].interfaces[k])
                                delete item['interfaces']
                                that.wifi2gGuest.push(item)

                            } else {
                                that.comuptedPower(radios[i].txpower, radios[i].txpower_max, radios[i].interfaces[k])
                                if (!radios[i].interfaces[k].up) {
                                    that.$set(radios[i].interfaces[k], 'channelStatus', false);
                                } else {
                                    that.$set(radios[i].interfaces[k], 'channelStatus', true);
                                }
                                that.$set(radios[i].interfaces[k], 'wifissid', radios[i].interfaces[k].ssid);
                                var item = Object.assign({}, data['wifi_2g'], radios[i].interfaces[k])
                                delete item['interfaces']
                                that.wifi2g.push(item)
                            }

                        } else {
                            if (radios[i].interfaces[k].guest == '1') {
                                that.$set(radios[i].interfaces[k], 'wifissid', radios[i].interfaces[k].ssid);
                                var item = Object.assign({}, data['wifi_5g'], radios[i].interfaces[k])
                                delete item['interfaces']
                                that.wifi5gGuest.push(item)
                            } else {
                                that.comuptedPower(radios[i].txpower, radios[i].txpower_max, radios[i].interfaces[k])
                                if (!radios[i].interfaces[k].up) {
                                    that.$set(radios[i].interfaces[k], 'channelStatus', false);
                                } else {
                                    that.$set(radios[i].interfaces[k], 'channelStatus', true);
                                }
                                that.$set(radios[i].interfaces[k], 'wifissid', radios[i].interfaces[k].ssid);
                                var item = Object.assign({}, data['wifi_5g'], radios[i].interfaces[k])
                                delete item['interfaces']
                                that.wifi5g.push(item)
                            }
                        }
                    }
                }
                this.judge2G = false;
                this.judge2GGuest = false;
                this.judge5G = false;
                this.judge5GGuest = false;


            },
            comuptedPower: function comuptedPower(txpower, txpowerMax, interfaces) {
                var that = this;
                if (txpower == txpowerMax) {
                    that.$set(interfaces, 'txpower', 'Max');
                } else if (parseInt(txpowerMax * 0.5) <= txpower) {
                    that.$set(interfaces, 'txpower', 'High');
                } else  if (txpower == 0 || txpower == 1) {
                    that.$set(interfaces, 'txpower', 'Low');
                } else{
                    that.$set(interfaces, 'txpower', 'Medium');
                }
            },


            generateId: function generateId(name, id, index) {
                return name + "_" + index;
            },
            timerData: function timerData() {
                var that = this;
                that.updatedata();
                clearInterval(that.timer);
            },
            updatedata: function updatedata() {
                var that = this;
                that.$store.dispatch("call", {
                    api: "getaps"
                }).then(function (result) {
                    if (result.success) {
                        that.getaps = JSON.parse(JSON.stringify(result));
                        that.getWlancache(that.getaps);
                        that.checkpassword = true;
                    }
                });
            },
            checkOpen: function checkOpen(item, index) {
                var dom = $("#idHotspotPassword_" + index);
                if (dom.next().next().children().hasClass("icon-eye-close")) {
                    dom.attr("type", "text");
                    dom.next().next().children().removeClass("icon-eye-close glyphicon-eye-close").addClass("glyphicon-eye-open icon-eye-open");
                } else {
                    dom.attr("type", "password");
                    dom.next().next().children().removeClass("glyphicon-eye-open icon-eye-open").addClass("glyphicon-eye-close icon-eye-close");
                }
            },
            hotspotEnableAp: function hotspotEnableAp(item) {
                var that = this;
                clearInterval(that.timer);
                clearTimeout(this.hostenableTimer);
                this.btnStatus = true;
                this.channelId = null
                that.hotEnableAp(item);
            },
            hotEnableAp: function hotEnableAp(item) {
                var that = this;
                this.$store.dispatch("call", {
                    api: "enableap",
                    async: true,
                    data: {
                        id: item.id,
                        ssid: item.ssid,
                        enable: item.up,
                        radio: item.device
                    }
                }).then(function (result) {
                    that.timerData();
                    if (result.failed) {
                        that.btnStatus = false;
                        that.$message({
                            "type": "error",
                            "api": "enableap",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "enableap",
                            "msg": result.code
                        });
                        that.hostenableTimer = setTimeout(function () {
                            that.btnStatus = false;
                            // that.updatedata();
                        }, 10000);
                    } else {
                        that.btnStatus = false;
                        that.$message({
                            "type": "error",
                            "api": "enableap",
                            "msg": result.code
                        });
                    }
                });
            },
            powerChange: function powerChange(item) {
                var data = 0;
                if (item.txpower == 'Max') {
                    data = item.txpower_max
                } else if (item.txpower == 'Low') {
                    data = 0
                } else if (item.txpower == "High") {
                    data = parseInt(item.txpower_max * 0.5);
                } else {
                    data = parseInt(item.txpower_max * 0.25);
                }
                var that = this;
                that.btnStatus = true;
                clearInterval(this.timer);
                clearTimeout(this.powerTimer);
                this.powerTimer = setTimeout(function () {
                    that.$store.dispatch("call", {
                        api: "settxpower",
                        async: true,
                        data: {
                            txpower: data,
                            device: item.device
                        }
                    }).then(function (result) {
                        if (result.failed) {
                            that.btnStatus = false;
                            that.$message({
                                "type": "error",
                                "api": "settxpower",
                                "msg": result.code
                            });
                            return;
                        }
                        if (result.success) {
                            that.btnStatus = false;
                            that.$message({
                                "type": "success",
                                "api": "settxpower",
                                "msg": result.code
                            });
                        } else {
                            that.btnStatus = false;
                            that.$message({
                                "type": "error",
                                "api": "settxpower",
                                "msg": result.code
                            });
                        }
                    }).then(function () {
                        if (!that.modify) {
                            // that.updatedata();
                            that.timerData();
                        }
                    });
                }, 500);
            },
            changeClick: function changeClick(item, index) {
                var btnn = "";
                this.itemThisList = Object.assign({}, item);
                this.wifiId = item.id;
                this.modify = true;
            },
            cancel: function cancel(index) {
                this.checkpassword = true;
                this.wifiId = undefined;
                this.btnStatus = false;
                this.timerData();
            },
            checkpsw: function checkpsw(data, id) {
                this.currentindex = id;
                if (!data) {
                    this.checkpassword = false;
                } else {
                    // 8-63位的非中文字符密码
                    if (this.getLen(data) <= 64 && this.getLen(data) >= 8) {
                        if (escape(data).indexOf("%u") != -1) {
                            this.checkpassword = false;
                        } else {
                            this.checkpassword = true;
                        }
                    } else {
                        this.checkpassword = false;
                    }
                }
            },
            applyBtnClick: function applyBtnClick(item) {
                var that = this;
                this.btnStatus = true;
                var itemsList = item;
                var index = item.id;
                this.channelId = null
                this.wifiId = undefined;
                var obj = {};
                for (var key in that.itemThisList) {
                    if (that.itemThisList[key] !== itemsList[key]) {
                        if (key == 'ssid') {
                            obj[key] = itemsList[key];
                            obj.id = itemsList.id;
                            obj.newssid = itemsList[key];
                        } else if (key == 'key') {
                            obj[key] = itemsList[key];
                            obj.id = itemsList.id;
                            if (itemsList.encrypt == 'OPEN') {
                                obj.encrypt = 'none';
                                delete obj['key'];
                            } else {
                                switch (itemsList.encrypt) {
                                    case 'WPA/WPA2-PSK':
                                        obj.encrypt = 'psk-mixed';
                                        break;
                                    case 'WPA2-PSK':
                                        obj.encrypt = 'psk2';
                                        break;
                                    case 'WPA3-SAE':
                                        obj.encrypt = 'sae';
                                        break;
                                    case 'WPA2/WPA3-PSK/SAE':
                                        obj.encrypt = 'sae-mixed';
                                        break;
                                    default:
                                        obj.encrypt = 'psk-mixed'; 
                                        break;
                                }
                            }
                        } else if (key == 'channel') {
                            obj[key] = itemsList[key];
                            obj.device = itemsList.device;
                        } else if (key == 'htmode') {
                            obj[key] = itemsList[key];
                            obj.device = itemsList.device;
                        } else if (key == 'encrypt' && itemsList[key] == 'OPEN') {
                            obj.encrypt = 'none';
                            obj.id = itemsList.id;
                            if (itemsList.key !== that.itemThisList[key]) {
                                obj.key = itemsList.key;
                                delete obj['key'];
                            }
                        } else if (key == "hwmode") {
                            obj.hwmode = itemsList[key];
                            obj.device = itemsList.device;
                            obj.htmode = itemsList.htmode;
                            obj.id = itemsList.id;
                        } if (key == 'encrypt' && itemsList[key] == 'WPA/WPA2-PSK') {
                            obj.encrypt = 'psk-mixed';
                            obj.key = itemsList.key;
                            obj.id = itemsList.id;
                        } else if (key == 'encrypt' && itemsList[key] == 'WPA2-PSK') {
                            obj.encrypt = 'psk2';
                            obj.key = itemsList.key;
                            obj.id = itemsList.id;
                        } else if (key == 'encrypt' && itemsList[key] == 'WPA2/WPA3-PSK/SAE') {
                            obj.encrypt = 'sae-mixed';
                            obj.key = itemsList.key;
                            obj.id = itemsList.id;
                        } else if (key == 'encrypt' && itemsList[key] == 'WPA3-SAE') {
                            obj.encrypt = 'sae';
                            obj.key = itemsList.key;
                            obj.id = itemsList.id;
                        } else if (key == "hidden") {
                                obj.hidden = itemsList[key] == "Shown"?false:true;
                                obj.id = itemsList.id;
                        }else if(key == 'maxsta'){
                            obj.maxsta =  itemsList[key]
                            obj.id = itemsList.id;
                        }
                    }
                }
                delete obj['channels'];
                delete obj['htmodelist'];
                delete obj['hwmodelist'];
                delete obj['txpower'];
                delete obj['encryptions'];
               if (this.router.model == 'ap1300') {
                if (!this.regnum.test(item.maxsta)) {
                    this.$message({
                        type: 'error',
                        msg: -4
                    });
                    this.wifiId = index;
                    return;
                }
               }
                if (item.ssid.length == 0) {
                    this.$message({
                        type: 'warning',
                        msg: -2802
                    });
                    that.btnStatus = false;
                    this.wifiId = index;
                    return;
                }
                if (this.getLen(item.ssid) > 32) {
                    this.$message({
                        type: 'error',
                        msg: -102
                    });
                    this.wifiId = index;
                    return;
                }
                if (!item.key && obj.encrypt && obj.encrypt != 'none') {
                    this.checkpassword = false;
                    that.btnStatus = false;
                }
                if (!this.checkpassword && index == this.currentindex && obj.encrypt && obj.encrypt != 'none') {
                    that.btnStatus = false;
                    this.wifiId = index;
                    return;
                }
                clearInterval(that.timer);
                this.$store.dispatch("call", {
                    api: "updateap",
                    data: obj
                }).then(function (result) {
                    that.modify = false;
                    if (result.failed) {
                        that.timer = setTimeout(function () {
                            that.$message({
                                "type": "error",
                                "api": "updateap",
                                "msg": result.code
                            });
                            that.timerData();
                            that.btnStatus = false;
                        }, 3000);
                        return;
                    }
                    if (result.success) {
                        that.timer = setTimeout(function () {
                            that.$message({
                                "type": "success",
                                "api": "updateap",
                                "msg": result.code
                            });
                            that.timerData();
                            item.wifissid = item.ssid;
                            that.btnStatus = false;
                        }, 3000);
                    } else {
                        that.timer = setTimeout(function () {
                            that.$message({
                                "type": "error",
                                "api": "updateap",
                                "msg": result.code
                            });
                            that.timerData();
                            that.btnStatus = false;
                        }, 3000);
                    }
                });
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
            concatItem: function concatItem(data) {
                var item = data.ath0.concat(data.ath1, data.eth1)
                return item
            },
            changeSecurity: function changeSecurity(val, type) {
                if (type == '2g') {
                    if (!this.judge2G) this.judge2G = true;
                    else this.securityDialog(val);
                } else if (type == '2g-guest') {
                    if (!this.judge2GGuest) this.judge2GGuest = true;
                    else this.securityDialog(val);
                } else if (type == '5g') {
                    if (!this.judge5G) this.judge5G = true;
                    else this.securityDialog(val);
                } else if (type == '5g-guest') {
                    if (!this.judge5GGuest) this.judge5GGuest = true;
                    else this.securityDialog(val);
                }
            },
            securityDialog: function securityDialog(val) {
                var that = this;
                if (val == 'OPEN' || val == 'WPA/WPA2-PSK') {
                    this.$store.commit("showModal", {
                        show: true,
                        type: 'warning',
                        title: "Warning",
                        message: that.t('The Wi-Fi encryption method you choose has a low-security level.'),
                        showCancelBtn: false,
                        closeOnClickMask: false,
                        esc: false
                    });
                }
            }
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
        },

        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnStatus) {
                clearInterval(this.timer);
                this.$store.commit('clearTimer_sta');
                next();
            } else {
                this.$message({
                    "type": "warning",
                    "msg": -2800,
                    "duration": 1000
                });
            }
        }
    });
    return vueComponent;
});
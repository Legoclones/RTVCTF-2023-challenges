"use strict";

define(["vue", "text!temple/internet/modem.html", "component/gl-dropdown/index", "component/gl-btn/index", "component/gl-comfirm-btn/index", "component/gl-input/index", "component/gl-label/index", "component/gl-select/index", "component/gl-loading/index", "component/gl-tooltip/index"], function (Vue, stpl, gl_dropdown, gl_btn, gl_cf_btn, gl_input, gl_label, gl_select, gl_loading, gl_tooltip) {
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
            "gl-tooltip": gl_tooltip
        },
        data: function data() {
            return {
                timermo: "", //modem定时器
                timeOut: "", //按钮timeout
                moServiceList: ["LTE/UMTS/GPRS", "CDMA/EVDO"],
                // moapn: "",
                modeStatus: false, //modem 高级设置模式
                modevice: "",
                moservice: "",
                mopincode: "",
                mopdanum: "",
                mousername: "",
                mopasswd: "",
                operator: "",
                envelope: false,
                moexpect: "init",
                mosuccess: 'init',
                mosetting: true, //当前模块设置
                isGetModem: false,
                modemIndex: 0, //      当前显示模块索引
                connectIndex: 0, //  当前连接索引
                resetIndex: 0, // 当前重置模块索引
                moreset: true, //重置
                reset: true,
                modemNum: 0,
                isManual: 'Default',
                isconnect: false,
                btnName: { //当前模块的自动按钮
                    "btn0": "Auto Setup",
                    "btn1": "Auto Setup",
                    "btn2": "Auto Setup"
                },
                athList: [
                    "NONE",
                    "PAP",
                    "CHAP",
                    "PAP or CHAP"
                ],
                moapns: { //当前模块的apn
                    "apn0": '',
                    "apn1": '',
                    "apn2": ''
                    // mosettings: {   
                    //     "moset0": true,
                    //     "moset1": true,
                    //     "moset2": true,
                    // }
                },
                athvalue:'NONE',
                timer_modem: null,
                modeInfoError: "",
                simModel: "SIM1",
                reveiceModel: "SIM1",
                simList: ["SIM1", "SIM2"],
                protoList: ['auto', 'qcm'],
                protoVal: 'auto',
                ttlVal: '',
                mtuVal:'',
                textObj: {fasterSpeedTxt: null, compatibilityTxt: null}
            };
        },
        beforeDestroy: function beforeDestroy() {
            clearTimeout(this.timermo);
            clearTimeout(this.timeOut);
            clearTimeout(this.timer_modem);
            // console.log("beforeDestroy modem");
        },
        computed: {
           
            moInfo: function moInfo() {
                return this.$store.getters.apiData["moInfo"];
            },
            modifyWifiChannel:function modifyWifiChannel() {
                return  this.t(`It is advised to set your channel to ${this.moInfo.hint_modify_wifi_channel} to avoid co-channel interference.`)
            },
            modems: function modems() {
                return this.moInfo.modems;
            },
            moGetconfig: function moGetconfig() {
                return this.$store.getters.apiData['moGet'];
            },
            router: function router() {
                return this.$store.getters.apiData['router_mini'];
            },
            // 模块连接后保存的配置
            configapn: function configapn() {
                if (this.moGetconfig.config && this.moGetconfig.config.apn != '') {
                    return false;
                }
                return true;
            },
            // apn列表
            apns: function apns() {
                return this.$store.getters.carinfo;
            },
            // 按钮过渡效果
            mobtnStatus: function mobtnStatus() {
                if (this.moexpect != "init") {
                    if (this.moexpect == this.modems[this.connectIndex].up || this.mosuccess == this.modems[this.connectIndex].up) {
                        this.moexpect = "init";
                        this.mosuccess = "init";
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            },
            modeEnvelope: function modeEnvelope() {
                if (this.router.model == 'mifi' || this.router.model == 'e750' || this.router.model == 'x750' || this.router.model == 'xe300' || this.router.model == 'x300b' || this.router.model == 'ap1300') {
                    return true;
                }
                return false;
            }
        },
        mounted: function mounted() {
            var _this = this;
            if (this.moInfo && this.moInfo.success) {
                this.isGetModem = true;
                _this.$store.commit("setonlist", {
                    data: "modem"
                });
            } else {
                _this.$store.commit("setofflist", {
                    data: "modem"
                });
            }
            this.timer_modem = setTimeout(function () {
                _this.renderData();
            }, 300);
            if (this.router.model == 'x1200') {
                this.envelope = true
            } else {
                this.envelope = false
            }
            this.getModemInfo();

        },
        methods: {
            getSimSwitch: function getSimSwitch(data, item) {
                var that = this;
                that.simModel = data;
                clearTimeout(this.timermo);
                var map = {
                    "bus": item.bus,
                    'modem_id': item.modem_id,
                    "sim_num": "1"
                }
                if (data == "SIM2") {
                    map.sim_num = "2"
                }
                this.$store.commit("showModal", {
                    type: "default",
                    title: "Caution",
                    message: this.t('Do you want to switch SIM card?'),
                    cb: function cb() {
                        that.switchSimApply(map);
                    },
                    cancel: function cancel() {
                        that.simModel = that.reveiceModel;
                    }
                });
            },
            switchSimApply: function switchSimApply(map) {
                var that = this
                that.moreset = false
                this.$store.dispatch("call", {
                    api: "simswitch",
                    data: map,
                    timeOut: 25000
                }).then(function (result) {
                    setTimeout(function () {
                        that.renderData();
                    }, 5000);
                    that.moreset = true;
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
                });
            },
            //渲染数据
            renderData: function renderData() {
                var that = this;
                that.timerMoData(); //modem info
            },
            timerMoData: function timerMoData() {
                var that = this;
                that.getMoData();
                // clearTimeout(this.timermo);
                // this.getMoData();
            },
            getMoData: function getMoData() {
                var that = this;
                clearTimeout(that.timermo);
                that.timermo = setTimeout(function () {
                    // clearTimeout(that.timermo);
                    that.getModemInfo()
                }, 10000);
                //  : null;
            },
            getModemInfo: function getModemInfo() {
                var that = this;
                that.$store.dispatch("call", {
                    api: "moInfo"
                }).then(function (result) {
                    if (that.isManual != 'Manual') {
                        that.modemNum = 0
                        that.moreset = true;
                        if (result.success) {
                            that.modeInfoError = result.warning
                            that.isGetModem = true;
                            that.$store.commit("setonlist", {
                                data: "modem"
                            });
                            that.mosetting = true;
                            // 清空apn
                            that.$store.commit('checkapns');
                            for (var i = 0; i < result.modems.length; i++) {
                                // 获取apn列表
                                if (result.modems[i].apns && result.modems[i].apns.length) {
                                    const apns = result.modems[i].apns.map(item=>{
                                        return {
                                            "-apn":item
                                        }
                                    })
                                    that.$store.commit('checkapns' , apns);
                                }else{
                                    that.$store.commit("getapns", result.modems[i]);
                                }
                                if (result.modems[i].up != 'off') {
                                    that.modemNum++;
                                }
                                if (result.modems[i].sim_num && result.modems[i].hw_version == "GL-X1200-S") {
                                    if (result.modems[i].sim_num == '1') {
                                        that.simModel = "SIM1";
                                        that.reveiceModel = "SIM1";
                                    } else {
                                        that.simModel = "SIM2";
                                        that.reveiceModel = "SIM2";
                                    }
                                }
                                if (result.modems[i].SIM_status === 0) {
                                    let fasterTxt = result.modems[i].qmi_port && result.modems[i].qmi_port.split('/')[result.modems[i].qmi_port.split('/').length - 1]
                                    let compatibilityTxt = result.modems[i].data_port && result.modems[i].data_port.split('/')[result.modems[i].data_port.split('/').length - 1]
                                    that.textObj = {
                                        fasterSpeedTxt: fasterTxt,
                                        compatibilityTxt: compatibilityTxt
                                    }
                                } else {
                                    that.textObj = {fasterSpeedTxt: null, compatibilityTxt: null}
                                }
                            }
                        } else if (result.code == "-17" || result.code == "-3") {
                            //不支持
                            that.isGetModem = false;
                            clearTimeout(that.timermo);
                            that.$store.commit("removeInter", {
                                data: "modem"
                            });
                        } else {
                            that.isGetModem = false;
                            that.$store.commit("checkapns");
                            that.$store.commit("setofflist", {
                                data: "modem"
                            });
                        }
                    }
                    that.getMoData();
                }).catch(function() {
                    that.getMoData();
                });
            },
            // 手动 apply
            manualSet: function manualSet(item, index, status) {
                var that = this;
                if (that.modemNum == 2) {
                    if (item.up == 'off') {
                        that.$message({
                            type: 'error',
                            msg: that.t(that.$lang.internet.Support)
                        });
                        return
                    }
                }
                if (that.moapns['apn' + index] && this.getLen(that.moapns['apn' + index]) > 32) {
                    that.$message({
                        type: 'error',
                        msg: -1321
                    });
                    return;
                }
                if (this.mopincode && this.getLen(this.mopincode) > 32) {
                    that.$message({
                        type: 'error',
                        msg: -1317
                    });
                    return;
                }
                if (this.mopdanum && this.getLen(this.mopdanum) > 32) {
                    that.$message({
                        type: 'error',
                        msg: -1318
                    });
                    return;
                }
                if (this.mousername && this.getLen(this.mousername) > 32) {
                    that.$message({
                        type: 'error',
                        msg: -1319
                    });
                    return;
                }
                if (this.mopasswd && this.getLen(this.mopasswd) > 32) {
                    that.$message({
                        type: 'error',
                        msg: -1320
                    });
                    return;
                }
                if (this.ttlVal && (/^[0-9]+$/.test(this.ttlVal)) && (this.ttlVal <= 0 || this.ttlVal > 255)) {
                    that.$message({
                        type: 'error',
                        msg: 'The value range of TTL is 1~255'
                    });
                    return;
                }
                if (this.mtuVal && (/^[0-9]+$/.test(this.mtuVal)) && (this.mtuVal <= 68 || this.mtuVal > 65535)) {
                    that.$message({
                        type: 'error',
                        msg: 'The MTU value range of TTL is 68~65535'
                    });
                    return;
                }
                this.ttlVal ? this.ttlVal = parseInt(this.ttlVal) : this.ttlVal = ''
                this.mtuVal ? this.mtuVal = parseInt(this.mtuVal) : this.mtuVal = ''
                var service;
                if (that.moservice.toLowerCase().indexOf("umts") != -1) {
                    // LTE/UMTS/GPRS
                    service = "umts";
                } else {
                    // CDMA/EVDO
                    service = "evdo";
                }
                if (status != 'off') {
                    that.isconnect = true;
                }
                // if (that.athvalue != 'NONE' && (that.mopasswd.length == 0 || that.mousername.length == 0)) {
                //     that.$message({
                //         "type": 'error',
                //         msg: 'The username and password cannot be empty'
                //     });
                //     return;
                // }
                that.moexpect = 'on';
                that.mosuccess = 'connecting';
                // that.mosettings['moset' + index] = true
                that.mosetting = true;
                that.connectIndex = index;
                that.isManual = "Default";
                clearTimeout(this.timeOut);
                clearTimeout(this.timermo);
                this.$store.dispatch("call", {
                    api: "moSet",
                    data: {
                        bus: item.bus,
                        modem_id: item.modem_id,
                        device: that.modevice,
                        service: service,
                        apn: that.moapns['apn' + index],
                        pincode: that.modevice.indexOf('cdc-wdm') < 0 ? that.mopincode : '',
                        ath:this.athvalue,
                        dianum: that.mopdanum,
                        username: that.mousername,
                        password: that.mopasswd,
                        proto:that.modevice.indexOf('cdc-wdm') < 0 ?'auto': that.protoVal,
                        ttl: that.ttlVal,
                        mtu: that.mtuVal,
                        operator: that.operator === "Auto" ? "": that.operator
                    },
                    timeOut: 30000
                }).then(function (result) {
                    that.manualStatus = false;
                    if (!result.success) {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                        that.moexpect = "init";
                        that.mosuccess = "init";
                        that.isconnect = false;
                    }
                    if (status != 'off') {
                        setTimeout(function () {
                            that.isconnect = false;
                        }, 3000);
                    }
                    that.timerMoData();
                    that.$store.dispatch("call", {
                        api: 'moGet'
                    }).then(function (result) {
                        if (result.code == 0) {
                            that.athvalue = result.config.authentication;
                            that.protoVal = result.config.proto;
                            that.ttlVal = result.config.ttl;
                            that.mtuVal = result.config.mtu
                        }
                    });
                    // var time = item.modem_id == 255 ? 30000 : 30000;
                    that.timeOut = setTimeout(function () {
                        if (that.moexpect != 'init' || that.mosuccess != 'init') {
                            that.moexpect = "init";
                            that.mosuccess = "init";
                        }
                    }, 30000);
                });
            },
            // 断开连接
            moDisconnect: function moDisconnect(item, index) {
                var that = this;
                that.moexpect = 'off';
                clearTimeout(that.timermo);
                clearTimeout(that.timeOut);
                that.connectIndex = index;
                this.$store.dispatch("call", {
                    api: "moEnable",
                    data: {
                        bus: item.bus,
                        modem_id: item.modem_id,
                        disable: true
                    }
                }).then(function (result) {
                    if (!result.success) {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                        that.moexpect = "init";
                    }
                    that.timerMoData();
                    that.timeOut = setTimeout(function () {
                        if (that.moexpect != 'init') {
                            that.moexpect = "init";
                        }
                    }, 15000);
                });
            },
            // 自动连接
            autoSet: function autoSet(item, index) {
                var that = this;
                if (that.modemNum >= 2) {
                    that.$message({
                        type: 'error',
                        msg: that.t(that.$lang.internet.Support)
                    });
                    return
                }
                that.moexpect = 'on';
                that.mosuccess = "connecting";
                that.connectIndex = index;
                clearTimeout(that.timeOut);
                clearTimeout(that.timermo);
                this.$store.dispatch("call", {
                    api: "moAuto",
                    data: {
                        bus: item.bus,
                        modem_id: item.modem_id,
                        isps: JSON.stringify(that.apns[index])
                    },
                    timeOut: 85000
                }).then(function (result) {
                    if (!result.success) {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                        that.moexpect = 'init';
                    }
                    // var time = item.modem_id == 255 ? 30000 : 30000;
                    that.timerMoData();
                    that.timeOut = setTimeout(function () {
                        if (that.moexpect != 'init' || that.mosuccess != 'init') {
                            // that.$message({
                            //     type: "error",
                            //     msg: -1307 // sim卡拨号连接超时。
                            // });
                            that.moexpect = 'init';
                            that.mosuccess = 'init';
                        }
                    }, 30000);
                });
            },
            // 开启关闭切换
            checkStatus: function checkStatus() {
                if (this.checkBtn == 'Apply') {
                    this.manualSet();
                    return;
                }
                this.moDisconnect();
            },
            // 更多设置
            clickMoSet: function clickMoSet(item, index) {
                var that = this;
                clearTimeout(that.timermo);
                clearTimeout(that.timeOut);
                that.isManual = 'Manual'
                that.$store.dispatch("call", {
                    api: "moGet",
                    data: {
                        modem_id: item.modem_id,
                        bus: item.bus
                    }
                }).then(function (result) {
                    that.mosetting = false;
                    if (result.success) {
                        that.athvalue = result.config.authentication
                        var config = result.config;
                        if (config.device) {
                            that.modevice = config.device;
                        } else {
                            for (var i = 0; i < that.modems[index].ports.length; i++) {
                                if (that.modems[index].ports[i].indexOf("cdc-wdm") != -1) {
                                    that.modevice = that.modems[index].ports[i];
                                }
                            }
                        }
                        if (config.service) {
                            if (config.service.toLowerCase() == "evdo") {
                                that.moservice = that.moServiceList[1];
                            } else {
                                that.moservice = that.moServiceList[0];
                            }
                        }
                        // that.moapn = config.apn;
                        that.mopincode = config.pincode;
                        that.mopdanum = config.dialnum;
                        that.mousername = config.username;
                        that.mopasswd = config.password;
                        // that.mosettings['moset' + index] = false;
                        that.moapns['apn' + index] = config.apn;
                        that.athvalue = config.authentication;
                        that.protoVal = config.proto;
                        that.ttlVal = config.ttl;
                        that.mtuVal = config.mtu
                        that.operator = config.operator || 'Auto'
                    }
                });
            },
            // 获取inpit输入apn
            getmoapn: function getmoapn(data) {
                this.moapns['apn' + this.modemIndex] = data;
            },
            // 点击返回
            clickBack: function clickBack(index) {
                // this.mosettings['moset' + index] = true;
                this.mosetting = true;
                this.isManual = "Default";
                this.timerMoData();
            },
            // 重置
            clickMoReset: function clickMoReset(item, index) {
                var that = this;
                clearTimeout(that.timeOut);
                clearTimeout(that.timermo);
                that.moreset = false;
                that.reset = false;
                that.manualStatus = false;
                that.resetIndex = index;
                this.isManual = "Default";
                setTimeout(function () {
                    that.reset = true;
                    that.moreset = false;
                    that.$store.dispatch("call", {
                        api: "moReset",
                        data: {
                            bus: item.bus,
                            modem_id: item.modem_id
                        },
                        timeOut: 35000
                    }).then(function (result) {
                        that.timeOut = setTimeout(function () {
                            that.timerMoData();
                        }, 10000);
                    });
                }, 3000);
            },
            changeModal: function changeModal() {
                this.modeStatus = !this.modeStatus;
            },
            checkModem: function checkModem(data) {
                this.clickBack();
                this.modemIndex = data;
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
            getMoreSetting: function getMoreSetting(index) {
                $('#advanced' + index).slideDown();
                $('.modem' + index).hide();
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
            newOperator(arr){
                return ['Auto',...arr]
            }
        }
    });
    return vueComponent;
});
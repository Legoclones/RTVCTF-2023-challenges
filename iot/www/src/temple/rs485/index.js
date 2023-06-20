"use strict";

define(["text!temple/rs485/index.html", "css!temple/rs485/index.css", "vue", "component/gl-toggle-btn/index", "component/gl-tooltip/index", "component/gl-btn/index", "component/gl-input/index", "component/gl-label/index", "component/gl-select/index", "component/gl-toggle-btn/index"], function (stpl, css, Vue, gl_switch, gl_tooltip, gl_btn, gl_input, gl_label, gl_select, gl_toggle) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
              // config
              configInfo: {},
              modifyConfigStatus: true,
              configBtnStatus: false,
              modifyBtnStatus: false,
              isCustom: false,
              speedList: ["1200", "2400", "4800", "9600", "19200", "38400", "57600", "115200", "Custom"],
              // terminal
              terminalList: {},
              applyTerminalStatus: false,
              writeTerminal: false,
              isReadResult: false,
              readResult: '',
              // Temperature & Humidity,
              tempHumiList: {},
              applyTempHumiStatus: false,
              setTempHumi: false,
              tempHumiVal: {},
              getTempHumiStatus: false,
              // message
              sendMessageData: {
                show_date: false,
                show_send: false,
                data: ''
              },
              messageType: ["str", "hex"],
              sendMessageStatus: false,
              isSendMessage: false,
              receiveMessage: null,
              // socket
              socketModeList: ['tcpc', 'tcps', 'udp'],
              socketData: {},
              isSocketCancelConnectingBtn: true,
              socketApplyBtnStatus: false,
              socketConnectStatus: false,
              // mqtt
              mqttConnectStatus: false,
              mqttData: {},
              qosClientidList: [0, 1, 2],
              isMqttCanceConnectinglBtn: true,
              mqttApplyBtnStatus: false,
              autoconnList: [this.t('Enabled'), this.t('Disabled')]
            };
        },
        components: {
            "gl-switch": gl_switch,
            "gl-tooltip": gl_tooltip,
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-label": gl_label,
            "gl-select": gl_select,
            "gl-tg-btn": gl_toggle,
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                setTimeout(function () {
                    if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                        $("#vpn").collapse("hide");
                        $("#moresetting").collapse("hide");
                        $("#applications").collapse("hide");
                        $("#system").collapse("hide");
                    }
                }, 50);
            });
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
          clearInterval(this.socketMqttConnectTimeOut);
          next();
        },
        computed: {
          modeList: function speedList() {
            var numArr = [8, 7, 6, 5];
            var strArr = ['n', 'e', 'o'];
            var arr = [];
            for (var i = 0; i < 4; i ++) {
              for (var j = 0; j < 3; j++ ) {
                for (var z = 1; z < 3; z ++) {
                  arr.push(numArr[i] + strArr[j] + z)
                }
              }
            }
            return arr;
          }
        },
        methods: {
          // 获取配置信息
          getConfigInfo: function getConfigInfo() {
            var that = this;
            this.$store.dispatch("call", {
              api: "getrs485_config"
            }).then(function(res) {
              if (res.code === 0) {
                that.configInfo = res.rs485_config
              }
            });
          },
          // 设置配置信息
          setConfigInfo: function setConfigInfo() {
            var that = this;
            if (this.configInfo.device.length > 32 || this.configInfo.device.length == 0) {
              this.verifyTip('warning', that.t('The device should be more than 1 and less than 32 characters in length'));
              return;
            }
            if (!(/^[-]?\d+$/.test(this.configInfo.speed))) {
              this.verifyTip('warning', that.t('The speed must be an integer'));
              return;
            }
            if (this.configInfo.speed > 115200 || this.configInfo.speed < 0 || this.configInfo.speed.length > 6) {
              this.verifyTip('warning',  that.t('Speed') + ':' + that.t('value must be in the range of 0~115200'));
              return;
            }
            if (/^[-]?\d+$/.test(this.configInfo.timeout)) {
              if (0 > this.configInfo.timeout || 65535 < this.configInfo.timeout || this.configInfo.timeout.length > 5) {
                this.verifyTip('warning', that.t('Timeout') + ':' + that.t('value must be in the range of 0~65535'));
                return;
              }
            } else {
              this.verifyTip('warning', that.t('Timeout') + ':' + that.t('value must be in the range of 0~65535'));
              return;
            }
            var that = this;
            this.configBtnStatus = false;
            this.modifyConfigStatus = true;
            this.modifyBtnStatus = true;
            this.$store.dispatch("call", {
              api: "setrs485_config",
              data: {
                device: that.configInfo.device,
                speed: that.configInfo.speed,
                mode: that.configInfo.mode,
                timeout: that.configInfo.timeout,
                type: that.configInfo.type
              }
            }).then(function(res) {
              if (res.code == 0) {
                that.verifyTip('success', 'success', 'setrs485_config');
                that.isCustom = false
                that.getConfigInfo()
              } else {
                that.verifyTip('error', 'error', 'setrs485_config');
              }
              that.modifyBtnStatus = false;
            });
          },
          // 取消修改
          clickConfigCancel: function clickConfigCancel() {
            this.configBtnStatus = false;
            this.modifyConfigStatus = true;
            this.isCustom = false;
            this.getConfigInfo();
          },
          // 确认修改
          clickConfigModify: function clickConfigModify() {
            this.configBtnStatus = true;
            this.modifyConfigStatus = false;
          },
          // speed select
          getSpeedSelectVal: function getSpeedSelectVal(val) {
            if (val == 'Custom') {
              this.isCustom = true;
              this.configInfo.speed = '';
            } else this.isCustom = false;
          },
          ApplyreadTerminal: function ApplyreadTerminal(val) {
            var that = this;
            // device id
            // 01 - f7
            var deviceIDREG = /^([0-9A-Ea-e][0-9A-Fa-f]$)|(^[Ff][0-7]$)/;
            if (!deviceIDREG.test(this.terminalList.device_id) || this.terminalList.device_id == '00') {
              this.verifyTip('warning', this.t('Device ID') + ':' + this.t('has to be hex'));
              return;
            }
            var func_code = this.terminalList.func_code,
                reg_addr_h = this.terminalList.reg_addr_h,
                reg_addr_l = this.terminalList.reg_addr_l;
            /* if (!funcCodeReg.test(func_code) || func_code == '00') {
              this.verifyTip('warning', this.t('Function Code') + ':' + this.t('has to be hex'));
              return;
            } */
            if (!this.regFunction(func_code, this.t('Function Code'))) {
              return;
            }
            if (!(this.regFunction(reg_addr_h, this.t('Reg Addr')) && this.regFunction(reg_addr_l, this.t('Reg Addr')))) {
              return;
            }
            // 01 - 20
            if (!(/(^[0-1][0-9A-Fa-f]$)|(^[2][0]$)/.test(this.terminalList.reg_len)) || this.terminalList.reg_len == '00') {
              this.verifyTip('warning', this.t('Reg Len') + ':' + that.t('has to be hex'));
              return;
            }
            if (val == 'read') {
              this.applyTerminalStatus = true;
              this.$store.dispatch("call", {
                api: "readrs485_data",
                data: {
                  device_id: that.terminalList.device_id,
                  func_code: that.terminalList.func_code,
                  reg_addr_h: that.terminalList.reg_addr_h,
                  reg_addr_l: that.terminalList.reg_addr_l,
                  reg_len: that.terminalList.reg_len,
                }
              }).then(function(res) {
                if (res.code == 0) {
                  if (res.rs485_data.error) {
                    that.verifyTip('error', res.rs485_data.error, 'readrs485_data');
                    that.isReadResult = false;
                  } else {
                    that.verifyTip('success', 'success', 'readrs485_data');
                    that.isReadResult = true;
                    that.readResult = res.rs485_data.alldata
                  }
                } else {
                  that.verifyTip('error', 'error', 'readrs485_data');
                  that.isReadResult = false;
                }
                that.applyTerminalStatus = false;
              })
            } else if (val = 'write') {
              var reg = /^[A-Fa-f0-9]+$/;
              if (!(/(^[0-3][0-9a-fA-F]|$)|(^[4][0]$)/.test(this.terminalList.data_count)) || this.terminalList.data_count == '00' || this.terminalList.data_count == '01') {
                this.verifyTip('warning', this.t('Data Count') + ':' + this.t('has to be hex'));
                return;
              }
              if (!this.terminalList.data  || !reg.test(this.terminalList.data)) {
                this.verifyTip('warning', this.t('Data') + ':' + this.t('has to be hex'));
                return;
              }
              if (this.terminalList.data.length > 128) {
                this.verifyTip('warning', this.t('Data') + ':' + this.t('should be more than 1 and less than 128 characters in length'));
                return;
              }
              this.applyTerminalStatus = true;
              this.$store.dispatch("call", {
                api: "writers485_data",
                data: {
                  device_id: that.terminalList.device_id,
                  func_code: that.terminalList.func_code,
                  reg_addr_h: that.terminalList.reg_addr_h,
                  reg_addr_l: that.terminalList.reg_addr_l,
                  reg_len: that.terminalList.reg_len,
                  data_count: that.terminalList.data_count,
                  data: that.terminalList.data
                }
              }).then(function(res) {
                if (res.code == 0) {
                  if (res.error) {
                    that.verifyTip('error', res.error, 'readrs485_data');
                    that.applyTerminalStatus = false;
                  }
                  if (res.rs485_data.error) {
                    that.verifyTip('error', res.rs485_data.error, 'readrs485_data');
                    that.isReadResult = false;
                  } else {
                    that.verifyTip('success', 'success', 'readrs485_data');
                    that.isReadResult = true;
                    that.readResult = res.rs485_data.alldata;
                    that.applyTerminalStatus = false;
                  }
                } else {
                  that.verifyTip('error', 'error', 'readrs485_data');
                  that.isReadResult = false;
                }
                that.applyTerminalStatus = false;
              })
            }
          },
          openWriteInput: function openWriteInput(val) {
            val == 'write' ? this.writeTerminal = true : this.writeTerminal = false
            if (val == 'write') {
              this.writeTerminal = true;
            } else if (val == 'read') {
              this.writeTerminal = false;
            }
            this.isReadResult = false;
          },
          // 匹配两位16进制码
          regFunction: function regFunction(str, type) {
            var reg=/^[0-9a-fA-F][0-9a-fA-F]$/;
            if (!str) {
              this.verifyTip('warning', type + ':' + this.t('has to be hex'));
              return false;
            } else if (str.length != 2) {
              this.verifyTip('warning', type + ':' + this.t('has to be hex'));
              return false;
            } else {
              if(reg.test(str)) {
                return true;
              } else {
                this.verifyTip('warning', type + ':' + this.t('has to be hex'));
                return false;
              }
            }
          },
          // change tab
          changeTab: function changeTab() {
            
          },
          // message
          sendMessage: function sendMessage() {
            if (this.sendMessageData.data.length == 0 || this.sendMessageData.data.length > 128) {
              this.verifyTip('warning', this.t('Data') + ':' + this.t('should be more than 1 and less than 128 characters in length'));
              return;
            }
            var that = this;
            this.isSendMessage = true;
            this.$store.dispatch('call', {
              api: 'send_read_message',
              data: that.sendMessageData
            }).then(function (res) {
              that.isSendMessage = false;
              if (res.code == 0) {
                that.verifyTip('success', 'success', 'send_read_message');
                that.receiveMessage = res.rs485_data;
              } else {
                that.verifyTip('error', 'error', 'send_read_message');
              }
            })
          },
          // socket
          getSocketData: function getSocketData() {
            var that = this;
            this.$store.dispatch('call', {
              api: 'get_socket'
            }).then(function (res) {
              if (res.code == 0) {
                that.socketData = res.rs485_socket_config;
              }
            })
          },
          getSocketConnectStatus: function getSocketConnectStatus() {
            var that = this;
            this.$store.dispatch('call', {
              api: 'status_socket'
            }).then(function (res) {
              if (res.code == 0) {
                res.rs485_socket_status == 1 ? that.socketConnectStatus = true : that.socketConnectStatus = false;
                that.socketApplyBtnStatus = false;
              } else that.socketApplyBtnStatus = false;
            })
          },
          // mqtt
          getMqttData: function getMqttData() {
            var that = this;
            this.$store.dispatch('call', {
              api: 'get_mqtt'
            }).then(function (res) {
              if (res.code == 0) {
                that.mqttData = res.rs485_mqtt_config;
                that.mqttData.autoconn = that.mqttData.autoconn == 1 ? that.t('Enabled') : that.t('Disabled');
              }
            })
          },
          getMqttConnectStatus: function getMqttConnectStatus() {
            var that = this;
            this.$store.dispatch('call', {
              api: 'status_mqtt'
            }).then(function (res) {
              if (res.code == 0) {
                res.rs485_mqtt_status == 1 ? that.mqttConnectStatus = true : that.mqttConnectStatus = false;
                that.mqttApplyBtnStatus = false;
              } else that.mqttApplyBtnStatus = false;
            })
          },
          // modify - cancel
          clickSocketMqttModify: function clickSocketMqttModify(type) {
            if (type == 'socket') {
              this.isSocketCancelConnectingBtn = false;
            } else if (type == 'socketCancel') {
              this.isSocketCancelConnectingBtn = true;
              this.getSocketData();
            } else if (type == 'mqtt') {
              this.isMqttCanceConnectinglBtn = false;
            } else if (type == 'mqttCancel') {
              this.isMqttCanceConnectinglBtn = true;
              this.getMqttData();
            }
          },
          // apply -start - stop
          applyStopStartSocketMqtt: function applyStopStartSocketMqtt(type) {
            var that = this;
            if (type == 'socketStart' || type == 'mqttStart') {
              var startStopApi = null;
              if (type == 'socketStart') {
                this.socketApplyBtnStatus = true;
                this.socketConnectStatus ? startStopApi = 'stop_socket' : startStopApi = 'start_socket';
              } else if (type == 'mqttStart') {
                this.mqttApplyBtnStatus = true;
                this.mqttConnectStatus ? startStopApi = 'stop_mqtt' : startStopApi = 'start_mqtt';
              }
              this.$store.dispatch('call', {
                api: startStopApi
              }).then(function (res) {
                if (res.code == 0) {
                  if (type == 'socketStart') {
                    that.socketApplyBtnStatus = !that.socketApplyBtnStatus;
                    that.socketConnectStatus = !that.socketConnectStatus;
                  } else {
                    that.mqttApplyBtnStatus = !that.mqttApplyBtnStatus;
                    that.mqttConnectStatus = !that.mqttConnectStatus;
                  }
                } else {
                  type == 'socketStart' ? that.socketApplyBtnStatus = false : that.mqttApplyBtnStatus = false;
                  that.verifyTip('error', 'error', startStopApi);
                }
              })
            } else {
              var socketMqttApi = null;
              var fromData = null;
              if (type == 'socketApply') {
                socketMqttApi = 'set_socket';
                if (!/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(this.socketData.address)) {
                  this.verifyTip('warning', this.t('Invalid IP Address') + ',eg: 192.168.8.1');
                  return;
                }
                if (this.socketData.port < 0 || this.socketData.port > 65535 || !this.socketData.port || this.socketData.port.length > 5) {
                  this.verifyTip('warning', this.t('Port') + ':' + this.t('value must be in the range of 0~65535'));
                  return;
                }
                if (this.socketData.timeout < 0 || this.socketData.timeout > 65535 || !this.socketData.timeout || this.socketData.timeout.length > 5) {
                  this.verifyTip('warning', this.t('Timeout') + ':' + this.t('value must be in the range of 0~65535'));
                  return;
                }
                fromData = this.socketData;
                this.socketApplyBtnStatus = true;
              } else if (type == 'mqttApply') {
                if (!this.mqttData.address || this.mqttData.address.length <= 0 || this.mqttData.address.length > 128) {
                  this.verifyTip('warning', this.t('Broker Address') + ':' + this.t('should be more than 1 and less than 128 characters in length'));
                  return;
                }
                if (!this.mqttData.port || !(/^[-]?\d+$/.test(this.mqttData.port)) || this.mqttData.port < 0 || this.mqttData.port > 65535 || this.mqttData.port.length > 5 ) {
                  this.verifyTip('warning', this.t('Port') + ':' +  this.t('value must be in the range of 0~65535'));
                  return;
                }
                if (!this.mqttData.clientid || this.mqttData.clientid.length <= 0 || this.mqttData.clientid.length > 128) {
                  this.verifyTip('warning', this.t('Client ID') + ':' + this.t('should be more than 1 and less than 128 characters in length'));
                  return;
                }
                if (!this.mqttData.publish || this.mqttData.publish.length <= 0 || this.mqttData.publish.length > 128) {
                  this.verifyTip('warning', this.t('Publish') + ':' + this.t('should be more than 1 and less than 128 characters in length'));
                  return;
                }
                if (!this.mqttData.subscribe || this.mqttData.subscribe.length <= 0 || this.mqttData.subscribe.length > 128) {
                  this.verifyTip('warning', this.t('Subscribe') + ':' + this.t('should be more than 1 and less than 128 characters in length'));
                  return;
                }
                if (this.mqttData.username && this.mqttData.username.length > 128) {
                  this.verifyTip('warning', this.t('Username') + ':' + this.t('should be more than 1 and less than 128 characters in length'));
                  return;
                }
                if (this.mqttData.password && this.mqttData.password.length > 128) {
                  this.verifyTip('warning', this.t('Password') + ':' + this.t('should be more than 1 and less than 128 characters in length'));
                  return;
                }
                if (this.mqttData.timeout && (!(/^[-]?\d+$/.test(this.mqttData.timeout)) || this.mqttData.timeout > 65535 || this.mqttData.timeout < 0 || this.mqttData.timeout.length > 5)) {
                  this.verifyTip('warning', this.t('Timeout') + ':' + this.t('value must be in the range of 0~65535'));
                  return;
                }
                if (this.mqttData.interval && (!(/^[-]?\d+$/.test(this.mqttData.interval)) || this.mqttData.interval > 65535 || this.mqttData.interval < 0 || this.mqttData.interval.length > 5)) {
                  this.verifyTip('warning', this.t('Interval') + ':' + this.t('value must be in the range of 0~65535'));
                  return;
                }
                this.mqttData.autoconn = this.mqttData.autoconn == this.t('Enabled') ? 1 : 0;
                if (this.mqttData.autoconninteval && (!(/^[-]?\d+$/.test(this.mqttData.autoconninteval)) || this.mqttData.autoconninteval > 65535 || this.mqttData.autoconninteval < 0 || this.mqttData.autoconninteval.length > 5)) {
                  this.verifyTip('warning', this.t('Autoconninteval') + ':' + this.t('value must be in the range of 0~65535'));
                  return;
                }
                if (this.mqttData.autoconnmaxtime && (!(/^[-]?\d+$/.test(this.mqttData.autoconnmaxtime)) || this.mqttData.autoconnmaxtime > 65535 || this.mqttData.autoconnmaxtime < 0 || this.mqttData.autoconnmaxtime.length > 5)) {
                  this.verifyTip('warning', this.t('Autoconnmaxtime') + ':' + this.t('value must be in the range of 0~65535'));
                  return;
                }
                socketMqttApi = 'set_mqtt';
                fromData = this.mqttData;
                this.mqttApplyBtnStatus = true;
              }
              this.$store.dispatch('call', {
                api: socketMqttApi,
                data: fromData
              }).then(function (res) {
                type == 'socketApply' ? that.socketApplyBtnStatus = false : that.mqttApplyBtnStatus = false;
                if (res.code == 0) {
                  that.verifyTip('success', 'success', socketMqttApi);
                  if (type == 'socketApply') {
                    that.getSocketData();
                    that.isSocketCancelConnectingBtn = true;
                  } else {
                    that.getMqttData();
                    that.isMqttCanceConnectinglBtn = true;
                  }
                } else {
                  that.verifyTip('error', 'error', socketMqttApi);
                }
              })
            }
          },
          /**
           * 
           * @param {提示类型:warning/success/error} type 
           * @param {message} value 
           * @param {api} api 
           */
          verifyTip: function verifyTip(type, value, api) {
            if (api) {
              this.$message({
                "type": type,
                "api": api,
                "msg": value
              });
            } else {
              this.$message({
                "type": type,
                "msg": value
              });
            }
          }
        },
        mounted: function mounted() {
          var that = this;
          this.getConfigInfo();
          // socket
          this.getSocketData();
          this.getSocketConnectStatus();
          that.socketMqttConnectTimeOut = setInterval(function() {
            that.getSocketConnectStatus();
            that.getMqttConnectStatus();
          }, 10000)
          // mqtt
          this.getMqttData();
          this.getMqttConnectStatus();
        }
    });
    return vueComponent;
});
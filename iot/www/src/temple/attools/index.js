"use strict";

define(["text!temple/attools/index.html", "css!temple/attools/index.css", "vue", "component/gl-btn/index", "component/gl-input/index", "component/gl-select/index"], function (stpl, css, Vue, gl_btn, gl_input, gl_select) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                atmsg: "",
                listItem: "",
                list: [],
                atItem: "",
                atlist: [{
                    'msg': 'Manual command',
                    'item': ''
                }, {
                    'msg': 'Request IMEI',
                    'item': 'AT+GSN'
                }, {
                    'msg': 'Request QCCID',
                    'item': 'AT+QCCID'
                }, {
                    'msg': 'Request IMSI',
                    'item': 'AT+CIMI'
                }, {
                    'msg': 'Check Signal Quality',
                    'item': 'AT+CSQ'
                }, {
                    'msg': 'Reset modem',
                    'item': 'AT&F0'
                }, {
                    'msg': 'Operator Names',
                    'item': 'AT+COPS?'
                }, {
                    'msg': 'Request SIM card status',
                    'item': 'AT+CPIN?'
                }],
                atlist_quectel: [{
                    'msg': 'Request network information',
                    'item': 'AT+QNWINFO'
                }, {
                    'msg': 'Check CA information',
                    'item': 'AT+QCAINFO'
                }, {
                    'msg': 'Set band',
                    'item': ''
                }],
                atlist_sierra: [{
                    'msg': 'Request network information',
                    'item': 'AT!GSTATUS?'
                }],
                setBandList: ['default_band', 'Band1', 'Band2', 'Band3', 'Band4', 'Band5', 'Band6', 'Band7', 'Band8', 'Band9', 'Band10', 'Band11', 'Band12', 'Band13', 'Band14', 'Band15', 'Band16', 'Band17', 'Band18', 'Band19', 'Band20', 'Band21', 'Band22', 'Band23', 'Band24', 'Band25', 'Band26', 'Band27', 'Band28', 'Band29', 'Band30', 'Band31', 'Band32', 'Band33', 'Band34', 'Band35', 'Band36', 'Band37', 'Band38', 'Band39', 'Band40', 'Band41', 'Band42', 'Band43', 'Band66', 'Band71'],
                isSend: false,
                modemIndex: this.$route.query.index,
                setBandStatus: false,
                msgindex:0,
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-select": gl_select
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
        },
        computed: {
            moInfo: function moInfo() {
                return this.$store.getters.apiData['moInfo'];
            },
            modems: function modems() {
                return this.moInfo.modems;
            }
        },
        mounted: function mounted() {
            var that = this;
            if (this.modems && this.modems.length > 0) {
                that.getList(this.modems);
            } else {
                this.$store.dispatch("call", {
                    api: "moInfo"
                }).then(function (result) {
                    if (result.success) {
                        that.$store.commit("setonlist", {
                            data: "modem"
                        });
                        if (result.modems) {
                            that.getList(result.modems);
                        }
                    } else if (result.code == "-17" || result.code == "-3") {
                        that.$store.commit("removeInter", {
                            data: "modem"
                        });
                    } else {
                        that.$store.commit("setonlist", {
                            data: "modem"
                        });
                    }
                });
            }
        },
        methods: {
            getList: function getList(data) {
                var that = this;
                var list = data;
                for (var i = 0; i < list.length; i++) {
                    for (var k = 0; k < list[i].ports.length; k++) {
                        if (list[i].ports[k].indexOf('cdc-wdm') != -1) {
                            list[i].ports.splice(k, 1);
                        }
                    }
                    if (list[i].modem_id == 5) {
                        that.atlist = that.atlist.concat(that.atlist_sierra);
                    } else if (list[i].modem_id != 255) {
                        that.atlist = that.atlist.concat(that.atlist_quectel);
                    }
                }
                that.list = list;
            },
            checkModem: function checkModem(index) {
                this.modemIndex = index;
            },
            getMsg: function getMsg(data) {
                if (data.msg == "Set band") {
                    this.setBandStatus = true;
                } else {
                    this.setBandStatus = false;
                }
                this.atmsg = data.item;

            },
            getMsgs(data) {
                if (data == 'default_band') {
                    this.atmsg = 'default_band';
                    return
                }
                var Command = data.substr(4) - 1
                Command = Math.pow(2, Command).toString(16);
                this.atmsg = 'AT+QCFG="band",0,' + Command + ",0"
            },
            sendtools: function sendtools(item,index) {
                if (!this.atmsg) {
                    this.$message({
                        type: "error",
                        msg: -4000
                    });
                    return;
                }
                var that = this;
                that.isSend = true;
                this.$store.dispatch("call", {
                    api: "atsend",
                    data: {
                        'at-command': this.atmsg,
                        'at-port': item.control_port
                        // "at-fd": this.moInfo.modems[0]['at-fd']
                    },
                    timeOut: 300000
                }).then(function (result) {
                    that.isSend = false;
                    if (result.success) {
                        that.$message({
                            type: "success",
                            msg: result.code
                        });
                        that.msgindex = index;
                        that.atItem = result.message;
                        // that.atmsg = "";
                    } else {
                        // that.atItem = "";
                        that.$message({
                            type: "error",
                            msg: result.code
                        });
                    }
                });
            }
        }
    });
    return vueComponent;
});
"use strict";

define(["text!temple/cells/index.html", "css!temple/cells/index.css", "vue", "component/gl-btn/index", "component/gl-input/index", "component/gl-select/index", "clipboard"], function (stpl, css, Vue, gl_btn, gl_input, gl_select, clipboardJS) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                modem_id: this.$route.query.id,
                bus: this.$route.query.bus,
                cells: [],
                btnStatus: false,
                copyNumber: '18404960408',
                iscopyJson: null,
                isretate: false,
                cellIndex: 0,
                rssiText:null,
                rsrqText:null,
                rsrpText:null,
                sinrText:null
            }
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-select": gl_select
        },
        mounted() {

            var that = this;
            that.$store.dispatch('call', {
                api: "simcells",
                data: {
                    modem_id: this.$route.query.id,
                    bus: this.$route.query.bus
                }
            }).then(function (result) {
                if (result.success) {
                    that.cells = that.handleCells(result.cells)
                }
            });
            this.iscopyJson = new clipboardJS('.copyJson')
        },
        computed:{
            rssiColor: function rssiColor(){
                let that = this
                if (this.cells && this.cells[0].type =='servingcell' && this.cells[0].rat == 'LTE') {
                    if (that.cells[0].rssi > -70) {
                        that.rssiText = 'Excellent'
                        return 'color: #6acd5b;'
                    } else if (-85 <= that.cells[0].rssi && that.cells[0].rssi <= -70) {
                        that.rssiText = 'Good'
                        return 'color: #fbfb0e;'
                    } else if (-100 <= that.cells[0].rssi && that.cells[0].rssi <= -86) {
                        that.rssiText = 'Fair'
                        return 'color: #f8bb09;'
                    } else if (-110 < that.cells[0].rssi && that.cells[0].rssi < -100) {
                        that.rssiText = 'Poor'
                        return 'color: #ed090a;'
                    } else if (that.cells[0].rssi <= -110 ) {
                        that.rssiText = 'No signal'
                        return 'color: #ac0606;'
                    }
                }
            },
            rsrqColor: function rsrqColor(){
                let that = this
                if (this.cells && this.cells[0].type =='servingcell' && this.cells[0].rat == 'LTE') {
                    if (that.cells[0].rsrq > -9) {
                        that.rsrqText = 'Excellent'
                        return 'color: #73cf5a;'
                    } else if ( -12 <= that.cells[0].rsrq && that.cells[0].rsrq <= -9 ) {
                        that.rsrqText = 'Good'
                        return 'color: #fbfb07;'
                    } else if (that.cells[0].rsrq <= -13 ) {
                        that.rsrqText = 'Fair to Poor'
                        return 'color: #f10708'
                    }
                }
            },
            rsrpColor: function rsrpColor(){
                let that = this
                if (this.cells && this.cells[0].type =='servingcell' && this.cells[0].rat == 'LTE') {
                    if (that.cells[0].rsrp > -90) {
                        that.rsrpText = 'Excellent'
                        return 'color: #6ccd5c;'
                    } else if ( -105 <= that.cells[0].rsrp && that.cells[0].rsrp <= -90 ) {
                        that.rsrpText = 'Good'
                        return 'color: #fbfb0e;'
                    } else if ( -120 <= that.cells[0].rsrp && that.cells[0].rsrp <= -106 ) {
                        that.rsrpText = 'Fair'
                        return 'color: #f8b90a'
                    } else if (that.cells[0].rsrp < -120 ) {
                        that.rsrpText = 'Poor'
                        return 'color: #ed090a'
                    }
                }
            },
            sinrColor: function sinrColor(){
                let that = this
                if (this.cells && this.cells[0].type =='servingcell' && this.cells[0].rat == 'LTE') {
                    if (that.cells[0].sinr > 10) {
                        that.sinrText = 'Excellent'
                        return 'color: #73ce59;'
                    } else if ( 6 <= that.cells[0].sinr && that.cells[0].sinr <= 10 ) {
                        that.sinrText = 'Good'
                        return 'color: #fafa0e;'
                    } else if ( 0 <= that.cells[0].sinr && that.cells[0].sinr <= 5 ) {
                        that.sinrText = 'Fair'
                        return 'color: #f7ba0a'
                    } else if (that.cells[0].sinr < 0 ) {
                        that.sinrText = 'Poor'
                        return 'color: #ec0a0b'
                    }
                }
            },
            isLTE: function isLTE(){
                if (this.cells && this.cells[0].type =='servingcell' && this.cells[0].rat == 'LTE') {
                    return ''
                } else {
                    return 'color: chocolate'
                }
            }
        },
        methods: {
            retateShow: function retateShow(index){
                this.isretate = !this.isretate
                this.cellIndex = index
                $(".collapse").collapse("hide");
            },
            initClipboard: function initClipboard() {
                var that = this;
                var copy = this.iscopyJson
                copy.on('success', function () {
                    that.$message({
                        type: "success",
                        msg: that.t("Successful copy")
                    })
                })

                copy.on('error', function () {
                    that.$message({
                        type: "error",
                        msg: "Copy Error"
                    })
                });
            },
            getCells: function getCells() {
                var that = this;
                this.btnStatus = true;
                that.$store.dispatch('call', {
                    api: "simcells",
                    data: {
                        modem_id: this.$route.query.id,
                        bus: this.$route.query.bus
                    }
                }).then(function (result) {
                    that.btnStatus = false;
                    if (result.success) {
                        that.cells = that.handleCells(result.cells)
                        that.$message({
                            type: "success",
                            api: "simcells",
                            msg: result.code
                        })
                    } else {
                        that.$message({
                            type: "error",
                            api: "simcells",
                            msg: result.code
                        })
                    }
                })
            },
            handleCells: function handleCells(list) {
                let arr = []
                for(let i = 0;i < list.length;i++) {
                    let keylists = Object.keys(list[i])
                    if (keylists.includes('rsrp') && keylists.includes('rsrq') && keylists.includes('rssi') && keylists.includes('sinr')) {
                      arr.unshift(list[i])
                    } else {
                      arr.push(list[i])
                    }
                }
                return arr
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
        },
    });
    return vueComponent;
});
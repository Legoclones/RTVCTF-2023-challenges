"use strict";



define(["text!temple/adblock/index.html", "vue", "css!temple/clients/index.css","component/gl-btn/index",  "component/gl-tooltip/index", "component/gl-toggle-btn/index"], function (temp, Vue, css, gl_btn, gl_tooltip, gl_toggle_btn) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                applyDisabled: true,
                adEnabled: false,
                adguard: false,
                hphosts: false,
                spam404: false,
                dshield: false,
                btnMove: false,
                AdbHistory: "",
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-tooltip": gl_tooltip,
            "gl-tg-btn": gl_toggle_btn
        },
        mounted: function mounted() {
            $("#router-visual").slideUp();
            if ($(".clsLink2" + this.$route.path.split("/")[1]).hasClass("bar")) {
                $(".bar.active").removeClass("active");
                $(".clsLink2" + this.$route.path.split("/")[1]).addClass("active");
                $("#vpn").collapse("hide");
                $("#moresetting").collapse("hide");
                $("#applications").collapse("hide");
                $("#system").collapse("show");
            }
            this.getSettings();
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnMove) {
                next();
                return;
            }
            this.$message({
                "type": "warning",
                "msg": "-1000"
            });
        },

        methods: {
            checkStatus: function checkStatus () {
                this.applyDisabled = false;
            }, 
            getSettings: function getSettings () {
                var that = this;
                that.$store.dispatch("call", {
                    'api': 'getadblock'
                }).then(function (result) {
                    var his = "";
                    if (result.success) {
                        that.adEnabled = result.enable;
                        that.adguard = result.source.adguard;
                        that.hphosts = result.source.hphosts;
                        that.spam404 = result.source.spam404;
                        that.dshield = result.source.dshield;
                        for( var cell of result.history){
                        his = his.concat('<tr><td class="col-lg-2 text-left" >' + that.parseTime(cell.time, '{h}:{i}') +'</td><td class="col-lg-6 text-center">'
                        +cell.url+'</td><td class="col-lg-3 text-left">' + cell.from +'</td><td class="col-lg-1 text-left">'
                         + cell.counter + '</td><td class="col-lg-1 text-left">' +'<a>Allow</a>'+ '</td></tr>')
                        }
                        that.AdbHistory = his;
                    }
                });
            },     
            applyAdbSetting: function applyAdbSetting() {
                var that = this;
                that.btnMove = true;
                this.$store.dispatch("call", {
                    api: "setadblock", data: {
                        enable: this.adEnabled,
                        adguard: this.adguard,
                        hphosts: this.hphosts,
                        spam404: this.spam404,
                        dshield: this.dshield
                    }
                }).then(function (result) {
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "setadblock",
                            "msg": result.code
                        });
                    } 

                });
            },
            parseTime: function parseTime(time, cFormat) {
                if (arguments.length === 0) {
                  return null
                }
                if (time === null) { // if this device never login in, its online/office time is 'null' 如果有设备从来没有上线过，其online/office time 是 null
                  return null
                }
              
                const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
                let date
                if (typeof time === 'object') {
                  date = time
                } else {
                  if (('' + time).length === 10) time = parseInt(time) * 1000
                  date = new Date(time)
                }
                const formatObj = {
                  y: date.getFullYear(),
                  m: date.getMonth() + 1,
                  d: date.getDate(),
                  h: date.getHours(),
                  i: date.getMinutes(),
                  s: date.getSeconds(),
                  a: date.getDay()
                }
                if (formatObj.y === 1970) { // online first time, its offline time is '1970-01-01 08:00:00.0'
                  return ''
                }
                const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
                  let value = formatObj[key]
                  if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
                  if (result.length > 0 && value < 10) {
                    value = '0' + value
                  }
                  return value || 0
                })
                return time_str
              }
        }
    });
    return vueComponent;
});
"use strict";
define(["text!temple/timezone/index.html", "css!temple/timezone/index.css", "jstz", "vue", "component/gl-btn/index", "component/gl-select/index", "component/gl-toggle-btn/index", "component/gl-input/index", ], function (temp, css, jstz, Vue, gl_btn, gl_select, gl_toggle, gl_input) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                applyDisabled: true,
                btnMove: false,
                timeZoneList: [],
                currentZoneName: '',
                initZoneName: {},
                systemTime: "",
                userTimeZoneName: jstz.determine().name().indexOf('_')!= -1 ? jstz.determine().name().replace('_'," "):jstz.determine().name(),
                text: "1",
                enable_client: false,
                enable_server: false,
                ntpServerOne: "",
                ntpServerTwo: "",
                ntpServerThree: "",
                ntpServerFour: "",
                ntp_btn_Status: false,
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-select": gl_select,
            "gl-tg-btn": gl_toggle,
            "gl-input": gl_input,
        },
        mounted: function mounted() {
            var that = this
            if (this.router.model == 'x1200') {
                if (that.ntpget && that.ntpget.success) {
                    that.enable_client = that.ntpget.enable
                    that.enable_server = that.ntpget.enable_server
                    that.ntpServerOne = that.ntpget.ntpserver0
                    that.ntpServerTwo = that.ntpget.ntpserver1
                    that.ntpServerThree = that.ntpget.ntpserver2
                    that.ntpServerFour = that.ntpget.ntpserver3
                } else {
                    that.getNtpData()
                }
            }
            $("#router-visual").slideUp();
            if ($(".clsLink2" + this.$route.path.split("/")[1]).hasClass("bar")) {
                $(".bar.active").removeClass("active");
                $(".clsLink2" + this.$route.path.split("/")[1]).addClass("active");
                $("#vpn").collapse("hide");
                $("#moresetting").collapse("show");
                $("#applications").collapse("hide");
                $("#system").collapse("hide");
            }
            this.updateDisplay();
        },
        computed: {
            ntpget: function ntpget() {
                return this.$store.getters.apiData["ntpget"];
            },
            router: function router() {
                return this.$store.getters.apiData["router_mini"];
            },
        },
        methods: {
            getTimezone: function getTimezone(data) {
                if (data.constructor === Object) {
                    this.initZoneName = data
                    this.applyDisabled = false
                }},
            getNtpData: function getNtpData(){
                var that = this;
                this.$store.dispatch("call", {
                    api: "ntpget"
                }).then(function (result) {
                    that.enable_client = result.enable
                    that.enable_server = result.enable_server
                    that.ntpServerOne = that.ntpget.ntpserver0
                    that.ntpServerTwo = that.ntpget.ntpserver1
                    that.ntpServerThree = that.ntpget.ntpserver2
                    that.ntpServerFour = that.ntpget.ntpserver3
                })
            },
            enabledclient: function enabledclient(data) {
                this.enable_client = data
                this.ntp_btn_Status = true
            },
            enabledserver: function enabledclient(data) {
                this.enable_server = data
                this.ntp_btn_Status = true
            },
            cssStyle: function cssStyle(data,css){
                $(data).css({
                    border: css
                })
            },
            removeclassNtp: function removeclassNtp(){
                this.cssStyle('.Address1 .gl-input >input',"1px solid #ccc")
                this.cssStyle('.Address2 .gl-input >input',"1px solid #ccc")
                this.cssStyle('.Address3 .gl-input >input',"1px solid #ccc")
                this.cssStyle('.Address4 .gl-input >input',"1px solid #ccc")
                this.ntp_btn_Status = true
            },
            applyntpTimezone: function applyntpTimezone() {
                var that = this;
                if (this.enable_client && !this.ntpServerOne) {
                    this.$message({
                        "type": "warning",
                        "api": "ntpset",
                        "msg": this.$lang.timerzone.Requiredcannot
                    })
                    return
                }
                if ((this.enable_client && this.ntpServerOne && this.ntpServerOne.length >128) || (this.enable_client && this.ntpServerTwo && this.ntpServerTwo.length >128) || (this.enable_client && this.ntpServerThree && this.ntpServerThree.length >128) || (this.enable_client && this.ntpServerFour && this.ntpServerFour.length >128)) {
                    this.$message({
                        "type": "error",
                        "api": "ntpset",
                        "msg": -22
                    })
                    if (this.enable_client && this.ntpServerOne && this.ntpServerOne.length >128) {
                        this.cssStyle('.Address1 .gl-input >input',"1px solid #f00")
                    }
                    if (this.enable_client && this.ntpServerTwo && this.ntpServerTwo.length >128) {
                        this.cssStyle('.Address2 .gl-input >input',"1px solid #f00")
                    }
                    if (this.enable_client && this.ntpServerThree && this.ntpServerThree.length >128) {
                        this.cssStyle('.Address3 .gl-input >input',"1px solid #f00")
                    }
                    if (this.enable_client && this.ntpServerFour && this.ntpServerFour.length >128) {
                        this.cssStyle('.Address4 .gl-input >input',"1px solid #f00")
                    }
                    return
                }
                if (!this.enable_client && this.ntpServerOne && this.ntpServerOne.length >128) {
                    this.ntpServerOne = ""
                }
                if (!this.enable_client && this.ntpServerTwo && this.ntpServerTwo.length >128) {
                    this.ntpServerTwo = ""
                }
                if (!this.enable_client && this.ntpServerThree && this.ntpServerThree.length >128) {
                    this.ntpServerThree = ""
                }
                if (!this.enable_client && this.ntpServerFour && this.ntpServerFour.length >128) {
                    this.ntpServerFour = ""
                }
                this.$store.dispatch("call", {
                    api: "ntpset",
                    data: {
                        enable: this.enable_client,
                        enable_server: this.enable_server,
                        ntpserver0: this.ntpServerOne,
                        ntpserver1: this.ntpServerTwo,
                        ntpserver2: this.ntpServerThree,
                        ntpserver3: this.ntpServerFour,
                    }
                }).then(function (result) {
                    that.ntp_btn_Status = false
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "ddnsset",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "ddnsset",
                            "msg": result.code
                        });
                    }
                })
            },
            /* updateDisplay: function updateDisplay() {
                var that = this;
                this.$store.dispatch("call", {
                    api: "gettimezone"
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "gettimezone",
                            "msg": result.code
                        });
                        return;
                }
                    if (result.success) {
                        var systemTime = result.systemtime;
                        that.systemTime = systemTime;
                        var sysZoneName = result.zonename;
                        that.autoTimezoneEnabled = result.autotimezone;
                        if (sysZoneName == "") {
                            sysZoneName = "Select Your Continent or Ocean/";
                        }
                        if (that.userTimeZoneName != sysZoneName) {
                            $(".routertime-reminder").removeClass("hide");
                            $(".routertime-reminder").slideDown();
                        } else {
                            $(".routertime-reminder").slideUp();
                        }
                        var continent = sysZoneName.split("/")[0];
                        var city = sysZoneName.split("/")[1];
                        if (sysZoneName.split("/").length == 3) {
                            city += '/' + sysZoneName.split("/")[2];
                        }
                        that.displayTimezone(continent, city);
                    } else {
                        this.$message({
                            "type": "error",
                            "api": "gettimezone",
                            "msg": result.code
                        });
                    }
                });
            }, */
            handleTimeZone: function handleTimeZone(target) {
                var that = this
                var data = {
                    zonename: this.initZoneName.zonename,
                    timezone: this.initZoneName.timezone,
                }
                if (target) {
                    data['zonename'] = this.userTimeZoneName
                    // 根据zonename匹配对应的timezone
                    var timezone = that.timeZoneList.find(function(item){
                        return item.zonename == that.userTimeZoneName
                    })
                    data['timezone'] = timezone.timezone || ''
                }
                that.btnMove = true;
                this.$store.dispatch("call", {
                    api: "settimezone", data: data
                }).then(function(result) {
                    that.btnMove = false;
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "settimezone",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.applyDisabled = true;
                        that.updateDisplay();
                        that.$message({
                            "type": "success",
                            "api": "settimezone",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "settimezone",
                            "msg": result.code,
                            "duration": 2000
                        });
                    }
                })
            },
            updateDisplay: function updateDisplay() {
                var that = this;
                this.$store.dispatch("call", { api: "gettimezone" }).then(function (result) {
                    if (result.failed) {
                        this.$message({
                            "type": "error",
                            "api": "gettimezone",
                            "msg": result.code
                        });
                        return;
                    }
                    if (result.success) {
                        that.timeZoneList = result.timezone_list
                        that.timeZoneList.unshift({zonename: "UTC", timezone: ""})
                        that.initZoneName['timezone'] = result.timezone
                        that.initZoneName['zonename'] = result.zonename
                        that.currentZoneName = result.zonename
                        that.currentTime = result.timestamp
                        var systemTime = result.systemtime;
                        that.systemTime = systemTime;

                        if (that.userTimeZoneName != result.zonename) {
                            $(".routertime-reminder").removeClass("hide");
                            $(".routertime-reminder").slideDown();
                        } else {
                            $(".routertime-reminder").slideUp();
                        }
                    } else {
                        this.$message({
                            "type": "error",
                            "api": "gettimezone",
                            "msg": result.code
                        });
                    }
                });
            },
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnMove) {
                next();
                return;
            }
            this.$message({
                "type": "warning",
                "msg": -2200,
                "duration": 1000
            });
        }
    });
    return vueComponent;
});
"use strict";

define(["text!temple/cloud/index.html", "component/gl-toggle-btn/index", "component/gl-btn/index", "css!temple/cloud/index.css", "vue", "component/gl-select/index", "component/gl-tooltip/index", "component/modal/modal", "component/gl-loading/index", ], function (stpl, gl_toggle_btn, gl_btn, css, Vue, gl_select, gl_tooltip, gl_modal, gl_loading) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                // serverList: ['Europe', 'America', 'Asia Pacific'],
                serverOption: "Asia Pacific",
                CloudStatus: false, //云开启
                DDNSStatus: false, //ddns开启
                HTTPStatus: false, //HTTp开启
                SSHStatus: false, //SSH开启
                AccessStatus: false, //Access开启
                msgURL: '',
                checkItem: [{
                    state: false
                }],
                checkStatus: [{
                    state: false
                }],
                agree: false,
                applyStatus: false,
                ddnsApplyStatus: false,
                normalShow: false,
                usernames: '',
                useremail: '',
                bindtime: undefined,
                ddnsagree: false,
                httpAndSshShow: false,
                selectAreaShow: false,
                applyBlock: false,
                DdnsBlock: false,
                btnStatus: true,
                showModalMoblie: false,
                checkip: false,
                lookupip: false,
                wanip: false,
                loadingStatus: false,
                analysisError: false,
                responseIp: '',
                logList: [],
                showLogModal: false,
                unbindZone: "",
                ddnsflag: false,
                cloudflag: false,
                HTTPSStatus: false,
                remoteSSHStatus: false,
                remoteHTTPStatus: false,

            };
        },
        components: {
            "gl-toggle-btn": gl_toggle_btn,
            "gl-btn": gl_btn,
            "gl-select": gl_select,
            "gl-tooltip": gl_tooltip,
            "gl-modal": gl_modal,
            "gl-loading": gl_loading,
        },
        beforeRouteEnter: function foreRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                    $("#applications").collapse("hide");
                    $("#moresetting").collapse("hide");
                    $("#system").collapse("show");
                    $("#vpn").collapse("hide");
                }
            });
        },
        mounted: function mounted() {
            this.getDdns();
            this.getData();
            this.$store.dispatch("call", { api: "router" });
            setTimeout(function () {
                $('body .gl-tooltip').hide();
            }, 100);
            if (this.getcloudinfo && this.getcloudinfo.success) {
                this.msgURL = this.getcloudinfo.name;
                this.CloudStatus = this.getcloudinfo.cloud_enable;
                this.cloudflag = this.getcloudinfo.cloud_enable;
                this.selectAreaShow = this.CloudStatus
                this.agree = this.CloudStatus
            }
            if (this.getddnsinfo && this.getddnsinfo.success) {
                this.DDNSStatus = this.getddnsinfo.ddns_enable;
                this.ddnsflag = this.getddnsinfo.ddns_enable;
                this.msgURL = this.getcloudinfo.name;
                this.HTTPStatus = this.getddnsinfo.http_enable;
                this.HTTPSStatus = this.getddnsinfo.https_enable;
                this.SSHStatus = this.getddnsinfo.ssh_enable;
                this.AccessStatus = this.getddnsinfo.access_anywhere_enable;
                this.httpAndSshShow = this.getddnsinfo.ddns_enable;
                this.ddnsagree = this.getddnsinfo.DDNSStatus
            }
            this.applyBlock = this.CloudStatus
            this.DdnsBlock = this.DDNSStatus
            var that = this

        },
        computed: {
            // 获取版本号 判断是否为2b固件
            is2BModel: function is2BModel() {
                var info = this.$store.getters.apiData["isconnected"];
                return info.version && info.version.includes('VB');
            },
            getcloudinfo: function getdnsinfo() {
                return this.$store.getters.apiData["cloudgets"];
            },
            getddnsinfo: function getdnsinfo() {
                return this.$store.getters.apiData["ddnsget"];
            },
            router: function router() {
                return this.$store.getters.apiData["router"];
            },

            lan: function lan() {
                return this.$store.getters.lang;
            },
            serverList: function serverList() {
                if (this.lan == "CN") {
                    return ['Asia Pacific', 'America', 'Europe', 'China']
                } else {
                    return ['Asia Pacific', 'America', 'Europe']
                }
            },
            hrefUrl: function hrefUrl() {
                var item = "https://www.goodcloud.xyz"
                if (this.unbindZone == "Europe") {
                    item = "https://eu.goodcloud.xyz"
                } else if (this.unbindZone == "America") {
                    item = "https://us.goodcloud.xyz"
                } else if (this.unbindZone == "China") {
                    item = "https://cloud.gl-inet.cn"
                }
                return item
            }
        },

        methods: {
            checkAgree: function checkAgree(item) { //是否checkbox
                item.state = !item.state;
                this.agree = item.state;
            },
            checkAgrees: function checkAgrees(item) { //是否checkbox
                item.state = !item.state;
                this.ddnsagree = item.state;
            },
            openCloud: function openCloud(data) { //开启云端状态
                this.applyBlock = true
                this.CloudStatus = data;
                if (this.CloudStatus) {
                    this.selectAreaShow = true;
                } else {
                    this.selectAreaShow = false;
                }
            },
            openDdns: function openDdns(data) { //ddns状态
                this.DDNSStatus = data;
                this.DdnsBlock = true
                this.btnStatus = false
                if (this.DDNSStatus) {
                    this.httpAndSshShow = true;
                } else {
                    this.httpAndSshShow = false
                }
            },
            openHTTP: function openHTTP(data) { //http状态
                this.HTTPStatus = data;
                this.btnStatus = false
                if (this.HTTPStatus) {
                    this.DDNSStatus = true
                }
            },
            openSSH: function openSSH(data) { //ssh状态
                this.SSHStatus = data;
                if (this.SSHStatus) {
                    this.DDNSStatus = true
                }
            },
            openAccess: function openAccess(data) { //access状态
                this.AccessStatus = data;
                this.btnStatus = false
                if (this.AccessStatus) {
                    this.HTTPStatus = false;
                    this.SSHStatus = false;
                    this.DDNSStatus = false;
                }
            },
            serverName: function serverName(data) { //下拉选中的
                this.serverOption = data;

            },
            applyCloud: function applyCloud(page) { //提交按钮
                var that = this;
                if (page == 'cloud') {
                    that.applyStatus = true;
                    that.$store.dispatch('call', {
                        api: 'cloudsets',
                        data: {
                            cloud_enable: that.CloudStatus,
                            serverzone: that.serverOption,
                            check_status: true,
                            rtty_ssh: that.remoteSSHStatus ? 1 : 0,
                            rtty_web: that.remoteHTTPStatus ? 1 : 0
                        }
                    }).then(function (result) {
                        if (result.success) {
                            setTimeout(function (){
                                that.agree = that.CloudStatus;
                                that.applyStatus = false;
                                that.getData()
                                that.$message({
                                    "type": "success",
                                    "api": "cloudsets",
                                    "msg": result.code
                                });
                            }, 5000);
                            setTimeout(function () {
                                $('body .gl-tooltip').hide();
                            }, 7000);
                        } else {
                            that.getData()
                            that.applyStatus = false;
                            if (result.code == -600) {
                                that.$store.commit("showModal", {
                                    show: true,
                                    type: "warning",
                                    title: "Caution",
                                    showfoot:false,
                                    message: that.t('Before turning off this feature, please turn off the wifi coverage function in the goodcloud management web.'),
                                })
                            } else {
                                that.$message({
                                    "type": "error",
                                    "api": "cloudsets",
                                    "msg": result.code
                                });
                            }
                        }
                    });
                } else {
                    that.ddnsApplyStatus = true;
                    that.$store.dispatch('call', {
                        api: 'ddnsset',
                        data: {
                            ddns_enable: that.DDNSStatus,
                            http_enable: that.HTTPStatus,
                            https_enable: that.HTTPSStatus,
                            ssh_enable: that.SSHStatus,
                            check_status: true,
                        }
                    }).then(function (result) {
                        that.ddnsagree = true;
                        if (result.success) {
                            setTimeout(function () {
                                that.ddnsApplyStatus = false;
                                that.getDdns()
                                that.$message({
                                    "type": "success",
                                    "api": "ddnsset",
                                    "msg": result.code
                                });
                            }, 5000);
                        } else {
                            that.ddnsApplyStatus = false;
                            that.$message({
                                "type": "error",
                                "api": "ddnsset",
                                "msg": result.code
                            });
                        }
                    });
                }
            },
            getData: function getData() {
                var that = this;
                that.$store.dispatch("call", {
                    api: 'cloudgets',
                }).then(function (result) {
                    if (result.success) {
                        that.unbindZone = result.serverzone
                        that.serverOption = result.serverzone || that.serverOption;
                        if (result.username && result.email) {
                            that.normalShow = result.cloud_enable;
                            that.usernames = result.username;
                            that.useremail = result.email;
                            if (result.bindtime.indexOf('-') != -1) {
                                that.bindtime = result.bindtime
                            } else {
                                that.bindtime = that.getFormatDate(parseInt(result.bindtime));
                            }
                        } else {
                            that.normalShow = false;
                        }
                        that.msgURL = result.name;
                        if (result.cloud_enable) {
                            that.applyBlock = true
                        }
                        that.CloudStatus = result.cloud_enable;
                        that.cloudflag = result.cloud_enable;
                        that.selectAreaShow = that.CloudStatus;
                        that.agree = that.CloudStatus;
                        that.remoteHTTPStatus = result.rtty_web;
                        that.remoteSSHStatus = result.rtty_ssh;

                    } else {
                        that.$message({
                            "type": "error",
                            "api": "cloudgets",
                            "msg": result.code,
                        });
                    }
                })

            },
            getFormatDate: function getFormatDate(timestamp) {
                var timestamp1 = new Date(parseInt(timestamp))
                return timestamp1.toLocaleDateString().replace(/\//g, "-") + " " + timestamp1.toTimeString().substr(0, 5)
            },
            getDdns: function getDdns() {
                var that = this
                that.$store.dispatch("call", {
                    api: 'ddnsget',
                }).then(function (result) {
                    if (result.success) {
                        that.msgURL = result.name;
                        that.DDNSStatus = result.ddns_enable;
                        that.ddnsflag = result.ddns_enable;
                        that.HTTPStatus = result.http_enable;
                        that.HTTPSStatus = result.https_enable;
                        that.SSHStatus = result.ssh_enable;
                        that.AccessStatus = result.access_anywhere_enable;
                        that.httpAndSshShow = that.DDNSStatus;
                        that.ddnsagree = that.DDNSStatus
                        if (result.ddns_enable) {
                            that.DdnsBlock = true
                        }
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "ddnsget",
                            "msg": result.code
                        });
                    }
                });
            },
            unbind: function unbind() { //解绑
                var that = this
                that.$store.commit("showModal", {
                    show: true,
                    title: 'Caution',
                    message: this.t('Do you want to unbind your device from'),
                    messageTwoi: this.t('Region') + " : " + this.unbindZone,
                    messageTwos: this.t('User') + " : " + this.usernames,
                    messageThree: this.t('Note: This only take effect to the selected region. If you have ever bound this device on different regions, do this on each region.'),
                    cb: function cb() {
                        that.$store.dispatch("call", {
                            api: "cloudunbind",
                            data: {
                                unbind: true
                            }
                        }).then(function (result) {
                            if (result.success) {
                                setTimeout(function () {
                                    that.getData();
                                }, 2000);
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
                    }
                });
            },
            analysisddns: function analysisddns() {
                this.showModalMoblie = true;
                this.loadingStatus = true
                this.checkip = false;
                this.lookupip = false;
                this.wanip = false;
                var that = this;
                that.$store.dispatch("call", {
                    api: 'ddnscheck',
                    timeOut: 10000
                }).then(function (result) {
                    that.loadingStatus = false
                    if (result.timeout || result.code == -3) {
                        that.checkip = true;
                    } else {
                        that.checkip = false;
                    }
                    if (result.success) {
                        if (result.nslookupip != result.checkip) {
                            that.checkip = true;
                        } else if (result.nslookupip == result.wanip && result.nslookupip == result.checkip) {
                            that.lookupip = true;
                        } else if (result.nslookupip == result.checkip && result.nslookupip != result.wanip) {
                            that.wanip = true;
                        }
                        if (result.nslookupip != "No nslookup ip") {
                            that.responseIp = result.nslookupip
                        }
                        if (result.nslookupip == "No nslookup ip" || result.checkip == 'No Internet' || result.wanip == 'No wan ip') {
                            that.analysisError = true;
                        } else {
                            that.analysisError = false;
                        }
                    } else {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                })
            },
            closeModal: function closeModal() {
                var that = this
                that.checkip = false;
                that.lookupip = false;
                that.wanip = false;
                that.showModalMoblie = false;
                that.analysisError = false;
            },
            logShow: function logShow() {
                this.showLogModal = true;
                var that = this
                that.$store.dispatch("call", {
                    api: 'cloudlog'
                }).then(function (result, status) {
                    that.logList = result.log
                })
            },
            handleRemoteChange: function handleRemoteChange(type, status) {
                if (type == 'ssh') {
                    this.remoteSSHStatus = status;
                } else {
                    this.remoteHTTPStatus = status;
                }
            }
        }
    });
    return vueComponent;
});
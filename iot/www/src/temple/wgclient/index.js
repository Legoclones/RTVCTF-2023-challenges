"use strict";

define(["text!temple/wgclient/index.html", "css!temple/wgclient/index.css", "vue", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index", "component/gl-btn/index", "component/gl-label/index", "component/modal/modal", "component/gl-toggle-btn/index"], function (stpl, css, Vue, gl_input, gl_tooltip, gl_select, gl_btn, gl_label, modal, gl_switch) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                showModal: false,
                typename: "default",
                wgclients: [],
                nmInput: "",
                port: "",
                ips: "",
                point: "",
                prtKey: "",
                address: "",
                pubKey: "",
                sectName: "",
                timer: "",
                isRest: false,
                addState: false,
                circleClass: "",
                ctlist: "",//配置信息
                wayState: 'two',
                nextState: true,
                errorPrt: false,
                errorPub: false,
                user: "",
                psw: "",
                dns: "",
                btnstatus: false,
                interStatus: false,
                vpnexpect: 'init',
                vpnsuccess: 'init',
                rmStatus: false,
                timeout: null,
                checkServer: false,
                dnsReg: /(?:(^|\.)(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){4}$/,
                ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
                ipv6Reg: /^([0-9a-fA-F]{1,4}:){7,7}([0-9a-fA-F]{1,4}|:)|([0-9a-fA-F]{1,4}:){1,6}(:[0-9a-fA-F]{1,4}|:)|([0-9a-fA-F]{1,4}:){1,5}((:[0-9a-fA-F]{1,4}){1,2}|:)|([0-9a-fA-F]{1,4}:){1,4}((:[0-9a-fA-F]{1,4}){1,3}|:)|([0-9a-fA-F]{1,4}:){1,3}((:[0-9a-fA-F]{1,4}){1,4}|:)|([0-9a-fA-F]{1,4}:){1,2}((:[0-9a-fA-F]{1,4}){1,5}|:)|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6}|:)|:((:[0-9a-fA-F]{1,4}){1,7}|:)/,
                portReg: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                numReg: /^\d+$/,
                checkip: true, // 检索 ip
                checkpubkey: true, // 检索公钥
                checkprikey: true, // 检索私钥
                checkport: true, // 检索 port
                checkdns: true, // 检索 dns
                checkpoint: true, // 检索 point
                checkIPs: true, // 检索 IPs
                policyStatus: false,
                checkmtu: true,
                checksharedKey: true,
                mtu: "",
                sharedKey: "",
                // modeSelection:['azirevpn','strongvpn','spidervpn','mullvad'],
                modeSelection:['azirevpn', 'mullvad'],
                selectPolicy:'azirevpn',
                ChangeIndex: 0,
                ShowStatus: true,
                wgclientData:{},//data
                wgclientType:'',//type
                submitData: {},
                showAllowedIPs: '',
                isAddClient: false,
                address_ipv6: null,
                showIpv6Mode6Info: false,
                blockStatus: false,
                access: false,
                download_config: false, // 下载中
                addingTips: null
            };
        },
        components: {
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip,
            "gl-select": gl_select,
            "gl-btn": gl_btn,
            "gl-label": gl_label,
            "gl-modal": modal,
            "gl-switch": gl_switch
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                $(".bar.active").removeClass("active");
                // $(".clsLink2vpn").addClass("active")
                setTimeout(function () {
                    if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                        $("#vpn").collapse("show");
                        $("#moresetting").collapse("hide");
                        $("#applications").collapse("hide");
                        $("#system").collapse("hide");
                    }
                }, 250);
            });
        },
        watch: {
            "cltstatus.code": {
                handler: function(val, oldVal) {
                    var status = 'off';
                    if (val == 0) status = 'connected';
                    else if (val == -203) status = 'connecting';
                    this.$bus.$emit('vpnCircleStatus', 'wgclient', status);
                },
                deep: true
            }
        },
        computed: {
            nextSts: function nextSts() {
                var realLength = 0,
                    charCode = -1;
                var len = this.nmInput.length;
                for (var i = 0; i < len; i++) {
                    charCode = this.nmInput.charCodeAt(i);
                    if (charCode > 0 && charCode <= 128) {
                        realLength += 1;
                    } else {
                        realLength += 3;
                    }
                }
                if (realLength > 30 || realLength <= 0) {
                    return true;
                }
                return false;
            },
            cltstatus: function cltstatus() {
                var wgclientStatus = this.$store.getters.apiData["wgcstatus"];
                this.showIpv6Mode6Info = wgclientStatus.mode6 == 'Native' ? true : false;
                return wgclientStatus;
            },
            wgclist: function wgclist() {
                return this.$store.getters.apiData["wgclist"];
            },
            showClient: function showClient() {
                return this.wgclist.peers && this.wgclist.length != 0;
            },
            btnControl: function btnControl() {
                var btnName = "Connect";
                switch (this.cltstatus.code) {
                    case -204:
                        this.typename = "default";
                        btnName = "Connect";
                        this.circleClass = "";
                        break;
                    case -203:
                        // this.sectName = this.cltstatus.main_server;
                        this.typename = "danger";
                        btnName = "Abort";
                        this.circleClass = "waiting";
                        break;
                    case 0:
                        // this.sectName = this.cltstatus.main_server;
                        this.typename = "danger";
                        btnName = "Disconnect";
                        this.circleClass = "active";
                        break;
                    default:
                        this.typename = "default";
                        btnName = "Connect";
                        this.circleClass = "";
                }
                return btnName;
            },
            checkVpn: function checkVpn() {
                if (this.vpnexpect != 'init') {
                    if (this.vpnexpect == this.cltstatus.code || this.vpnsuccess == this.cltstatus.code) {
                        this.vpnexpect = 'init';
                        this.vpnsuccess = 'init';
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            },
            ipAdr: function ipAdr() {
                return this.cltstatus && this.cltstatus.ipaddr ? this.cltstatus.ipaddr : "";
            },
            ipAdrv6:function ipAdrv6() {
                return this.cltstatus && this.cltstatus.ipaddrv6 ? this.cltstatus.ipaddrv6 : "";
            },
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (this.btnstatus || this.isRest) {
                this.$message({
                    type: "warning",
                    msg: -2606
                });
                return;
            }
            if (this.addingTips) {                    
                this.addingTips.close()
                this.addingTips = null
            }
            clearInterval(this.timer);
            next();
        },
        mounted: function mounted() {
            var _this2 = this;

            if (this.cltstatus.code == 0) {
                this.sectName = this.cltstatus.main_server;
            }
            var that = this;
            that.$store.dispatch("call", {
                api: "getpolicy"
            }).then(function (result) {
                if (result.success) {
                    that.policyStatus = result.enable;
                }
            });
            // 获取 client list
            this.getctList();
            // 获取 client status
            this.getStatus();
            setTimeout(function () {
                _this2.timerData();
            }, 500);
        },
        methods: {
            changeStatusPolicy: function changeStatusPolicy() {
				if (this.ChangeIndex == 0) {
					this.ChangeIndex++;
				} else {
					this.ShowStatus = false
				}
			},
            // 切换三种添加client的方式
            changeWay: function changeWay(target) {
                switch (target) {
                    case 'user':
                        this.wayState = 'one';
                        this.$refs.clientent.className = "";
                        this.$refs.clientpaste.className = "";
                        this.$refs.clientUser.className = "active";
                        break;
                    case 'paste':
                        this.wayState = 'two';
                        this.$refs.clientent.className = "";
                        this.$refs.clientUser.className = "";
                        this.$refs.clientpaste.className = "active";
                        break;
                    case 'enter':
                        this.wayState = 'three';
                        this.$refs.clientUser.className = "";
                        this.$refs.clientpaste.className = "";
                        this.$refs.clientent.className = "active";
                }
            },
            // client status
            getStatus: function getStatus() {
                var that = this;
                that.$store.dispatch("call", {
                    api: "wgcstatus"
                }).then(function (result) {
                    that.blockStatus = false;
                    // if (!result.enable) {
                    //     clearInterval(that.timer);
                    // }
                    var status = 'off';
                    that.access = result.access;
                    if (result.code == 0) status = 'connected';
                    else if (result.code == -203) status = 'connecting';
                    that.$bus.$emit('vpnCircleStatus', 'wgclient', status);
                    if(!result.enable){
                        that.typename = "default";
                        that.circleClass = "";
                        that.btnControl = "Connect"
                    }
                    that.download_config = result.download_config
                    if (result.download_config) {
                        if (!that.addingTips) {
                            that.addingTips = that.$message({
                                type: 'info',
                                msg: that.t('The router is generating configuration on the background and it will take around 20 minutes. '),
                                duration: 0
                            });
                        }
                    }else{
                        if ( that.addingTips) {
                            that.addingTips.close()
                        }
                    }
                 
                }).catch(function () {
                    that.blockStatus = false;
                });
            },
            timerData: function timerData() {
                var _this = this;
                clearInterval(this.timer);
                if (_this.wgclients.length != 0 || _this.download_config) {
                    _this.timer = setInterval(function () {
                        _this.getStatus();
                    }, 5000);
                }
            },
            getCheck: function getCheck() {
                clearInterval(this.timer);
                if (this.cltstatus.success || this.cltstatus.code == -203) {
                    if (this.cltstatus.main_server == this.sectName) {
                        this.checkServer = false;
                        this.timerData();
                        return;
                    }
                }
                this.checkServer = true;
            },
            // 启动 - 关闭
            toggleClient: function toggleClient(target) {
                var _this = this;
                this.checkServer = false;
                if (target == 'check') {
                    _this.isRest = true;
                    _this.startClient(target);
                } else {
                    if (this.btnControl == "Connect") {
                        // _this.isRest = true;
                        // _this.$store.dispatch("call", {
                        //     api: 'internetreachable',
                        //     async: true
                        // }).then(function (result) {
                            // _this.isRest = false;
                            // if (!result.reachable) {
                                // _this.$message({
                                    // type: 'warning',
                                    // msg: -210
                                // });
                            // } else {
                                _this.startClient(target);
                            // }
                        // });
                    } else {
                        _this.stopClient();
                    }
                }
            },
            startClient: function startClient(target) {
                var _this = this;
                if (this.sectName.indexOf('app_hideme') == 0 ) { // 判断是否以 app_hideme开头
                    _this.$message({
                        type: "warning",
                        api: "wgcstart",
                        msg: this.t('Due to the limitation of Hide.me, you must conect using your smartphone app.')
                    });
                    return
                }
                _this.vpnexpect = -203;
                _this.vpnsuccess = 0;
                var restart = target ? true : false;
                clearInterval(this.timer);
                clearTimeout(this.timeout);
                _this.$store.dispatch("call", {
                    api: "wgcstart",
                    data: {
                        name: this.sectName,
                        restart: restart
                    },
                    timeOut: 20000
                }).then(function (result) {
                    _this.isRest = false;
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgcstart",
                            msg: result.code
                        });
                        _this.vpnexpect = 'init';
                        _this.vpnsuccess = 'init';
                        _this.getStatus();
                        _this.timerData();
                        return;
                    }
                    if (result.success) {
                        // _this.$message({
                        //     type: "success",
                        //     api: "wgcstart",
                        //     msg: result.code
                        // });
                    } else {
                        _this.$message({
                            'type': "error",
                            'api': "wgcstart",
                            'msg': result.code
                        });
                        _this.vpnexpect = 'init';
                        _this.vpnsuccess = 'init';
                    }
                    setTimeout(function () {
                        _this.getStatus();
                        _this.timerData();
                    }, 5000);
                    _this.timeout = setTimeout(function () {
                        if (_this.vpnexpect != 'init' || _this.vpnsuccess != 'init') {
                            _this.vpnexpect = 'init';
                            _this.vpnsuccess = 'init';
                        }
                    }, 15000);
                });
            },
            stopClient: function stopClient() {
                var _this = this;
                clearInterval(this.timer);
                clearTimeout(this.timeout);
                this.vpnexpect = -204;
                _this.$store.dispatch("call", {
                    api: "wgcstop"
                }).then(function (result) {
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgcstart",
                            msg: result.code
                        });
                        _this.getStatus();
                        _this.timerData();
                        _this.vpnexpect = 'init';
                        return;
                    }
                    if (result.success) {
                        // _this.$message({
                        //     type: "success",
                        //     api: "wgcstart",
                        //     msg: result.code
                        // });
                    } else {
                        _this.vpnexpect = 'init';
                    }
                    setTimeout(function () {
                        _this.getStatus();
                        _this.timerData();
                    }, 10000);
                    _this.timeout = setTimeout(function () {
                        if (_this.vpnexpect != 'init') {
                            _this.vpnexpect = 'init';
                        }
                    }, 15000);
                });
            },
            // client list
            getctList: function getctList() {
                var _this = this;
                this.$store.dispatch("call", {
                    api: "wgclist"
                }).then(function (result) {
                    if (result.success) {
                        _this.addState = false;
                        _this.wgclients = result.peers;
                        var len = _this.wgclients.length;
                        for (var i = 0; i < len; i++) {
                            _this.wgclients[i].id = 'item' + i;
                            _this.$set(_this.wgclients[i], "description", _this.wgclients[i].name);
                            if (result.current_server && _this.wgclients[i]['description'] == result.current_server) {
                                var description = _this.wgclients[i]
                                _this.wgclients.splice(i, 1);
                                _this.wgclients.unshift(description);
                            }
                        }
                        _this.timerData();
                    } else {
                        _this.sectName = '';
                        _this.wgclients = [];
                        _this.addState = true;
                    }
                });
            },
            // 下一步
            addNext: function addNext() {
                if (this.wgclients) {
                    for (var k in this.wgclients) {
                        if (this.nmInput == this.wgclients[k].name) {
                            this.$message({
                                type: "error",
                                msg: -15
                            });
                            return;
                        }
                    }
                }
                this.wgclientData.name = this.nmInput
                if (!this.showAllowedIPs || (this.showAllowedIPs == '0.0.0.0/0' || this.showAllowedIPs == '0.0.0.0/0,::/0')) {
                    this.add_client(this.wgclientData, this.wgclientType)
                    this.nextState = true;
                } else {
                    this.checkAllowedIPsModal();
                    this.isAddClient = true;
                }
            },
            // add modal chose  添加
            addctList: function addctList() {
                this.user = this.user.replace(/\s*/g,"");
                var data = {};
                var _this = this;
                this.errorPrt = false;
                this.errorPub = false;
                if (this.wayState == 'one') {
                    if (this.selectPolicy == 'mullvad') {
                        if (!this.user) {
                            this.$message({
                                type: "warning",
                                msg: -2602
                            });
                            return;
                        }
                    } else {
                        if (!this.user || !this.psw) {
                            this.$message({
                                type: "warning",
                                msg: -2602
                            });
                            return;
                        }
                        if (this.getLen(this.psw) > 512) {
                            this.$message({
                                type: "error",
                                msg: -22
                            });
                            return;
                        }
                    }
                    if (this.getLen(this.user) > 512) {
                        this.$message({
                            type: "error",
                            msg: -22
                        });
                        return;
                    }
                    data = {
                        user: this.user,
                        psw: this.psw,
                        type: this.selectPolicy
                    };
                    _this.showAllowedIPs = '';
                    _this.wgclientType = 'wrthirdadd';
                    _this.wgclientData = data;
                    _this.nextState = false;
                } else if (this.wayState == 'two') {
                    if (!_this.ctlist) {
                        this.$message({
                            type: "warning",
                            msg: -2602
                        });
                        return;
                    }
                    if (this.isJsonString(_this.ctlist)) {
                        data = JSON.parse(_this.ctlist);
                        data.dns = data.dns ? data.dns : '';
                    } else {
                        var list = _this.ctlist.split(/[\n]/).filter(item => item.indexOf('=') > -1);
                        data.address = '';
                        data.address_ipv6 = '';
                        data.listen_port = '';
                        data.private_key = '';
                        data.allowed_ips = '';
                        data.end_point = '';
                        data.persistent_keepalive = 25;
                        data.public_key = '';
                        data.dns = '';
                        data.preshared_key = "";
                        data.mtu = "";
                        list.forEach(item => {
                            const temp = item
                            .split('=')[0]
                            .trim()
                            .toLowerCase()
                          if (temp.indexOf('address') > -1) {
                            const ipArr = item
                              .slice(item.indexOf('=') + 1)
                              .trim()
                              .split(',')
                            ipArr.forEach(ipItem=>{
                                const ipItemArr = ipItem.trim().split('/')
                                if (_this.ipReg.test(ipItemArr[0])) {
                                    data.address = ipItem.trim();
                                }
                                if (_this.ipv6Reg.test(ipItemArr[0])) {
                                    data.address_ipv6 = ipItem.trim();
                                }
                            })
                          }
                          if (temp.indexOf('listenport') > -1) {
                            data.listen_port = item.slice(item.indexOf('=') + 1).trim()
                          }
                          if (temp.indexOf('presharedkey') > -1) {
                              data.preshared_key = item.slice(item.indexOf('=') + 1).trim()
                          } 
                          if (temp.indexOf('privatekey') > -1) {
                              data.private_key = item.slice(item.indexOf('=') + 1).trim()
                          }
                          if (temp.indexOf('mtu') > -1) {
                                data.mtu = item.slice(item.indexOf('=') + 1).trim()
                          }
                          if (temp.indexOf('allowedips') > -1) {
                            data.allowed_ips = item.slice(item.indexOf('=') + 1).replace(/\s/g,'')
                              
                          }
                          if (temp.indexOf('endpoint') > -1) {
                            data.end_point = item.slice(item.indexOf('=') + 1).trim()
                          }
                          if (temp.indexOf('publickey') > -1) {
                            data.public_key = item.slice(item.indexOf('=') + 1).trim()
                          }
                          if (temp.indexOf('dns') > -1) {
                            data.dns = item
                            .slice(item.indexOf('=') + 1)
                            .trim()
                          }
                          if (temp.indexOf('persistentkeepalive') > -1) {
                            data.persistent_keepalive = item.slice(item.indexOf('=') + 1).trim()
                            
                          }
                        });
                    
                        if (!data.address || !data.private_key || !data.allowed_ips || !data.end_point || !data.public_key) {
                            this.$message({
                                type: "warning",
                                msg: -2603
                            });
                            return;
                        }
                    }
                    _this.showAllowedIPs = data.allowed_ips;
                    _this.wgclientType = 'wgcadd';
                    _this.wgclientData = data;
                    _this.nextState = false;
                } else if (this.wayState == 'three') {
                    if (!this.address) {
                        this.checkip = false;
                    }
                    if (!this.prtKey) {
                        this.checkprikey = false;
                    }
                    if (this.sharedKey) {
                        this.checksharedKey = this.serachsharedKey();
                    }
                    if (!this.pubKey) {
                        this.checkpubkey = false;
                    }
                    if (!this.point) {
                        this.checkpoint = false;
                    }
                    if (!this.ips) {
                        this.checkIPs = false;
                    }
                    if (this.dns) {
                        this.checkdns = this.searchdns();
                    }
                    if (this.mtu) {
                        this.checkmtu = this.searchmtu();
                    }
                    if (this.port) {
                        this.checkport = this.searchport();
                    }
                    // 除allowed_ips未填写时，滚动到弹窗底部
                    if (this.checkip && this.checkprikey && this.checkpubkey && this.checkpoint &&  !this.checkIPs) {
                        document.getElementById('allowedIpsAnimate').scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                    if (!this.checkip || !this.checksharedKey || !this.checkprikey || !this.checkdns || !this.checkpubkey || !this.checkpoint || !this.checkIPs || !this.checkmtu || !this.checkport) {
                        return;
                    }
                    if (this.address.indexOf(',') != -1) {
                        this.address = this.address.split(',')[0];
                    }
                    data = {
                        address: this.address.trim(),
                        listen_port: this.port ? this.port.trim() : "",
                        persistent_keepalive: 25,
                        allowed_ips: this.ips.trim(),
                        end_point: this.point.trim(),
                        private_key: this.prtKey.trim(),
                        preshared_key: this.sharedKey.trim(),
                        public_key: this.pubKey.trim(),
                        dns: this.dns.trim(),
                        mtu: this.mtu ? this.mtu.trim() : '',
                        address_ipv6: this.address_ipv6 ? this.address_ipv6.trim() : '',
                       
                    };
                    _this.showAllowedIPs = data.allowed_ips;
                    _this.wgclientType = 'wgcadd'
                    _this.wgclientData = data;
                    _this.nextState = false;
                }
            },
            removeSpace: function removeSpace(str) {
                if (str.indexOf(', ')) {
                    str = str.replace()
                }
            },
            add_client: function add_client(data, api) {
                var _this = this;
                _this.btnstatus = true;
                _this.showModal = false;
                if (api == "wrthirdadd") {
                    if (data.type === 'azirevpn') {    
                        _this.$message({
                           type: 'info',
                           msg: -2607,
                           duration: 0
                       });
                    }
                    if (data.type === "mullvad") {
                        _this.addingTips =  _this.$message({
                            type: 'info',
                            msg: _this.t('The router is generating configuration on the background and it will take around 20 minutes. '),
                            duration: 0
                        });
                    }
                    
                }
                _this.$store.dispatch("call", {
                    api: api,
                    data: data,
                    timeOut: 90000
                }).then(function (result) {
                    _this.btnstatus = false;
                    if (data.type === "mullvad") {
                        _this.download_config = true
                        _this.timerData()
                    }
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgcadd",
                            msg: result.code
                        });
                        return;
                    }
                    if (result.success) {
                        if (data.type !== "mullvad")  { 
                            _this.$message({
                                type: "success",
                                api: "wgcadd",
                                msg: result.code
                            });
                            _this.getctList();
                        }
                        _this.closeModal();
                    } else {
                        if (result.code == -199) {
                            _this.$store.commit("showModal", {
                                show: true,
                                title: _this.t('Caution'),
                                message: "You have reached the maximum number of WireGuard keys. Please revoke one of your keys at the following URL:",
                                href: "https://mullvad.net/account/#port-management",
                                cb: function cb() {}
                            });
                            $("body").find(".t-message").remove();
                        } else {
                            _this.$message({
                                type: "error",
                                api: "wgcadd",
                                msg: result.code
                            });
                        }
                    }
                });
            },
            removeClient: function removeClient(index) {
                var _this = this;
                var msg = this.t(this.$lang.modal.delConfig) + "?";
                var isAll = false;
                if (index == 'all') {
                    msg = this.$lang.modal.delProfiles_all;
                    isAll = true;
                }
                this.$store.commit("showModal", {
                    show: true,
                    title: "Caution",
                    message: msg,
                    messageTwo: this.$lang.modal.dela,
                    cb: function cb() {
                        isAll ? _this.rmAll() : _this.rmClient(index);
                    }
                });
            },
            rmAll: function rmAll() {
                var _this = this;
                _this.rmStatus = true;
                _this.$store.dispatch("call", {
                    api: 'wgrmall'
                }).then(function (result) {
                    _this.rmStatus = false;
                    if (result.success) {
                        _this.$message({
                            type: 'success',
                            msg: result.code
                        });
                        _this.circleClass = '';
                        _this.getctList();
                    } else {
                        var type = "error";
                        if (result.code == -302) {
                            type = 'warning';
                            _this.circleClass = '';
                            _this.getctList();
                        }
                        _this.$message({
                            type: type,
                            msg: result.code
                        });
                    }
                });
            },
            rmClient: function rmClient(index) {
                var _this = this;
                _this.$store.dispatch("call", {
                    api: "wgcremove",
                    data: {
                        name: this.wgclients[index].name
                    }
                }).then(function (result) {
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgcremove",
                            msg: result.code
                        });
                        return;
                    }
                    if (result.success) {
                        _this.$message({
                            type: "success",
                            api: "wgcremove",
                            msg: result.code
                        });
                        // 已删除该配置 select上面继续显示已删除name
                        var len = _this.wgclients.length;
                        if (_this.wgclients[index].name == _this.sectName) {
                            if (index == 0 && len > 1) {
                                _this.sectName = _this.wgclients[1].name;
                            } else {
                                _this.sectName = _this.wgclients[0].name;
                            }
                        }
                        if (_this.wgclients.length == 1) {
                            _this.sectName = _this.wgclients[0].name;
                        }
                        if (_this.wgclients.length == 0) {
                            _this.sectName = "";
                        }
                    } else {
                        var type = "error";
                        if (result.code == -302) {
                            type = "warning";
                        }
                        _this.$message({
                            type: type,
                            api: "wgcremove",
                            msg: result.code
                        });
                    }
                    $(".vpn-manage-body").collapse("hide");
                    _this.wgclients.splice(index, 1);
                    _this.getctList();
                });
            },
            modifyClient: function modifyClient(index, name) {
                var _this = this;

                var addr = this.wgclients[index].allowed_ips ? this.wgclients[index].address.replace(/(^\s*)|(\s*$)/g, '') : '';
                var address = '';
                var address_ipv6 = '';
                if (addr) {
                    if (addr.indexOf(',') != -1) {
                        address = addr.substring(0, addr.indexOf(','));
                        address_ipv6 = addr.substr(addr.indexOf(',') + 1);
                    } else {
                        address = addr
                    }
                }
                var ips = this.wgclients[index].allowed_ips ? this.wgclients[index].allowed_ips.trim() : '';
                var point = this.wgclients[index].end_point ? this.wgclients[index].end_point.trim() : '';
                var listen_port = this.wgclients[index].listen_port ? this.wgclients[index].listen_port.trim() : '';
                var keepalive = this.wgclients[index].persistent_keepalive ? this.wgclients[index].persistent_keepalive.trim() : '';
                var pri_key = this.wgclients[index].private_key ? this.wgclients[index].private_key.trim() : '';
                var pub_key = this.wgclients[index].public_key ? this.wgclients[index].public_key.trim() : '';
                var shared_key = this.wgclients[index].preshared_key ? this.wgclients[index].preshared_key.trim() : '';
                var dns = this.wgclients[index].dns ? this.wgclients[index].dns.trim() : '';
                var mtu = this.wgclients[index].mtu ? this.wgclients[index].mtu.trim() : '';
                if (!address || !this.serachIp(address)) {
                    this.$message({
                        type: "error",
                        msg: '-2608'
                    });
                    return;
                }
                if (address_ipv6 && !this.searchIpv6(address_ipv6)) {
                    this.$message({
                        type: "error",
                        msg: '-2608'
                    });
                    return;
                }
                if (!pri_key || pri_key.length != 44) {
                    this.$message({
                        type: "error",
                        msg: '-2609'
                    });
                    return;
                }
                if (shared_key) {
                    if (shared_key.length != 44) {
                        this.$message({
                            type: "error",
                            msg: 'Invalid PresharedKey'
                        });
                        return;
                    }
                }

                if (!pub_key || pub_key.length != 44) {
                    this.$message({
                        type: "error",
                        msg: '-2612'
                    });
                    return;
                }
                if (listen_port) {
                    if (!this.portReg.test(listen_port)) {
                        this.$message({
                            type: "error",
                            msg: '-2610'
                        });
                        return;
                    }
                }
                if (mtu) {
                    if (this.numReg.test(this.mtu)) {
                        if (mtu < 64 || mtu > 1500) {
                            this.$message({
                                type: "error",
                                msg: 'Invalid MTU'
                            });
                            return;
                        }
                    }
                }
                if (dns) {
                    let dnsPass=true
                    dns.split(',').forEach(item => {
                        if (!this.dnsReg.test(item.trim())&&!this.ipv6Reg.test(item.trim())) {
                            dnsPass = false
                        }
                    });
                    if (!dnsPass) {
                        this.$message({
                            type: "error",
                            msg: '-2611'
                        });
                        return;
                    }
                }
                if (!ips) {
                    this.$message({
                        type: "error",
                        msg: '-2614'
                    });
                    return;
                }
                if (!point || !this.serachPoint(point)) {
                    this.$message({
                        type: "error",
                        msg: '-2613'
                    });
                    return;
                }
                if (keepalive) {
                    if (!this.numReg.test(keepalive) || parseInt(keepalive) > 65535 || parseInt(keepalive) < 0) {
                        this.$message({
                            type: "error",
                            msg: '-2615'
                        });
                        return;
                    }
                }
                keepalive = keepalive ? keepalive : 25;
                this.submitData = {
                    name: this.wgclients[index].name,
                    address: address,
                    allowed_ips: ips,
                    end_point: point,
                    listen_port: listen_port,
                    persistent_keepalive: keepalive,
                    private_key: pri_key,
                    public_key: pub_key,
                    dns: dns,
                    mtu: mtu,
                    preshared_key: shared_key,
                    address_ipv6: address_ipv6.trim()
                };
                // allowed ips 校验
                let  checkIPs = true
                const subneipv4Reg = /^(([0-9]|[12][0-9]|3[012]))$/; // 0~32整数校验
                const subneipv6Reg = /^(([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))$/; // 0~128整数校验
                // allowed ips 校验
                const ipsArr = ips.split(',');
                for (let i = 0;  i < ipsArr.length;  i++) {
                    const item = ipsArr[i].trim()
                    const itemIp= item.split('/')[0].trim()
                    const itemsubnet =item.split('/')[1]? item.split('/')[1].trim():undefined
                    if (itemsubnet === undefined  || (!this.ipReg.test(itemIp) && !this.ipv6Reg.test(itemIp)) || (this.ipReg.test(itemIp) && !subneipv4Reg.test(itemsubnet)) || (this.ipv6Reg.test(itemIp) && !subneipv6Reg.test(itemsubnet))) {
                        checkIPs = false
                        break 
                    }
                    
                }
                if (!checkIPs) {
                    this.$message({
                            "type": 'warning',
                            "msg": this.t('Invalid AllowedIPs')
                        })
                    return
                }
                ips = ips.replace(/\s+/g, "");
                if (ips == '0.0.0.0/0' || ips == '0.0.0.0/0,::/0') {
                    this.handleConfirm();
                } else {
                    this.checkAllowedIPsModal();
                    return
                }
            },
            // 打开模态窗 显示相应界面内容
            openModal: function openModal() {
                if (this.btnstatus || this.download_config) {
                    return
                }
                this.showModal = true;
                // this.wayState = 'one';
                this.wayState = 'one';//lzq modify
                this.changeWay('user')//lzq modify
                this.nextState = true;//lzq modify
                this.checkip = true;
                this.checkprikey = true;
                this.checksharedKey = true;
                this.checkport = true;
                this.checkdns = true;
                this.checkmtu = true;
                this.checkpubkey = true;
                this.checkpoint = true;
                this.checkIPs = true;
            },
            // 关闭弹窗，数据初始化
            closeModal: function closeModal() {
                this.showModal = false;
                this.nmInput = "";
                this.ips = "";
                this.point = "";
                this.port = "";
                this.address = "";
                this.prtKey = "";
                this.pubKey = "";
                this.ctlist = "";
                this.user = "";
                this.psw = "";
                this.dns = "";
                this.wgclientData = {}
                this.wgclientType = ''
                this.nextState = true;
                this.checkip = true;
                this.checkprikey = true;
                this.checksharedKey = true;
                this.checkport = true;
                this.checkdns = true;
                this.checkmtu = true;
                this.checkpubkey = true;
                this.checkpoint = true;
                this.checkIPs = true;
            },
            isJsonString: function isJsonString(str) {
                try {
                    if (this.checktype(JSON.parse(str)) == "Object") {
                        return true;
                    }
                } catch (e) {
                    // console.log("error: ");
                }
                return false;
            },
            checktype: function checktype(val) {
                return Object.prototype.toString.call(val).split(" ")[1].split("]")[0];
            },
            getLen: function getLen(data) {
                var realLength = 0;
                var charCode = -1;
                if (data) {
                    var len = data.trim().length;
                    for (var i = 0; i < len; i++) {
                        charCode = data.trim().charCodeAt(i);
                        if (charCode > 0 && charCode <= 128) {
                            realLength += 1;
                        } else {
                            realLength += 3;
                        }
                    }
                }
                return realLength;
            },
            serachip: function serachip(data) {
                if (!this.address || data == "focus") {
                    this.checkip = true;
                } else {
                    var address = this.address;
                    var indexIPAddressComma = address.indexOf(',');// 用于区分ipv4和ipv6
                    var ipv4_checked = true;
                    var ipv6_checked = true;
                    if (indexIPAddressComma != -1) {
                        this.address = address.substring(0, indexIPAddressComma);
                        this.address_ipv6 = address.substring(indexIPAddressComma + 1);
                        if (!this.address_ipv6) ipv6_checked = false;
                        else ipv6_checked = this.searchIpv6(this.address_ipv6);
                        ipv4_checked = this.serachIp(this.address);
                    } else {
                        ipv4_checked = this.serachIp(this.address);
                    }
                    if (!ipv4_checked || !ipv6_checked) {
                        this.checkip = false;
                    } else {
                        this.checkip = true;
                    }
                }
                var item = this.checkip;
                return item;
            },
            serachprikey: function serachprikey(data) {
                if (data == "focus") {
                    this.checkprikey = true;
                } else {
                    this.checkprikey = !this.prtKey ? true : this.getLen(this.prtKey) != 44 ? false : true;
                }
            },
            serachsharedKey: function serachsharedKey(data) {
                if (data == "focus") {
                    this.checksharedKey = true;
                } else {
                    this.checksharedKey = !this.sharedKey ? true : this.getLen(this.sharedKey) != 44 ? false : true;
                }
                var item = this.checksharedKey;
                return item;
            },
            searchport: function searchport(data) {
                if (data == "focus") {
                    this.checkport = true;
                } else {
                    this.checkport = !this.port ? true : this.portReg.test(this.port.trim());
                }
                var item = this.checkport;
                return item;
            },
            getlens: function getlens(data) {
                if (this.numReg.test(data)) {
                    if (data < 64) {
                        return false;
                    } else if (data > 1500) {
                        return false
                    } else {
                        return true;
                    }
                } else {
                    return false
                }
            },
            searchmtu: function searchmtu(data) {
                if (data == "focus") {
                    this.checkmtu = true;
                } else {
                    this.checkmtu = !this.mtu ? true : this.getlens(this.mtu.trim());
                }
                var item = this.checkmtu;
                return item;
            },
            searchdns: function searchdns(data) {
                if (data == "focus") {
                    return true;
                } else {
                    // dns校验
                    var dns = this.dns
                    if (!dns) {
                        this.checkdns = true;
                        return
                    }
                    var dns_checked = true;
                    dns.split(',').forEach(item=>{
                        if (!this.dnsReg.test(item.trim())&&!this.ipv6Reg.test(item.trim())) {
                            dns_checked = false
                        }
                    })
                console.log(dns_checked);
                    this.checkdns = dns_checked
                    
                    return this.checkdns;
                }
            },
            serachpubkey: function serachpubkey(data) {
                if (data == "focus") {
                    this.checkpubkey = true;
                } else {
                    this.checkpubkey = !this.pubKey ? true : this.getLen(this.pubKey) != 44 ? false : true;
                }
            },
            serachpoint: function serachpoint(data) {
                var url = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
                var initPoint = this.point.trim();
                var ipv6Point = null, ipv6Port = null;
                if (initPoint.indexOf('[') == 0 && initPoint.indexOf(']') != '-1') {
                    ipv6Point = initPoint.substr(1).split(']')[0];
                    ipv6Port = initPoint.substr(1).split(']')[1].substr(1);
                }
                var checkip = false;
                var checkurl = false;
                var checkPort = false;
                if (!this.point || data == 'focus') {
                    this.checkpoint = true;
                } else {
                    if (ipv6Point) {
                        if (this.ipv6Reg.test(ipv6Point) && this.portReg.test(ipv6Port)) {
                            this.checkpoint = true;
                        } else {
                            this.checkpoint = false;
                        }
                    } else {
                        if (initPoint.indexOf(':')) {
                            var point = initPoint.trim().split(':');
                            checkPort = this.portReg.test(point[1]);
                            if ($.type(point[0]) === 'number') {
                                checkip = this.checkip(point[0]);
                            } else {
                                checkurl = url.test(point[0]);
                            }
                            if (checkip && checkPort || checkurl && checkPort) {
                                this.checkpoint = true;
                            } else {
                                this.checkpoint = false;
                            }
                        } else {
                            this.checkpoint = false;
                        }
                    }
                }
                var item = this.checkpoint;
                return item;
            },
            serachIPs: function serachIPs(data) {
                if (!this.ips || data == "focus") {
                    this.checkIPs = true;
                } else {
                    this.checkIPs = true
                    const subneipv4Reg = /^(([0-9]|[12][0-9]|3[012]))$/; // 0~32整数校验
                    const subneipv6Reg = /^(([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))$/; // 0~128整数校验
                    // allowed ips 校验
                    const ipsArr = this.ips.split(',');
                    for (let i = 0;  i < ipsArr.length;  i++) {
                        const item = ipsArr[i].trim()
                        const itemIp= item.split('/')[0].trim()
                        const itemsubnet =item.split('/')[1]? item.split('/')[1].trim():undefined
                        if (itemsubnet === undefined  || (!this.ipReg.test(itemIp) && !this.ipv6Reg.test(itemIp)) || (this.ipReg.test(itemIp) && !subneipv4Reg.test(itemsubnet)) || (this.ipv6Reg.test(itemIp) && !subneipv6Reg.test(itemsubnet))) {
                            this.checkIPs = false
                            break 
                        }
                        
                    }
                }
                return this.checkIPs;
            },
            serachPoint: function serachPoint(data) {
                var url = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
                var initPoint = data.trim();
                var ipv6Point = null, ipv6Port = null;
                if (initPoint.indexOf('[') == 0 && initPoint.indexOf(']') != '-1') {
                    ipv6Point = initPoint.substr(1).split(']')[0];
                    ipv6Port = initPoint.substr(1).split(']')[1].substr(1);
                }
                var checkip = false;
                var checkurl = false;
                var checkPort = false;
                var item;
                if (data) {
                    if (ipv6Point) {
                        if (this.ipv6Reg.test(ipv6Point) && this.portReg.test(ipv6Port)) {
                            item = true;
                        } else {
                            item = false;
                        }
                    } else {
                        if (data.trim().indexOf(':')) {
                            var point = data.trim().split(':');
                            checkPort = this.portReg.test(point[1]);
                            if ($.type(point[0]) === 'number') {
                                checkip = this.checkip(point[0]);
                            } else {
                                checkurl = url.test(point[0]);
                            }
                            if (checkip && checkPort || checkurl && checkPort) {
                                item = true;
                            } else {
                                item = false;
                            }
                        } else {
                            item = false;
                        }
                    }
                }
                return item;
            },
            serachIp: function serachIp(data) {
                var item;
                if (data) {
                    var address = data.trim();
                    if (address.indexOf('/') != -1) {
                        var list = address.split('/');
                        if (this.ipReg.test(list[0]) && list[1] >= 0 && list[1] <= 32 && list[1] != '') {
                            item = true;
                        } else {
                            item = false;
                        }
                    } else {
                        if (this.ipReg.test(address)) {
                            item = true;
                        } else {
                            item = false;
                        }
                    }
                }
                return item;
            },
            searchIpv6: function searchIpv6(data) {
                var item;
                if (data) {
                    var address_ipv6 = data.trim();
                    if (address_ipv6.indexOf('/') != -1) {
                        var list = address_ipv6.split('/');
                        if (this.ipv6Reg.test(list[0]) && list[1] >= 0 && list[1] <= 128 && list[1] != '') {
                            item = true;
                        } else {
                            item = false;
                        }
                    } else {
                        if (this.ipv6Reg.test(address_ipv6)) {
                            item = true;
                        } else {
                            item = false;
                        }
                    }
                }
                return item;
            },
            handleConfirm: function handleConfirm(){
                if (this.isAddClient) {
                    this.add_client(this.wgclientData, this.wgclientType);
                    this.nextState = true;
                    this.isAddClient = false;
                } else {
                    var _this = this;
                    _this.$store.dispatch("call", {
                        api: "wgcset",
                        data: {
                            name: _this.submitData.name,
                            address: _this.submitData.address,
                            allowed_ips: _this.submitData.allowed_ips,
                            end_point: _this.submitData.end_point,
                            listen_port: _this.submitData.listen_port,
                            persistent_keepalive: _this.submitData.persistent_keepalive,
                            private_key: _this.submitData.private_key,
                            public_key: _this.submitData.public_key,
                            dns: _this.submitData.dns,
                            mtu: _this.submitData.mtu,
                            preshared_key: _this.submitData.preshared_key,
                            address_ipv6: _this.submitData.address_ipv6
                        }
                    }).then(function (result) {
                        if (result.failed) {
                            _this.$message({
                                type: "error",
                                api: "wgcset",
                                msg: result.code
                            });
                            return;
                        }
                        if (result.success) {
                            _this.$message({
                                type: "success",
                                api: "wgcset",
                                msg: result.code
                            });
                            _this.$set(_this.wgclients[index], "description", _this.wgclients[index].name);
                        } else {
                            _this.$message({
                                type: "error",
                                api: "wgcset",
                                msg: result.code
                            });
                        }
                    });
                }
            },
            checkAllowedIPsModal: function checkAllowedIPsModal() {
                var that = this;
                this.$store.commit('showModal', {
                    message: that.t('Note that only data accessing subnet') + that.showAllowedIPs + that.t('will pass through the VPN.'),
                    messageTwo: that.t('There may be a risk of data leakage. Do you want to continue?'),
                    type: 'warning',
                    no: 'Cancel',
                    title: that.t(that.$lang.modal.caution),
                    cb: function cb() {
                        that.handleConfirm();
                    }
                })
            },
            blockclient: function blockclient() {
                var access = this.cltstatus.access;
                var that = this;
                clearInterval(this.timer);
                if (access) {
                    that.block(false);
                } else {
                    this.$store.commit("showModal", {
                        show: true,
                        message: this.t('If you turn on this function, server will be able to access your local files. Do you want to turn on this option?'),
                        title: this.$lang.modal.access,
                        cb: function cb() {
                            that.block(true);
                        },
                        cancel: function cancel() {
                            that.timerData();
                            that.access = that.wgclist.access;
                        }
                    });
                }
            },
            block: function block(item) {
                var that = this;
                that.blockStatus = true;
                that.$store.dispatch("call", {
                    api: 'wgcblock',
                    data: {
                        "enable": item
                    }
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "wgcblock",
                            "msg": result.code
                        });
                        that.timerData();
                        return;
                    }
                    if (result.success) {
                        that.access = item;
                        that.$message({
                            "type": "success",
                            "api": "wgcblock",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "wgcblock",
                            "msg": result.code
                        });
                    }
                    that.getStatus();
                });
            }
        }
    });
    return vueComponent;
});
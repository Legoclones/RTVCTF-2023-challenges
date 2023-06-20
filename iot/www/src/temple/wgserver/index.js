"use strict";

define(["text!temple/wgserver/index.html", "qrcode", "jqueryqrcode", "css!temple/wgserver/index.css", "vue", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index", "component/gl-btn/index", "component/gl-label/index", "component/modal/modal", "component/gl-toggle-btn/index"], function (stpl, qrcode, jqueryqrcode, css, Vue, gl_input, gl_tooltip, gl_select, gl_btn, gl_label, modal, gl_switch) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                typename: "default",
                showModal: false,
                wgclients: [],
                severName: "",
                nmInput: "",
                clientIp: "",
                clientkey: "",
                status: "",
                showServer: false,
                timer: null,
                timeout: null,
                circleClass: "",
                ctlist: "",
                copyModal: false,
                addState: false,
                numReg: /^\d+$/,
                cfg: '',
                copyStatus: false,
                btnexpect: 'init',
                msgOf_dmz: false,
                blockStatus: false,
                access: false,
                Ipv6Address: '',
                inputV6Status: null,
                ipv6AddressDisabled: false,
                ipv6EnabledTooltip: null
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
                // $(".clsLink2vpn").addClass("active");
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
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            clearInterval(this.timer);
            clearTimeout(this.timeout);
            next();
        },
        watch: {
            "ssStatus.code": {
                handler: function(val, oldVal) {
                    var status = 'off';
                    if (val == '0') status = 'connected';
                    this.$bus.$emit('vpnCircleStatus', 'wgserver', status);
                }
            }
        },
        computed: {
            publicKey: function publicKey() {
                return this.$store.getters.apiData["wgsGetKey"];
            },
            wgsget: function wgsget() {
                var wgsInfo = this.$store.getters.apiData["wgsifget"];
                if (wgsInfo.ipv6 == 0) {
                    this.ipv6EnabledTooltip = this.t('Please enable ipv6 first if you want to configure ipv6 vpn tunnel');
                    this.ipv6AddressDisabled = true;
                } else if (wgsInfo.mode6 == 'Native') {
                    this.ipv6EnabledTooltip = this.t('The ipv6 tunnel for VPN is disabled when using ipv6 Native mode and this may cause data leak, please change ipv6 mode then restart vpn server/client.');
                    this.ipv6AddressDisabled = true;
                } else {
                    this.ipv6AddressDisabled = false;
                }
                return wgsInfo;
            },
            wgsCheckKey: function wgsCheckKey() {
                return this.$store.getters.apiData["wgsCheckKey"];
            },
            // showServer: function showServer() {
            //     return this.wgsCheckKey.success;
            // },
            ssStatus: function ssStatus() {
                return this.$store.getters.apiData["wgsstatus"];
            },
            peStatus: function peStatus() {
                return this.$store.getters.apiData["wgspestatus"];
            },
            btnControl: function btnControl() {
                var btnName = "Start";
                switch (this.ssStatus.code) {
                    case 0:
                        btnName = "Stop";
                        this.typename = "danger";
                        this.circleClass = "active";
                        break;
                    case -202:
                        btnName = "Start";
                        this.typename = "default";
                        this.circleClass = "";
                        break;
                    default:
                        btnName = "Start";
                        this.typename = "default";
                        this.circleClass = "";
                }
                return btnName;
            },
            manLen: function manLen() {
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
            btnstatus: function btnstatus() {
                if (this.btnexpect != 'init') {
                    if (this.btnexpect == this.ssStatus.code) {
                        this.btnexpect = 'init';
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        },
        mounted: function mounted() {
            var _this = this;
            // 获取 public key
            _this.checkKey();
            // 获取 sever status
            this.timerData();
            _this.showServer = _this.wgsCheckKey.success;
            _this.$store.dispatch("call", { api: 'fwget' }).then(function (result) {
                if (result.status == 'Enabled') {
                    _this.msgOf_dmz = true;
                }
            });
        },
        methods: {
            blockclient: function blockclient() {
                var access = this.wgsget.access
                var that = this;
                clearInterval(this.timer);
                if (access) {
                    that.block(false);
                } else {
                    this.$store.commit("showModal", {
                        show: true,
                        message: this.$lang.modal.isOpen,
                        title: this.$lang.modal.access,
                        cb: function cb() {
                            that.block(true);
                        },
                        cancel: function cancel() {
                            that.timerData();
                            that.access = that.wgsget.access;
                        }
                    });
                }
            },
            block: function block(item) {
                var that = this;
                that.blockStatus = true;
                that.$store.dispatch("call", {
                    api: 'wgsblock',
                    data: {
                        "enable": item
                    }
                }).then(function (result) {
                    that.blockStatus = false;
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "wgsblock",
                            "msg": result.code
                        });
                        that.timerData();
                        return;
                    }
                    if (result.success) {
                        that.access = item;
                        that.$message({
                            "type": "success",
                            "api": "wgsblock",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "wgsblock",
                            "msg": result.code
                        });
                    }
                    that.timerData();
                });
            },
            Qrcodeshow: function Qrcodeshow() {
                $('.qrcodeMO').show().siblings("div").hide();
                $('.QrcodeShow').addClass('active').siblings('li').removeClass('active');
            },
            infoshow: function infoshow() {
                $('.textarea').show().siblings('div').hide();
                $('.configShow').addClass('active').siblings('li').removeClass('active');
            },
            jsonshow: function jsonshow() {
                $('.JSONShow').addClass('active').siblings('li').removeClass('active');
                $('.jsonConfig').show().siblings('div').hide();
            },

            getStatus: function getStatus() {
                var that = this
                this.$store.dispatch("call", { api: "wgsstatus" }).then(function(res) {
                    var status = 'off';
                    if (res.code == '0') status = 'connected';
                    that.$bus.$emit('vpnCircleStatus', 'wgserver', status);
                });
                this.$store.dispatch("call", { api: "wgspestatus" });
            },
            timerData: function timerData() {
                var _this = this;
                _this.getStatus();
                this.$store.dispatch("call", { 
                    api: "wgsifget" 
                }).then(function (result) {
                    _this.access = result.access;
                    _this.Ipv6Address = result.local_ipv6;
                });
                clearInterval(this.timer);
                _this.timer = setInterval(function () {
                    _this.getStatus();
                }, 5000);
            },
            getClients: function getClients() {
                var _this = this;
                this.$store.dispatch("call", {
                    api: "wgsplist"
                }).then(function (result) {
                    if (result.success) {
                        _this.wgclients = result.peers;
                        for (var key in _this.wgclients) {
                            _this.$set(_this.wgclients[key], "description", _this.wgclients[key].name);
                        }
                    }
                });
            },
            toggleClient: function toggleClient() {
                if (this.btnControl == "Start") {
                    this.startSever();
                } else {
                    this.stopSever();
                }
            },
            startSever: function startSever() {
                var _this = this;
                if (!_this.wgsget.local_ip || !_this.wgsget.local_port) {
                    _this.$message({
                        type: "warning",
                        msg: -2704
                    });
                    return;
                }
                if (this.wgsget.local_port) {
                    if (!this.numReg.test(this.wgsget.local_port) || parseInt(this.wgsget.local_port) > 65535 || parseInt(this.wgsget.local_port) < 1) {
                        this.$message({
                            type: "error",
                            msg: -2616
                        });
                        return;
                    }
                }
                if (_this.inputV6Status == 'error' || !_this.wgsget.local_ipv6) {
                    _this.$message({
                        type: "warning",
                        msg: _this.t('Invalid IP Address')
                    });
                    return;
                };
                _this.btnexpect = 0;
                clearTimeout(_this.timeout);
                clearInterval(_this.timer);
                _this.$store.dispatch("call", {
                    api: 'wgsifset',
                    data: {
                        local_ip: _this.wgsget.local_ip,
                        local_port: _this.wgsget.local_port,
                        local_ipv6: _this.wgsget.local_ipv6
                    }
                }).then(function (result) {
                    if (!result.success) {
                        if (result.code == -223) {
                            _this.$message({
                                "type": "error",
                                "msg": -223
                            });
                        } else {
                            _this.$message({
                                type: "error",
                                api: "wgsifset",
                                msg: result.code
                            });
                        }
                        _this.btnexpect = 'init';
                        _this.timerData();
                    } else {
                        // _this.getSever();
                        _this.$store.dispatch("call", {
                            api: "wgsstart"
                        }).then(function (result) {
                            _this.timerData();
                            if (result.failed) {
                                _this.$message({
                                    type: "error",
                                    api: "wgsstart",
                                    msg: result.code
                                });
                                _this.btnexpect = 'init';
                                return;
                            }
                            if (result.success) {
                                _this.timeout = setTimeout(function () {
                                    if (_this.btnexpect != 'init') {
                                        _this.btnexpect = 'init';
                                    }
                                }, 10000);
                            } else {
                                _this.btnexpect = 'init';
                                _this.$message({
                                    type: "error",
                                    api: "wgsstart",
                                    msg: result.code
                                });
                            }
                        });
                    }
                });
            },
            stopSever: function stopSever() {
                var _this = this;
                _this.btnexpect = -202;
                clearInterval(_this.timer);
                clearTimeout(_this.timeout);
                _this.$store.dispatch("call", {
                    api: "wgsstop"
                }).then(function (result) {
                    _this.timerData();
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgsstop",
                            msg: result.code
                        });
                        _this.btnexpect = 'init';
                        return;
                    }
                    if (result.success) {
                        _this.timeout = setTimeout(function () {
                            if (_this.btnexpect != 'init') {
                                _this.btnexpect = 'init';
                            }
                            clearInterval(_this.timer);
                        }, 10000);
                    } else {
                        _this.$message({
                            type: "error",
                            api: "wgsstop",
                            msg: result.code
                        });
                        _this.btnexpect = 'init';
                    }
                });
            },
            addClients: function addClients() {
                var _this = this;
                if (!this.nmInput) {
                    this.$message({
                        type: "warning",
                        msg: -2702
                    });
                    return;
                }
                _this.addState = true;
                _this.$store.dispatch("call", {
                    api: "wgspadd",
                    data: {
                        name: _this.nmInput.replace(/\s+/g, "")
                    }
                }).then(function (result) {
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgspadd",
                            "msg": result.code
                        });
                        _this.addState = false;
                        return;
                    }
                    if (result.success) {
                        setTimeout(function () {
                            _this.$message({
                                type: "success",
                                api: "wgspadd",
                                "msg": result.code
                            });
                            _this.addState = false;
                        }, 1500);
                        _this.closeModal();
                        _this.getClients();
                    } else {
                        _this.$message({
                            type: "error",
                            api: "wgspadd",
                            "msg": result.code
                        });
                        _this.addState = false;
                    }
                });
            },
            removeClient: function removeClient(index) {
                var _this = this;
                this.$store.commit("showModal", {
                    show: true,
                    title: "Caution",
                    message: this.t(this.$lang.modal.delUser) + ' ' + this.wgclients[index].name + "?",
                    cb: function cb() {
                        _this.rmClient(index);
                    }
                });
            },
            rmClient: function rmClient(index) {
                var _this = this;
                _this.$store.dispatch("call", {
                    api: "wgspremove",
                    data: {
                        name: this.wgclients[index].name
                    }
                }).then(function (result) {
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgspremove",
                            msg: result.code
                        });
                        return;
                    }
                    if (result.success) {
                        _this.$message({
                            type: "success",
                            api: "wgspremove",
                            msg: result.code
                        });
                        _this.wgclients.splice(index, 1);
                        _this.getClients();
                        if (_this.wgclients.length == 1) {
                            _this.severName = _this.wgclients[0].name;
                        }
                    }
                });
            },
            copyPeconfig: function copyPeconfig(index) {
                if (this.copyStatus) {
                    return;
                }
                var _this = this;
                var obj = {};
                var name = _this.wgclients[index].name;
                this.$message({
                    type: "info",
                    msg: -2703
                });
                this.copyStatus = true;
                _this.$store.dispatch("call", {
                    api: "wgsCopy",
                    data: {
                        name: name
                    }
                }).then(function (result) {
                    _this.copyStatus = false;
                    if (result.success) {
                        _this.copyModal = true;
                        obj.address = result.address;
                        obj.allowed_ips = result.allowed_ips;
                        obj.end_point = result.end_point;
                        obj.dns = result.dns;
                        obj.listen_port = result.listen_port;
                        obj.persistent_keepalive = result.persistent_keepalive;
                        obj.private_key = result.private_key;
                        obj.public_key = result.public_key;
                        _this.$message({
                            type: "success",
                            api: "wgsCopy",
                            msg: result.code
                        });
                        _this.ctlist = _this.formatJson(JSON.stringify(obj));
                        _this.$refs.serTextarea.select();
                        _this.cfg = '[Interface]\n' + 'Address = ' + obj.address + '\n' + 'ListenPort = ' + obj.listen_port + '\n' + 'PrivateKey = ' + obj.private_key + '\n' + 'DNS = ' + obj.dns + '\n' + '\n' + '[Peer]\n' + 'AllowedIPs = ' + obj.allowed_ips + '\n' + 'Endpoint = ' + obj.end_point + '\n' + 'PersistentKeepalive = ' + obj.persistent_keepalive + '\n' + 'PublicKey = ' + obj.public_key + '\n';
                        $('#qrcode').qrcode(_this.cfg);
                    } else {
                        _this.$message({
                            type: "error",
                            msg: result.code
                        });
                    }
                });
            },
            setbtnState: function setbtnState() {
                this.btnName = this.btnName == "简易" ? "高级" : "简易";
            },
            addopenModal: function addopenModal() {
                this.showModal = true;
            },
            getSever: function getSever() {
                var that = this;
                this.$store.dispatch("call", { api: 'wgsifget' }).then(function (result) {
                    that.access = result.access;
                    that.Ipv6Address = result.local_ipv6;
                });
            },
            // checkKey
            checkKey: function checkKey() {
                var _this = this;
                _this.$store.dispatch("call", {
                    api: 'wgsCheckKey'
                }).then(function (result) {
                    if (result.success) {
                        // 获取 server info
                        _this.getSever();
                        // 获取 wireguard client
                        _this.getClients();
                        _this.showServer = true;
                    } else {
                        _this.showServer = false;
                    }
                });
            },
            // created Key
            createKey: function createKey() {
                var _this = this;
                _this.$message({
                    type: "warning"
                });
                _this.$store.dispatch("call", {
                    api: 'wgsCreateKey'
                }).then(function (result) {
                    if (result.failed) {
                        _this.$message({
                            type: "error",
                            api: "wgsCreateKey",
                            msg: result.code
                        });
                        return;
                    }
                    if (result.success) {
                        _this.$message({
                            type: "success",
                            api: "wgsCreateKey",
                            msg: result.code
                        });
                        // 获取 wireguard client
                        _this.getClients();
                        // 获取 server info
                        _this.getSever();
                        _this.$store.dispatch("call", {
                            api: 'wgsCheckKey'
                        });
                        _this.showServer = true;
                    } else {
                        _this.$message({
                            type: "error",
                            api: "wgsCreateKey",
                            msg: result.code
                        });
                        _this.showServer = false;
                    }
                });
            },
            closeModal: function closeModal() {
                this.showModal = false;
                this.nmInput = "";
                this.copyModal = false;
                this.ctlist = "";
                $('.qrcodeMO').show().siblings("div").hide();
                $('.QrcodeShow').addClass('active').siblings('li').removeClass('active');
                $('.textareaQRCode > #qrcode').html('');
            },
            formatJson: function formatJson(text) {
                var json = text;
                var i = 0,
                    len = 0,
                    tab = "    ",
                    targetJson = "",
                    indentLevel = 0,
                    inString = false,
                    currentChar = null;
                for (i = 0, len = json.length; i < len; i += 1) {
                    currentChar = json.charAt(i);
                    switch (currentChar) {
                        case '{':
                        case '[':
                            if (!inString) {
                                targetJson += currentChar + "\n" + this.repeat(tab, indentLevel + 1);
                                indentLevel += 1;
                            } else {
                                targetJson += currentChar;
                            }
                            break;
                        case '}':
                        case ']':
                            if (!inString) {
                                indentLevel -= 1;
                                targetJson += "\n" + this.repeat(tab, indentLevel) + currentChar;
                            } else {
                                targetJson += currentChar;
                            }
                            break;
                        case ',':
                            if (!inString) {
                                targetJson += ",\n" + this.repeat(tab, indentLevel);
                            } else {
                                targetJson += currentChar;
                            }
                            break;
                        case ':':
                            if (!inString) {
                                targetJson += ": ";
                            } else {
                                targetJson += currentChar;
                            }
                            break;
                        case ' ':
                        case "\n":
                        case "\t":
                            if (inString) {
                                targetJson += currentChar;
                            }
                            break;
                        case '"':
                            if (i > 0 && json.charAt(i - 1) !== '\\') {
                                inString = !inString;
                            }
                            targetJson += currentChar;
                            break;
                        default:
                            targetJson += currentChar;
                            break;
                    }
                }
                return targetJson;
            },
            repeat: function repeat(s, count) {
                return new Array(count + 1).join(s);
            },
            validatev6: function validatev6() {
                var ipReg = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/
                var isValid = ipReg.test(this.wgsget.local_ipv6);
                if (isValid) {
                    this.inputV6Status = "success";
                    this.Ipv6Address = this.wgsget.local_ipv6.substring(0, this.wgsget.local_ipv6.lastIndexOf('.'))
                } else {
                    this.inputV6Status = "error";
                }
            }
        }
    });
    return vueComponent;
});
"use strict";

define(["text!temple/index/index.html", "component/gl-btn/index", "vue", "Cookie", "component/gl-select/index", "component/modal/modal", "component/gl-loading/index", "component/gl-input/index", "component/gl-label/index", "component/gl-toggle-btn/index", "component/gl-tooltip/index", "css!temple/index/index.css"], function (stpl, gl_btn, Vue, Cookies, gl_select, gl_modal, gl_loading, gl_input, gl_label, gl_switch, gl_tooltip, css) {
    var vueComponent = Vue.extend({
        template: stpl,
        name: "app",
        data: function data() {
            return {
                appliedMessages: ["Reboot", "are you sure", "✔"],
                language: ["English", "简体中文", '繁體中文', "Deutsch", "Français", "Español", "Italiano", "日本語", '한국어', 'Русский'],
                routerMode: "router", // 桥接模式
                webLang: 'EN',
                loading: true,
                rebootStatus: false,
                timer: null,
                ssid: '',
                key: '',
                wifiInitModal: false,
                wifiBtnInit: false,
                checkpassword: true,
                // 左侧tab高亮
                vpnclientCircleStatus: false,
                vpnclientCircleStatusFlag: 'off',
                wgclientCircleStatus: false,
                wgclientCircleStatusFlag: 'off',
                ssclientCircleStatus: false,
                ssclientCircleStatusFlag: 'off',
                vpnServerCircleStatus: false,
                vpnServerCircleStatusFlag: 'off',
                wgServerCircleStatus: false,
                wgServerCircleStatusFlag: 'off',
                torCircleStatus: false,
                torCircleStatusFlag: 'off',
                internetKillSwitchCircleStatus: false,
                internetKillSwitchCircleStatusFlag: 'off',
                vpnPoliciesCircleStatus: false,
                vpnPoliciesCircleStatusFlag: 'off',
                vpnCricleStatus: 'off',
                haveNotPortal: false,
                shareJudge: true
            };
        },
        components: {
            "gl-select": gl_select,
            "gl-loading": gl_loading,
            "gl-tooltip": gl_tooltip,
            "gl-label": gl_label,
            "gl-input": gl_input,
            "gl-btn": gl_btn
        },
        computed: {
            gl_package: function gl_package() {
                return this.$store.getters.packageList;
            },
            // 首屏展示状态 全局循环调用
            router: function router() {
                return this.$store.getters.apiData["router_mini"];
            },
            // 当前语言
            lan: function lan() {
                return this.$store.getters.lang;
            },
            // 弹框
            modal: function modal() {
                return this.$store.getters.modal;
            },
            // 语言栏显示当前语言
            lang: function lang() {
                var item = "English";
                switch (this.lan) {
                    case "CN":
                        item = "简体中文";
                        break;
                    case "EN":
                        item = "English";
                        break;
                    case "DE":
                        item = "Deutsch";
                        break;
                    case "FR":
                        item = "Français";
                        break;
                    case "SP":
                        item = "Español";
                        break;
                    case "TC":
                        item = "繁體中文";
                        break;
                    case "JP":
                        item = "日本語";
                        break;
                    case "IT":
                        item = "Italiano";
                        break;
                    case "KR":
                        item = "한국어";
                        break;
                    case "RU":
                        item = "Русский";
                        break;
                }
                return item;
            },
            // 路由器wifi信息
            getaps: function getaps() {
                return this.$store.getters.apiData["getaps"];
            },
            getWifiList: function getWifiList() {
                if (this.getaps && this.getaps.success) {
                    var radios = [];
                    var list = [];
                    radios.push(this.getaps['wifi_2g']);
                    if (this.getaps['wifi_5g']) {
                        radios.push(this.getaps['wifi_5g']);
                    }
                    for (var i = 0; i < radios.length; i++) {
                        list = list.concat(radios[i]['interfaces'])
                    }
                }
                return list
            },
            // VPN功能列表
            vpnlist: function vpnlist() {
                return this.$store.getters.vpnData;
            },
            // WAN口连接网络信息
            waninfo: function waninfo() {
                return this.$store.getters.apiData["waninfo"];
            },
            // 中继网络信息
            stainfo: function stainfo() {
                return this.$store.getters.apiData["stainfo"];
            },
            // 3G/4G模块信息
            moInfo: function moInfo() {
                return this.$store.getters.apiData["moInfo"];
            },
            // 模块列表
            modems: function modems() {
                return this.moInfo.modems;
            },
            // 模块拨号状态
            mostatus: function mostatus() {
                var modems = this.modems || [];
                if (this.modems && this.modems.length > 0) {
                    for (var i = 0; i < modems.length; i++) {
                        if (modems[i].up == 'on') {
                            return true;
                        }
                    }
                }
                return false;
            },
            modesList: function modesList() {
                var item = this.$lang.index.modem
                if (this.modems) {
                    for (var i = 0; i < this.modems.length; i++) {
                        if (this.modems[i].up == 'on') {
                            item = this.modems[i].carrier || this.$lang.index.modem
                            break
                        }
                    }
                }
                return item
            },
            // tethering信息
            teinfo: function teinfo() {
                return this.$store.getters.apiData["teinfo"];
            },
            aghstatus: function aghstatus() {
                return this.$store.getters.apiData["agh_get_config"]['enable'];
            },
            router_clients: function router_clients() {
                return this.router.clients;
            },
            // 通过wifi连接的设备数量
            wifiNum: function wifiNum() {
                return this.router_clients&&this.router_clients.wifi_cli_count != 0 ? this.router_clients.wifi_cli_count : 0;
            },
            // 通过lan口连接的设备数量
            lanNum: function lanNum() {
                return this.router_clients&&this.router_clients.lan_cli_count != 0 ? this.router_clients.lan_cli_count : 0;
            },
            // 自动更新
            checkfirmware: function checkfirmware() {
                return this.$store.getters.apiData["checkfirmware"];
            },
            // 中继wifi标识高亮
            wifiIconActive: function wifiIconActive() {
                return this.stainfo.ip
            },
            // 有无网络连接
            staActive: function staActive() {
                return this.$store.getters.apiData["internetreachable"]["reachable"] == null ? true : this.$store.getters.apiData["internetreachable"]["reachable"];
            },
            // VPN功能列表
            getapplist: function getapplist() {
                return this.$store.getters.apiData['getapplist'];
            },
            // isAdvanced: function isAdvanced() {
            //     var list = this.getapplist.applist || [];
            //     for (var i = 0; i < list.length; i++) {
            //         if (list[i] == 'gl_luci') {
            //             return true;
            //         }
            //     }
            //     return false;
            // },
            isShowTor: function isShowTor() {
                var list = this.getapplist.applist || [];
                for (var i = 0; i < list.length; i++) {
                    if (list[i] == 'gl_tor') {
                        return true;
                    }
                }
                return false;
            },
            isGetBle: function isGetBle() {
                var list = this.getapplist.applist || [];
                for (var i = 0; i < list.length; i++) {
                    if (list[i] == 'Bluetooth') {
                        return true;
                    }
                }
                return false;
            },
            // mifi 点亮温度显示
            mifiMcu: function mifiMcu() {
                return this.$store.getters.apiData['getmcu'];
            },
            percent: function percent() {
                return this.mifiMcu.Percent + '%' || '';
            },
            temperature: function temperature() {
                return this.mifiMcu.Temperature + '℃' || '';
            },
            isShowmifiMcu: function isShowmifiMcu() {
                return !this.mifiMcu.Temperature && !this.mifiMcu.Percent;
            },
            battery: function battery() {
                var style = {};
                var item = this.mifiMcu.Percent;
                if (item || item == 0) {
                    style['width'] = this.mifiMcu.Percent / 100 * 22 + 'px';
                    if (this.mifiMcu.Charging == 1) {
                        style['background'] = '#22f4bb';
                    } else {
                        if (item <= 20) {
                            style['background'] = '#ffe000';
                        } else if (item == 100) {
                            style['background'] = '#22f4bb';
                        } else {
                            style['background'] = '#22f4bb';
                        }
                    }
                }
                return style;
            },
            // router_status: function router_status() {
            //     return this.$store.getters.apiData['router_status'];
            // },
            router_vpn: function rrouter_vpn() {
                return this.router && this.router.vpn||{};
            },
            vpnstatus: function vpnstatus() {
                return this.router_vpn && this.router_vpn.ovpn || '';
            },
            ssstatus: function ssstatus() {
                return this.router_vpn && this.router_vpn.ss  || '';
            },
            wrstatus: function wrstatus() {
                return this.router_vpn && this.router_vpn.wireguad || '';
            },
            torstatus: function torstatus() {
                return this.router_vpn.tor || '';
            },
            // 首页路由器图标
            vpnIconSrc: function vpnIconSrc() {
                var item = "icon-vpnclient-fail";
                // vpn && ssclient
                if ( this.vpnstatus == 'connecting') {
                    item = 'icon-vpnclient-warning'
                }else if(this.vpnstatus == 'connected'){
                    item = 'icon-vpnclient-on'
                }
                // wireguard
                if (this.wrstatus=='connected') {
                   item = 'icon-wg-on';
                }else if (this.wrstatus=='connecting') {
                    item = 'icon-wg-alert'
                }
                // ssclient
                if (this.ssstatus == 'connected') {
                    item = 'icon-vpnclient-on'
                }
                // tor
                if (this.torstatus == 'connected') {
                     item = 'icon-tor-on'
                }
                if (this.webLang == "CN") {
                    item = 'vpnShowStatus';
                }
                return item;
            },
            // router_ddns: function router_ddns() {
            //     return this.$store.getters.apiData['router_ddns'];
            // },
            // ddns: function ddns() {
            //     return this.router_ddns.ddns;
            // },
            // 路由器型号图片
            appIcon: function appIcon() {
                    var model = this.router && this.router.model || 'xe300';
                    if (model.toLowerCase().indexOf('usb') != -1) {
                        return "usb-router";
                    } else if (model == 'ar750') {
                        return "mv1000-router";
                    } else if (model == 'ar750s') {
                        return "ar750s-router";
                    } else if (model == 'e750') {
                        return "e750-router";
                    } else if (model == 'b2200') {
                        return "b2200-router";
                    } else if (model.toLowerCase().indexOf('ar300m') != -1) {
                        return 'ar300m-router';
                    } else if (model.toLowerCase().indexOf('ar150') != -1) {
                        return 'ar300m-router';
                    } else if (model.toLowerCase().indexOf('mt300n-v2') != -1) {
                        return 'ar300m-router';
                    } else if (model.toLowerCase().indexOf('mt300n') != -1) {
                        return 'ar300m-router';
                    } else if (model.toLowerCase().indexOf('n300') != -1) {
                        return 'mt300n-router';
                    } else if (model.toLowerCase().indexOf('mt300a') != -1) {
                        return 'ar300m-router';
                    } else if (model.toLowerCase().indexOf('x750') != -1) {
                        return 'x750-router';
                    } else if (model.toLowerCase().indexOf('s1300') != -1) {
                        return 'b1300-router';
                    } else if (model.toLowerCase().indexOf('b1300') != -1) {
                        return 'b1300-router';
                    } else if (model.toLowerCase().indexOf('x1200') != -1) {
                        return "x1200-router"
                    } else if (model.toLowerCase().indexOf('ap1300') != -1) {
                        return 'ap1300-router';
                    } else if (model.toLowerCase().indexOf('mt1300') != -1 || model.toLowerCase().indexOf('sft1200') != -1 || model.toLowerCase().indexOf('s200') !== -1) {
                        return 'mt1300-router';
                    } else if (model.toLowerCase().indexOf('mv1000') !== -1) {
                        return 'mv1000-router'
                    } else if (model.toLowerCase().indexOf('x300b') !== -1) {
                        return 'x300b-router'
                    } else if (model.toLowerCase().indexOf('xe300') !== -1) {
                        return 'xe300-router'
                    } else if (model.toLowerCase().indexOf('ax1800') !== -1) {
                        return 'ax1800-router'
                    } else if (model.toLowerCase().indexOf('sf1200') !== -1) {
                        return 'sf1200-router'
                    } else {
                        return "mini-router";
                    }
            },
            phoneInter: function phoneInter() {
                if (this.router.model == 'usb150') {
                    if (this.wifiIconActive) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    if (this.wifiIconActive || this.waninfo.ip || this.teinfo.ip || this.mostatus) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            settings: function settings() {
                return this.router.has_sw && (this.routerMode == 'router' || this.routerMode == 'mesh') && this.router.model != 'vixmini' && this.router.model != 'usb150' && this.router.model != 'x750';
            },
            vpnActive: function vpnActive() {
                return (this.routerMode == 'router' || this.routerMode == 'mesh') && this.router.model != 'vixmini';
            },
            isN300icon: function isN300icon() {
                if (this.router.model == 'n300' || this.router.model == 'b2200'|| this.router.model == 'sf1200' || this.router.model == 's200') {
                    return true;
                }
                return false;
            },
            isAp1300icon: function isAp1300icon() {
                if (this.router.model == 'ap1300') {
                    return true;
                }
                return false;
            },
            share: function share() {
                return this.router.model != 'vixmini' && this.router.model != 'usb150' && this.router.model != 'n300' && this.router.model != 'x300b' && this.router.model != 'sf1200' && this.router.model != 'ap1300';
            },
            vixmini: function vixmini() {
                return this.router.model != 'vixmini';
            },
            modemicon: function modemicon() {
                return this.moInfo.code != -17 && this.moInfo.code != -3 && this.router.model != 'usb150' && this.router.model != 'vixmini' && this.router.model != 'n300' && this.router.model != 'b2200' && this.router.model != 'sf1200' && this.router.model != 's200';
            },
            teicon: function teicon() {
                return this.teinfo.code != -17 && this.router.model != 'usb150' && this.router.model != 'vixmini' && this.router.model != 'n300' && this.router.model != 'b2200' && this.router.model != 'sf1200' && this.router.model != 's200';
            },
            wanicon: function wanicon() {
                return this.waninfo.code != -17 && this.router.model != 'usb150';
            },
            inetrStatus: function inetrStatus() {
                return this.$store.getters.inetr_status;
            },
            noInter: function noInter() {
                return !this.staActive && !this.stainfo.gateway && this.router.ip_addr !== this.stainfo.gateway && !this.waninfo.gateway && this.router.ip_addr !== this.waninfo.gateway && !this.teinfo.gateway && this.inetrStatus;
            },
            hideVpn: function hideVpn() {
                if (this.lan == 'CN') {
                    return false;
                }
                return true;
            },
            hideFire: function hideFire() {
                if (this.router.mode != 'router' && this.router.mode != 'mesh') {
                    return false;
                };
                return true;
            },
            meshjudge: function meshjudge() {
                if (this.router.mode == 'mesh') {
                    return true
                }
                return false
            },
            hideE750: function hideE750() {
                if (this.router.model == 'e750') {
                    return false
                }
                return true
            },
            wifiInitStatus: function wifiInitStatus() {
                return this.$store.getters.apiData["get_wifi_init"];
            },
            judgeAdguardHome: function judgeAdguardHome() {
                var list = this.getapplist.applist || [];
                for (var i = 0; i < list.length; i++) {
                    if (list[i] == 'AdGuardHome') {
                        return true;
                    }
                }
                return false;
            },
            vpnLabelCyStatus: function vpnLabelCyStatus() {
                return (this.vpnclientCircleStatusFlag != 'connected' && this.vpnclientCircleStatusFlag != 'off') || (this.wgclientCircleStatusFlag != 'connected' && this.wgclientCircleStatusFlag != 'off') || (this.ssclientCircleStatusFlag != 'connected' && this.ssclientCircleStatusFlag != 'off') || (this.vpnServerCircleStatusFlag != 'connected' && this.vpnServerCircleStatusFlag != 'off') || (this.torCircleStatusFlag != 'connected' && this.torCircleStatusFlag != 'off') || (this.internetKillSwitchCircleStatusFlag != 'connected' && this.internetKillSwitchCircleStatusFlag != 'off') || (this.vpnPoliciesCircleStatusFlag != 'connected' && this.vpnPoliciesCircleStatusFlag != 'off');
            },
            hasGps:function hasGps() {
                let bool=false
                const list = this.getapplist.applist || [];
                for (let i = 0; i < list.length; i++) {
                    if (list[i] == 'GPS') {
                        bool = true;
                        break;
                    }
                }
                return bool; 
            },
            SideRouteMode:function SideRouteMode() {
                let bool=false
                const list = this.getapplist.applist || [];
                for (let i = 0; i < list.length; i++) {
                    if (list[i] == 'SideRouter') {
                        bool = true;
                        break;
                    }
                }
                return bool; 
            },
            hasRs485:function hasRs485() {
                let bool=false
                const list = this.getapplist.applist || [];
                for (let i = 0; i < list.length; i++) {
                    if (list[i] == 'RS485') {
                        bool = true;
                        break;
                    }
                }
                return bool; 
            },
            Mudial:function Mudial() {
                let bool=false
                const list = this.getapplist.applist || [];
                for (let i = 0; i < list.length; i++) {
                    if (list[i] == 'mudial') {
                        bool = true;
                        break;
                    }
                }
                return bool; 
            }
        },
        beforeCreate: function beforeCreate() {
            var that = this;
            // that.$store.dispatch('call', { api: 'router_ddns' });
            that.$store.dispatch('getList_vpn'); // 获取VPN列表
            that.$store.dispatch('call', {
                api: 'router_mini',
                timeOut:200000
            }).then(function (result) {
                if (result.success) {
                    that.routerMode = result.mode;
                    if (result.mode !== 'router' && result.mode !== 'mesh') {
                        that.$router.push('wlan');
                    } else {
                        that.$store.dispatch('call', {
                            api: 'internetreachable',
                            timeOut: 30000
                        }).then(function (result) {
                            if (result.reboot_flag) {
                                that.rebootStatus = result.reboot_flag
                            }
                        });
                        that.timer = setInterval(function () {
                            that.$store.dispatch('call', {
                                api: 'internetreachable',
                                timeOut: 30000
                            }).then(function (result) {
                                if (result.reboot_flag) {
                                    that.rebootStatus = result.reboot_flag
                                }
                            }); //网络状态
                        }, 30000);
                    }
                   
                }
                setTimeout(function() {
                    that.loading = false;
        that.$store.commit('isInit', true);
                }, 1000);
            });
            
        },
        methods: {
            routerPush: function routerPush(item) {
                if (this.router.mode != 'router' && this.router.mode != 'mesh') {
                    return;
                }
                this.$router.push(item);
            },
            geclass: function geclass(name) {
                return "clsLink2" + name + " bar";
            },
            onShow: function onShow(animation) {
                this.modal.animation = animation;
                this.modal.show = true;
            },
            showHide: function showHide() {
                $("#ulLogo").toggleClass("ulShow");
                $("sub").toggle();
            },
            // modal取消按钮
            CancelFirm: function CancelFirm() {
                if (this.modal.cancel) {
                    this.modal.cancel()
                }
                this.$store.commit("hideModal");
            },
            // modal确定按钮
            comfirm: function comfirm() {
                if (this.modal.cb) {
                    this.modal.cb()
                }
                this.$store.commit("hideModal");
            },
            setlang: function setlang(data) {
                var lang = "";
                var that = this;
                switch (data) {
                    case "简体中文":
                        lang = "CN";
                        break;
                    case "English":
                        lang = "EN";
                        break;
                    case "Deutsch":
                        lang = "DE";
                        break;
                    case "Français":
                        lang = "FR";
                        break;
                    case "Español":
                        lang = "SP";
                        break;
                    case "繁體中文":
                        lang = "TC";
                        break;
                    case "Italiano":
                        lang = "IT";
                        break;
                    case "日本語":
                        lang = "JP";
                        break;
                    case "한국어":
                        lang = "KR";
                        break;
                    case "Русский":
                        lang = "RU";
                        break;
                }
                this.webLang = lang;
                // 插件储存
                that.$translate.setLang(lang);
                // 后台储存
                this.$store.dispatch("call", {
                    api: "setlanguage",
                    data: {
                        language: lang
                    }
                }).then(function (result) {
                    if (result.success) {
                        that.$store.commit("setLang", {
                            lang: lang
                        });
                    }
                });
            },
            logout: function logout() {
                //登出
                var that = this;
                this.$store.dispatch('call', {
                    api: "logout"
                }).then(function (result) {
                    clearInterval(that.timer);
                    if (result.success) {
                        Cookies.remove('Admin-Token');
                        // if (window.location.href.indexOf('chrome-extension') == -1) {
                        //     window.location.href = "/#/login"; //打到登录页
                        // } else {
                        //     window.location.href = "/idx_vue.html#/login"; //打到登录页
                        // }
                        location.reload();
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "logout",
                            "msg": result.code
                        });
                        return;
                    }
                });
            },
            toggleNav: function toggleNav(e) {
                if ($(e.target).hasClass("bar")) {
                    $("#navbar-ex1-collapse").removeClass("in");
                }
            },
            reboot: function reboot() {
                //重启
                this.$store.commit("showModal", {
                    show: true,
                    title: "Caution",
                    message: this.$lang.modal.isReboot,
                    cb: function cb() {
                        if (window.caniuse) {
                            sessionStorage.setItem("callfunction", "reboot");
                        }
                        if (window.location.href.indexOf('chrome-extension') == -1) {
                            window.location.href = "/#/process?action=reboot"; //打到进度条页面
                        } else {
                            window.location.href = "/idx_vue.html#/process?action=reboot"; //打到进度条页面
                        }
                    }
                });
            },
            changeCollapse: function changeCollapse(item) {
                var routers = ["system", "moresetting", "vpn"];
                var ie = this.userAgent();
                if (ie) {
                    //判断是否ie8以下
                    return;
                }
                var router;
                var len = routers.length;
                for (var i = 0; i < len; i++) {
                    router = routers[i];
                    if (item == router) {
                        $('#' + router).collapse("show"); //是vpn才展开
                    } else {
                        $('#' + router).collapse("hide");
                    }
                }
            },
            userAgent: function userAgent() {
                var Sys = {};
                var ua = navigator.userAgent.toLowerCase(); //判断浏览器的类型
                var state = null;
                var isOpera;
                (state = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = state[1]: (state = ua.match(/msie ([\d.]+)/)) ? Sys.ie = state[1] : (state = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = state[1] : (state = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = state[1] : (state = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = state[1] : 0;
                if (Sys.ie && parseInt(Sys.ie) <= 9) {
                    return true;
                }
                return false;
            },
            // 跳过
            /* jumpSkip: function jumpSkip() {
                this.wifiInitModal = false
            }, */
            // 确认
            confirmInput: function confirmInput() {
                var that = this
                if (that.ssid == '' || that.key == '') {
                    that.$message({
                        "type": "error",
                        "msg": 'Please complete!'
                    });
                    that.wifiBtnInit = false
                    return
                }
                if (this.checkpassword) {
                    this.wifiBtnInit = true
                    that.$store.dispatch("call", {
                        api: "set_wifi_init",
                        data: {
                            ssid: that.ssid,
                            key: that.key
                        }
                    }).then(function (res) {
                        if (res.failed) {
                            that.$message({
                                "type": "error",
                                "api": "set_wifi_init",
                                "msg": res.code
                            });
                            return;
                        }
                        if (res.success) {
                            that.$message({
                                "type": "success",
                                "api": "set_wifi_init",
                                "msg": res.code
                            });
                            that.$store.dispatch("call", {
                                api: "get_wifi_init",
                            }).then(function (res) {
                                if (res.success && res.wifi) {
                                   that.wifiInitModal = false
                                }
                            })
                            that.$store.dispatch("call", {
                                api: "getaps"
                            })
                        } else {
                            that.$message({
                                "type": "error",
                                "api": "set_wifi_init",
                                "msg": res.code
                            });
                        }
                        that.wifiBtnInit = false
                    })
                }
            },
            checkpsw: function checkpsw(data) {
                if (!data) {
                    this.checkpassword = false;
                } else {
                    // 8-63位的非中文字符密码
                    if (this.getLen(data) <= 63 && this.getLen(data) >= 8) {
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
            // 刷新界面，更新vpn左侧tab高亮状态
            updataVpnTabHighLightStatus: function updataVpnTabHighLightStatus() {
                var that = this;
                // vpnclient
                this.$store.dispatch("call", { api: "ovpngetclientstatus" }).then(function(res) {
                    if (res.status != 'off') that.vpnCricleStatus = true;
                    that.vpnclientCircleStatus = 'vpnclient';
                    that.vpnclientCircleStatusFlag = res.status;
                });
                // vpnserver
                this.$store.dispatch("call", { api: "ovpnstatus" }).then(function(res) {
                    if (res.status == 'started') {
                        that.vpnCricleStatus = true;
                        that.vpnServerCircleStatusFlag = 'connected';
                    }
                    that.vpnServerCircleStatus = true;
                });
                // wgclient
                this.$store.dispatch("call", { api: "wgcstatus" }).then(function (res) {
                    var status = 'off';
                    if (res.code == 0) status = 'connected';
                    else if (res.code == -203) status = 'connecting';
                    that.wgclientCircleStatus = 'wgclient';
                    if (status != 'off') that.vpnCricleStatus = true;
                    that.wgclientCircleStatusFlag = status;
                });
                // wgserver
                this.$store.dispatch("call", { api: "wgsstatus" }).then(function(res) {
                    if (res.code == '0') {
                        that.vpnCricleStatus = true;
                        that.wgServerCircleStatus = true;
                        that.wgServerCircleStatusFlag = 'connected';
                    }
                });
                // ssclient
                this.$store.dispatch("call", { api: "ssclientstatus" }).then(function(res) {
                    if (res.status == 'connected') {
                        that.vpnCricleStatus = true;
                        that.ssclientCircleStatus = 'ssclient';
                        that.ssclientCircleStatusFlag = 'connected';
                    }
                });
                // policy
                this.$store.dispatch("call", { api: "getpolicy" }).then(function (res) {
                    if (res.enable) {
                        that.vpnCricleStatus = true;
                        that.vpnPoliciesCircleStatus = true;
                        that.vpnPoliciesCircleStatusFlag = 'connected';
                    }
                });
                // kill switch
                this.$store.dispatch("call", { 'api': 'getsafe' }).then(function (res) {
                    if (res.enable) {
                        that.vpnCricleStatus = true;
                        that.internetKillSwitchCircleStatus = true;
                        that.internetKillSwitchCircleStatusFlag = 'connected';
                    }
                });
                // tor
                if (this.router.model != 'sf1200') {
                    that.$store.dispatch('call', { api: 'gettor', }).then(function (res) {
                        if (res.enable) {
                            that.vpnCricleStatus = true;
                            that.torCircleStatus = true;
                            that.torCircleStatusFlag = 'connected';
                        }
                    });
                }
            }

        },
        watch: {
            getaps: {
                handler: function (val, oldval) {
                    this.wifiInitModal = false
                    if (this.wifiInitStatus.wifi != undefined && !this.wifiInitStatus.wifi) {
                        this.wifiInitModal = true
                        this.$nextTick(function () {
                            var maskDom = window.document.getElementById('mask')
                            maskDom.style.height = window.innerHeight + 'px'
                        })
                    }
                },
                deep: true
            }
        },
        mounted: function mounted() {
            this.updataVpnTabHighLightStatus();
            var that = this
            this.$store.dispatch("call", {
                api: "shareget"
            }).then(function (result) {
                if (!result.success) {
                    that.shareJudge = false;
                }
            });
            this.$store.dispatch("call", {
                api: "getportal",
            }).then(function (result) {
                that.haveNotPortal = result.success ? false : true;
            })
            this.$bus.$on('vpnCircleStatus', function (type, status) {
                // type 为路由 status为高亮状态(颜色)
                if (type == 'vpnclient') {
                    that.vpnclientCircleStatus = type;
                    that.vpnclientCircleStatusFlag = status;
                }
                if (type == 'wgclient') {
                    that.wgclientCircleStatus = type;
                    that.wgclientCircleStatusFlag = status;
                }
                if (type == 'ssclient') {
                    that.ssclientCircleStatus = type;
                    that.ssclientCircleStatusFlag = status;
                }
                if (type == 'vpnserver') {
                    that.vpnServerCircleStatus = true;
                    that.vpnServerCircleStatusFlag = status;
                }
                if (type == 'wgserver') {
                    that.wgServerCircleStatus = true;
                    that.wgServerCircleStatusFlag = status;
                }
                if (type == 'tor') {
                    that.torCircleStatus = true;
                    that.torCircleStatusFlag = status;
                }
                if (type == 'internetKillSwitch') {
                    that.internetKillSwitchCircleStatus = true;
                    that.internetKillSwitchCircleStatusFlag = status;
                }
                if (type == 'vpnPolicies') {
                    that.vpnPoliciesCircleStatus = true;
                    that.vpnPoliciesCircleStatusFlag = status;
                }
                if (that.vpnclientCircleStatusFlag != 'off' || that.wgclientCircleStatusFlag != 'off' || that.ssclientCircleStatusFlag != 'off' || that.vpnServerCircleStatusFlag != 'off' || that.wgServerCircleStatusFlag != 'off' || that.torCircleStatusFlag != 'off' || that.internetKillSwitchCircleStatusFlag != 'off' || that.vpnPoliciesCircleStatusFlag != 'off') {
                    that.vpnCricleStatus = true;
                } else {
                    that.vpnCricleStatus = 'off';
                }
            })
            setTimeout(() => {
                if (this.router && (this.router.model == 'b2200' || this.router.model == 'ax1800')) {
                    this.$store.dispatch("call", {
                        api: "get_wifi_init",
                    })
                }
            }, 1000)
        }
    });
    return vueComponent;
});
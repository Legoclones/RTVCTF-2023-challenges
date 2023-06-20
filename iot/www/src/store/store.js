'use strict';

define(['vue', 'vueX', 'store/api', 'apn', 'jquery', 'language', 'promise', 'Cookie', 'component/gl-message/index'], function (Vue, Vuex, api, apnlist, jquery, language, Promise, Cookies, message) {
    var apiItem = {};
    Vue.prototype.$lang = language;
    var mode = 'develop'; // 开发模式
    // 不是浏览器访问修改为产品模式
    if (window.location.href.indexOf('chrome-extension') == -1) {
        mode = 'product';
    }
    var ip = '192.168.99.1'; // 当为开发模式时。将此处修改为路由器的host ip地址。
    ip = "192.168.8.1";
    var host = 'http://' + ip;
    // 生成一个数据列表  键=API 值=数据
    if (Object.keys) {
        // 返回一个对象所有属性的数组
        Object.keys(api).forEach(function (item) {
            apiItem[item] = {};
        });
    } else {
        for (var key in api) {
            apiItem[key] = {};
        }
    }
    // 删除数组中的某一项，首页动态排版封装用
    Array.prototype.remove = function (val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };
    var state = {
        apiData: apiItem,
        timer_repeater: "", // repeater info  定时器
        timer_vpn: "", // vpn status 状态定时器
        vpnData: [], //vpn功能列表
        carinfo: [],
        allsorft: [],
        onlist: [],
        offlist: ['waninfo', 'repeater', 'tethering', 'modem'],
        lang: '',
        packageList: [],
        animation: ['zoom', 'fade', 'flip', 'door', 'rotate', 'slideUp', 'slideDown', 'slideLeft', 'slideRight'],
        modal: {
            show: false,
            animation: '',
            cb: null,
            cancel: null,
            esc: true,
            title: '',
            message: '',
            yes: '',
            no: '',
            type: "",
            messageTwo: '',
            messageThree: '',
            showCancelBtn: true,
            closeOnClickMask: true
        },
        inetrStatus: true,
        loading: false
    };
    var getters = {
        packageList: function packageList(state) {
            return state.packageList;
        },
        apiData: function apiData(state) {
            return state.apiData;
        },
        vpnData: function vpnData(state) {
            return state.vpnData;
        },
        onlist: function onlist(state) {
            return state.onlist;
        },
        offlist: function offlist(state) {
            return state.offlist;
        },
        carinfo: function carinfo(state) {
            return state.carinfo;
        },
        allsorft: function allsorft(state) {
            return state.allsorft;
        },
        inetr_status: function inetr_status(state) {
            return state.inetrStatus;
        },
        isLoading: function isLoading(state) {
            return state.loading;
        },
        modal: function modal(state) {
            return state.modal;
        },
        lang: function lang(state) {
            return state.lang;
        },
    };
    function getStainfo(state, dispatch, commit) {
        clearTimeout(state.timer_repeater);
        state.timer_repeater = setTimeout(function () {
            if (state.apiData['stainfo'].code != -17) dispatch('call', {
                api: 'stainfo'
            }).then(function (result) {
                if (result.success) {
                    if (result.ip) {
                        commit('setonlist', {
                            data: 'repeater'
                        });
                    } else {
                        commit('setofflist', {
                            data: 'repeater'
                        });
                    }
                } else {
                    commit('setofflist', {
                        data: 'repeater'
                    });
                }
                getStainfo(state, dispatch, commit)
            }).catch(function() {
                getStainfo(state, dispatch, commit)
            });
        }, 10000);
    }
    var actions = {
        // 全局方法 API调用
        call: function call(_ref, payload) {
            var state = _ref.state,
                commit = _ref.commit,
                datacache = false;
            var promise = new Promise(function (resolve) {
                var currentdate = new Date().getTime();
                if (payload.data) {
                    // 使用缓存
                    if (payload.cache) {
                        datacache = true;
                    }
                } else {
                    if (payload.sync) {
                        datacache = false;
                    } else {
                        datacache = true;
                    }
                }
                var TokenKey = 'Admin-Token';
                var token = Cookies.get(TokenKey);
                var hostip = payload.ip;
                if (!payload.isModel) {
                    var SyncTime = parseInt(currentdate - state.apiData[payload.api]['lastSync']);
                }
                if (!SyncTime) {
                    SyncTime = 0;
                }
                // 如果是post请求不采用缓存策略。如果是get请求则使用缓存策略，在同一条时间线上不允许在3s内再次发起请求，对请求时间线进行清理。减少服务器数据的压力。
                if (datacache && !payload.isModel && state.apiData[payload.api]['lastSync'] && SyncTime < 3000 && payload.api.indexOf("status") != -1) {
                    // console.log("重复请求: ", payload.api, api[payload.api]);
                    resolve(state.apiData[payload.api]);
                } else {
                    // 记录请求的最后时间
                    commit('setSyncTime', {
                        api: payload.api,
                        lastSync: currentdate,
                        isModel: payload.isModel
                    });
                    var contentType = payload.contentType;
                    var processData = payload.processData;
                    if (Object.prototype.toString.call(payload.data).split(' ')[1].split(']')[0] == 'FormData') {
                        contentType = false;
                        processData = false;
                    }
                    // ip没有传入
                    if (!hostip) {
                        // 产品模式直接通过域名访问api 开发模式通过192.168.8.1
                        hostip = mode == 'develop' ? payload.isModel ? payload.api : host + api[payload.api] : payload.isModel ? payload.api : api[payload.api];
                    } else {
                        hostip = 'http://' + payload.ip + api[payload.api];
                    }
              
                    jquery.ajax({
                        url: hostip,
                        data: payload.data,
                        type: payload.data == null ? 'get' : 'post', // data不存在为get请求
                        cache: false, // 不使用缓存 每次都会向服务器请求
                        dataType: payload.dataType == null ? 'json' : payload.dataType,
                        beforeSend: function beforeSend(request) {
                            // 携带token
                            request.setRequestHeader("Authorization", token);
                        },
                        contentType: contentType,
                        processData: processData,
                        timeout: payload.timeOut == null ? 20000 : payload.timeOut,
                        success: function success(result) {
                            if (payload.api != 'internetreachable') {
                                if (result.code == -1) {
                                    Cookies.remove('Admin-Token');
                                    // window.location.href = "/#/login";
                                    location.reload(true);
                                }
                            }
                            result.api = payload.api;
                            // 记录请求返回时间
                            result.lastSync = new Date().getTime();
                            // 更新store中的数据
                            commit('setApiData', result);
                            if (result.code == 0) {
                                result.success = true;
                            } else {
                                result.success = false;
                            }
                            resolve(result);
                        },
                        error: function error(XMLHttpRequest, textStatus, errorThrown) {
                            var result = {};
                            if (textStatus == "timeout") {
                                result.timeout = true;
                                result.code = -6;
                                state.apiData[payload.api].code = -6;
                            }
                            // console.log("Api Error： " + payload.api, '超时：' + result.timeout);
                            result.api = payload.api;
                            result.success = false;
                            result.failed = true;
                            resolve(result);
                        }
                    });
                    
                }
            });
            return promise;
        },
        // 全局方法 在扫描wifi成功之后调用 wifi列表排序
        getWifi: function getWifi(_ref2) {
            var state = _ref2.state,
                commit = _ref2.commit;
            var promise = new Promise(function (resolve) {
                // 排序 将DFS类型区分开加到最后面
                commit('sortWifi');
                // 删除相同的ssid
                commit('filterWifi');
                resolve(state.apiData['scanwifi']);
            });
            return promise;
        },
        // stroe方法 获取VPN列表 在setTimer中调用
        getList_vpn: function getList_vpn(_ref2) {
            var state = _ref2.state,
                commit = _ref2.commit,
                dispatch = _ref2.dispatch;
            var that = this
            dispatch('call', {
                api: 'getapplist'
            }).then(function (result) {
                if (result.success) {
                    if (result.applist) {
                        var vpnList = [];
                        var ui_package = [];
                        for (var i = 0; i < result.applist.length; i++) {
                            if (result.applist[i].indexOf('OpenVPN') != -1 || result.applist[i].indexOf('WireGuard') != -1 || result.applist[i].indexOf('Shadowsocks') != -1) {
                                switch (result.applist[i]) {
                                    case 'OpenVPN-Client':
                                        vpnList.push({
                                            'router': 'vpnclient',
                                            'name': 'OpenVPN Client',
                                            "api": "ovpngetclientstatus"
                                        });
                                        break;
                                    case 'OpenVPN-Server':
                                        vpnList.push({
                                            'router': 'vpnserver',
                                            'name': 'OpenVPN Server'
                                        });
                                        break;
                                    case 'Shadowsocks-Client':
                                        vpnList.push({
                                            'router': 'ssclient',
                                            'name': 'SS Client',
                                            "api": "ssclientstatus"
                                        });
                                        break;
                                    case 'Shadowsocks-Server':
                                        vpnList.push({
                                            'router': 'ssserver',
                                            'name': 'SS Server'
                                        });
                                        break;
                                    case 'WireGuard-Client':
                                        vpnList.push({
                                            'router': 'wgclient',
                                            'name': 'WireGuard Client',
                                            "api": "wgcstatus"
                                        });
                                        break;
                                    case 'WireGuard-Server':
                                        vpnList.push({
                                            'router': 'wgserver',
                                            'name': 'WireGuard Server'
                                        });
                                        break;
                                }
                            } else {
                                ui_package.push(result.applist[i]);
                            }
                        }
                        // 获取路由器支持的vpn功能client列表
                        commit("getData_vpn", vpnList);
                        commit("getPackage", ui_package);
                    }
                }
            });
        },
        // 全局一直调用的定时器  三个api
        getInfo_repeater: function getInfo_repeater(_ref2) {
            var state = _ref2.state,
                dispatch = _ref2.dispatch,
                commit = _ref2.commit;
            dispatch('call', {
                api: 'stainfo'
            }).then(function (result) {
                if (result.success) {
                    if (result.ip) {
                        commit('setonlist', {
                            data: 'repeater'
                        });
                    } else {
                        commit('setofflist', {
                            data: 'repeater'
                        });
                    }
                } else {
                    commit('setofflist', {
                        data: 'repeater'
                    });
                }
            });
            getStainfo(state, dispatch, commit);
        }
        // VPN status 定时器开启
        // getStatus_vpn: function getStatus_vpn(_ref2) {
        //     var state = _ref2.state,
        //         dispatch = _ref2.dispatch;
        //     dispatch("call", { api: 'ovpngetclientstatus' });
        //     dispatch("call", { api: 'ssclientstatus' });
        //     dispatch("call", { api: 'wgcstatus' });
        //     clearInterval(state.timer_vpn);
        //     state.timer_vpn = setInterval(function () {
        //         if (state.apiData['ovpngetclientstatus'].code != -3) dispatch("call", { api: 'ovpngetclientstatus' });
        //         if (state.apiData['ssclientstatus'].code != -3) dispatch("call", { api: 'ssclientstatus' });
        //         if (state.apiData['wgcstatus'].code != -3) dispatch("call", { api: 'wgcstatus' });
        //     }, 5000);
        // }
    };
    // 暴露的全局同步方法
    var mutations = {
        getPackage: function getPackage(state, payload) {
            var newRouter = [];
            for (var i = 0; i < payload.length; i++) {
                var routerObj = {};
                var payloadList = payload[i].split(',');
                routerObj.router = payloadList[0];
                routerObj.name = payloadList[1];
                newRouter.push(routerObj);
            }
            state.packageList = newRouter;
        },
        // 停止调用 repeater info 定时器
        clearTimer_sta: function clearTimer_sta(state) {
            clearTimeout(state.timer_repeater);
        },
        // 更新vpn状态
        isInit: function isInit(state, payload) {
            state.loading = payload;
        },
        // 是否获取网络状态
        isGetStatus_inter: function isGetStatus_inter(state, payload) {
            state.inetrStatus = payload;
        },
        // 哪种VPN存在就调用哪种状态
        getData_vpn: function getData_vpn(state, payload) {
            state.vpnData = payload;
        },
        // 将当前API请求的数据同步到state.apiData中
        setApiData: function setApiData(state, payload) {
            state.apiData[payload.api] = payload;
        },
        setSyncTime: function setSyncTime(state, payload) {
            if (!payload.isModel) {
                state.apiData[payload.api]['lastSync'] = payload.lastSync;
            }
        },
        setAllSorft: function setAllSorft(state, payload) {
            state.allsorft = payload;
        },
        // 设置语言
        setLang: function setLang(state, payload) {
            state.lang = payload.lang;
        },
        // wifi列表排序
        sortWifi: function sortWifi(state) {
            var encryptWifi = state.apiData['scanwifi']['wifis'].filter(function (item) {
                return item.type != 'normal';
            });
            var wifi_dfs = state.apiData['scanwifi']['wifis'].filter(function (item) {
                return item.type != 'dfs';
            });
            encryptWifi.sort(function (a, b) {
                return b.signal - a.signal;
            });
            wifi_dfs.sort(function (a, b) {
                return b.signal - a.signal;
            });
            state.apiData['scanwifi']['wifis'] = wifi_dfs.concat(encryptWifi);
        },
        // wifi列表去重
        filterWifi: function filterWifi(state) {
            var wifilist = state.apiData['scanwifi']['wifis'];
            var encryptList2g = {};
            var unEncrypt2g = {};
            var encryptList = {};
            var unEncrypt = {};
            state.apiData['scanwifi']['wifis'] = wifilist.reduce(function (cur, next) {
                if (next.channel >= 36) {
                    if (next.encrypt == 'none') {
                        unEncrypt2g[next.ssid] ? '' : unEncrypt2g[next.ssid] = true && cur.push(next);
                    } else {
                        encryptList2g[next.ssid] ? "" : encryptList2g[next.ssid] = true && cur.push(next);
                        }
                } else {
                    if (next.encrypt == 'none') {
                        unEncrypt[next.ssid] ? '' : unEncrypt[next.ssid] = true && cur.push(next);
                    } else {
                        encryptList[next.ssid] ? "" : encryptList[next.ssid] = true && cur.push(next);
                    }
                }
                return cur;
            }, []);
        },
        // 上线添加 => 条件是 API请求成功
        setonlist: function setonlist(state, payload) {
            if (state.onlist.indexOf(payload.data) < 0) {
                state.onlist.unshift(payload.data);
                state.offlist.remove(payload.data);
                // 移动到顶端
                $("html,body").animate({
                    scrollTop: 0
                }, 500);
            }
        },
        // 下线移除 => 条件是 API请求失败 或者一些code值为负
        setofflist: function setofflist(state, payload) {
            if (state.offlist.indexOf(payload.data) < 0) {
                state.offlist.push(payload.data);
                state.onlist.remove(payload.data);
            }
            if (state.offlist.length == 4) {
                state.offlist = ['waninfo', 'repeater', 'tethering', 'modem'];
            }
        },
        // 路由器不支持该功能直接移除
        removeInter: function removeInter(state, payload) {
            state.offlist.remove(payload.data);
            state.onlist.remove(payload.data);
        },
        // 在mdoem.js中调用
        getapns: function getapns(state, payload) {
            var mcc = payload.mcc || '000';
            var mnc = payload.mnc || '000';
            var carrial = apnlist.apns.apn.filter(function (val) {
                return val['-mcc'] == mcc;
            });
            var carinfo = carrial.filter(function (val) {
                return val['-mnc'] == mnc;
            });
            if (!carinfo.length) {
                var mncData = mnc.substr(0, 2);
                carinfo = carrial.filter(function (val) {
                    return val['-mnc'] == mncData;
                });
            }
            // 最多支持四个模块
            if (state.carinfo.length <= 3) {
                state.carinfo.push(carinfo);
            }
        },
        checkapns: function checkapns(state,arr) {
            if (arr) {
                if (state.carinfo.length <= 3) {
                    state.carinfo.push(arr);
                }
            }else{
                state.carinfo = [];
            }
        },
        changeVal: function changeVal(state, payload) {
            payload.data[payload.attr] = payload.val;
        },
        showModal: function showModal(state, payload) {
            state.modal.show = payload.show ? payload.show : true;
            state.modal.animation = payload.animation ? payload.animation : state.animation[parseInt(Math.random() * 10)];
            state.modal.title = payload.title ? payload.title : 'Caution';
            state.modal.yes = payload.yes ? payload.yes : 'Yes';
            state.modal.no = payload.no ? payload.no : 'No';
            state.modal.showCancelBtn = payload.showCancelBtn == false ? payload.showCancelBtn : true;
            state.modal.type = payload.type ? payload.type : 'default';
            state.modal.message = payload.message ? payload.message : 'message';
            state.modal.href = payload.href ? payload.href : '';
            state.modal.messageTwo = payload.messageTwo ? payload.messageTwo : '';
            state.modal.href = payload.href ? payload.href : '';
            state.modal.messageTwoi = payload.messageTwoi ? payload.messageTwoi : '';
            state.modal.messageTwos = payload.messageTwos ? payload.messageTwos : '';
            state.modal.messageThree = payload.messageThree ? payload.messageThree : '';
            state.modal.esc = payload.esc;
            state.modal.closeOnClickMask = payload.closeOnClickMask;
            state.modal.cb = payload.cb ? payload.cb : null;
            state.modal.cancel = payload.cancel ? payload.cancel : null;
            state.modal.showfoot = payload.showfoot == 0 ? payload.showfoot : 1;
        },
        hideModal: function hideModal(state) {
            state.modal.show = false;
            state.modal.animation = '';
            state.modal.message = '';
            state.modal.title = '';
            state.modal.cb = null;
            state.modal.cancel = null;
        }
    };
    Vue.use(Vuex);
    Vue.config.debug = true; // 1.为所有的警告打印栈追踪  2.把所有的锚节点以注释节点显示在 DOM 中，更易于检查渲染结果的结构。
    var store = new Vuex.Store({
        state: state,
        actions: actions,
        getters: getters,
        mutations: mutations,
        strict: false
    });
    return store;
});

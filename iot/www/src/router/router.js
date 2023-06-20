"use strict";

define(["vue", "vueRouter", "require","src/store/store.js"], function (Vue, vueRouter, require,store ) {
    Vue.use(vueRouter);
    const getModle = ()=> new Promise((resolve)=>{
        store.dispatch("call", { api: "getap4config" }).then(function (result) {
            if (result.success) {
                resolve(result.model.toLowerCase())
            }else{
                resolve('')
            }
        })
    })
    var router = new vueRouter({
        routes: [
            // { path: "/", redirect: "welcome" },
            {
                path: "/",
                name: "index",
                redirect: '/internet',
                component: function component(resolve) {
                    require(["/src/temple/index/index.js"], resolve);
                },
                children: [{
                    path: "/internet",
                    name: "internet",
                    component: function component(resolve) {
                        require(["/src/temple/internet/index.js"], resolve);
                    }
                }, {
                    path: "/wlan",
                    name: "wlan",
                    component: function component(resolve) {
                        require(["/src/temple/wlan/index.js"], resolve);
                    }
                }, {
                    path: "/lanip",
                    name: "lanip",
                    component: function component(resolve) {
                        require(["/src/temple/lanip/index.js"], resolve);
                    }
                }, {
                    path: "/adminpw",
                    name: "adminpw",
                    component: function component(resolve) {
                        require(["/src/temple/adminpw/index.js"], resolve);
                    }
                }, {
                    path: "/apitest",
                    name: "apitest",
                    component: function component(resolve) {
                        require(["/src/temple/apitest/index.js"], resolve);
                    }
                }, {
                    path: "/attools",
                    name: "attools",
                    component: function component(resolve) {
                        require(["/src/temple/attools/index.js"], resolve);
                    }
                }, {
                    path: "/bridge",
                    name: "bridge",
                    component: function component(resolve) {
                        require(["/src/temple/bridge/index.js"], resolve);
                    }
                }, {
                    path: "/clients",
                    name: "clients",
                    component: function component(resolve) {
                        try{
                            getModle().then(model=>{
                                if (model==='b2200') {
                                    require(["/src/temple/clientsb2200/index.js"], resolve);
                                }else{
                                    require(["/src/temple/clients/index.js"], resolve);
                                }
                            })
                        }catch{
                            require(["/src/temple/clients/index.js"], resolve);
                        }
                    }
                }, {
                    path: "/cloud",
                    name: "cloud",
                    component: function component(resolve) {
                        require(["/src/temple/cloud/index.js"], resolve);
                    }
                }, {
                    path: "/dns",
                    name: "dns",
                    component: function component(resolve) {
                        require(["/src/temple/dns/index.js"], resolve);
                    }
                }, {
                    path: "/firewall",
                    name: "firewall",
                    component: function component(resolve) {
                        require(["/src/temple/firewall/index.js"], resolve);
                    }
                }, {
                    path: "/knownWifi",
                    name: "knownWifi",
                    component: function component(resolve) {
                        require(["/src/temple/knownWifi/index.js"], resolve);
                    }
                }, {
                    path: "/macclone",
                    name: "macclone",
                    component: function component(resolve) {
                        require(["/src/temple/macclone/index.js"], resolve);
                    }
                }, {
                    path: "/revert",
                    name: "revert",
                    component: function component(resolve) {
                        require(["/src/temple/revert/index.js"], resolve);
                    }
                }, {
                    path: "/sendmsg",
                    name: "sendmsg",
                    component: function component(resolve) {
                        require(["/src/temple/sendmsg/index.js"], resolve);
                    }
                }, {
                    path: "/settings",
                    name: "settings",
                    component: function component(resolve) {
                        require(["/src/temple/settings/index.js"], resolve);
                    }
                }, {
                    path: "/setWifi",
                    name: "setWifi",
                    component: function component(resolve) {
                        require(["/src/temple/setWifi/index.js"], resolve);
                    }
                }, {
                    path: "/share",
                    name: "share",
                    component: function component(resolve) {
                        require(["/src/temple/share/index.js"], resolve);
                    }
                }, {
                    path: "/smessage",
                    name: "smessage",
                    component: function component(resolve) {
                        require(["/src/temple/smessage/index.js"], resolve);
                    }
                }, {
                    path: "/software",
                    name: "software",
                    component: function component(resolve) {
                        require(["/src/temple/software/index.js"], resolve);
                    }
                }, {
                    path: "/ssclient",
                    name: "ssclient",
                    component: function component(resolve) {
                        require(["/src/temple/ssclient/index.js"], resolve);
                    }
                }, {
                    path: "/ssserver",
                    name: "ssserver",
                    component: function component(resolve) {
                        require(["/src/temple/ssserver/index.js"], resolve);
                    }
                }, {
                    path: "/timezone",
                    name: "timezone",
                    component: function component(resolve) {
                        require(["/src/temple/timezone/index.js"], resolve);
                    }
                }, {
                    path: "/upgrade",
                    name: "upgrade",
                    component: function component(resolve) {
                        try{
                            getModle().then(model=>{
                                if (model==='b2200') {
                                    require(["/src/temple/upgradeb2200/index.js"], resolve);
                                }else{
                                    require(["/src/temple/upgrade/index.js"], resolve);
                                }
                            })
                        }catch{
                            require(["/src/temple/upgrade/index.js"], resolve);
                        } 
                    }
                }, {
                    path: "/vpnclient",
                    name: "vpnclient",
                    component: function component(resolve) {
                        require(["/src/temple/vpnclient/index.js"], resolve);
                    }
                }, {
                    path: "/vpnserver",
                    name: "vpnserver",
                    component: function component(resolve) {
                        require(["/src/temple/vpnserver/index.js"], resolve);
                    }
                }, {
                    path: "/wgclient",
                    name: "wgclient",
                    component: function component(resolve) {
                        require(["/src/temple/wgclient/index.js"], resolve);
                    }
                }, {
                    path: "/wgserver",
                    name: "wgserver",
                    component: function component(resolve) {
                        require(["/src/temple/wgserver/index.js"], resolve);
                    }
                }, {
                    path: "/bluetooth",
                    name: "bluetooth",
                    component: function component(resolve) {
                        require(["/src/temple/bluetooth/index.js"], resolve);
                    }
                }, {
                    path: "/blelist",
                    name: "blelist",
                    component: function component(resolve) {
                        require(["/src/temple/bluetooth/list.js"], resolve);
                    }
                }, {
                    path: "/portal",
                    name: "portal",
                    component: function component(resolve) {
                        require(["/src/temple/portal/index.js"], resolve);
                    }
                }, {
                    path: "/policy",
                    name: "policy",
                    component: function component(resolve) {
                        require(["/src/temple/policy/index.js"], resolve);
                    }
                },{
                    path: "/gps",
                    name: "gps",
                    component: function component(resolve) {
                        require(["/src/temple/gps/index.js"], resolve);
                    }
                },{
                    path: "/cells",
                    name: "cells",
                    component: function component(resolve) {
                        require(["/src/temple/cells/index.js"], resolve);
                    }
                }, {
                    path: "/tor",
                    name: "tor",
                    component: function component(resolve) {
                        require(["/src/temple/tor/index.js"], resolve);
                    }
                }, {
                    path: "/safemode",
                    name: "safemode",
                    component: function component(resolve) {
                        require(["/src/temple/safemode/index.js"], resolve);
                    }
                }, {
                    path: "/ipv6",
                    name: "ipv6",
                    component: function component(resolve) {
                        require(["/src/temple/ipv6/index.js"], resolve);
                    }
                },{
                    path: "/ping",
                    name: "ping",
                    component: function component(resolve) {
                        require(["/src/temple/ping/index.js"], resolve);
                    }
                }, {
                    path: "/mcu",
                    name: "mcu",
                    component: function component(resolve) {
                        require(["/src/temple/mcu/index.js"], resolve);
                    }
                }, {
                    path: "/siderouter",
                    name: "siderouter",
                    component: function component(resolve) {
                        require(["/src/temple/siderouter/index.js"], resolve);
                    }
                },{
                    path: "/mudial",
                    name: "mudial",
                    component: function component(resolve) {
                        require(["/src/temple/mudial/index.js"], resolve);
                    }
                }, {
                    path: "/rs485",
                    name: "rs485",
                    component: function component(resolve) {
                        require(["/src/temple/rs485/index.js"], resolve);
                    }
                }, {
                    path: "/adguardhome",
                    name: "adguardhome",
                    component: function component(resolve) {
                        require(["/src/temple/adguardhome/index.js"], resolve);
                    }
                },{
                    path: "/snooping",
                    name: "snooping",
                    component: function component(resolve) {
                        require(["/src/temple/snooping/index.js"], resolve);
                    }
                },
                {
                    path: "/sms",
                    name: "sms",
                    component: function component(resolve) {
                        require(["/src/temple/sms/index.js"], resolve);
                    }
                },{
                    path: "/luci",
                    name: "luci",
                    component: function component(resolve) {
                        require(["/src/temple/luci/index.js"], resolve);
                    }
                },
                {
                    path: "/log",
                    name: "log",
                    component: function component(resolve) {
                        require(["/src/temple/log/index.js"], resolve);
                    }
                }
            ]
            }, {
                path: "/login",
                name: "login",
                component: function component(resolve) {
                    require(["/src/temple/login/index.js"], resolve);
                }
            }, {
                path: "/process",
                name: "process",
                component: function component(resolve) {
                    try{
                        getModle().then(model=>{
                            if (model==='b2200') {
                                require(["/src/temple/processb2200/index.js"], resolve);
                            }else{
                                require(["/src/temple/process/index.js"], resolve);
                            }
                        })
                    }catch{
                        require(["/src/temple/process/index.js"], resolve);
                    }
                }
            }, {
                path: "/welcome",
                name: "welcome",
                component: function component(resolve) {
                    require(["/src/temple/welcome/index.js"], resolve);
                }
            },
        ]
    });
    return router;
});

'use strict';

require(['vue', 'vueX', 'router/router', 'store/store', 'lang', 'en', 'jquery', 'Cookie', 'Appvue', 'component/loading/index', 'component/gl-message/index', 'component/gl-modal/index', 'component/gl-dropdown/index', 'component/gl-loading/index', 'bootstrap'], function (Vue, Vuex, router, store, vuexI18n, en, jquery, Cookies, indext, loading, message, vodal, gl_dropdown, gl_loading) {
    window.Vue = Vue;
    Vue.component('vodal', vodal);
    Vue.component('gl-dropdown', gl_dropdown);
    Vue.prototype.$message = message;
    Vue.prototype.$bus = new Vue()//lzq add
    Vue.config.debug = true;
    Vue.config.devtools = true;
    Vue.use(vuexI18n);
    Vue.locales(en);
    Vue.directive('focus', {
        inserted: function inserted(el, _ref) {
            var value = _ref.value;
            if (value) {
                el.focus();
            }
        }
    });
    var whiteList = ['/login']; // 白名单
    var initList = ['/welcome']; // 白名单
    router.beforeEach(function (to, from, next) {
        if (Cookies.get('Admin-Token') && Cookies.get('Admin-Token') !== 'undefined') {
            if (to.path === '/login' || to.path === '/welcome') {
                next({ path: '/' });
            } else {
                next();
            }
        }else{
            initWeb().then(function (response) {
                if (response) {
                        if (whiteList.indexOf(to.path) !== -1) {
                            // 白名单跳转
                            next();
                        } else {
                            next('/login'); // 无Cookie全部重定向到登录页
                        }
                } else {
                    if (initList.indexOf(to.path) !== -1) {
                        // 白名单跳转
                        next();
                    } else {
                        next('/welcome'); // 无Cookie全部重定向到登录页
                    }
                }
            })
        }
    });
    function initWeb() {
        var promise = new Promise(function (resolve) {
            store.dispatch('call', { api: 'isconnected' }).then(function (result) {
                if (result.code === 0 && result.configured) resolve(true);
                else resolve(false);
            });
        });
        return promise;
    }
    new Vue({
        el: '#app',
        router: router,
        store: store,
        components: {
            "gl-loading": gl_loading,
            loading: loading,
            indext: indext
        },
        mounted: function mounted() {
            var that = this;
            that.$store.dispatch('call', { api: 'getlanguage' }).then(function (result) {
                if (result.success) {
                    that.$store.commit("setLang", { lang: result.language });
                    that.$translate.setLang(result.language);
                } else {
                    that.$store.commit("setLang", { lang: 'EN' });
                    that.$translate.setLang('EN');
                }
            });
        }
    });
});
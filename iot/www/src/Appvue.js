"use strict";

define(["vue"], function (Vue) {
    var vueComponent = Vue.extend({
        name: "app",
        template: "<div class=\"app\">\n            <router-view/>\n        </div>",
        data: function data() {
            return {};
        }
    });
    return vueComponent;
});
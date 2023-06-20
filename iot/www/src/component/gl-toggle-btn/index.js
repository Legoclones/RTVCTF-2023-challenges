"use strict";

define(["vue", "css!component/gl-toggle-btn/index.css"], function (Vue) {
    var vueComponent = Vue.extend({
        name: "vue-ios7-switch",
        template: "\n        <div class=\"temple\">\n            <label :data-theme=\"theme\" :style=\"{ 'font-size':size }\":class=\"['vue-ios7-switch',cssClass]\">\n                <input type=\"checkbox\" :disabled=\"disabled\" v-model=\"checked\" @click=\"clickItem\" @change=\"changeItem\">\n                <span><i :class=\"{'disabled': disabled}\"><b>{{showon ? message : ''}}</b></i></span>\n            </label>\n        </div>\n        ",
        model: {
            prop: "checked",
            event: "change"
        },
        props: {
            "cssClass": String,
            "checked": {
                type: Boolean,
                default: false
            },
            "showon": {
                type: Boolean,
                default: false
            },
            "disabled": {
                type: Boolean,
                default: false
            },
            "size": String,
            "iseconds": {
                type: Number,
                default: 10
            },
            "timer": {
                type: Boolean,
                default: false
            },
            "showTimer": {
                type: Boolean,
                default: false
            },
            "theme": {
                type: String,
                default: "green"
            },
            "waitingMessage": {
                type: String,
                required: false,
                default: "{{seconds}}"
            }
        },
        data: function data() {
            return {
                seconds: this.iseconds,
                message: this.checked ? 'ON' : "OFF",
                intv: null
            };
        },
        watch: {
            checked: function checked(val) {
                this.message = val ? 'ON' : "OFF";
            }
        },
        methods: {
        
            clickItem: function clickItem() {
                if (this.disabled) {
                    return
                }
                var _this = this;
                _this.disabled = true;
                if (this.timer) {
                    _this.seconds = _this.iseconds;
                    clearInterval(this.intv)
                    this.intv = setInterval(function () {
                        _this.seconds -=1 
                        if (_this.seconds > 0) { 
                            if (_this.showTimer) {
                                _this.message = _this.waitingMessage.replace(/{{ *seconds *}}/g, _this.seconds);
                            }
                           
                        } else {
                            if (_this.showon) {
                                _this.message = _this.checked ? 'ON' : "OFF";
                            } else {
                                _this.message = "";
                            }
                            _this.disabled = false;
                            clearInterval(_this.intv)
                        }
                    }, 1000);
                } else {
                    _this.disabled = false;
                    if (_this.showon) {
                        _this.message =_this.checked ?  'ON' : "OFF";
                    } else {
                        _this.message = "";
                    }
                }
                this.$emit("onclick", _this.checked);
            },
            changeItem: function changeItem() {
                this.$emit("change", this.checked);
            }
        }
    });
    return vueComponent;
});
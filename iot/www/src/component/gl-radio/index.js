"use strict";

define(["vue", "css!component/gl-radio/index.css", "text!component/gl-radio/index.html"], function (Vue, css, stpl) {
    var vueComponent = Vue.extend({
        template: stpl,
        name: 'gl-radio', //radio组件名称
        model: { //自定义 v-model的 prop和event,这个定义的意思就是使用change事件更新model的值,以此来实时更新v-model的值
            prop: 'model',
            event: 'change'
        },
        props: {
            value: { //radio的value属性
                type: [String, Number],
                require: true
            },
            model: { //这里的model指的是上面定义的v-model的prop
                type: [String, Number],
                require: true
            },
            checked: { //是否默认选中
                type: Boolean,
                default: false
            },
            disabled: { //是否禁用
                type: Boolean,
                default: false
            }
        },
        mounted: function mounted() {
            //当dom渲染完成,判断组件是否默认选中
            if (this.checked === true) this.updateVal();
        },
        methods: {
            updateVal: function updateVal() {
                //当用户点击radio时,触发change事件更新v-model
                this.$emit('change', this.$refs.radio.value);
            }
        },
    });
    return vueComponent;
});
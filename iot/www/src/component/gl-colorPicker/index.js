"use strict";

define(["vue", "text!component/gl-colorPicker/index.html", "css!component/gl-colorPicker/index.css"], function (Vue, stpl, css) {
    var vueComponent = Vue.extend({
        template: stpl,
        name: 'colorPicker',
        props: {
            // 当前颜色值
            value: {
                type: String,
                required: true
            },
            // 默认颜色
            defaultColor: {
                type: String,
                default: '#ffffff'
            },
            // 禁用状态
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data: function data() {
            return {
                // 面板打开状态
                openStatus: false,
                // 鼠标经过的颜色块
                hoveColor: null,
                // 主题颜色
                tColor: ['#000000', '#ffffff', '#eeece1', '#1e497b', '#4e81bb', '#e2534d', '#9aba60', '#8165a0', '#47acc5', '#f9974c'],
                // 颜色面板
                colorConfig: [['#7f7f7f', '#f2f2f2'], ['#0d0d0d', '#808080'], ['#1c1a10', '#ddd8c3'], ['#0e243d', '#c6d9f0'], ['#233f5e', '#dae5f0'], ['#632623', '#f2dbdb'], ['#4d602c', '#eaf1de'], ['#3f3150', '#e6e0ec'], ['#1e5867', '#d9eef3'], ['#99490f', '#fee9da']],
                // 标准颜色
                bColor: ['#c21401', '#ff1e02', '#ffc12a', '#ffff3a', '#90cf5b', '#00af57', '#00afee', '#0071be', '#00215f', '#72349d'],
                html5Color: this.value
            };
        },

        computed: {
            // 显示面板颜色
            showPanelColor: function showPanelColor() {
                if (this.hoveColor) {
                    return this.hoveColor;
                } else {
                    return this.showColor;
                }
            },

            // 显示颜色
            showColor: function showColor() {
                if (this.value) {
                    return this.value;
                } else {
                    return this.defaultColor;
                }
            },

            // 颜色面板
            colorPanel: function colorPanel() {
                var colorArr = [];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.colorConfig[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var color = _step.value;

                        colorArr.push(this.gradient(color[1], color[0], 5));
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } catch (err){
                        if (_didIteratorError) {
                            return _iteratorError
                        }
                    }
                }

                return colorArr;
            }
        },
        methods: {
            // 拉起input color框
            triggerHtml5Color: function triggerHtml5Color() {
                this.$refs.html5Color.click();
            },

            // 更新组件的值 value
            updataValue: function updataValue(value) {
                this.$emit('input', value);
                this.$emit('change', value);
                this.openStatus = false;
            },

            // 设置默认颜色
            handleDefaultColor: function handleDefaultColor() {
                this.updataValue(this.defaultColor);
            },

            // 格式化 hex 颜色值
            parseColor: function parseColor(hexStr) {
                if (hexStr.length === 4) {
                    hexStr = '#' + hexStr[1] + hexStr[1] + hexStr[2] + hexStr[2] + hexStr[3] + hexStr[3];
                } else {
                    return hexStr;
                }
            },

            // RGB 颜色 转 HEX 颜色
            rgbToHex: function rgbToHex(r, g, b) {
                var hex = (r << 16 | g << 8 | b).toString(16);
                return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex;
            },

            // HEX 转 RGB 颜色
            hexToRgb: function hexToRgb(hex) {
                hex = this.parseColor(hex);
                var rgb = [];
                for (var i = 1; i < 7; i += 2) {
                    rgb.push(parseInt('0x' + hex.slice(i, i + 2)));
                }
                return rgb;
            },

            // 计算渐变过渡颜色
            gradient: function gradient(startColor, endColor, step) {
                // 讲 hex 转换为 rgb
                var sColor = this.hexToRgb(startColor);
                var eColor = this.hexToRgb(endColor);

                // 计算R\G\B每一步的差值
                var rStep = (eColor[0] - sColor[0]) / step;
                var gStep = (eColor[1] - sColor[1]) / step;
                var bStep = (eColor[2] - sColor[2]) / step;

                var gradientColorArr = [];
                // 计算每一步的hex值
                for (var i = 0; i < step; i++) {
                    gradientColorArr.push(this.rgbToHex(parseInt(rStep * i + sColor[0]), parseInt(gStep * i + sColor[1]), parseInt(bStep * i + sColor[2])));
                }
                return gradientColorArr;
            }
        },
        mounted: function mounted() {
            var _this = this;

            // 点击页面上其他地方，关闭弹窗
            document.onclick = function () {
                _this.openStatus = false;
            };
        }
    });
    return vueComponent;
});
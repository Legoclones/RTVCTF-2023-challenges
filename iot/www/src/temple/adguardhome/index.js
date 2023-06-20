"use strict";

define(["text!temple/adguardhome/index.html", "css!temple/adguardhome/index.css", "vue", "component/gl-btn/index", "component/gl-toggle-btn/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index", "component/gl-chart/index", "component/gl-loading/index"], function (temp, css, Vue, gl_btn, gl_toggle, gl_input, gl_tooltip, gl_select, gl_chart, gl_loading) {
  var vueComponent = Vue.extend({
    template: temp,
    data: function data() {
      return {
        applystatus: true,
        ChartValueBlocked: [],
        ChartValueDNS: [],
        ChartValueParent: [],
        ChartValueSafe: [],
        topBlockedDomains: [],
        topQueriedDomains: [],
        numDnsQueries: 0,
        numBlockedFiltering: 0,
        ChartLabels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
        ChartColor0: "rgba(70,127,207, 0.3)",
        ChartColor1: "rgba(205,32,31, 0.3)",
        ChartColor2: "rgba(94,186,0, 0.3)",
        ChartColor3: "rgba(241,196,15, 0.3)",
        BorderColor0: "rgba(70,127,207, 1)",
        BorderColor1: "rgba(205,32,31, 1)",
        BorderColor2: "rgba(94,186,0, 1)",
        BorderColor3: "rgba(241,196,15, 1)",
        controlStats: {},
        isLoading: false,
        interval: 1,
        isEnable: false,
        isDisabled: false,
        timer: null,
      };
    },
    components: {
      "gl-btn": gl_btn,
      "gl-tg-btn": gl_toggle,
      "gl-input": gl_input,
      "gl-select": gl_select,
      "gl-tooltip": gl_tooltip,
      "gl-chart": gl_chart,
      "gl-loading": gl_loading
    },
    beforeRouteLeave: function beforeRouteLeave(to, from, next) {
      clearInterval(this.timer);
      next();
    },
    beforeRouteEnter: function beforeRouteEnter(to, from, next) {
      next(function (vm) {
        $("#router-visual").slideUp();
        $(".bar.active").removeClass("active");
        // $(".clsLink2applications").addClass("active");
        setTimeout(function () {
          if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
            $(".bar.active").removeClass("active");
            $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
            $("#vpn").collapse("hide");
            $("#moresetting").collapse("hide");
            $("#applications").collapse("hide");
            $("#system").collapse("show");
          }
        }, 50);
      });
    },
    computed: {
      hostname: function hostname() {
        var ip = window.location.hostname;
        return "http://" + ip + ":3000"
      }

    },
    mounted: function mounted() {
      var that = this;
      that.getConfig();
      that.getData();
      that.getStatsInfo();
    },

    methods: {
      //设置使能状态
      setConfig: function setConfig() {
        var that = this;
        this.isDisabled = true;
        that.$store.dispatch('call', {
          api: 'agh_set_config',
          data: {
            enable: that.isEnable,
          }
        }).then(function (result) {
          if (result.success) {
            if (that.isEnable) {
              that.isLoading = true;
              that.timer = setInterval(function () {
                that.$store.dispatch("call", {
                  api: "agh_stats"
                }).then(function (result) {
                  if (result.time_units) {
                    that.isDisabled = false;
                    that.isLoading = false;
                    that.getStatsInfo();
                    that.stateOperation(result);
                    clearInterval(that.timer);
                  }
                });
              }, 10000);
            } else {
              that.isLoading = true;
              that.$store.dispatch("call", {
                api: "agh_stats"
              }).then(function (result) {
                that.isDisabled = false;
                that.isLoading = false;
                that.stateOperation(result);
              });
            }
            that.$message({
              "type": "success",
              "api": "enableap",
              "msg": result.code
            });
          } else {
            that.isDisabled = false;
            that.isEnable = false;
            that.$message({
              "type": "error",
              "api": "enableap",
              "msg": result.code
            });
          }

        });
      },
      //获取状态
      getConfig: function getConfig() {
        var that = this;
        that.$store.dispatch('call', {
          api: 'agh_get_config'
        }).then(function (result) {
          if (result.success) {
            that.isEnable = result.enable;
          }
        })
      },
      //获取agh_stats_info
      getStatsInfo: function getStatsInfo() {
        var that = this;
        that.$store.dispatch('call', {
          api: 'agh_stats_info'
        }).then(function (result) {
          that.interval = result.interval;
        })
      },
      //天数转换
      timeConversion: function timeConversion() {
        if (this.interval == 1 || this.interval == undefined) {
          return '24 ' + this.t('hours');
        }
        return this.interval + ' ' + this.t('days');
      },
      //刷新接口
      refresh: function refresh() {
        if(this.isDisabled){
          return ;
        }
        var that = this;
        that.getStatsInfo();
        that.getData();
      },
      stateOperation: function stateOperation(result) {
        var that = this;
        that.controlStats = result;
        that.ChartValueDNS = result.dns_queries;
        that.ChartValueBlocked = result.blocked_filtering;
        that.ChartValueSafe = result.replaced_safebrowsing;
        that.ChartValueParent = result.replaced_parental;
        that.topBlockedDomains = result.top_blocked_domains
        that.topQueriedDomains = result.top_queried_domains
        that.numBlockedFiltering = result.num_blocked_filtering
        that.numDnsQueries = result.num_dns_queries
        var date = new Date();
        var timesta = date.getTime();
        var labels = [];
        if (result.dns_queries){
          var data_len = result.dns_queries.length;
        }
        for (var i = 0; i < data_len; i++) {
          //根据时间单位生成X坐标
          if (result.time_units == "hours") {
            labels[i] = that.parseTime(timesta - (data_len - i) * 3600 * 1000, '{m}-{d} {h}:00');
          } else {
            labels[i] = that.parseTime(timesta - (data_len - i - 1) * 3600 * 1000 * 24, '{y}-{m}-{d}');
          }
        }
        that.ChartLabels = labels;
      },
      //获取接口返回的内容
      getData: function getData() {
        var that = this;
        this.isLoading = true;
        that.$store.dispatch("call", {
          api: "agh_stats"
        }).then(function (result) {
          that.isLoading = false;
          that.stateOperation(result);
        });
      },
      //计算拦截占比 首页出dns请求的其他三个百分比
      blockPercentage: function blockPercentage(value) {

        if (this.numDnsQueries == 0 || this.numDnsQueries == undefined) {
          return 0
        }
        var item = (value / this.numDnsQueries) * 100
        return item.toFixed(2);
      },
      //计算单个拦截/请求的的占比
      itemPercentage: function itemPercentage(value, data) {
        var item = this.interceptName(value) / data * 100
        return item.toFixed(2);
      },
      //返回item数据的单个值
      interceptName: function interceptName(item) {
        for (var key in item) {
          return item[key];
        }
        return '0'
      },
      //返回item的单个键
      blockingTimes: function blockingTimes(item) {
        for (var key in item) {
          return key;
        }
        return 'Unknown'
      },
      applyAGH: function applyAGH() {},

      parseTime: function parseTime(time, cFormat) {
        if (arguments.length === 0) {
          return null
        }
        if (time === null) { // if this device never login in, its online/office time is 'null' 如果有设备从来没有上线过，其online/office time 是 null
          return null
        }
        const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
        let date
        if (typeof time === 'object') {
          date = time
        } else {
          if (('' + time).length === 10) time = parseInt(time) * 1000
          date = new Date(time)
        }
        const formatObj = {
          y: date.getFullYear(),
          m: date.getMonth() + 1,
          d: date.getDate(),
          h: date.getHours(),
          i: date.getMinutes(),
          s: date.getSeconds(),
          a: date.getDay()
        }
        if (formatObj.y === 1970) { // online first time, its offline time is '1970-01-01 08:00:00.0'
          return ''
        }
        const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
          let value = formatObj[key]
          if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
          if (result.length > 0 && value < 10) {
            value = '0' + value
          }
          return value || 0
        })
        return time_str
      }
    }

  });
  return vueComponent;
});

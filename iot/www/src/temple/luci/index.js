"use strict";

define([
  "text!temple/luci/index.html",
  "vue",
  "component/gl-toggle-btn/index",
  "component/gl-tooltip/index",
  "component/gl-btn/index",
  "component/gl-select/index",
  'component/modal/modal',
], function (stpl, Vue, gl_switch, gl_tooltip, gl_btn, gl_select,gl_modal) {
  var vueComponent = Vue.extend({
    template: stpl,
    data: function data() {
      return {
        luciInstallStatus: false,
        spinnerStatus: "",
        flash_free: 0,
        flash_total: 0,
        msgModal:false,
        errMsg:'',
        putMsg:'',
        softName:'',
        status:'',
        href: '',
        uploadStatus:false,
        uploadStaMsg:'',
        uploadOperat:'',
        uploadOperatBtn:false,
        updateDisaBtn:false
      };
    },
    components: {
      "gl-switch": gl_switch,
      "gl-tooltip": gl_tooltip,
      "gl-btn": gl_btn,
      "gl-select": gl_select,
      "gl-modal": gl_modal,
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
            $("#moresetting").collapse("show");
            $("#applications").collapse("hide");
            $("#system").collapse("hide");
          }
        }, 50);
      });
    },
    beforeRouteLeave: function beforeRouteLeave(to, from, next) {
      if (this.luciInstallStatus) {
        this.$message({
          type: "info",
          msg: -1900,
          duration: 2000,
        });
        return 
      } 
      next();
      
    },
    mounted: function mounted() {
      this.detectUpdateStatus();
      this.$store.dispatch("call", {
        api: "getapplist",
      });
      this.getRouerMini();
      this.href="/cgi-bin/luci";
    },
    computed: {
      getapplist: function getapplist() {
        return this.$store.getters.apiData["getapplist"];
      },
      currentLanguage: function currentLanguage() {
        return this.$store.getters.lang;   
      },
      router: function router() {
        return this.$store.getters.apiData["router_mini"];
      },
      splitString: function splitString() {
        if (this.flash_free.toString().length >= 4) {
            var int = this.flash_free.toString().indexOf('.') + 2;
            this.flash_free = this.flash_free.toString().slice(0,int);
            return this.flash_free;
        };
        return this.flash_free;
    },
      isAdvanced: function isAdvanced() {
        var list = this.getapplist.applist || [];
        for (var i = 0; i < list.length; i++) {
          if (list[i] == "gl_luci") {
            return true;
          }
        }
        return false;
      },
    },
    watch:{
      currentLanguage:function currentLanguage(newval) {
        var that = this
        if (newval) {
         that.detectUpdateStatus()
        }
      }
    },
    methods: {
      getRouerMini: function getRouerMini() {
        var that = this;
        this.$store.dispatch("call", {
          api: "router_mini",
        })
          .then(function (result) {
            if (result.flash_total != 0) {
              that.flash_free =
                result.flash.flash_free / result.flash.flash_total;
              that.flash_free = that.flash_free.toFixed(2) * 100;
              that.flash_total = Math.floor(
                result.flash.flash_free / 1024
              );
            } else {
              that.flash_total = "0";
              that.flash_free = "0";
            }
          });
      },
      installApp: function installApp(value) {
        var that = this;
        this.luciInstallStatus = true;
        var data = { name: value };
        this.softName = value;
        that.$store
          .dispatch("call", {
            api: "app_install",
            timeOut: 300000,
            data: data,
          })
          .then(function (result) {
            that.luciInstallStatus = false;
            that.msgModal = true;
            that.putMsg = result.stdout;
            if (result.success) {
              that.status = "successfully"
              that.$store.dispatch("call", {
                api: "getapplist",
              });
            } else {
              that.status = "failed";
              that.errMsg = result.stderr;
              if (result.code == -32 ||result.code == -12||result.code == -13||result.code == -111||result.code == -24) {
                that.errMsg = result.msg;
              }
            }
          });
      },
      closeModal: function closeModal() {
        this.showModal = false;
        this.msgModal = false;
        this.errMsg = '';
        this.putMsg = '';
        this.status = '';
        this.softName = '';
    },
     // 软件包更新状态获取
     detectUpdateStatus: function updateSortWare() {
      var that = this;
      that.uploadStaMsg=this.t('The router is refreshing the software repository.');
      that.uploadOperat=this.t('Please wait a while.');
      that.$store.dispatch("call", {
          api: "softwareStatus",
          timeOut: 60000
      }).then(function (result) {
          if (result.code=='0') {
              if (result.status=='updated') {
                that.uploadStaMsg=that.t('Please install Luci before you can continue.');
                that.uploadOperat="";
                that.uploadOperatBtn=false; 
                that.uploadStatus=true;
              } else {
                that.updatesofeware();
              }   
          } else {
            that.updatesofeware();
          } 
      });
     },
    // 点击更新
     updateSoftWare:function updateSoftWare() {
       this.updatesofeware();
     },  
     // 更新接口
     updatesofeware: function updatesofeware() {
      var that=this;
      that.uploadStaMsg=this.t('The router is refreshing the software repository.');
      that.uploadOperat=this.t('Please wait a while.');
      that.updateDisaBtn=true;
      that.uploadOperatBtn=false;
      that.uploadStatus=false
      this.$store.dispatch("call", {
        api: "updatesofeware",
      }).then(function (res) {
        that.updateDisaBtn=false;
        if (res.success) {
          that.uploadStaMsg=that.t('Please install Luci before you can continue.');
          that.uploadOperat="";
          that.uploadStatus=true
          that.uploadOperatBtn=false; 
        }else {
          that.uploadStaMsg=that.t('The router failed to reresh the software repository.');
          that.uploadOperat=that.t('Refresh again now.');
          that.uploadOperatBtn=true;
        }
      })
     },
     
    },
  });
  return vueComponent;
});

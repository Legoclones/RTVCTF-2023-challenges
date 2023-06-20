"use strict";

define([
  "text!temple/share/index.html",
  "css!temple/share/index.css",
  "vue",
  "component/gl-toggle-btn/index",
  "component/gl-tooltip/index",
  "component/gl-btn/index",
  "component/gl-select/index",
  'component/modal/modal',
], function (stpl, css, Vue, gl_switch, gl_tooltip, gl_btn, gl_select,gl_modal,gl_loading) {
  var vueComponent = Vue.extend({
    template: stpl,
    data: function data() {
      return {
        isShow: false,
        agreeStatus: false,
        applyStatus: true,
        msgOf_dmz: false,
        // dlna
        applyDlnaStatus: true, //是否禁用(true为禁用)
        currentDlnaDir: null,
        flagDlna: "",
        enableDlna: false,
        // samba
        flag: "", //第一次进入页面用于阻止应用按钮开启
        currentDir: null,
        dlnaInstallStatus: false,
        spinnerStatus: "",
        flash_free: 0,
        flash_total: 0,

        showModal:false,
        msgModal:false,
        errMsg:'',
        putMsg:'',
        softName:'',
        status:'',
        uploadStatus:false,
        uploadStaMsg:'',
        uploadOperat:'',
        uploadOperatBtn:false,
        updateDisaBtn:false,
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
    beforeRouteLeave: function beforeRouteLeave(to, from, next) {
      if (this.dlnaInstallStatus) {
        this.$message({
          type: "info",
          msg: -1900,
          duration: 2000,
        });
      } else {
        next();
      }
    },
    mounted: function mounted() {
      var that = this;
      this.detectUpdateStatus();
      this.$store.dispatch("call", {
        api: "shareget",
      });
      this.$store.dispatch("call", {
        api: "getdlna",
      });
      this.$store.dispatch("call", {
        api: "getapplist",
      });
      that.getRouerMini();
      that.$store
        .dispatch("call", {
          api: "fwget",
        })
        .then(function (result) {
          if (result.status == "Enabled") {
            that.msgOf_dmz = true;
          }
        });
        
    },
    computed: {
      shareget: function shareget() {
        var curList = this.$store.getters.apiData["shareget"];
        this.flag = curList.share_dir;
        this.currentDir = curList.share_dir;
        return this.$store.getters.apiData["shareget"];
      },
      currentLanguage: function currentLanguage() {
        return this.$store.getters.lang;   
      },
      dlnaget: function dlnaget() {
        var curList = this.$store.getters.apiData["getdlna"];
        this.flagDlna = curList.current;
        this.currentDlnaDir = curList.current;
        this.enableDlna = curList.enabled;
        return this.$store.getters.apiData["getdlna"];
      },
      router: function router() {
        return this.$store.getters.apiData["router_mini"];
      },
      getapplist: function getapplist() {
        return this.$store.getters.apiData["getapplist"];
      },
      isSharing: function isSharing() {
        var list = this.getapplist.applist || [];
        for (var i = 0; i < list.length; i++) {
          if (list[i] == "FileSharing") {
            return true;
          }
        }
        return false;
      },
      isDlna: function isDlna() {
        var list = this.getapplist.applist || [];
        for (var i = 0; i < list.length; i++) {
          if (list[i] == "DLNA") {
            return true;
          }
        }
        return false;
      },
      splitString: function splitString() {
        if (this.flash_free.toString().length >= 4) {
            var int = this.flash_free.toString().indexOf('.') + 2;
            this.flash_free = this.flash_free.toString().slice(0,int);
            return this.flash_free;
        };
        return this.flash_free;
      },
      isDiasableShareApply() {
        return this.shareget && this.shareget.list.length <= 0
      }
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
      // 安装
      installApp: function installApp(value) {
     
        var that = this;
        this.spinnerStatus = value == "dlna" ? "dlna" : "sharing";
        this.dlnaInstallStatus = true;
        this.softName = value;
        var data = { name: value };
        that.$store
          .dispatch("call", {
            api: "app_install",
            timeOut: 300000,
            data: data,
          })
          .then(function (result) {
            that.dlnaInstallStatus = false;
            that.putMsg = result.stdout;
            that.msgModal = true;
            if (result.success) {
              that.status = "successfully"
              that.$store.dispatch("call", {
                api: "getapplist",
              });
              that.getRouerMini();
              setTimeout(function() {
                that.$store.dispatch("call", {
                  api: "shareget",
                });
              }, 2000);
            } else {
              that.status = "failed";
              that.errMsg = result.stderr;
              if (result.code == -32 ||result.code == -12||result.code == -13||result.code == -111||result.code == -24) {
                that.errMsg = result.msg;
              }
            }
          });
      },
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
      checkApply: function checkApply() {
        this.applyStatus = false;
      },
      checkArgee: function checkArgee() {
        var that = this;
        if (this.shareget.samba_writable) {
          that.$store.commit("showModal", {
            show: true,
            title: "Caution",
            type: "warning",
            message: this.$lang.modal.usbUseInfo,
            yes: "Agree",
            no: "Cancel",
            cb: function cb() {
              that.applyStatus = false;
            },
            cancel: function cancel() {
              that.shareget.samba_writable = false;
            },
          });
        } else {
          that.applyStatus = false;
        }
      },
      // 改变目录
      changeCurDir: function changeSambaDir(type) {
        if (type == "dlna" && this.currentDlnaDir != this.flagDlna) {
          this.applyDlnaStatus = false;
        } else if (type == "samb" && this.currentDir != this.flag) {
          this.applyStatus = false;
        }
      },
      // 输入目录
      curInputDir: function inputSambaDir(type) {
        if (type == "dlna") {
          this.applyDlnaStatus = false;
        } else if (type == "samb") {
          this.applyStatus = false;
        }
      },
      setShare: function setShare() {
        var that = this;
        that.applyStatus = true;
        this.$store
          .dispatch("call", {
            api: "shareset",
            data: {
              path: that.currentDir,
              lan_share: that.shareget.share_on_lan,
              wan_share: that.shareget.share_on_wan,
              writable: that.shareget.samba_writable,
            },
          })
          .then(function (result) {
            if (result.success) {
              that.$message({
                type: "success",
                msg: result.code,
              });
            } else {
              that.$message({
                type: "error",
                msg: result.code,
              });
            }
          });
      },
      // set DLNA
      setDLNA: function setDLNA() {
        var that = this;
        that.$store
          .dispatch("call", {
            api: "setdlna",
            data: {
              enabled: that.enableDlna,
              current: that.currentDlnaDir,
            },
          })
          .then(function (result) {
            if (result.success) {
              that.$message({
                type: "success",
                msg: result.code,
              });
            } else {
              that.$message({
                type: "error",
                msg: result.code,
              });
            }
            that.applyDlnaStatus = true;
          });
      },
      checkDlnaApply: function checkDlnaApply() {
        this.applyDlnaStatus = false;
      },
       // 清空详情框
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
                that.uploadStaMsg=that.t('Please install before you can continue.');
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
      that.uploadOperatBtn=false;
      that.updateDisaBtn=true;
      that.uploadStatus=false
      this.$store.dispatch("call", {
        api: "updatesofeware",
      }).then(function (res) {
        that.updateDisaBtn=false;
        if (res.success) {
          that.uploadStaMsg=that.t('Please install before you can continue.');
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


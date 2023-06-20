"use strict";

define(["text!temple/log/index.html", "vue", "component/gl-btn/index", "css!temple/log/index.css", "component/gl-select/index", "component/gl-input/index", "component/select/index", "component/modal/modal"], function (stpl, Vue, gl_btn, css, gl_select, gl_input, select, gl_modal) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                enable: 0
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-select": gl_select,
            "gl-input": gl_input,
            "select": select,
            "gl-modal": gl_modal
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                    $("#vpn").collapse("hide");
                    $("#moresetting").collapse("hide");
                    $("#applications").collapse("hide");
                    $("#system").collapse("show");
                }
            });
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnMove) {
                next();
                return;
            }
            this.$message({
                "type": "warning",
                "msg": -1500,
                "duration": 1000
            });
        },
        mounted: function mounted() {
           this.getLogStatus()
        },
        watch: {
           
        },
        methods: {
            handleChangeCrash(){
                if (this.enable == 1 ) {
                    this.setLogEnable(0)
                }else{
                    this.setLogEnable(1)
                }
                
            },
            handleExportLog(){
                this.$store.dispatch("call", {
                    'api': 'get_log_file'}).then(res=>{
                        if (res.code == -1100) {
                            this.$message({
                                "type": "error",
                                "api": "set_log_enable",
                                "msg": ""
                            });
                        }
                        if (res.success) {
                            const a = document.createElement('a')
                            a.href = res.file
                            a.download = res.file.split('/')[ res.file.split('/').length -1 ] +".log"
                            a.click()
                        }
                    })
            },
            getLogStatus(){
                this.$store.dispatch("call", {
                    'api': 'get_log_status', sync: true}).then(res=>{
                        this.enable = res.enable
                    })
            },
            setLogEnable(enable){
                this.$store.dispatch("call", {
                    'api': 'set_log_enable', data: {
                        enable: enable
                    }}).then(res=>{
                        if (res.success) {
                            this.$message({
                                "type": "success",
                                "api": "set_log_enable",
                                "msg": res.code
                            });
                            this.getLogStatus()
                        } 
                    })
            }
        }
    });
    return vueComponent;
});
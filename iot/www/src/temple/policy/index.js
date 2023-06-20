"use strict";


define(["text!temple/policy/index.html", "css!temple/policy/index.css", "component/gl-btn/index", "component/gl-toggle-btn/index", "component/gl-upload-file/index", "component/gl-select/index", "vue", "component/gl-tooltip/index", "component/modal/modal", "component/gl-input/index", ], function (stpl, css, gl_btn, gl_toggle, gl_upf, gl_select, Vue, gl_tooltip, gl_modal, gl_input) {
	var vueComponent = Vue.extend({
		template: stpl,
		data: function data() {
			return {
				modeSelection: ['Domain/IP', 'MAC Address'],
				enablePolicy: false, //开启policy,
				whiteBlackList: ['Only allow the following use VPN', "Do not use VPN for the following"],
				whiteBlackVal: 'Do not use VPN for the following',
				guestPolicy: true, //开启guest
				localPolicy: true, //开启本地策略
				selectPolicy: "Domain/IP",
				clientList: [], //获取本机客户端Mac
				MacReg: /^([0-9a-fA-F]{2})(([/\s:][0-9a-fA-F]{2}){5})$/,
				DomainReg: /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/,
				domainInputVal: "", //input框接受的值
				macSelectVal: "", //下拉框接受的值
				macList: [], //mac列表
				domainList: [], //domain列表
				ClientName: "*",
				receive: [], //用来判断mac是否重复
				loadingStatus: false, //转圈圈的的状态
				ShowStatus: true,
				activeStutas: false,
				StatusIndex: 0,
				ChangeIndex: 0,


			};
		},
		components: {
			"gl-btn": gl_btn,
			"gl-tg-btn": gl_toggle,
			"gl-upf": gl_upf,
			"gl-select": gl_select,
			"gl-tooltip": gl_tooltip,
			"gl-modal": gl_modal,
			"gl-input": gl_input,
		},
		beforeRouteEnter: function beforeRouteEnter(to, from, next) {
			next(function (vm) {
				$("#router-visual").slideUp();
				$(".bar.active").removeClass("active");
				// $(".clsLink2vpn").addClass("active")
				setTimeout(function () {
					if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
						$(".bar.active").removeClass("active");
						$(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
						$("#vpn").collapse("show");
						$("#moresetting").collapse("hide");
						$("#applications").collapse("hide");
						$("#system").collapse("hide");
					}
				}, 250);
			});
		},
		computed: {
			checkMacOrDomain: function checkMacOrDomain() {
				if (this.selectPolicy == "MAC Address") {
					return true;
				}
				return false;
			},
			isbypass: function isbypass() {
				if (this.selectPolicy == "MAC Address" && this.whiteBlackVal == "Only allow the following use VPN" || this.selectPolicy == "Domain/IP" && this.whiteBlackVal == "Only allow the following use VPN") {
					return this.t('Use VPN for the items in the list');
				}
				return this.t('Do not use VPN for the items in the list');
			},
			isRenderList: function isRenderList() {
				if (this.checkMacOrDomain) {
					return this.macList;
				}
				return this.domainList;
			},
			getpolicy: function getpolicy() {
				return this.$store.getters.apiData['getpolicy'];
			},
			getclients: function getclients() {
				return this.$store.getters.apiData['getclients'];
			}
		},
		beforeRouteLeave: function beforeRouteLeave(to, from, next) {
			next();
		},
		created: function created() {
			var that = this;
			that.$store.dispatch("call", {
				api: "getclients"
			}).then(function (result) {
				if (result.success) {
					that.getData();
					var data = result.clients;
					for (var i = 0; i < data.length; i++) {
						if (data[i].iface != "2.4G_Guest" && data[i].iface != "5G_Guest") {
							that.receive.push(data[i]);
							that.clientList.push(data[i].mac.toUpperCase() + " ( " + data[i].name + " )");
						}
					}
				} else {
					that.clientList = []
				}
			});
		},
		methods: {
			changeStatus: function changeStatus() {
				if (this.StatusIndex == 0) {
					this.StatusIndex++;
				} else {
					this.ShowStatus = false
				}
			},
			changeStatusPolicy: function changeStatusPolicy() {
				if (this.ChangeIndex == 0) {
					this.ChangeIndex++;
				} else {
					this.ShowStatus = false
				}
			},
			getData: function getData() {
				var that = this;
				that.$store.dispatch("call", {
					api: "getpolicy"
				}).then(function (result) {
					if (result.success) {
						that.activeStutas = result.enable
						that.enablePolicy = result.enable
						if (result.local_policy == 'bypass') {
							that.localPolicy = false;
						}
						if (result.guest_policy == "bypass") {
							that.guestPolicy = false;
						}
						if (result.mac_bypass || result.mac_via) {
							if (result.mac_bypass == 'all' || result.mac_via == 'all') {

							} else {
								var macLists;
								var data;
								var list = [];
								var item = result.mac_bypass ? result.mac_bypass : result.mac_via
								macLists = item.split('\n');
								that.macList= [];
								// macList = macList.slice(0, macList.length - 1)
								for (var i = 0; i < macLists.length; i++) {
									for (var k = 0; k < that.receive.length; k++) {
										if (macLists[i].toLowerCase() == that.receive[k].mac.toLowerCase()) {
											data = {
												item: macLists[i],
												name: " (" + that.receive[k].name + ")"
											}
											list.push(data)
											break
										} else {
											data = {
												item: macLists[i],
												name: " (*)"
											}
											if (k == that.receive.length - 1) {
												list.push(data)
											}
										}

									}
								}
								that.macList = list
							}
						}
						if (result.domain_bypass || result.domain_via) {
							if (result.domain_bypass == 'all' || result.domain_via == 'all') {

							} else {
								var domainList
								var data
								var item = result.domain_bypass ? result.domain_bypass : result.domain_via
								domainList = item.split('\n');
								that.domainList = [];
								for (var i = 0; i < domainList.length; i++) {
									data = {
										item: domainList[i],
										name: ""
									}
									that.domainList.push(data)
								}
							}
						}
						if (result.type == "domain_via") {
							that.selectPolicy = "Domain/IP"
							that.whiteBlackVal = "Only allow the following use VPN"
						} else if (result.type == "domain_bypass") {
							that.selectPolicy = "Domain/IP"
							that.whiteBlackVal = "Do not use VPN for the following"
						} else if (result.type == "mac_bypass") {
							that.selectPolicy = "MAC Address"
							that.whiteBlackVal = "Do not use VPN for the following"
						} else {
							that.selectPolicy = "MAC Address"
							that.whiteBlackVal = "Only allow the following use VPN"
						}
					}
				})
			},
			addListPolicy: function addListPolicy() {
				this.ShowStatus = false;
				if (this.checkMacOrDomain) { //如果是选择mac
					if (!this.macSelectVal) {
						this.$message({
							type: 'warning',
							msg: "Can not be empty"
						});
						return
					};
					if (this.MacReg.test(this.macSelectVal)) { //mac地址验证成功
						// -----------------------------
						if (this.macList && this.macList.length > 0) { //验证是否重复添加了mac
							for (var i = 0; i < this.macList.length; i++) {
								if (this.macSelectVal == this.macList[i].item) {
									this.$message({
										type: 'warning',
										msg: "Mac address already exists, don't add it again"
									});
									return
								}
							}
						}
						// -------------------------------
						for (var i = 0; i < this.receive.length; i++) {
							if (this.macSelectVal.toLowerCase() == this.receive[i].mac.toLowerCase()) {
								this.ClientName = this.receive[i].name
								break
							}
						}
						var data = {
							item: this.macSelectVal,
							name: " (" + this.ClientName + ")"
						}
						this.macList.push(data);
						this.macSelectVal = "";
						this.ClientName = "*";
						// ----------------------------------------
					} else { //mac地址验证失败
						this.$message({
							type: 'error',
							msg: "Mac address error"
						});
						return
					};

				} else {
					if (!this.domainInputVal) {
						this.$message({
							type: 'warning',
							msg: "Can not be empty"
						});
						return
					};
					if (this.DomainReg.test(this.domainInputVal)) { //domain 地址验证成功
						if (this.domainList && this.domainList.length > 0) { //验证是否有重复的domian地址
							for (var i = 0; i < this.domainList.length; i++) {
								if (this.domainInputVal == this.domainList[i].item) {
									this.$message({
										type: 'warning',
										msg: "Domain already exists, don't add it again"
									});
									return
								}
							}
						}
						var data = {
							item: this.domainInputVal,
						};
						this.domainList.push(data);
						this.domainInputVal = "";
					} else {
						this.$message({
							type: 'error',
							msg: "Domain error"
						});
						return
					};
				}
			},
			delectItemVpn: function delectItemVpn(index) {
				this.ShowStatus = false;
				if (this.checkMacOrDomain) {
					this.macList.splice(index, 1);
				} else {
					this.domainList.splice(index, 1);
				}
			},
			getValue: function getValue(data) {
				this.ShowStatus = false;
				if (data.indexOf(" ") != -1) {
					this.macSelectVal = data.split(" ")[0];
				} else {
					this.macSelectVal = data
				}
			},
			submitApplyList: function submitApplyList() {
				var that = this;
				var data;
				var item;
				var type;
				var localPolicy = "bypass";
				var guestPolicy = "bypass";

				if (this.checkMacOrDomain) {
					var macList = [];
					if (this.macList && this.macList.length > 0) {
						for (let i = 0; i < this.macList.length; i++) {
							macList.push(this.macList[i].item)
						}
						item = macList.join('\n')
					} else {
						item = "all"
					}
					if (this.selectPolicy == "MAC Address") {
						if (this.whiteBlackVal == "Do not use VPN for the following") {
							type = 'mac_bypass'
						} else {
							type = "mac_via"

						}
					}
				} else {
					var domainList = [];
					if (this.domainList && this.domainList.length > 0) {
						for (let i = 0; i < this.domainList.length; i++) {
							domainList.push(this.domainList[i].item)
						}
						item = domainList.join('\n')
					} else {
						item = "all"
					}
					if (this.selectPolicy == "Domain/IP") {
						if (this.whiteBlackVal == "Do not use VPN for the following") {
							type = 'domain_bypass'
						} else {
							type = "domain_via"
						}
					}
				}
				if (this.localPolicy) {
					localPolicy = "forward"
				}
				if (this.guestPolicy) {
					guestPolicy = "forward"
				}
				data = {
					enable: this.enablePolicy,
					guest_policy: guestPolicy,
					local_policy: localPolicy,
					type: type,
					content: item
				}
				this.loadingStatus = true;
				this.$store.dispatch("call", {
					api: "setpolicy",
					data: data
				}).then(function (result) {
					if (result.success) {
						that.loadingStatus = false;
						var status = 'off';
						if (that.enablePolicy == true) status = 'connected';
						that.$bus.$emit('vpnCircleStatus', 'vpnPolicies', status);
						// that.getData();
						that.$message({
							"type": "success",
							"api": "setpolicy",
							"msg": result.code,
						});
					} else {
						that.loadingStatus = false;
						that.$message({
							"type": "error",
							"api": "setpolicy",
							"msg": result.code
						});
					}
				})
			}
		}
	});
	return vueComponent;
});
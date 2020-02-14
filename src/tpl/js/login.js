import regeneratorRuntime from "../../utils/runtime-module";
import {checkLogin, decryptWxCode, getUserMerchantInfo, queryMerchantById} from "../../utils/host1-api";
import {getAppUserInfo, setUserInfo, showToast, storage} from "../../utils/util";
import {appid} from "../../utils/config";

export default {
    // 打开授权页面
    openLoginPage() {
        // 新用户
        if (!getAppUserInfo("uid") && this.route !== "pages/login/login") {
            console.log("新用户进入到登录页", this.route);
            wx.navigateTo({
                url: `/pages/login/login`
            });
        }
    },
    redirectPageUrl(url) {
        wx.redirectTo({
            url: `/pages/${url}`
        });
    },
    // 老用户跳转页面判断
    async oldUserPath() {
        return new Promise(async (a, b) => {
            if (!getAppUserInfo("uid")) return a(false);
            //   if(!storage("merchant")) || merchant.auditStatus * 1 !== 1
            // 没有商家信息 或者已申请但审核状态不是通过 重新获取
            let merchant = storage("merchant");
            if (!merchant || (merchant.auditStatus * 1 !== 1 && merchant.mid)) await this.getAppMerchantByUid();
            merchant                         = storage("merchant");
            let type = merchant.type, status = storage("merchant").auditStatus,
                route                        = this.route;
            console.log(storage("merchant"), 'merchant---')
            // 未填写基本资料(跳密码登录页)
            if (["pages/apply/desc", "pages/apply/entry", "pages/apply/city", "pages/apply/check", "pages/login/register"].indexOf(route) === -1 &&
                !merchant.mid
            ) {
                this.redirectPageUrl('login/register');
                return a(true);
            }
            // return a(true);
            // 还未入驻商家
            if (type * 1 === -1 && route !== 'pages/login/register') {
                this.redirectPageUrl('login/register');
                return a(true);
            }
            // 已经入驻
            if (type * 1 === 0) {
                console.log(type, status, '已经入驻---')
                // 申请了但没通过(跳转审核失败)
                if (status * 1 === -1 && route !== 'pages/apply/entry' && route !== 'pages/apply/city') {
                    this.redirectPageUrl(`apply/entry?auditStatus=${status}`);
                    return a(true);
                }
                // 待审核
                if (status * 1 === 0 && route !== 'pages/apply/check') {
                    // 未填写资料
                    if (!merchant.mid) {
                        return a(true);
                    }
                    // 已填写资料(跳转待审核)
                    this.redirectPageUrl('apply/check');
                    return a(true);
                }
                // 审核通过(跳转首页)
                if (status * 1 === 1 && ["pages/apply/desc", "pages/apply/entry", "pages/apply/check", "pages/login/register"].indexOf(route) > -1) {
                    console.log(type, status, '审核通过---')
                    this.openHome();
                    return a(true);
                }
                return a(true);
            } else {
                // 是普通商家
                console.log(type, status, '普通商家---')
                // this.redirectPageUrl('index/index');
                return a(true);
            }
        });
    },
    // 判断是否新用户
    async userActiveLogin() {
        return new Promise(async (a, b) => {
            // 不是新用户有uid
            if (await this.oldUserPath()) return a(true);
            // 新用户
            // wx.login 换code
            let userLogin = await this.userLogin();
            if (!userLogin) return a(false);
            // 拿着code 去后台换 用户数据
            let userType = await this.getUserIdByCode(userLogin);
            if (!userType) return a(false);
            // 老用户
            if (userType === "old") return a(await this.getAppMerchantByUid(1));
            this.openLoginPage();
            return a(false);
        });
    },
    /**
     * 通过用户uid获取商家信息,通过后台接口
     */
    getAppMerchantByUid(option) {
        let self             = this;
        let getUserInfoModal = (a, b) => {
            if (self.$store.isShowNetModel) return;
            self.$store.isShowNetModel = true;
            // wx.showModal({
            //     title  : "警告",
            //     content: "网络不通,请更换网络",
            //     success(res) {
            //         self.$store.isShowNetModel = false;
            //         if (res.confirm) {
            //             getUserById(a, b);
            //             return;
            //         }
            //         getUserInfoModal(a, b);
            //     },
            //     fail() {
            //         self.$store.isShowNetModel = false;
            //     }
            // });
        };
        let getMerchantById  = async (a, b) => {
            // login:isLogin===1为账号密码登录 密码登录通过mid查询
            let login = storage('login');
            if (login.isLogin * 1 === 1) {
                // 有mid 通过mid获取
                let mid = storage('merchant').mid;
                mid && queryMerchantById({mid}, res => {
                    if (res.statusCode === -1 || res.code * 1 !== 0) {
                        getUserInfoModal(a, b);
                        return a(false);
                    }
                    let data = res.data;
                    storage("userInfo", data.user, 24 * 60 * 60);
                    storage("merchant", data, 24 * 60 * 60);
                    if (option === 1) self.oldUserPath();
                    return a(true);
                });
                // merchant过期通过账号密码获取
                !mid && login.account && await this.getMerchantByAccount(login.account, login.password);
                return a(true);
            }
            // 主账号授权通过uid获取商家信息
            getUserMerchantInfo(
                {
                    uid: getAppUserInfo("uid") || ""
                },
                res => {
                    // console.log('获取用户信息', res)
                    if (res.statusCode === -1 || res.code * 1 !== 0) {
                        getUserInfoModal(a, b);
                        return a(false);
                    }
                    let data = res.data;
                    storage("userInfo", data.user, 24 * 60 * 60);
                    storage("merchant", data.merchant, 24 * 60 * 60);
                    // 不是新用户
                    if (option === 1) self.oldUserPath();
                    // self.route === "pages/login/login" && this.goBack(0);
                    a(true);
                }
            );
        };
        return new Promise((a, b) => {
            getMerchantById(a, b);
        });
    },
    // 通过账号密码获取商家信息
    getMerchantByAccount(account, password, e) {
        return new Promise((a, b) => {
            let data={uid: getAppUserInfo("uid"), username: account, password};
            checkLogin(
                data,
                res => {
                    if (res.statusCode === -1 || res.code * 1 !== 0) {
                        showToast("error", res.msg);
                        return a(false);
                    }
                    showToast("success", "登录成功!", 2000);
                    let data     = res.data,
                        userInfo = data.user,
                        login    = {
                            isLogin: 1,
                            account,
                            password
                        };
                    storage('login', login);
                    storage("userInfo", userInfo, 24 * 60 * 60);
                    storage("merchant", data.merchant, 24 * 60 * 60);
                    e && this.openHome(e);
                    return a(false)
                }
            );
        })

    },

    /**
     * 根据微信 code 解密
     */
    getUserIdByCode(code) {
        // 没有uid且已经换取wxcode
        if (getAppUserInfo("openid")) {
            return true;
        }
        let self               = this;
        let getUserUidModal    = (a, b) => {
            if (self.$store.isShowNetModel) return;
            self.$store.isShowNetModel = true;
            // wx.showModal({
            //     title  : "警告",
            //     content: "网络不通,请更换网络",
            //     success(res) {
            //         self.$store.isShowNetModel = false;
            //         if (res.confirm) {
            //             self.reloadPage();
            //             return a(false);
            //         }
            //         getUserUidModal(a, b);
            //     },
            //     fail() {
            //         self.$store.isShowNetModel = false;
            //     }
            // });
        };
        let getUserIdByCodeMix = (a, b) => {
            if (typeof code === "undefined" || !code) return a(false);
            decryptWxCode(
                {
                    jsCode  : code,
                    appid   : appid,
                    inviteId: ""
                },
                async res => {
                    // 获取失败
                    if (res.statusCode === -1 || res.code * 1 !== 0)
                        return getUserUidModal(a, b);
                    // if (
                    //     getAppUserInfo("uid") &&
                    //     getAppUserInfo("isMerchant") === -1
                    // ) {
                    //     setUserInfo("isMerchant", 1);
                    //     return a(true);
                    // }
                    let data     = res.data;
                    // console.log(res, '解密code');
                    let userInfo = storage("userInfo") || {};
                    // userInfo.uid = data.user.uid;
                    // userInfo.newUser = data.newUser;
                    // userInfo.auth = data.auth;
                    storage("userInfo", data);
                    // 解密成功后, 判断用户是否 新用户, 老用户才根据id查请求
                    if (getAppUserInfo("uid")) {
                        // console.log('老用户根据uid查询信息');
                        a("old");
                    } else {
                        a("new");
                        storage("isNewUser", true);
                    }
                }
            );
        };
        return new Promise((a, b) => {
            getUserIdByCodeMix(a, b);
        });
    },

    /**
     * 获取用户code
     */
    userLogin() {
        return ;
        if (getAppUserInfo("uid")) return;
        // 没有uid且已经换取wxcode
        if (getAppUserInfo("openid")) {
            return true;
        }
        let self        = this;
        let getUserCode = (a, b) => {
            self.$store.getWxLoginCount++;
            let userLoginModal = () => {
                if (self.$store.isShowNetModal) return;
                self.$store.isShowNetModal = true;
                // wx.showModal({
                //     title  : "警告login失败",
                //     content: "网络不通,请更换网络",
                //     success(res) {
                //         self.$store.isShowNetModal = false;
                //         if (res.confirm) return self.reloadPage();
                //         userLoginModal();
                //     },
                //     fail() {
                //         self.$store.isShowNetModal = false;
                //     }
                // });
            };
            if (self.$store.getWxLoginCount > 3) {
                userLoginModal();
                return a(false);
            }
            wx.login({
                timeout: 10000,
                complete(res) {
                    let code = res.code;
                    console.log(res, "wx.login");
                    // 获取微信code成功
                    if (!!code) {
                        return a(code);
                    }
                    getUserCode(a, b);
                    console.log("userLogin失败", res);
                }
            });
        };
        return new Promise((a, b) => {
            getUserCode(a, b);
        });
    }
};

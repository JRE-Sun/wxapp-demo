import {
    deepClone,
    showToast,
    merge,
    storage,
    updateApp,
    diff,
    getAppUserInfo
} from "../../utils/util";
import regeneratorRuntime from "../../utils/runtime-module";
import {http, imgUrl} from "../../utils/config";

let app           = getApp();
let openThreadErr = http.openThreadErr || false;
// 这是每个小程序页面,共有的配置,最后回自动合并到setting中
// 每个页面都会有的共有方法
export default {
    data: {
        imgUrl: imgUrl
    },

    mix: {
        pageScrollTime : false,
        pageScrollTimer: null, // 页面滚动timer
        options        : {}, // 存储options,以备不时之需...
        openingPage    : false, // openingPage 通过转发进来,并且需要打开新页面,正在打开中... true为正在打开
        runOnLoad      : true, // 默认正在运行onLoad,运行完onLoad后才能执行onShow
        isRun          : false, // 判断是否正常走完onLoad和onShow
        goBackTimer    : null, // 页面加载失败,goBack方法的timer
        __event        : {
            pageOnError: ["pageSendErrLog"],
            pageScroll : ["pageOnScroll"]
        }
    },

    /**
     * 根据key获取页面data
     * @param key
     * @return {*}
     */
    getPageData(key) {
        let value = this.data;
        try {
            key.split(".").forEach(n => {
                value = value[n];
            });
        } catch (e) {
            value = void 0;
        }
        return deepClone(value);
    },

    /**
     * 打开新页面
     * @param e
     */
    openPage(e) {
        let dataset = {};
        if (e.currentTarget && e.currentTarget.dataset) {
            dataset = e.currentTarget.dataset;
            // 再打开新页面之前会发送openPage
            this.runEvent("openPage", e);
            wx.navigateTo({
                url: `/pages/${dataset.query}`
            });
        }
    },

    /**
     * 重定向页面
     * @param e
     */
    redirectPage(e) {
        let dataset = {};
        if (e.currentTarget && e.currentTarget.dataset) {
            dataset = e.currentTarget.dataset;
            this.runEvent("redirectPage");
            wx.redirectTo({
                url: `/pages/${dataset.query}`
            });
        }
    },

    /**
     * 事件分发函数(核心功能)
     * @param key
     * @param data
     */
    runEvent(key, data) {
        let runEventList = this.mix.__event;
        if (typeof runEventList === "undefined") return;
        let callBackArray = runEventList[key];
        if (typeof callBackArray === "undefined") return;
        callBackArray.forEach(n => {
            this[n] && this[n](data);
        });
    },

    /**
     * 返回上个页面
     * @param time 单位s,默认1.6s后返回上个页面
     */
    goBack(time = 1600, backNum = 1) {
        this.mix.goBackTimer = setTimeout(() => {
            if (!this.mix.goBackTimer) return;
            wx.navigateBack({
                delta: backNum
            });
        }, time);
    },

    goBackNow() {
        this.goBack(0);
    },

    /**
     * 加载失败,返回上一页
     */
    goError(text = "加载失败") {
        showToast("error", text);
        this.goBack();
    },

    $setData(newData = {}, oldData = this.data) {
        let diffResult = diff(newData, oldData);
        if (Object.keys(diffResult)[0] === "") {
            diffResult = diffResult[""];
        }
        this.setData(diffResult);
    },

    /**
     * 检查是否需要重定向到新页面
     */
    checkedRedirect() {
        return this.mix.hasOwnProperty("redirect") ? this.mix.redirect : false;
    },

    initPage(methods = '') {
        // 取store上数据渲染到data/mix上
        app.store.updateStore(this);
        let delayRun = () => {
            return new Promise((a, b) => {
                setTimeout(() => {
                    this.mix.runOnLoad = false;
                    a();
                }, 30);
            });
        };
        let redirect = async () => {
            await delayRun();
            // 当需要重定向 直接 截断
            if (this.checkedRedirect()) {
                this.openRedirectPage();
                return false;
            }
            return true;
        };
        return new Promise(async (a, b) => {
            if (this.mix.isRun && storage('merchant')) return a(true);
            if (methods === 'show' && this.mix.runOnLoad && storage('merchant')) return a(false);
            if (this.hasOwnProperty("onLoadBefore")) {
                return this.onLoadBefore(async data => {
                    if (!(await this.onDefaultLoad())) return a(false);
                    await delayRun();
                    a(data && redirect());
                });
            }
            let status = await this.onDefaultLoad();
            await delayRun();
            a(status && redirect());
        });
    },

    /**
     * 返回值, a(true)  会继续执行生命周期
     *       a(false)  会截断生命周期
     * @returns {Promise<any>}
     */
    onDefaultLoad() {
        return new Promise(async (a, b) => {
            console.log(this.route, 'onDefaultLoad');
            let login = await this.userActiveLogin();
            console.error("login", login);
            a(login);
        });
    },

    /**
     * 更新组件data
     */
    updateTplData(name, value) {
        let currTplData = this.data[name] || {};
        let tplData     = {};
        tplData[name]   = merge({}, currTplData, value);
        this.$setData(tplData);
    },

    openRedirectPage() {
        if (this.mix.openingPage) return;
        this.mix.openingPage = true;
        setTimeout(() => {
            // 打开新页面前,删除当前页redirect
            delete this.options.redirect;
            this.mix.redirect    = false;
            this.mix.openingPage = false;
        }, 100);
        wx.navigateTo({
            url: this.mix.redirect
        });
    },

    initRedirectData(options) {
        if (!options.hasOwnProperty("redirect")) return;
        this.mix.redirect = true;
        // 分享进来
        let queryStr      = "";
        let queryJson     = {};
        if (options.params) {
            queryJson = JSON.parse(options.params);
            for (let key in queryJson) {
                queryStr = queryStr + key + "=" + queryJson[key] + "&&";
            }
            queryStr = queryStr.substr(0, queryStr.length - 2);
        }
        console.log(
            "/" + options.redirect + (queryStr !== "" ? "?" + queryStr : ""),
            "即将打开的页面路径"
        );
        this.mix.redirect =
            "/" + options.redirect + (queryStr !== "" ? "?" + queryStr : "");
    },

    /**
     * 初始化track数据
     * @param options
     */
    initTrackData(options) {
        if (!options.track) return;
        let track = JSON.parse(options.track);
        delete this.options.track;
        console.log(track, this.route, "track数据");
    },

    /**
     * 通过分享进来
     * @param options
     */
    onLoadShared(options) {
        this.initTrackData(options);
        this.initRedirectData(options);
    },

    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad(options) {
        console.log(this)
        this.mix.options = JSON.parse(JSON.stringify(options));
        // 解析参数 设置对应mix上的key如redirect,track上
        this.onLoadShared(options);
        // 判断 进入页面是否需要其他逻辑,例如必须授权,必须定位等
        if (!(await this.initPage())) return;
        this.mix.isRun = true;
        updateApp();
        console.log(this.route, "onLoad", options);
        showToast();
        this.runEvent("pageOnLoad", options);
        this.onShow('load');
    },

    /**
     * 生命周期函数--监听页面显示
     */
    async onShow(methods = '') {
        // 如果当前正在运行onLoad直接退出onShow
        if (this.mix.runOnLoad) return;
        if (!(await this.initPage('show'))) return;
        // 如果onLoad,onShow周期被截断
        if (!this.mix.isRun) {
            this.runEvent("pageOnLoad", this.options);
            this.runEvent("pageOnShow", this.options);
            this.mix.isRun = true;
            return;
        }
        this.runEvent("pageOnShow");
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        console.log(this.route, "onReady");
        this.runEvent("pageOnReady");
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        console.log(this.route, "onHide");
        this.runEvent("pageOnHide");
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        console.log(this.route, "onUnload");
        clearTimeout(this.mix.pageScrollTimer);
        this.mix.pageScrollTimer = null;
        this.runEvent("pageOnUnload");
        clearTimeout(this.mix.goBackTimer);
        this.mix.goBackTimer = null;
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        console.log(this.route, "onPullDownRefresh");
        this.runEvent('pullDownRefresh');
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        console.log(this.route, "onReachBottom");
        this.runEvent("pageBottomLoad");
    }
};

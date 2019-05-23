import {
    deepClone,
    showToast,
    merge, storage,
    updateApp
} from '../../utils/util';
import regeneratorRuntime from '../../utils/runtime-module';
import {http} from '../../utils/config';

let app           = getApp();
let openThreadErr = http.config || false;
// 这是每个小程序页面,共有的配置,最后回自动合并到setting中
// 每个页面都会有的共有方法
export default {
    data: {},
    mix : {
        options     : {}, // 存储options,以备不时之需...
        openingPage : false, // openingPage 通过转发进来,并且需要打开新页面,正在打开中... true为正在打开
        runOnLoad   : true, // 默认正在运行onLoad,运行完onLoad后才能执行onShow
        isRun       : false, // 判断是否正常走完onLoad和onShow
        consoleCount: 0, // 是否打开调试点击次数,连续点击7次即可打开调试
        isMergeStore: true, // 是否合并 app.store 到页面data里面 => 为了页面上能够访问显示
        goBackTimer : null, // 页面加载失败,goBack方法的timer
        __event     : {
            pageOnError: ['pageSendErrLog']
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
            key.split('.').forEach(n => {
                value = value[n];
            });
        } catch (e) {
            value = void 0;
        }
        return deepClone(value);
    },

    /**
     * 页面上当大图片默认隐藏,当加载完成时才显示
     * @param currentTarget
     */
    defaultLoadImgEvent({currentTarget}) {
        let loadKey = currentTarget.dataset.loadKey;
        let key     = loadKey || 'imgLoaded';
        this.setData({
            [key]: true,
        })
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
            this.runEvent('openPage');
            wx.navigateTo({
                url: `/pages/${dataset.query}`
            })
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
            this.runEvent('redirectPage');
            wx.redirectTo({
                url: `/pages/${dataset.query}`
            })
        }
    },

    /**
     * 预览图片
     * @param e
     */
    previewImages(e) {
        let dataset = e.currentTarget.dataset;
        if (typeof dataset.previewUrls === 'undefined') {
            dataset.previewUrls = [dataset.previewUrl];
        }
        wx.previewImage({
            urls   : dataset.previewUrls,
            current: dataset.previewUrl,
        })
    },

    /**
     * 事件分发函数(核心功能)
     * @param key
     * @param data
     */
    runEvent(key, data) {
        let runEventList = this.mix.__event;
        if (typeof runEventList === 'undefined') return;
        let callBackArray = runEventList[key];
        if (typeof callBackArray === 'undefined') return;
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

    /**
     * 加载失败,返回上一页
     */
    goError(text = '加载失败') {
        showToast('error', text);
        this.goBack();
    },

    /**
     * 设置页面data
     * @param obj
     */
    setPageData(obj = {}) {
        // todo 待解决合并数据通过 diff => 失败一次了
        // let diffObj = {};
        // obj         = util.deepClone(obj);
        // console.log(obj, 'setPageData');
        // Object.keys(obj).forEach(key => {
        //     let newValue = obj[key];
        //     let oldValue = this.data[key];
        //     // page页面上没有 或者 老的值不是 数组或者json
        //     if (typeof oldValue === 'undefined' || typeof oldValue !== 'object' || typeof newValue !== 'object') {
        //         diffObj[`${key}`] = newValue;
        //         return;
        //     }
        //     console.log(key, 'key');
        //     let getDiff = util.formatDataByDiff(key, newValue, oldValue);
        //     console.log('getDiff=>', getDiff);
        //     if (!getDiff) {
        //         diffObj[key] = false;
        //     } else {
        //         console.log(diffObj, getDiff, 'diffObj, getDiff');
        //         diffObj = util.merge(diffObj, getDiff);
        //     }
        //     console.log('diffObj', diffObj);
        // });
        // if (Object.keys(diffObj).length === 0) return;
        // console.log(diffObj, '差异合并diffObj');
        this.setData(obj);
    },

    /**
     * 合并Store到data
     */
    mergeStore() {
        if (!this.checkedStore()) return;
        this.setPageData({
            '$store': app.store
        });
    },

    getStore(key) {
        if (!this.checkedStore()) return false;
        let $store = this.data.$store;
        let data   = '';
        try {
            key.split('.').forEach(n => {
                data = $store[n];
            });
        } catch (e) {
            data = void 0;
        }
        return data;
    },

    checkedStore() {
        // 当禁止合并
        if (!this.mix.isMergeStore) {
            console.log(this.route, '当前页面禁止合并store变量!');
            return false;
        }
        return true;
    },

    /**
     * 设置Store
     * @param obj
     */
    setStore(obj) {
        if (!this.checkedStore()) return;
        // 设置 Store
        app.store = merge({}, app.store, obj);
        this.mergeStore();
    },

    /**
     * 页面注销,删除store里面值
     * @param key
     */
    deleteStoreKey(key = null) {
        if (!key) return;
        try {
            delete app.store[key];
            this.mergeStore();
        } catch (e) {
            console.error(`${this.route}页面onUnLoad时,删除key:${key}失败,出现错误`);
        }
    },

    /**
     * 检查是否需要重定向到新页面
     */
    checkedRedirect() {
        return this.mix.hasOwnProperty('redirect') ? this.mix.redirect : false;
    },

    initPage() {
        this.mergeStore();
        let delayRun = () => {
            this.mix.runOnLoad = false;
        };
        let redirect = () => {
            delayRun();
            // 当需要重定向 直接 截断
            if (this.checkedRedirect()) {
                this.openRedirectPage();
                return false;
            }
            return true;
        };
        return new Promise(async (a, b) => {
            if (this.mix.isRun) {
                return a(true);
            }
            if (this.onLoadBefore) {
                return this.onLoadBefore(data => {
                    delayRun();
                    a(data && redirect());
                })
            }
            delayRun();
            a(redirect());
        })
    },

    /**
     * 更新组件data
     */
    updateTplData(name, value) {
        let currTplData = this.data[name] || {};
        let tplData     = {};
        tplData[name]   = merge({}, currTplData, value);
        this.setData(tplData);
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
        if (!options.hasOwnProperty('redirect')) return;
        this.mix.redirect = true;
        // 分享进来
        let queryStr      = '';
        let queryJson     = {};
        if (options.params) {
            queryJson = JSON.parse(options.params);
            for (let key in queryJson) {
                queryStr = queryStr + key + '=' + queryJson[key] + '&&';
            }
            queryStr = queryStr.substr(0, queryStr.length - 2);
        }
        console.log('/' + options.redirect + (queryStr !== '' ? '?' + queryStr : ''), '即将打开的页面路径');
        this.mix.redirect = '/' + options.redirect + (queryStr !== '' ? '?' + queryStr : '');
    },

    /**
     * 初始化track数据
     * @param options
     */
    initTrackData(options) {
        if (!options.track) return;
        let track = JSON.parse(options.track);
        delete this.options.track;
        console.log(track, this.route, 'track数据');
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
        this.mix.options = JSON.parse(JSON.stringify(options));
        // 解析参数 设置对应mix上的key如redirect,track上
        this.onLoadShared(options);
        // 判断 进入页面是否需要其他逻辑,例如必须授权,必须定位等
        if (!await this.initPage()) return;
        this.mix.isRun = true;
        updateApp();
        console.log(this.route, 'onLoad', options);
        this.runEvent('pageOnLoad', options);
        openThreadErr && this.pageSendErrLog();
        this.onShow();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    async onShow() {
        // 如果当前正在运行onLoad直接退出onShow
        if (this.mix.runOnLoad) return;
        console.log(this.route, 'onShow');
        if (!await this.initPage()) return;
        // 如果onLoad,onShow周期被截断
        if (!this.mix.isRun) {
            this.runEvent('pageOnLoad', this.options);
            this.runEvent('pageOnShow', this.options);
            this.mix.isRun = true;
            return;
        }
        this.runEvent('pageOnShow');
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        console.log(this.route, 'onReady');
        this.runEvent('pageOnReady');
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        console.log(this.route, 'onHide');
        this.runEvent('pageOnHide');
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        console.log(this.route, 'onUnload');
        this.runEvent('pageOnUnload');
        clearTimeout(this.mix.goBackTimer);
        this.mix.goBackTimer = null;
        if (openThreadErr) {
            clearTimeout(this.mix.pageErrTimer);
            this.mix.pageErrTimer = null;
        }
    },

    /**
     * 打开调试
     */
    openConsole(time = null) {
        this.mix.consoleCount++;
        if (this.mix.consoleCount === 7) {
            console.error('打开调试');
            storage('_debug', true, !!time ? time : 30 * 60);
            wx.setEnableDebug({
                enableDebug: true
            })
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        console.log(this.route, 'pagePullDownRefresh');
        this.runEvent('pagePullDownRefresh');
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log(this.route, 'onReachBottom');
        this.runEvent('pageBottomLoad');
    },
};
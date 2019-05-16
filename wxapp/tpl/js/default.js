let util          = require('../../utils/util');
let openThreadErr = require('../../utils/config').http.config || false;
let app           = getApp();
// 这是每个小程序页面,共有的配置,最后回自动合并到setting中

// 每个页面都会有的共有方法
module.exports = {
    data: {},
    mix : {
        consoleCount: 0, // 是否打开调试点击次数,连续点击7次即可打开调试
        isMergeStore: false, // 是否合并 app.store 到页面data里面 => 为了页面上能够访问显示
        goBackTimer : null, // 页面加载失败,goBack方法的timer
        share       : true, // 默认页面能够分享
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
        return util.deepClone(value);
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
        util.showToast('error', text);
        this.goBack();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.mergeStore();
        console.log('onShow');
        this.runEvent('pageOnShow');
    },

    /**
     * 设置页面data
     * @param obj
     */
    setPageData(obj = {}) {
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

    checkedStore() {
        // 当禁止合并
        if (!this.mix.isMergeStore) {
            console.log('当前页面禁止合并store变量!');
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
        app.store = util.merge(app.store, obj);
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
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.mergeStore();
        console.log('onLoad', options);
        this.onLoadShared(options);
        this.runEvent('pageOnLoad', options);
        openThreadErr && this.pageSendErrLog();
    },

    /**
     * 更新混合mix数据
     * @param key
     * @param value
     */
    updateMixData(key, value) {
        let mixData   = this.mix[key] || {};
        this.mix[key] = util.merge(mixData, value);
    },

    /**
     * 更新组件data
     */
    updateTplData(name, value) {
        let currTplData = this.data[name] || {};
        let tplData     = {};
        tplData[name]   = util.merge(currTplData, value);
        this.setData(tplData);
    },

    /**
     * 通过分享进来
     * @param options
     */
    onLoadShared(options) {
        // 分享进来
    },

    /**
     * 加载图片,用于canvas画图
     * @param imgPath
     * @return {Promise<any>}
     */
    loadImg(imgPath) {
        return new Promise((a, b) => {
            wx.downloadFile({
                url    : imgPath,
                success: function (res) {
                    if (res.statusCode === 200) {
                        a(res.tempFilePath);
                    }
                }
            });
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.runEvent('pageOnReady');
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.runEvent('pageOnHide');
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
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
            util.storage('_debug', true, !!time ? time : 30 * 60);
            wx.setEnableDebug({
                enableDebug: true
            })
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.runEvent('pagePullDownRefresh');
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.runEvent('pageBottomLoad');
    },
};
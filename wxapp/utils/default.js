let util = require('./util');

// 这是每个小程序页面,共有的配置,最后回自动合并到setting中

// 每个页面都会有的共有方法
module.exports = {
    data: {},
    mix : {
        goBackTimer: null, // 页面加载失败,goBack方法的timer
        share      : true, // 默认页面能够分享
    },
    openPage(e) {
        let dataset = {};
        if (e.currentTarget && e.currentTarget.dataset) {
            dataset = e.currentTarget.dataset;
            wx.navigateTo({
                url: `/pages/${dataset.query}`
            })
        }
    },

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

    runEvent(key, data) {
        let runEventList = this.mix.__event;
        if (typeof runEventList === 'undefined') return;
        let callBackArray = runEventList[key];
        if (typeof callBackArray === 'undefined') return;
        callBackArray.forEach(n => {
            this[n] && this[n](data);
        });
    },

    goBack(time = 1600) {
        let timer = setTimeout(() => {
            if (!this.mix.goBackTimer) return;
            wx.navigateBack();
        }, time);

        this.mix.goBackTimer = timer;
    },

    /**
     * 生命周期函数--监听页面显示
     */

    onShow() {
        console.log('onShow');
        this.runEvent('pageOnShow');
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log('onLoad', options);
        this.runEvent('pageOnLoad', options);
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
    onHide  : function () {
        this.runEvent('pageOnHide');
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        this.runEvent('pageOnUnload');
        clearTimeout(this.mix.goBackTimer);
        this.mix.goBackTimer = null;
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.runEvent('pageBottomLoad');
    },
};
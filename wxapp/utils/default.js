let util = require('./util');

// 这是每个小程序页面,共有的配置,最后回自动合并到setting中

// 每个页面都会有的共有方法
module.exports = {
    data: {

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

    storage(key, data = null) {
        if (data === null) {
            try {
                data = wx.getStorageSync(key);
            } catch (e) {
                data = false;
            }
            return data;
        }

        try {
            wx.setStorageSync(key, data);
        } catch (e) {
            console.log('缓存失败');
        }
    },

    previewImages(e) {
        let dataset = e.currentTarget.dataset;
        wx.previewImage({
            urls: dataset.previewUrls,
            current: dataset.previewUrl,
        })
    },
    runEvent(key, data) {
        let runEventList = this.data.runEvent;
        if (typeof runEventList === 'undefined') return;
        let callBackArray = runEventList[key];
        if (typeof callBackArray === 'undefined') return;
        callBackArray.forEach(n => {
            this[n] && this[n](data);
        });
    },

    goBack(time = 1600) {
        setTimeout(() => {
            wx.navigateBack();
        }, time);
    },

    /**
     * 转换 腾讯坐标->百度坐标,并且保留小数点后六位
     * @return {*}
     */
    formatLocation(location) {
        let options = null;
        let { latitude, longitude } = location;
        if (typeof latitude !== 'undefined' && typeof longitude !== 'undefined') {
            options = util.tencent2baidu(latitude, longitude);
            options = {
                longitude: Math.ceil(options.longitude * 1000000) / 1000000,
                latitude: Math.ceil(options.latitude * 1000000) / 1000000,
            };
        }
        return options;
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
     * 更新组件data
     */
    updateTplData(name, value) {
        let currTplData = this.data[name] || {};
        let tplData = {};
        tplData[name] = util.merge(currTplData, value);
        this.setData(tplData);
    },

    /**
     * 获取元素的宽高top之类的属性
     * @param {*} select 
     */
    querySelector(select) {
        let query = wx.createSelectorQuery();
        query.select(select).boundingClientRect();
        return new Promise((a, b) => {
            query.exec(res => {
                a(res[0]);
            })
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        this.runEvent('pageOnReady');
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        this.runEvent('pageOnHide');
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        this.runEvent('pageBottomLoad');
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(res) {
        let pages = getCurrentPages();
        let currPage = pages[pages.length - 1];
        let currPageUrl = currPage.route;
        return {
            title: '标题',
            path: '/' + currPageUrl
        }
    }
};
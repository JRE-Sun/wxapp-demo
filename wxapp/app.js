let util = require('./utils/util');
//app.js
App({
    onLaunch  : function () {

    },
    globalData: {},
    storage(key, data = null) {
        if (data === null) {
            try {
                data = wx.getStorageSync(key) || false;
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
    /**
     * 转换 腾讯坐标->百度坐标,并且保留小数点后六位
     * @return {*}
     */
    formatLocation(location) {
        let options               = null;
        let {latitude, longitude} = location;
        if (typeof latitude !== 'undefined' && typeof longitude !== 'undefined') {
            options = util.tencent2baidu(latitude, longitude);
            options = {
                longitude: Math.ceil(options.longitude * 1000000) / 1000000,
                latitude : Math.ceil(options.latitude * 1000000) / 1000000,
            };
        }
        return options;
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
})
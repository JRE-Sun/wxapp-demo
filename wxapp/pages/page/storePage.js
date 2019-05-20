let xapp               = require('../../utils/xapp');
// 让小程序支持es7 async/asait,如果不用可以不引入
let regeneratorRuntime = require('../../utils/runtime-module');
let app                = getApp();
let util               = require('../../utils/util');
let setting            = {
    data: {
        showDom: false,
    },
    // mix 是页面混合数据,里面存放不需要在页面上渲染的数据
    mix : {
        isMergeStore: true, // 开启合并store
        __event     : {
            pageOnLoad: ['storeOnLoad']
        }
    },
    storeOnLoad() {
        app.globalData.a = app.globalData.a + 1;

        setTimeout(() => {
            this.setPageData({
                showDom: true,
            })
            console.log(app.globalData.a)
        }, 3000);
    },
    storeAddClickCount() {
        let count = this.getPageData('$store.count');
        console.error(count, 'count')
        if (!count) count = 0;
        count++;
        console.error(count);
        this.setStore({
            count,
        });
    },

    /**
     *  返回true 不会截断
     *  返回false 会截断本来的生命周期不会触发pageOnLoad/pageOnShow
     * @param callback
     */
    async onLoadBefore(callback) {
        if (this.getStore('isLogin')) {
            console.log(this.route, this.getStore('isLogin'));
            callback(true);
            return;
        }
        util.showToast('loading', '跳转登录中');
        // 模拟异步的 登录 / 定位 获取城市
        console.log('模拟异步的 登录 / 定位 获取城市')
        wx.navigateTo({
            url: `/pages/page/share`
        })
        util.hideToast();
        callback(false);
    },
};

// 如果页面不需要其他组件,直接 xapp.runPage(setting);
xapp.runPage(setting);
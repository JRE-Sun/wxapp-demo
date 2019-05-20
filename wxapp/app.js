let util = require('./utils/util');
//app.js
App({

    /**
     * 小程序打开,只执行一次
     * @param e
     */
    onLaunch: function (e) {
        // 检查是否为Debug模式,来动态显示隐藏console
        util.checkDebug();
    },

    onShow({scene}) {
        console.error(scene, 'app onshow options')
    },

    globalData: {
        isLogin: false,
    },

    store: {}, // 页面间传参,或者所谓的全局缓存
})
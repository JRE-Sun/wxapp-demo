//app.js
App({
    /**
     * 小程序打开,只执行一次
     * @param e
     */
    onLaunch: function (e) {

    },

    onShow({scene}) {
        console.error(scene, "app onshow options");
    },

    globalData: {},

    store: {
        count: 0,
    } // 页面间传参,或者所谓的全局缓存
});

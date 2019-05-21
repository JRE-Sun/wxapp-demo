import xapp from '../../utils/xapp';
// 让小程序支持es7 async/asait,如果不用可以不引入
import regeneratorRuntime from '../../utils/runtime-module';
import {showToast,hideToast} from '../../utils/util';

let app     = getApp();
let setting = {
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
        let self = this;
        if (this.getStore('isLogin')) {
            console.log(this.route, this.getStore('isLogin'));
            callback(true);
            return;
        }
        // if (await util.getLocationSet() === false) {
        //     console.error('用户拒绝定位');
        //     self.setStore({
        //         isLogin: '用户拒绝定位',
        //     });
        //     callback(true);
        //     return;
        // }
        // util.showToast('loading', '定位中');
        // // 模拟异步的 登录 / 定位 获取城市
        // wx.getLocation({
        //     type: 'wgs84',
        //     success(res) {
        //         util.hideToast();
        //         self.setStore({
        //             isLogin: JSON.stringify(res),
        //         });
        //         callback(true);
        //     },
        //     fail() {
        //         util.hideToast();
        //         self.setStore({
        //             isLogin: '获取定位失败',
        //         });
        //         callback(true);
        //     }
        // })

        if (this.getStore('isLogin')) {
            console.log(this.route, this.getStore('isLogin'));
            callback(true);
            return;
        }
        showToast('loading', '跳转登录中');
        // 模拟异步的 登录 / 定位 获取城市
        console.log('模拟异步的 登录 / 定位 获取城市')
        wx.navigateTo({
            url: `/pages/page/share`
        })
        hideToast();
        callback(false);
    },
};

// 如果页面不需要其他组件,直接 xapp.runPage(setting);
xapp.runPage(setting);
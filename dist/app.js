import Store from './utils/store';
import {storage} from "./utils/util";

let debug = storage('_debug');
let store = new Store({a: 1, debug});
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

    store, // 页面间传参,或者所谓的全局缓存
});

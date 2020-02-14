import xapp from "../../utils/xapp";
// 让小程序支持es7 async/asait,如果不用可以不引入
import regeneratorRuntime from "../../utils/runtime-module";

let app     = getApp();
let setting = {
    name    : 'page/index/index',
    // store   : ['a'],
    mixStore: ['','a'],
    data    : {},
    // mix 是页面混合数据,里面存放不需要在页面上渲染的数据
    mix     : {
        __event: {
            pageOnLoad: ["indexOnLoad"],
            pageOnShow: ['indexOnShow']
        }
    },
    indexOnShow() {
        console.log("执行页面onshow事件!");
    },
    indexOnLoad() {
        console.log("执行页面onLoad事件!");
    },
};

// 如果页面不需要其他组件,直接 xapp.runPage(setting);
xapp.runPage(setting);

let xapp               = require('../../utils/xapp');
// 让小程序支持es7 async/asait,如果不用可以不引入
let regeneratorRuntime = require('../../utils/runtime-module');

let setting = {
    data: {},
    // mix 是页面混合数据,里面存放不需要在页面上渲染的数据
    mix : {
        __event: {
            pageOnLoad: ['indexOnLoad'],
        }
    },
    indexOnLoad() {
        console.log('执行页面onLoad事件!');
    }
};

// 如果页面不需要其他组件,直接 xapp.runPage(setting);
xapp.runPage(setting);
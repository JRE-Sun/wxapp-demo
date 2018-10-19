let xapp               = require('../../utils/xapp');
let tplArray           = ['test','a']; // 该页面所需要引入的组件
// 让小程序支持es7 async/asait,如果不用可以不引入
let regeneratorRuntime = require('../../utils/runtime-module');

let setting = {
    data: {
        runEvent          : {
            pageOnLoad: ['indexOnLoad'],
        }
    },
    indexOnLoad() {
      console.log('执行页面onLoad事件!');
    }
};

// 如果页面不需要其他组件,直接 xapp.runPage(setting);
xapp.runPage(setting, tplArray);
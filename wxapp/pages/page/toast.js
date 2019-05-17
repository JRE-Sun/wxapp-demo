let xapp               = require('../../utils/xapp');
// 让小程序支持es7 async/asait,如果不用可以不引入
let regeneratorRuntime = require('../../utils/runtime-module');

let util = require('../../utils/util');

let setting = {
    data: {},
    showMyToast({currentTarget}) {
        let {type, text} = currentTarget.dataset;
        util.showToast(type, text);
    },

    b() {
        this.goBack(0);
    },

    f() {
        this.goError();
    },

    goPrePage() {
        this.goBack();
    },
};

// 如果页面不需要其他组件,直接 xapp.runPage(setting);
xapp.runPage(setting);
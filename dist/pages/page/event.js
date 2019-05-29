import xapp from '../../utils/xapp';
// 让小程序支持es7 async/asait,如果不用可以不引入
import regeneratorRuntime from '../../utils/runtime-module';

let setting = {
    data: {
        msg: '我是event页面上的msg变量....'
    },
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
// 该页面所需要引入的组件
// 如果页面不需要其他组件,直接 xapp.runPage(setting);
xapp.runPage(setting, ['b', 'a']);
let xapp               = require('../../utils/xapp');
// 让小程序支持es7 async/asait,如果不用可以不引入
let regeneratorRuntime = require('../../utils/runtime-module');
let util               = require('../../utils/util');
let setting            = {
    data: {
        shareMenu: true,
    },
    mix : {
        // share: {
        //     insert: '', // 页面分享是否 需要插入前缀 路径
        //     title : '', // 分享标题
        //     img   : '', // 分享图
        //     path  : '', // 分享路径
        //     query : '', // 分享参数, 分享路径和分享参数拼接在一起最后会形成 path-query=>page/index/home?b=1
        //     track : '', // 追踪信息,是单独在最外面
        // },
        __event: {
            pageOnLoad: ['shareOnLoad']
        }
    },
    shareOnLoad() {
        this.setShareData({
            title : '我是测试标题',
            insert: 'index/g',
            query : {
                id: 98
            },
            track : {
                cateID : 1,
                goodsId: 2
            }
        });
    },
    changeRightTopShare({currentTarget}) {
        let dataset = currentTarget.dataset;
        this.setShareData({
            ...dataset
        });
    },
    changeShareMenu() {
        let shareMenu = !this.getPageData('shareMenu');
        this.setPageData({
            shareMenu,
        })
        if (shareMenu) {
            util.showShareMenu();
            return;
        }
        util.hideShareMenu();
    },
};

// 如果页面不需要其他组件,直接 xapp.runPage(setting);
xapp.runPage(setting);
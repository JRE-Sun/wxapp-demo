let xapp               = require('../../utils/xapp');
// 让小程序支持es7 async/asait,如果不用可以不引入
let regeneratorRuntime = require('../../utils/runtime-module');

let util = require('../../utils/util');

let setting = {
    data: {
        isImgLoad      : false,
        imgList        : [
            'http://pic40.nipic.com/20140412/18428321_144447597175_2.jpg',
            'http://k.zol-img.com.cn/sjbbs/7692/a7691515_s.jpg'
        ],
        downloadImgPath: false,
    },

    saveImg() {
        let path = this.getPageData('downloadImgPath');
        if (!path) return util.showToast('error','请先下载图片');
        util.saveImageToAlbum(path);
    },

    downloadImgs({currentTarget}) {
        util.showToast('loading', '下载中');
        util.downloadImg(currentTarget.dataset.url, res => {
            if (!res) {
                util.showToast('error', '下载失败');
                return;
            }
            util.showToast('success', '下载成功');
            this.setPageData({
                downloadImgPath: res.savedFilePath
            })
        });
    },

};

// 如果页面不需要其他组件,直接 xapp.runPage(setting);
xapp.runPage(setting);
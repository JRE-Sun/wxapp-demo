import regeneratorRuntime from "../utils/runtime-module";

/**
 * 重新加载页面
 */
const reloadPage = () => {
    this.mix.openingPage = false;
    this.mix.runOnLoad   = true;
    this.mix.isRun       = false;
    this.onLoad(this.mix.options);
};

/**
 * 页面上当大图片默认隐藏,当加载完成时才显示
 * @param currentTarget
 */
const defaultLoadImgEvent = ({currentTarget}) => {
    let loadKey = currentTarget.dataset.loadKey;
    let key     = loadKey || "imgLoaded";
    this.$setData({
        [key]: true
    });
};

/**
 * 图片懒加载
 */
const imgLazyLoad = async (scrollTop) => {
    let lazyImg = await querySelectorAll(".img-lazy-load");
    if (lazyImg.length === 0) return;
    let setObj   = {};
    let lazyLoad = this.data.lazyLoad || {};
    lazyImg.forEach(n => {
        if (lazyLoad[n.dataset.lazyKey]) return;
        setObj[n.dataset.lazyKey] = n.top <= scrollTop + 300;
    });
    lazyLoad = merge({}, lazyLoad, setObj);
    this.$setData({
        lazyLoad
    });
};

/**
 * 预览图片
 * @param e
 */
const previewImages = (e) => {
    let dataset = e.currentTarget.dataset;
    if (typeof dataset.previewUrls === "undefined") {
        dataset.previewUrls = [dataset.previewUrl];
    }
    wx.previewImage({
        urls   : dataset.previewUrls,
        current: dataset.previewUrl
    });
};

/**
 * 拨打电话
 */
const callPhone = ({currentTarget}) => {
    wx.makePhoneCall({
        phoneNumber: currentTarget.dataset.phone
    })
};

/**
 * 页面滚动事件
 * @param e
 */
const onPageScroll = (e) => {
    let currTime       = new Date().getTime();
    let pageScrollTime = this.mix.pageScrollTime;
    if (!pageScrollTime) {
        this.mix.pageScrollTime = pageScrollTime = currTime;
    }

    let run = () => {
        clearTimeout(this.mix.pageScrollTimer);
        this.mix.pageScrollTimer = null;
        this.mix.pageScrollTime  = currTime;
        this.runEvent("pageScroll", e.scrollTop);
    };

    if (!this.mix.pageScrollTimer) {
        this.mix.pageScrollTimer = setTimeout(() => {
            run();
        }, 800);
    }

    // 如果两次滚动之间时间小于300ms,不变化
    if (currTime - pageScrollTime < 400) return;
    run();
};

export default {
    'page/index/index': {
        defaultLoadImgEvent,
        callPhone
    }
}
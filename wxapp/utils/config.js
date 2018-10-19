module.exports = (() => {
    const IS_DEBUG = true;
    let url        = IS_DEBUG ? '开发环境地址' : '线上地址';
    return {
        appid      : '',
        ajaxBaseURL: url + '',
        baseURL    : url,
        ak         : '', // 百度地图apk
        aLaApk     : '', // 阿拉丁apk
        IS_DEBUG   : IS_DEBUG
    }
})();
export const appid = ""; // 小程序appid

export const apk = ""; // 百度apk等等...

export const host1 = 'http://192.168.1.210:8080/ww/'; // host1-api.js 所有接口的前缀url

// 开发版:develop 正式版:release  体验版:trial
export const appVersion = "release";

export const share = {
    title: "wxapp分享", // 默认分享标题
    img  : "...没图" // 默认分享图
};

export const http = {
    // 配置thread.js => http => 以下所有参数都为选填
    baseURL  : "", // 所有请求自动增加的前缀
    maxNum   : 5, // 请求的最大并发数
    timeout  : 10000, // 请求单次超时时间
    dataType : "json",
    cacheTime: 5 * 60, // 如果请求设置了缓存,生效 秒
    headers  : {"Content-Type": "application/x-www-form-urlencoded"},
    log      : true, // 是否打印请求console => 默认false
    token    : false, // 默认请求需要token
};


module.exports = {

    log: true, // true => 打印log信息, false => 关闭log信息

    appid: '', // 小程序appid

    apk: '', // 百度apk等等...

    host1: 'http://www.baidu.com/', // host1-api.js 所有接口的前缀url

    host2: 'http://www.souhu.com/', // host2-api.js 所有接口的前缀url

    share: {
        title: 'wxapp分享', // 默认分享标题
        img  : 'dfghjkl', // 默认分享图
    },

    http: { // 配置thread.js => http => 以下所有参数都为选填
        baseURL      : '', // 所有请求自动增加的前缀
        maxNum       : 5, // 请求的最大并发数
        timeout      : 10000, // 请求单次超时时间
        dataType     : 'json',
        cacheTime    : 5 * 60, // 如果请求设置了缓存,生效 秒
        headers      : {},
        log          : true, // 是否打印请求console => 默认false
        openThreadErr: true, // 是否打开请求失败,发送错误日志 => 默认false
    },

    threadErr: { // 配置thread.js => threadErrLog => 错误日志
        api    : 'api/log',
        options: {
            baseURL: 'www.baidu.com/',
            headers: {},
        },
    }
};
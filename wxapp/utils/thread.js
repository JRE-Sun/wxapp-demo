/**
 * 拥有ajax请求并发管理的http模块
 * @type {*|global.regeneratorRuntime}
 */
import regeneratorRuntime from './runtime-module';
import {storage} from './util';
import miment from './miment';
import {http} from './config';

let app           = getApp();
let openThreadErr = http.openThreadErr || false; // 是否发送错误日志
let log           = http.log || false; // 是否打印请求console

/**
 * 错误日志
 */
export const threadErr = {
    add(method, msg, data = '') {
        let errLogList = this.getErrLogList();
        let isHasLog   = false;
        errLogList.forEach(n => {
            if (method === n.method) {
                isHasLog = true;
            }
        });

        !isHasLog && errLogList.push({
            method,
            msg,
            data
        });
        storage('errLogList', errLogList);
        // this.run();
    },
    getErrLogList() {
        // 缓存的错误日志
        return storage('errLogList') || [];
    },

    getNetworkType() {
        return new Promise((a, b) => {
            wx.getNetworkType({
                success(res) {
                    a(res.networkType !== 'none');
                },
                fail() {
                    a(false);
                }
            });
        });
    },

    isEmptyObject(obj) {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            return false;
        }
        return (JSON.stringify(obj) === '{}')
    },

    async sendErrLog() {
        let self = this;
        // 用户当前没网,不发送日志
        if (!await this.getNetworkType()) return;
        let errLogList = this.getErrLogList();
        if (!errLogList || errLogList.length === 0) return;
        let currErrLog   = errLogList.shift();
        // httpThread.config.baseURL = 'http://192.168.2.238/jfmmnear/';
        let isNormalJson = false;
        let msg          = currErrLog.msg;
        for (let key in msg) {
            isNormalJson = true;
        }

        if (isNormalJson) {
            msg = JSON.stringify(msg);
        }

        if (this.isEmptyObject(msg)) {
            msg = '';
        }

        Http.post({
            url    : config.threadErr.api,
            data   : {
                message   : JSON.stringify(currErrLog.data) + '---|---' + msg.substr(0, 1000),
                methodName: currErrLog.method || 'currErrLog.method取不到或为空',
                uid       : currErrLog.uid,
            },
            callback(res) {
                if (res.code === 0) {
                    storage('errLogList', errLogList);
                    self.run();
                }
            },
            options: {...config.threadErr.options}
        });
    },

    async run() {
        // 用户当前没网,不发送日志
        if (!await this.getNetworkType()) return;
        this.sendErrLog();
    }
};

export const Http = {
    config  : {
        maxNum   : config.http.maxNum || 5, // 最大并发数
        timeout  : config.http.timeout || 14000, // 14s
        baseURL  : config.http.baseURL || '', // 路径前缀
        dataType : config.http.dataType || 'json',
        cacheTime: config.http.cacheTime || 5 * 60,
        busyNum  : 0, // 繁忙数
        headers  : config.http.headers || {'Content-Type': 'application/x-www-form-urlencoded'},
    },
    httpList: [], // http请求队列
    post({url = null, data = null, callback = null, options = {},} = {}) {
        log && console.log(`${url}加入队列时间:${miment().format('YYYY/MM/DD hh-mm-ss SSS')}`);
        // 插入队列
        this.httpList.push({
            url, data, callback, options, info: {
                groupIn: miment().format('YYYY/MM/DD hh-mm-ss SSS'),
            }
        });
        // 插入队列后,立即运行
        this.run();
    },
    get({url = null, data = null, callback = null, options = {}} = {}) {
        options.method = 'get';
        this.httpList.push({
            url, data, callback, options, info: {
                groupIn: miment().format('YYYY/MM/DD hh-mm-ss SSS'),
            }
        });
        this.run();
    },
    async run() {
        app.networkChangeEvent();
        // 判断当前繁忙的请求数
        // 当 当前运行的 请求大于 maxNum return
        if (this.config.maxNum <= this.config.busyNum) return;
        // 发送http请求
        let length = this.config.maxNum - this.config.busyNum;
        for (let i = 0; i < length; i++) {
            if (this.httpList.length === 0) return;
            let options           = this.httpList.shift();
            let count             = options.options.count;
            options.options.count = typeof count === 'undefined' ? 0 : (count + 1);
            ++this.config.busyNum;
            options.info.groupOut = miment().format('YYYY/MM/DD hh-mm-ss SSS');
            this.request(options.url, options.data, options.options, options.callback, options.info);
            this.run();
        }
    },
    isFunction(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]'
    },

    eq(a, b, aStack, bStack) {

        // === 结果为 true 的区别出 +0 和 -0
        if (a === b) return a !== 0 || 1 / a === 1 / b;

        // typeof null 的结果为 object ，这里做判断，是为了让有 null 的情况尽早退出函数
        if (a == null || b == null) return false;

        // 判断 NaN
        if (a !== a) return b !== b;

        // 判断参数 a 类型，如果是基本类型，在这里可以直接返回 false
        var type = typeof a;
        if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;

        // 更复杂的对象使用 deepEq 函数进行深度比较
        return this.deepEq(a, b, aStack, bStack);
    },

    deepEq(a, b, aStack, bStack) {

        // a 和 b 的内部属性 [[class]] 相同时 返回 true
        var className = Object.prototype.toString.call(a);
        if (className !== Object.prototype.toString.call(b)) return false;

        switch (className) {
            case '[object RegExp]':
            case '[object String]':
                return '' + a === '' + b;
            case '[object Number]':
                if (+a !== +a) return +b !== +b;
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                return +a === +b;
        }

        var areArrays = className === '[object Array]';
        // 不是数组
        if (!areArrays) {
            // 过滤掉两个函数的情况
            if (typeof a != 'object' || typeof b != 'object') return false;

            var aCtor = a.constructor,
                bCtor = b.constructor;
            // aCtor 和 bCtor 必须都存在并且都不是 Object 构造函数的情况下，aCtor 不等于 bCtor， 那这两个对象就真的不相等啦
            if (aCtor == bCtor && !(this.isFunction(aCtor) && aCtor instanceof aCtor && this.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
                return false;
            }
        }


        aStack     = aStack || [];
        bStack     = bStack || [];
        var length = aStack.length;

        // 检查是否有循环引用的部分
        while (length--) {
            if (aStack[length] === a) {
                return bStack[length] === b;
            }
        }

        aStack.push(a);
        bStack.push(b);

        // 数组判断
        if (areArrays) {

            length = a.length;
            if (length !== b.length) return false;

            while (length--) {
                if (!this.eq(a[length], b[length], aStack, bStack)) return false;
            }
        }
        // 对象判断
        else {

            var keys = Object.keys(a),
                key;
            length   = keys.length;

            if (Object.keys(b).length !== length) return false;
            while (length--) {

                key = keys[length];
                if (!(b.hasOwnProperty(key) && this.eq(a[key], b[key], aStack, bStack))) return false;
            }
        }

        aStack.pop();
        bStack.pop();
        return true;

    },
    request(url, data, options, callback, info) {
        let self = this;
        return new Promise((a, b) => {
            let httpCacheList = storage('http_cache_list') || [];
            if (options.cache === true && typeof httpCacheList[url] !== 'undefined') {
                if (self.eq(httpCacheList[url].data, data)) {
                    log && console.log(url + '从缓存读取数据');
                    callback && callback(httpCacheList[url].res);
                    --self.config.busyNum;
                    self.run();
                    a();
                    return;
                }
                delete httpCacheList[url];
            }
            // 如果优先服务器,删除该url下缓存
            if (options.cache === false) {
            }
            info.start  = miment().format('YYYY/MM/DD hh-mm-ss SSS');
            let oldTime = Date.now();
            log && console.log(url, data, miment().format('YYYY/MM/DD hh-mm-ss SSS'), '发送');
            let currRequest = wx.request({
                method      : options.method || 'post',
                url         : (options.baseURL || this.config.baseURL) + url,
                dataType    : options.dataType || this.config.dataType,
                header      : options.headers || this.config.headers,
                responseType: options.responseType || 'text',
                data        : data || {},
                success(res) {
                    log && console.log(url, data, miment().format('YYYY/MM/DD hh-mm-ss SSS'), Date.now() - oldTime, '接收');
                    clearTimeout(timer);
                    timer = null;
                    // currRequest && currRequest.abort();
                    --self.config.busyNum;
                    if (res.statusCode === 200) {
                        log && console.log(url, data, res, miment().format('YYYY/MM/DD hh-mm-ss SSS'), '接收状态200');
                        // 当没有配置cache,不缓存
                        // 当配置cache为true, 优先使用缓存,
                        // 当配置cache为false,有限使用服务器,然后缓存
                        // 默认缓存5分钟
                        if (typeof options.cache !== 'undefined') {
                            let httpCacheList = storage('http_cache_list') || {};
                            delete options.count;
                            httpCacheList[url] = {
                                data,
                                options,
                                res: res.data
                            };
                            storage('http_cache_list', httpCacheList, options.cacheTime || self.config.cacheTime);
                        }
                        callback && callback(res.data);
                        self.run();
                        a(res.data);
                        return;
                    }
                    let errorData = {
                        statusCode   : -1,
                        statusMessage: res.errMsg
                    };
                    openThreadErr && threadErr.add(url, res, data);
                    log && console.error(url, data, res, miment().format('YYYY/MM/DD hh-mm-ss SSS'), '接收状态非200');
                    callback && callback(errorData);
                    self.run();
                    a(errorData)
                },
                fail(res) {
                    log && console.error(url, data, miment().format('YYYY/MM/DD hh-mm-ss SSS'), '接收失败', res);
                    if (res.errMsg.search(/abort/ig) > -1) return;
                    openThreadErr && threadErr.add(url, res, data);
                    clearTimeout(timer);
                    timer = null;
                    --self.config.busyNum;
                    let errorData = {
                        statusCode   : -1,
                        statusMessage: res.errMsg
                    };
                    callback && callback(errorData);
                    self.run();
                    a(errorData)
                }
            });
            let timer       = setTimeout(() => {
                if (!timer) return;
                currRequest && currRequest.abort && currRequest.abort();
                --this.config.busyNum;

                let errorData = {statusCode: -1, statusMessage: '连接超时'};
                // 如果首次超时
                if (options.count === 0) {
                    log && console.error('第一次超时', url);
                    options.count += 1;
                    let method = options.method ? options.method : 'post';
                    method === 'post' && this.post({url, data, options, callback});
                    method === 'get' && this.get({url, data, options, callback});
                    // errorData.statusCode = -2;
                    // callback && callback(errorData);
                    this.run();
                    a(errorData);
                    return;
                }
                // 第二次超时
                log && console.error('第二次超时', url);
                info.timeout = miment().format('YYYY/MM/DD hh-mm-ss SSS');
                log && console.error(url, data, miment().format('YYYY/MM/DD hh-mm-ss SSS'), '接收超时');
                openThreadErr && threadErr.add(url, {msg: '请求超时', info}, data);
                callback && callback(errorData);
                this.run();
                a(errorData);
            }, this.config.timeout);
        });
    },
};
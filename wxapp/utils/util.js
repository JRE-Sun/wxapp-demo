let _                  = require('./lodash.min');
let app                = getApp();
let {log}              = require('./config');
let regeneratorRuntime = require('./runtime-module');
let util               = {};

util._     = _;
util.merge = _.merge;

/**
 * 腾轩转百度
 * @param latitude
 * @param longitude
 * @return {{longitude: (number|*), latitude: (number|*)}}
 */
util.tencent2baidu = (latitude, longitude) => {
    let x_pi  = 3.14159265358979324 * 3000.0 / 180.0;
    let x     = longitude;
    let y     = latitude;
    let z     = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    let lngs  = z * Math.cos(theta) + 0.0065;
    let lats  = z * Math.sin(theta) + 0.006;
    return {
        longitude: lngs,
        latitude : lats,
    };
};

/**
 * 百度经纬度坐标转换腾讯坐标
 */
util.badidu2tencent = (lat, lng) => {
    let x_pi  = 3.14159265358979324 * 3000.0 / 180.0;
    let x     = lng * 1 - 0.0065, y = lat * 1 - 0.006;
    let z     = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    lng       = z * Math.cos(theta);
    lat       = z * Math.sin(theta);
    return {
        longitude: lng,
        latitude : lat
    }
}

/**
 * 检查是否为Debug模式,来动态显示隐藏console
 */
util.checkDebug = (debugKey = '_debug') => {
    if (log) {
        util.storage('_debug', true, 30 * 60);
        return;
    }
    if (!util.storage(debugKey)) {
        util.closeConsole();
    }
};

/**
 * 关闭console
 */
util.closeConsole = () => {
    console.log   = () => {
    };
    console.error = () => {
    };
};


/**
 * 计算两个点的距离距离
 * @param location1 第一点的纬度，经度；
 * @param Location2 第二点的纬度，经度
 * @return {number}
 */
util.getDisByLocation = (location1, Location2) => {
    function Rad(d) {
        return d * Math.PI / 180.0;
    }

    let lat1    = location1.latitude;
    let lng1    = location1.longitude;
    let lat2    = Location2.latitude;
    let lng2    = Location2.longitude;
    let radLat1 = Rad(lat1);
    let radLat2 = Rad(lat2);
    let a       = radLat1 - radLat2;
    let b       = Rad(lng1) - Rad(lng2);
    let s       = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));

    s = s * 6378.137;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000; //输出为公里
    //s=s.toFixed(4);
    return s;
};

/**
 * 设置页面标题
 * @param title
 */
util.setTitleBar = title => {
    wx.setNavigationBarTitle({
        title: title,
    });
};

/**
 * 获取一个月多少天
 * @param year
 * @param month
 * @return {number}
 */
util.getMonthHasDayCounts = (year, month) => {
    let date = new Date();
    date.setFullYear(year);
    date.setMonth(month);
    date.setDate(0);
    return date.getDate();
};

/**
 * 获取某一天是周几
 * @param year
 * @param month
 * @param day
 * @return {number}
 */
util.getDateDay = (year, month, day) => {
    let date = new Date();
    date.setFullYear(year);
    date.setMonth(month - 1);
    date.setDate(day);
    return date.getDay();
};

/**
 *
 * @param key
 * @param data
 * @param duration 保存多长时间s
 * @return {*}
 */
util.storage = (key, data = null, duration = null) => {
    if (data === null) {
        try {
            data = wx.getStorageSync(key) || false;
            // 走判断时间逻辑
            if (data && data.duration) {
                let currTime = Math.ceil(new Date().getTime() / 1000);
                if (currTime >= data.duration) {
                    data = false;
                    wx.setStorageSync(key, false);
                } else {
                    data = data[key];
                }
            }
        } catch (e) {
            data = false;
        }
        return data;
    }
    // 存数据
    try {
        // 当没有设置时间,直接存
        if (!duration) {
            wx.setStorageSync(key, data);
            return;
        }
        // 设置了缓存时间
        let obj      = {};
        obj[key]     = data;
        //  在 duration 时间过期,传进来的是秒,例如 保存 30s
        obj.duration = Math.ceil(new Date().getTime() / 1000) + duration * 1;
        wx.setStorageSync(key, obj);
    } catch (e) {
        console.log('缓存失败', e);
    }
};

/**
 * 根据两个时间,获取时间的差值,返回的是 秒
 * @param startTime
 * @param endTime
 * @param callback
 * @return {number}
 */
util.getTwoTimerTime = (startTime, endTime, callback) => {
    if (Object.prototype.toString.call(startTime).search(/String/) > -1 && startTime.search(/-/g) > -1) {
        let endStr = '.0';
        let d      = startTime.length - endStr.length;
        if (d >= 0 && startTime.lastIndexOf(endStr) === d) {
            startTime = startTime.substr(0, startTime.length - 2);
        }
        startTime = startTime.replace(/-/g, '/');
        startTime = new Date(startTime).getTime();
    }
    if (Object.prototype.toString.call(endTime).search(/String/) > -1 && endTime.search(/-/) > -1) {
        endTime = endTime.replace(/-/g, '/');
        endTime = new Date(endTime).getTime();
    }
    callback && callback(startTime, endTime);
    return endTime - startTime;
};


/**
 * 根据毫秒,获取=>{day,hour,minute,second}
 * @param milliSecond
 * @param callback
 * @return {{day: number, hour: *, minute: *, second: *}}
 */
util.getTwoTimeDistance = (milliSecond, callback) => {
    let leftSecond = parseInt(milliSecond / 1000);
    let day        = Math.floor(leftSecond / (60 * 60 * 24));
    let hour       = Math.floor((leftSecond - day * 24 * 60 * 60) / 3600);
    let minute     = Math.floor((leftSecond - day * 24 * 60 * 60 - hour * 3600) / 60);
    let second     = Math.floor(leftSecond - day * 24 * 60 * 60 - hour * 3600 - minute * 60);
    let timeObj    = {
        day,
        hour  : hour < 10 ? '0' + hour : hour,
        minute: minute < 10 ? '0' + minute : minute,
        second: second < 10 ? '0' + second : second,
    };
    callback && callback(timeObj);
    return timeObj;
};

util.compose = (...args) => {
    let i      = args.length - 1;
    let result = null;
    return function f(...argement) {
        result = args[i].apply(null, argement);
        if (i <= 0) return result;
        i--;
        return f.call(null, result);
    }
};

/**
 * 柯里化
 * @param fn
 */
util.curry = fn => {
    // 首次传进来一个函数
    // 然后返回一个函数
    return function fn1(...args) {
        // 接收n个参数,当参数够了,在运行,否则自调用
        // fn参数的长度 小于 传进来args的长度
        if (fn.length > args.length) {
            return function () {
                return fn1.apply(null, args.concat(...arguments));
            }
        }
        return fn.apply(null, args);
    }
};


/**
 * 删除数组里keys
 */
util.deleteArrayKeys = (array, keys) => {
    return array.map(n => {
        return deleteKeys(n, keys);
    });
};


/**
 * 删除对象里keys
 */
util.deleteKeys = (obj, keys) => {
    keys.forEach(key => {
        obj.hasOwnProperty(key) && delete obj[key];
    });
    return obj;
};

/**
 * 管道
 * @param fn
 */
util.pipe = (...fn) => {
    // 首次传进来n个函数
    // 然后返回一个函数,该函数接收一个参数
    let length = fn.length;
    let i      = 0;
    let result = null;
    return function fn1(...args) {
        // 从左向右遍历
        result = fn[i].apply(null, args);
        if (i >= length - 1) {
            return result;
        }
        i++;
        return fn1.call(null, result);
    }
};


/**
 * Monad函子
 * @constructor
 */
const Maybe = function (value) {
    this.val = value;
};

Maybe.of = function (value) {
    return new Maybe(value);
};

Maybe.prototype.isNothing = function () {
    return (this.val === null || this.val === void 0);
};

Maybe.prototype.join = function () {
    return this.isNothing() ? Maybe.of(null) : this.val;
};

Maybe.prototype.value = function () {
    return this.isNothing() ? null : this.val;
};

Maybe.prototype.map = function (fn) {
    return this.isNothing() ? Maybe.of(null) : Maybe.of(fn(this.val));
};

Maybe.prototype.chain = function (fn) {
    return this.map(fn).join();
};

util.Maybe = Maybe;

util._typeOf = function (val) {
    return Object.prototype.toString.call(val)
}

util.isArray          = arr => {
    return util._typeOf(arr).search('Array') > -1;
};
util.checkArrayLength = arr => {
    if (!isArray(arr)) return null;
    return arr.length > 0 ? arr : null;
};
util.arrFirst         = arr => {
    if (!isArray(arr)) return null;
    if (arr.length === 0) return null;
    return arr[0];
};
util.maybeMap         = util.curry((fn, maybe) => maybe.map(fn));

const TYPE_ARRAY  = '[object Array]'
const TYPE_OBJECT = '[object Object]'

/**
 * diff算法
 * @author 逍遥
 */
util.addDiff = function addDiff(
    current = {},
    prev    = {},
    root    = '',
    result  = {}
) {
    Object.entries(current).forEach(item => {
        let key   = item[0],
            value = item[1],
            path  = root === '' ? key : root + '.' + key
        if (util._typeOf(current) === TYPE_ARRAY) {
            path = root === '' ? key : root + '[' + key + ']'
        }

        if (!prev.hasOwnProperty(key)) {
            result[path] = value
        } else if (
            (util._typeOf(prev[key]) === TYPE_OBJECT &&
                util._typeOf(current[key]) === TYPE_OBJECT) ||
            (util._typeOf(prev[key]) === TYPE_ARRAY &&
                util._typeOf(current[key]) === TYPE_ARRAY)
        ) {
            addDiff(current[key], prev[key], path, result)
        } else if (prev[key] !== current[key]) {
            result[path] = value
        }
    })
    return result;
}

util.nullDiff = function nullDiff(
    current = {},
    prev    = {},
    root    = '',
    result  = {}
) {
    Object.entries(prev).forEach(item => {
        let key   = item[0],
            value = item[1],
            path  = root === '' ? key : root + '.' + key
        if (util._typeOf(current) === TYPE_ARRAY) {
            path = root === '' ? key : root + '[' + key + ']'
        }

        if (!current.hasOwnProperty(key)) {
            result[path] = null
        } else if (
            (util._typeOf(prev[key]) === TYPE_OBJECT &&
                util._typeOf(current[key]) === TYPE_OBJECT) ||
            (util._typeOf(prev[key]) === TYPE_ARRAY &&
                util._typeOf(current[key]) === TYPE_ARRAY)
        ) {
            nullDiff(current[key], prev[key], path, result)
        }
    })
    return result;
}

util.diff = function diff(current = {}, prev = {}) {
    let result = {};
    util.addDiff(current, prev, '', result);
    util. nullDiff(current, prev, '', result);
    return result;
};

/**
 * 极简深拷贝 => 不能属性是函数
 * @param data
 * @return {any}
 */
util.deepClone = data => {
    if (typeof data === 'undefined' || typeof data !== 'object') {
        return data;
    }
    try {
        data = JSON.parse(JSON.stringify(data));
    } catch (e) {
        console.error(e, '深拷贝数据错误!');
        data = false;
    }
    return data;
};

/**
 *
 * 打开地图
 * @param longitude (必填)
 * @param latitude  (必填)
 * @param address
 * @param name
 * @param type
 */
util.openMap = ({longitude = '', latitude = '', address = '', name = '', type = 'baidu'} = {}) => {
    if (longitude === "" || latitude === "") {
        app.showToast('error', '地址错误');
        return;
    }
    let shopLocation = {};
    switch (type) {
        case 'baidu':
            shopLocation = util.badiDu2Tencent(latitude, longitude);
            break;
        case 'tencent':
            shopLocation.latitude  = latitude;
            shopLocation.longitude = longitude;
            break;
    }
    wx.openLocation({
        latitude : shopLocation.latitude,
        longitude: shopLocation.longitude,
        scale    : 18,
        address,
        name
    })
};


/**
 * 检查是否有保存图片权限,如果没有直接打开授权页
 * @return {Promise<any>}
 */
util.checkImgSetting = () => {
    return new Promise((a, b) => {
        wx.getSetting({
            success(res) {
                let imgSet = res.authSetting['scope.writePhotosAlbum'];
                if (imgSet === false) {
                    wx.openSetting({});
                    a(false);
                    return;
                }
                a(true);
            },
            fail() {
                a(false);
            }
        });
    });
};

/**
 * 下载网络图片到缓存
 * @param url
 * @param callback
 */
util.downloadImg = (url, callback) => {
    if (url.indexOf('https') === -1) {
        url = url.replace(/http/ig, 'https');
    }
    wx.downloadFile({
        url    : url,
        success: function (res) {
            wx.saveFile({
                tempFilePath: res.tempFilePath,
                success     : (fileRes) => {
                    callback(fileRes);
                },
                fail(fileRes) {
                    callback(fileRes);
                }
            })
        },
        fail(fileRes) {
            callback(fileRes);
        }
    });
};

/**
 * toast
 * @param type
 * @param title
 * @param duration
 */
util.showToast = (type = 'loading', title = '拼命加载中', duration = 1500) => {
    let options = {
        duration: type === 'loading' ? 1000000 : duration,
        title,
        mark    : true
    };
    if (type === 'error') {
        options.image = '../../image/error.png';
        if (title === '拼命加载中') {
            options.title = '加载失败';
        }
    } else {
        options.icon = type;
    }
    wx.showToast(options);
};


/**
 * 1. 当返回的typeof是undefined    用户首次进来,弹出授权框,此时不知道有没有授权
 * 2. 当值为false                 用户拒绝授权
 * 3. 当值为true                  用户运行授权
 * 4. 当值为-1                    小程序获取定位权限可能超时或者什么
 * @return {Promise<any>}
 */
util.getLocationSet = () => {
    return new Promise((a, b) => {
        wx.getSetting({
            success(res) {
                a(res.authSetting['scope.userLocation']);
            },
            error() {
                a(false);
            }
        });
    });
};

/**
 * 更新app
 */
util.updateApp = () => {
    let updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
    });
    updateManager.onUpdateReady(function () {
        let showUpdateModal = () => {
            wx.showModal({
                title  : '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate();
                        return;
                    }
                    showUpdateModal();
                }
            })
        };
        showUpdateModal();
    });
    updateManager.onUpdateFailed(function () {
        // 新版本下载失败
    });
};

/**
 * 隐藏右上角分享
 */
util.hideShareMenu = () => {
    wx.hideShareMenu();
};

/**
 * 通过diff,并且格式化数据,生成setData能用的对象
 * @param key
 * @param newValue
 * @param oldValue
 * @return {{}}
 */
util.formatDataByDiff = (key, newValue, oldValue) => {
    if (util.isArray(oldValue)) {
        return {[key]: newValue};
    }
    console.log(key, newValue, oldValue, 'key, newValue, oldValue');
    let diffData = util.diff(newValue, oldValue);
    console.log(diffData, 'diffData');
    let diffObj = {};
    Object.keys(diffData).forEach(n => {
        // 0.a
        let m = n.split('.').map(n => {
            // 非文字
            // Number.isNaN(n * 1)
            return Number.isNaN(n * 1) ? n : `[${n}]`;
        }).join('.');

        diffObj[`${key}.${m}`] = util.deepClone(diffData[n]);
    });
    return diffObj;
};


/**
 * 获取当前定位城市信息
 * @param latitude
 * @param longitude
 * @param ak => 百度ak
 * @return {Promise<any>}
 */
util.getCityInfoByBaiDu = async ({latitude, longitude, ak}) => {
    return new Promise((a, b) => {
        wx.request({
            url    : 'https://api.map.baidu.com/geocoder/v2/?ak=' + ak + '&location=' + latitude + ',' + longitude + '&output=json',
            data   : {},
            header : {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                if (res.status * 1 === 0) {
                    a(res);
                    return;
                }
                a(false);
            },
            fail   : function (error) {
                a(error);
            },
        })
    });
};


/**
 * 监听网络发生变化
 * @param callback
 * @return {Promise<any>}
 */
util.networkChangeEvent = callback => {
    return new Promise((a, b) => {
        wx.onNetworkStatusChange(res => {
            // ['4g', '3g', 'wifi'].indexOf(res.networkType) === -1
            if (!res.isConnected || res.networkType === 'none') {
                callback();
                a(false);
                return;
            }
            a(true);
        });
        wx.getNetworkType({
            success(res) {
                // ['4g', '3g', 'wifi'].indexOf(res.networkType) === -1
                if (res.networkType === 'none') {
                    callback();
                    a(false);
                    return;
                }
                a(true);
            },
            fail() {
                a(true);
            }
        });
    });
};

/**
 * 隐藏toast
 */
util.hideToast = () => {
    wx.hideToast();
};

/**
 * 保存图片到本地
 * @return {Promise<void>}
 */
util.saveImageToAlbum = async ({currentTarget}) => {
    showToast('loading', '保存中..');
    // 没有权限会自动跳转 授权页面
    if (!await checkImgSetting()) {
        hideToast();
        return;
    }
    // 获取权限成功
    wx.saveImageToPhotosAlbum({
        filePath: currentTarget.dataset.filePath,
        success(res) {
            console.log('保存成功', res);
            app.showToast('success', '保存成功');
        },
        fail(res) {
            console.log('保存失败', res);
            self.getImgSetting();
            app.showToast('error', '保存失败');
        }
    });
};

/**
 * 获取元素的宽高top之类的属性
 * @param {*} select
 */
util.querySelector = select => {
    let query = wx.createSelectorQuery();
    query.select(select).boundingClientRect();
    return new Promise((a, b) => {
        query.exec(res => {
            a(res[0]);
        })
    });
};

/**
 * 设置nav title
 * @param navTitle
 */
util.setNavTitle = navTitle => {
    wx.setNavigationBarTitle({
        title: navTitle,
    });
};

module.exports = util;

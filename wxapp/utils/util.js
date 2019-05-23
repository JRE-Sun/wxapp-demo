import {log} from './config';
import regeneratorRuntime from './runtime-module';
import lodash from './lodash.min';


export const _     = lodash;
export const merge = _.merge;

/**
 * 通过require引入import写法文件,返回真实obj
 * @param path
 * @returns {*}
 */
export const getImportObjByRequire = (path) => {
    let data = require(path);
    if (data.hasOwnProperty('default')) {
        data = data.default;
    }
    return data;
};

/**
 * 腾轩转百度
 * @param latitude
 * @param longitude
 * @return {{longitude: (number|*), latitude: (number|*)}}
 */
export const tencent2baidu = (latitude, longitude) => {
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
export const badidu2tencent = (lat, lng) => {
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
export const checkDebug = (debugKey = '_debug') => {
    if (log) {
        storage('_debug', true, 30 * 60);
        return;
    }
    if (!storage(debugKey)) {
        closeConsole();
    }
};

/**
 * 关闭console
 */
export const closeConsole = () => {
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
export const getDisByLocation = (location1, Location2) => {
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
 * 获取一个月多少天
 * @param year
 * @param month
 * @return {number}
 */
export const getMonthHasDayCounts = (year, month) => {
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
export const getDateDay = (year, month, day) => {
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
export const storage = (key, data = null, duration = null) => {
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
export const getTwoTimerTime = (startTime, endTime, callback) => {
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
export const getTwoTimeDistance = (milliSecond, callback) => {
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

export const compose = (...args) => {
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
export const curry = fn => {
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
export const deleteArrayKeys = (array, keys) => {
    return array.map(n => {
        return deleteKeys(n, keys);
    });
};


/**
 * 删除对象里keys
 */
export const deleteKeys = (obj, keys) => {
    keys.forEach(key => {
        obj.hasOwnProperty(key) && delete obj[key];
    });
    return obj;
};

/**
 * 管道
 * @param fn
 */
export const pipe = (...fn) => {
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
export const Maybe = function (value) {
    this.val = value;
};

Maybe.of = function (value) {
    return new Maybe(value);
};

Maybe.prototype.isNothing = function () {
    return (this.val === null || this.val === void 0);
};

Maybe.prototype.join = function () {
    return this.isNothing() ? null : this.val;
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

export const _typeOf = function (val) {
    return Object.prototype.toString.call(val)
}

export const jsonString = data => {
    try {
        if (isString(data)) {
            data = JSON.parse(data);
        }
        data = JSON.stringify(data);
    } catch (e) {
        console.error('util.jsonString参数错误,必须为json对象或者json字符串');
        data = JSON.stringify({});
    }
    return data;
};

/**
 * 初始化分享
 * @param img
 * @param title
 * @param insert
 * @param track
 * @param path
 * @param query
 * @return {{imageUrl: *, title: *}}
 */
export const initShareOptions = ({img, title, insert, track, path, query}) => {
    let shareOption = {
        imageUrl: img,
        title   : title
    };
    let param       = false;
    // 插入 特定 前缀页
    if (insert) {
        if (track) {
            // 有track
            param = `?track=${track}&&redirect=${path}&&params=${query}`;
            console.error(param, '插入 特定 前缀页---有track');
        } else {
            // 无
            param = `?redirect=${path}&&params=${query}`;
            console.error(param, '插入 特定 前缀页---无track');
        }
        shareOption.path = `/pages/${insert}${param}`;
        console.error('最后转发的全部路径:', shareOption);
        return shareOption;
    }
    // 不插 前缀页

    if (track) {
        // 有track
        param = `?params=${query}&&track=${track}`;
        console.error(param, '不插 前缀页---有track');
    } else {
        // 无
        param = `?params=${query}`;
        console.error(param, '不插 前缀页---无track');
    }
    shareOption.path = `/${path}${param}`;
    console.error('最后转发的全部路径:', shareOption);
    return shareOption;
};


export const isObject = val => {
    return _typeOf(val).search('Object') > -1;
};

export const isString = val => {
    return _typeOf(val).search('String') > -1;
};


export const isArray          = arr => {
    return _typeOf(arr).search('Array') > -1;
};
export const checkArrayLength = arr => {
    if (!isArray(arr)) return null;
    return arr.length > 0 ? arr : null;
};
export const arrFirst         = arr => {
    if (!isArray(arr)) return null;
    if (arr.length === 0) return null;
    return arr[0];
};
export const maybeMap         = curry((fn, maybe) => maybe.map(fn));

const TYPE_ARRAY  = '[object Array]'
const TYPE_OBJECT = '[object Object]'

/**
 * diff算法
 * @author 逍遥
 */
export const addDiff = function addDiff(
    current = {},
    prev    = {},
    root    = '',
    result  = {}
) {
    Object.entries(current).forEach(item => {
        let key   = item[0],
            value = item[1],
            path  = root === '' ? key : root + '.' + key
        if (_typeOf(current) === TYPE_ARRAY) {
            path = root === '' ? key : root + '[' + key + ']'
        }

        if (!prev.hasOwnProperty(key)) {
            result[path] = value
        } else if (
            (_typeOf(prev[key]) === TYPE_OBJECT &&
                _typeOf(current[key]) === TYPE_OBJECT) ||
            (_typeOf(prev[key]) === TYPE_ARRAY &&
                _typeOf(current[key]) === TYPE_ARRAY)
        ) {
            addDiff(current[key], prev[key], path, result)
        } else if (prev[key] !== current[key]) {
            result[path] = value
        }
    })
    return result;
}

export const nullDiff = function nullDiff(
    current = {},
    prev    = {},
    root    = '',
    result  = {}
) {
    Object.entries(prev).forEach(item => {
        let key   = item[0],
            value = item[1],
            path  = root === '' ? key : root + '.' + key
        if (_typeOf(current) === TYPE_ARRAY) {
            path = root === '' ? key : root + '[' + key + ']'
        }

        if (!current.hasOwnProperty(key)) {
            result[path] = null
        } else if (
            (_typeOf(prev[key]) === TYPE_OBJECT &&
                _typeOf(current[key]) === TYPE_OBJECT) ||
            (_typeOf(prev[key]) === TYPE_ARRAY &&
                _typeOf(current[key]) === TYPE_ARRAY)
        ) {
            nullDiff(current[key], prev[key], path, result)
        }
    })
    return result;
}

export const diff = function diff(current = {}, prev = {}) {
    let result = {};
    addDiff(current, prev, '', result);
    nullDiff(current, prev, '', result);
    return result;
};

/**
 * 极简深拷贝 => 不能属性是函数
 * @param data
 * @return {any}
 */
export const deepClone = data => {
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
export const openMap = ({longitude = '', latitude = '', address = '', name = '', type = 'baidu'} = {}) => {
    if (longitude === "" || latitude === "") {
        showToast('error', '地址错误');
        return;
    }
    let shopLocation = {};
    switch (type) {
        case 'baidu':
            shopLocation = badiDu2Tencent(latitude, longitude);
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
export const checkImgSetting = () => {
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
export const downloadImg = (url, callback) => {
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
export const showToast = (type = 'loading', title = '拼命加载中', duration = 1500) => {
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
export const getLocationSet = () => {
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
export const updateApp = () => {
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
export const hideShareMenu = () => {
    wx.hideShareMenu();
};

/**
 * 显示右上角分享
 */
export const showShareMenu = () => {
    wx.showShareMenu();
};

/**
 * 通过diff,并且格式化数据,生成setData能用的对象
 * @param key
 * @param newValue
 * @param oldValue
 * @return {{}}
 */
export const formatDataByDiff = (key, newValue, oldValue) => {
    if (isArray(oldValue)) {
        return {[key]: newValue};
    }
    console.log(key, newValue, oldValue, 'key, newValue, oldValue');
    let diffData = diff(newValue, oldValue);
    console.log(diffData, 'diffData');
    let diffObj = {};
    Object.keys(diffData).forEach(n => {
        // 0.a
        let m = n.split('.').map(n => {
            // 非文字
            // Number.isNaN(n * 1)
            return Number.isNaN(n * 1) ? n : `[${n}]`;
        }).join('.');

        diffObj[`${key}.${m}`] = deepClone(diffData[n]);
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
export const getCityInfoByBaiDu = async ({latitude, longitude, ak}) => {
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
export const networkChangeEvent = callback => {
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
export const hideToast = () => {
    wx.hideToast();
};

/**
 * 保存图片到本地
 * @return {Promise<void>}
 */
export const saveImageToAlbum = async (path) => {
    showToast('loading', '保存中..');
    // 没有权限会自动跳转 授权页面
    if (!await checkImgSetting()) {
        hideToast();
        return;
    }
    // 获取权限成功
    wx.saveImageToPhotosAlbum({
        filePath: path,
        success(res) {
            console.log('保存成功', res);
            showToast('success', '保存成功');
        },
        fail(res) {
            console.log('保存失败', res);
            checkImgSetting();
            showToast('error', '保存失败');
        }
    });
};

/**
 * 获取元素的宽高top之类的属性
 * @param {*} select
 */
export const querySelector = select => {
    let query = wx.createSelectorQuery();
    query.select(select).boundingClientRect();
    return new Promise((a, b) => {
        query.exec(res => {
            a(res[0]);
        })
    });
};

/**
 * 设置页面标题
 * @param navTitle
 */
export const setNavTitle = navTitle => {
    wx.setNavigationBarTitle({
        title: navTitle,
    });
};

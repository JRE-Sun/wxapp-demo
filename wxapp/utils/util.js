let _ = require('./lodash.min');

const tencent2baidu = (latitude, longitude) => {
    let x_pi  = 3.14159265358979324 * 3000.0 / 180.0;
    let x     = parseFloat(longitude * 1);
    let y     = parseFloat(latitude * 1);
    let z     = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    longitude = z * Math.cos(theta) + 0.0065;
    latitude  = z * Math.sin(theta) + 0.006;
    // longitude = Math.ceil(longitude * 1000000) / 1000000;
    // latitude  = Math.ceil(latitude * 1000000) / 1000000;
    return {
        longitude,
        latitude
    }
}

/**
 * 百度经纬度坐标转换腾讯坐标
 */
const badiDu2Tencent = (lat, lng) => {
    let x_pi  = 3.14159265358979324 * 3000.0 / 180.0;
    let x     = lng*1 - 0.0065, y = lat*1 - 0.006;
    let z     = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    lng       = z * Math.cos(theta);
    lat       = z * Math.sin(theta);
    return {
        lng: lng,
        lat: lat
    }
}


const setTitleBar = title => {
    wx.setNavigationBarTitle({
        title: title,
    });
};


module.exports = {
    setTitleBar,
    _,
    merge: _.merge,
    tencent2baidu,
    badiDu2Tencent,
};

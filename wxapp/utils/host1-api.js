let thread = require('./thread');
let host1  = require('./config');

/**
 * 某接口
 */
export const getHappyGoodsList = (data, callback) => {
    return thread.post({
        url    : 'test/h/shop',
        callback,
        data,
        options: {baseURL: host1}
    });
}


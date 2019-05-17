let thread     = require('./thread');
let host1      = require('./config');
module.exports = {
    /**
     * 某接口
     */
    getHappyGoodsList: (data, callback) => {
        return thread.post({
            url    : 'test/h/shop',
            callback,
            data,
            options: {baseURL: host1}
        });
    }
};
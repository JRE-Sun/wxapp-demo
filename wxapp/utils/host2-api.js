let thread = require('./thread');
let host2  = require('./config');

/**
 * 某接口
 */
export const getHappyGoodsList = (pageNum, callback) => {
    return thread.post({
        url    : 'api/a/user',
        callback,
        data   : {pageSize: 10, pageNum},
        options: {baseURL: host2}
    });
}
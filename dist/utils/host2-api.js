import {Http} from './thread';
import {host2} from './config';

/**
 * 某接口
 */
export const getHappyGoodsList = (pageNum, callback) => {
    return Http.post({
        url    : 'api/a/user',
        callback,
        data   : {pageSize: 10, pageNum},
        options: {baseURL: host2}
    });
}
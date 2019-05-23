import {Http} from './thread';
import {host1} from './config';

/**
 * 某接口
 */
export const getHappyGoodsList = (data, callback) => {
    return Http.post({
        url    : 'test/h/shop',
        callback,
        data,
        options: {baseURL: host1}
    });
}


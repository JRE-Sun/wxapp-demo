import {Http} from "./thread";
import {mmApi} from "./config";

/**
 * 获取城市列表
 * @param data
 */
export const getCityList = callback => {
    return Http.post({
        url    : "city/query",
        callback,
        options: {
            cache    : true, // 是否缓存该cache
            cacheTime: 24 * 60 * 60, // 请求缓存时间,默认30分钟
            baseURL  : mmApi,
            token    : false, // 该请求是否携带token
        }
    });
};
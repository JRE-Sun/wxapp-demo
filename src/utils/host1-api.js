import Http from "./http";
import {host1} from "./config";

/**
 * 获取城市列表
 * @param data
 */
export const getUserInfo = (data, callback) => {
    return Http.post({
        url    : "api/a/b",
        data,
        callback,
        options: {
            // -------------------------
            // baseURL为必填，其他选填
            // -------------------------
            cache    : true, // 是否缓存该请求
            cacheTime: 24 * 60 * 60, // 缓存24小时
            baseURL  : host1, // 自动添加前缀，前缀会和上面的url合并
            token    : false, // 该请求是否以来token
            secondRun: false, // 发送失败后，是否再次发送第二次
        }
    });
};
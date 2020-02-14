import Http from "./http";
import {host1} from "./config";

/**
 * 普通请求
 * @param data
 * @param callback
 * @returns {*|Promise<void>}
 */
export const base1 = (data, callback) => {
    return Http.post({
        url    : "base1",
        data,
        callback,
        options: {
            baseURL: host1,
        }
    });
};

/**
 * 添加/更新/上传数据操作
 * @param data
 * @param callback
 * @returns {*|Promise<void>}
 */
export const base2 = (data, callback) => {
    return Http.post({
        url    : "base2",
        data,
        callback,
        options: {
            baseURL  : host1,
            secondRun: false, // 禁止因为发送超时,触发的二次发送请求
        }
    });
};

/**
 * 图片上传
 * @param formData
 * @param filePath
 * @param callback
 * @returns {*|void}
 */
export const uploadImg = (formData, filePath, callback) => {
    return Http.upload({
        url     : "uploadImg",
        filePath: filePath,
        formData: formData,
        options : {
            baseUrl: host1,
            name   : "img"
        },
        callback
    });
};
import regeneratorRuntime from "./runtime-module";
import {Http} from "./thread";
import {storage, getAppUserInfo} from "./util";
import miment from "./miment";

let http        = Http,
    isGeting    = false;
http.sendBefore = (url, data, options) => {
    return new Promise((a, b) => {
        if (!(options.token === void 0 ? http.config.token : options.token))
            return a(true);
        let token = null;
        try {
            token = storage("token");
        } catch (e) {
            token = false;
        }
        if (token) return a(true);
        if (isGeting) return a(false);
        isGeting        = true;
        let runCallBack = res => {
            if (res.statusCode === -1 || res.code * 1 !== 0 || !res.data)
                return a(false);
            let data = res.data;
            let time = data.failTime - 5 * 60 * 1000;
            storage("token", data.token, parseInt(time / 1000));
            isGeting = false;
            a(true);
        };
        http.request(
            "api/token/getToken",
            {uid: getAppUserInfo("uid")},
            {baseURL: options.baseURL || ""},
            runCallBack,
            {groupOut: miment().format("YYYY/MM/DD hh-mm-ss SSS")}
        );
    });
};
export default http;

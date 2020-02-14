import {http} from "./config";
import {merge, _, getImportObjByRequire} from "./util";

let openThreadErr = http.openThreadErr || false;
export default {
    mergeConfig(tplUrlName) {
        let runEventArray = [];
        let mergeTplJs    = {};
        let runEvent      = {};
        // 根据组件名称 合并组件
        tplUrlName.forEach(n => {
            let tplJs = getImportObjByRequire(`../tpl/js/${n}`);
            tplJs.mix && runEventArray.push(tplJs.mix);
            mergeTplJs = merge({}, mergeTplJs, tplJs);
        });
        runEventArray.forEach(n => {
            let currRunEvent = n.__event;
            if (typeof currRunEvent === "undefined") return;
            for (let key in currRunEvent) {
                if (typeof runEvent[key] === "undefined") runEvent[key] = [];
                runEvent[key] = runEvent[key].concat(currRunEvent[key]);
            }
        });
        if (mergeTplJs.mix) {
            mergeTplJs.mix.__event = runEvent;
        }
        return mergeTplJs;
    },
    runPage(setting, tplUrlName = []) {
        let mergeTplJs = {};
        openThreadErr && tplUrlName.push("threadErr");
        tplUrlName.push("run");
        if (tplUrlName.length !== 0) {
            mergeTplJs = this.mergeConfig(tplUrlName);
        }

        if (tplUrlName.length !== 0) {
            mergeTplJs = this.mergeConfig(tplUrlName);
        }
        let mergeRunEvent;
        let settingRunEvent;
        if (mergeTplJs.mix) {
            mergeRunEvent = mergeTplJs.mix.__event || {};
        }
        if (setting.mix) {
            settingRunEvent = setting.mix.__event || {};
        }
        let __event = _.mergeWith(mergeRunEvent, settingRunEvent, function (
            a,
            b
        ) {
            if (_.isArray(a) && _.isArray(b)) {
                return a.concat(b);
            }
        });
        setting     = merge({}, mergeTplJs, setting);
        if (setting.mix && setting.mix.__event) {
            setting.mix.__event = __event;
        }
        setting = merge({}, getImportObjByRequire(`./share`), setting);
        Page(setting);
    }
};

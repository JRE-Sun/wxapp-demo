let openThreadErr = require('./config').http.config || false;
let util          = require('./util');


module.exports = {
    mergeConfig(tplUrlName) {
        let runEventArray = [];
        let mergeTplJs    = {};
        let runEvent      = {};
        // 根据组件名称 合并组件
        tplUrlName.forEach(n => {
            let tplJs = require(`../tpl/js/${n}`);
            tplJs.mix && runEventArray.push(tplJs.mix);
            mergeTplJs = util.merge(mergeTplJs, tplJs);
        });
        runEventArray.forEach(n => {
            let currRunEvent = n.__event;
            if (typeof currRunEvent === 'undefined') return;
            for (let key in currRunEvent) {
                if (typeof runEvent[key] === 'undefined') runEvent[key] = [];
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
        openThreadErr && tplUrlName.push('threadErr');
        tplUrlName.push('default');
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
        let __event = util._.mergeWith(mergeRunEvent, settingRunEvent, function (a, b) {
            if (util._.isArray(a) && util._.isArray(b)) {
                return a.concat(b);
            }
        });
        setting     = util.merge({}, mergeTplJs, setting);
        if (setting.mix && setting.mix.__event) {
            setting.mix.__event = __event;
        }
        setting = util.merge({}, require('./share'), setting);
        Page(setting);
    }
};  
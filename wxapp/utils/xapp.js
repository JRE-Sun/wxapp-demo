let defaultConfig = require('./default');
let util = require('./util');

module.exports = {
    mergeConfig(tplUrlName) {
        let runEventArray = [];
        let mergeTplJs = {};
        let runEvent = {};
        // 根据组件名称 合并组件
        tplUrlName.forEach(n => {
            let tplJs = require(`../tpl/js/${n}`);
            tplJs.data && runEventArray.push(tplJs.data);
            mergeTplJs = util.merge(mergeTplJs, tplJs);
        });
        runEventArray.forEach(n => {
            let currRunEvent = n.runEvent;
            if (typeof currRunEvent === 'undefined') return;
            for (let key in currRunEvent) {
                if (typeof runEvent[key] === 'undefined') runEvent[key] = [];
                runEvent[key] = runEvent[key].concat(currRunEvent[key]);
            }
        });
        mergeTplJs.data.runEvent = runEvent;
        return mergeTplJs;
    },
    runPage(setting, tplUrlName = []) {
        let mergeTplJs = {};
        if (tplUrlName.length !== 0) {
            mergeTplJs = this.mergeConfig(tplUrlName);
        }
        let mergeRunEvent;
        let settingRunEvent;
        if (mergeTplJs.data) {
            mergeRunEvent = mergeTplJs.data.runEvent || {};
        }
        if (setting.data) {
            settingRunEvent = setting.data.runEvent || {};
        }
        let runEvent = util._.mergeWith(mergeRunEvent, settingRunEvent, function(a, b) {
            if (util._.isArray(a) && util._.isArray(b)) {
                return a.concat(b);
            }
        });
        setting = util.merge(setting, mergeTplJs);
        if (setting.data && setting.data.runEvent) {
            setting.data.runEvent = runEvent;
        }
        Page(util.merge(setting, defaultConfig));
    }
};
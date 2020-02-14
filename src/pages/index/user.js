import xapp from "../../utils/xapp";
import regeneratorRuntime from "../../utils/runtime-module";
import {testObj} from '../../utils/util';

let setting = {
    data: {},
    mix : {
        __event: {
            pageOnLoad: ["userOnLoad"],
            pageOnShow: ["userOnShow"],
        }
    },
    userOnLoad() {
        this.storeLink(['count']);
    },
    userOnShow() {

    },
};
xapp.runPage(setting);

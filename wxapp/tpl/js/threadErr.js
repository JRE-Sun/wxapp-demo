import {http, threadErr} from '../../utils/thread';

export default {
    data: {},
    mix : {
        pageErrTimer: null, // 错误日志timer
        __event     : {
            pageOnError: ['pageSendErrLog']
        }
    },

    /**
     * 发送错误日志
     */
    pageSendErrLog() {
        let errLength = threadErr.getErrLogList().length;
        // 没有错误日志
        if (errLength === 0) return;
        // 当前ajax队列还有请求,延迟发送错误日志
        if (http.httpList.length > 0) {
            this.mix.pageErrTimer = setTimeout(() => {
                if (!this.mix.pageErrTimer) return;
                this.pageSendErrLog();
            }, 1000);
            return;
        }
        threadErr.sendErrLog();
    },
};
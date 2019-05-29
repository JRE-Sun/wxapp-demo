export default {
    data: {
        b: {
            msg: 3,
        },
    },
    mix : {
        timer  : null,
        __event: {
            pageOnLoad  : ['bOnLoad'],
            pageOnUnload: ['bOnUnload']
        }
    },

    bOnUnload() {
        clearInterval(this.mix.timer);
        this.mix.timer = null;
    },

    /**
     * 这个方法每个组件都必须有,逻辑一样但是名字不一样
     */
    setBData(value) {
        this.updateTplData('b', value);
    },
    bClickBtn() {
        if (this.mix.timer) return;
        let msg        = this.getPageData('b.msg');
        let run        = () => {
            msg--;
            if (msg < 0 || !this.mix.timer) {
                clearInterval(this.mix.timer);
                this.mix.timer = null;
                return;
            }
            if (msg === 0) this.runEvent('bColorChange', 'black');
            this.setBData({
                msg,
            });
        };
        this.mix.timer = setInterval(run, 1000);
        run();
    },
};
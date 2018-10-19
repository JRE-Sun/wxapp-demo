module.exports = {
    data: {
        a: {
            aaa: '我是a组件数据',
            b: true,
        },
        runEvent: {
            pageOnLoad: ['aOnLoad'],
        }
    },

    /**
     * 这个方法每个组件都必须有,逻辑一样但是名字不一样 
     */
    setAData(value) {
        this.updateTplData('a', value);
    },
    aOnLoad() {

    }
};
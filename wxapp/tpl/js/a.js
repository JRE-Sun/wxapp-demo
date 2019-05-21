export default {
    data: {
        a: {
            msg: '我是a组件',
        },
    },
    mix : {
        imgSrc : '不会渲染到视图层',
        __event: {
            pageOnLoad  : ['aOnLoad'],
            bColorChange: ['watchBColor'],
        }
    },


    /**
     * 这个方法每个组件都必须有,逻辑一样但是名字不一样
     */
    setAData(value) {
        this.updateTplData('a', value);
    },

    /**
     * 监听b颜色是否发生变化
     */
    watchBColor(color) {
        let msg = this.getPageData('a.msg');
        this.setAData({
            msg: `${msg}===>我监听到b变成了${color}`
        });
    },
};
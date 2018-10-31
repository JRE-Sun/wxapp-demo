module.exports = {
    data: {
        test: {
            testData: '3s后我会自动更改数据哦',
            showBtn : true,
        },
    },
    mix : {
        __event: {
            pageOnLoad: ['testOnLoad'],
        }
    },
    /**
     * 这个方法每个组件都必须有,逻辑一样但是名字不一样
     */
    setTestData(value) {
        this.updateTplData('test', value);
    },
    testOnLoad() {
        setTimeout(() => {
            this.setTestData({
                testData: '我是test组件',
                showBtn : false
            });
        }, 3000);
    }
};
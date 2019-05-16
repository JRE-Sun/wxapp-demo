/**
 * 分享
 */
let app = getApp();

module.exports = {

    /**
     * 设置分享标题/图片
     * @param title
     * @param img
     */
    setShareData({title = '好服务都在妈妈身边', img = `${this.data.mamaImgUrl}logo.png`} = {}) {
        console.log(title, '转发文字');
        this.mix.shareTitle = title;
        this.mix.shareImage = img;
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function ({target = null}) {
        console.error(target, 'share target');
        let shareOption = {
            imageUrl: this.mix.shareImage,
            title   : this.mix.shareTitle
        };
        // 分享追踪消息
        let trackData   = this.getTrackData();
        let trackQuery  = {
            mchId   : trackData.mchId || '',
            userId  : trackData.userId || '',
            inviteId: this.getAppUserInfo('uid')
        };
        // target 为真则是页面禁止分享,通过点击的button
        // target 为null,则是普通的转发
        let currPage = app.getCurrPagePath();
        let route    = currPage.route;
        let dataset  = this.resultName(target, 'dataset');

        let shareRoute  = this.resultName(dataset, 'shareRoute');
        let insertIndex = this.resultName(dataset, 'insertIndex');
        insertIndex     = typeof insertIndex === 'boolean' ? insertIndex : (insertIndex === 'true');
        let shareQuery  = this.resultName(dataset, 'shareQuery');
        let shareTitle  = this.resultName(dataset, 'shareTitle');
        let shareImg    = this.resultName(dataset, 'shareImg');
        let type        = this.resultName(dataset, 'type');
        // 普通转发
        if (!target || (type && type === 'normal')) {
            // 1.转发首页
            if (route === 'pages/index/index') {
                shareOption.path = '/pages/index/index?trackData=' + JSON.stringify(trackQuery);
                console.error(shareOption, '转发首页');
                return shareOption;
            }
            // 2.转发非首页
            shareOption.path = '/pages/index/index?trackData=' + JSON.stringify(trackQuery) + '&&redirect=' + route + '&&params=' + JSON.stringify(currPage.options);
            console.error(shareOption, '正常转发非首页');
            return shareOption;
        }

        console.error(shareQuery);
        // 通过点击 button
        shareQuery  = shareQuery ? JSON.parse(shareQuery) : {};
        shareOption = {
            imageUrl: shareImg || this.mix.shareImage || false,
            title   : shareTitle || this.mix.shareTitle || '好服务都在妈妈身边'
        };
        // 转发当前页,不插入首页
        if (shareRoute === route && !insertIndex) {
            let currOptions  = shareQuery ? shareQuery : currPage.options;
            let shareOptions = Object.keys(currOptions).map(key => {
                return key + '=' + currOptions[key];
            });
            shareOption.path = '/' + route + '?' + shareOptions.join('&&');
            console.error(shareOption, '点击按钮转发当前页 不插入首页');
            return shareOption;
        }
        // 转发非当前页
        // 插入首页
        if (insertIndex) {
            shareOption.path = '/pages/index/index?trackData=' + JSON.stringify(trackQuery) + '&&redirect=' + shareRoute + '&&params=' + JSON.stringify(shareQuery);
            console.error(shareOption, '点击按钮 插入首页转发');
            return shareOption;
        }
        // 不插入首页
        let shareOptions = Object.keys(shareQuery).map(key => {
            return key + '=' + shareQuery[key];
        });
        shareOption.path = '/' + shareRoute + '?' + shareOptions.join('&&');
        console.error(shareOption, '点击按钮 不插入首页转发');
        return shareOption;
    }
};
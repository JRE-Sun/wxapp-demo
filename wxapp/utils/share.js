/**
 * 分享
 */

let app        = getApp();
module.exports = {

    setShareData({title = '默认标题', img = '/image/logo.jpeg'} = {}) {
        this.mix.shareTitle = title;
        this.mix.shareImage = img;
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        let shareOption = {
            title: this.mix.shareTitle,
            path : ''
        };
        if (this.mix.shareImage) {
            shareOption.imageUrl = this.mix.shareImage;
        }
        return shareOption;
    }
};
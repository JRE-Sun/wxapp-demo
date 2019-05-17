/**
 * 分享
 */
let app                  = getApp();
let {share: configShare} = require('./config');
let util                 = require('./util');

module.exports = {

    /**
     * 设置分享标题/图片
     * @param title
     * @param img
     */
    setShareData(options) {
        options        = util.merge({}, {
            title: configShare.title,
            img  : configShare.img,
            path : this.route,
            query: this.options
        }, options);
        this.mix.share = {};
        Object.keys(options).forEach(n => {
            this.mix.share[n] = options[n];
        });
        console.log(`${this.route}设置setShareData后的this.mix.share=`, this.mix.share);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function ({target = null}) {
        let share = util.Maybe.of(this.mix.share);
        let chain = (maybe, key) => {
            return maybe.chain(data => {
                return data[key];
            })
        };

        let addShareToQuery = data => {
            data       = JSON.parse(util.jsonString(data));
            data.share = true;
            return util.jsonString(data);
        };

        let insert = chain(share, 'insert'); // 页面分享是否 需要插入前缀 路径
        let title  = chain(share, 'title'); // 分享标题
        let img    = chain(share, 'img'); // 分享图
        let path   = chain(share, 'path'); // 分享路径
        let query  = share.map(data => data.query).chain(addShareToQuery) || util.jsonString({share: true});
        // 分享参数, 分享路径和分享参数拼接在一起最后会形成 path-query=>page/index/home?b=1
        let track  = share.map(data => data.track).chain(util.jsonString) || false;
        // target 为真则是页面禁止分享,通过点击的button
        // target 为null,则是普通的转发
        let dataset   = util.Maybe.of(target).map(data => data.dataset);
        let shareType = chain(dataset, 'shareType');
        // this.mix.shareTitle;
        // 普通转发 => 两种,右上角转发/点击button转发
        if (!target || (shareType && shareType === 'normal')) {
            return util.initShareOptions({img, title, insert, track, path, query});
        }
        let sharePath   = chain(dataset, 'sharePath');
        let shareInsert = chain(dataset, 'shareInsert');
        let shareTitle  = chain(dataset, 'shareTitle');
        let shareImg    = chain(dataset, 'shareImg');
        let shareTrack  = dataset.map(data => data.shareTrack).chain(util.jsonString) || false;
        let shareQuery  = dataset.map(data => data.shareQuery).chain(addShareToQuery) || util.jsonString({share: true});
        return util.initShareOptions({
            img   : shareImg,
            title : shareTitle,
            insert: shareInsert,
            track : shareTrack,
            path  : sharePath,
            query : shareQuery
        });
    }
};
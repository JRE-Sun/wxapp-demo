import {getMerchant} from "../../utils/util";

let scale = 4;
let app   = getApp();
export default class LastMayday {
    palette(codePath, bag) {
        let categoryName = getMerchant('categoryName'),
            merchantName = getMerchant('merchantName'),
            textObj      = [],
            posterPath   = bag.posterPath,
            price        = bag.sumDiscountPrize,
            setMealName  = bag.setMealName;
        if (codePath && codePath.indexOf("https") === -1) {
            codePath = codePath.replace(/http/gi, "https");
        }
        if (posterPath && posterPath.indexOf("https") === -1) {
            posterPath = posterPath.replace(/http/gi, "https");
        }
        if (!posterPath) {
            textObj = [
                _textSet(`[妈妈身边精选${categoryName}服务商]`, `${510 * scale}`, `${28 * scale}`, {
                    left : `${38 * scale}rpx`,
                    color: '#fff'
                }),
                _textSet(`${setMealName}`, `${566 * scale}`, `${36 * scale}`, {
                    left      : `${38 * scale}rpx`,
                    color     : '#fff',
                    fontWeight: 'bold'
                }),
                _textSet('¥', `${643 * scale}`, `${60 * scale}`, {
                    left      : `${230 * scale}rpx`,
                    color     : '#fff',
                    fontWeight: 'bold'
                }),
                _textSet(`${price / 100}`, `${623 * scale}`, `${80 * scale}`, {
                    left      : `${280 * scale}rpx`,
                    color     : '#fff',
                    fontWeight: 'bold'
                }),
            ];
        }
        posterPath = posterPath || '../../image/poster-bg.png';

        return ({
            width       : `${600 * scale}rpx`,
            height      : `${970 * scale}rpx`,
            background  : '',
            borderRadius: `${20 * scale}rpx`,
            views       : [
                // 海报背景图
                {
                    type: 'image',
                    url : posterPath,
                    css : {
                        top         : `40rpx`,
                        left        : `0rpx`,
                        width       : `${600 * scale}rpx`,
                        height      : `${930 * scale}rpx`,
                        borderRadius: `${6 * scale}rpx`,
                    },
                },

                // 二维码图片
                {
                    type: 'image',
                    url : codePath,
                    css : {
                        bottom: `${10 * scale}rpx`,
                        left  : `${220 * scale}rpx`,
                        width : `${145 * scale}rpx`,
                        height: `${145 * scale}rpx`,
                    },
                },
                ...textObj

            ],
        });
    }
}

const startTop  = 50;
const startLeft = 20;
const gapSize   = 70;
const common    = {
    left    : `${startLeft}rpx`,
    fontSize: '40rpx',
};

// 字体设置
function _textSet(decoration, top, fontSize, cssAttr) {
    return ({
        type: 'text',
        text: decoration,
        css : [{
            top     : `${top}rpx`,
            fontSize: `${fontSize}rpx`,
            color   : `#333`
        }, cssAttr],
    });
}

// 设置背景圆角
function _bgRadius(top, width, cssAttr) {
    return ({
        type: 'rect',
        css : [{
            color       : '#DBEEDC',
            borderRadius: '6rpx',
            borderWidth : '0rpx',
            height      : '50rpx',
            top         : `${top}rpx`,
            borderColor : `#DBEEDC`,
            width       : `${width}rpx`
        }, cssAttr],
    });
}

function _textDecoration(decoration, index, color) {
    return ({
        type: 'text',
        text: decoration,
        css : [{
            top           : `${startTop + index * gapSize}rpx`,
            color         : color,
            textDecoration: decoration,
        }, common],
    });
}

function _image(index, rotate, borderRadius) {
    return (
        {
            type: 'image',
            url : '/palette/avatar.jpg',
            css : {
                top         : `${startTop + 8.5 * gapSize}rpx`,
                left        : `${startLeft + 160 * index}rpx`,
                width       : '120rpx',
                height      : '120rpx',
                rotate      : rotate,
                borderRadius: borderRadius,
            },
        }
    );
}


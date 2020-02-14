import {querySelector} from '../../utils/util'
import regeneratorRuntime from '../../utils/runtime-module'
import {
    showToast, showModal
} from "../../utils/util";

export default {
    data: {
        write: {
            id           : 'canvas-write__canvas',
            lastLoc      : {x: 0, y: 0},
            isOnMoveDown : false,
            lastTimestamp: 0,
            lastLineWidth: -1
        }
    },
    mix : {
        __event: {
            pageOnLoad: ['writePageOnLoad'],
        },
    },
    setWriteData(value) {
        this.updateTplData('write', value);
    },

    writeMouseDown() {
        this.setWriteData({
            isOnMoveDown: true
        })
    },
    writeUploadScaleStart(e) {
        console.log(e)
        let [touch0, touch1] = e.touches
        var curLoc           = {
            x: touch0.x,
            y: touch0.y
        }

        this.setWriteData({
            lastLoc      : curLoc,
            lastTimestamp: new Date().getTime(),
            isOnMoveDown : true,
            lastLineWidth: -1
        })
    },
    writeUploadScaleMove(e) {
        // console.log(e)
        let [touch0, touch1] = e.changedTouches
        //draw 
        var isOnMoveDown     = this.data.write.isOnMoveDown;
        if (isOnMoveDown) {
            var ctx           = this.data.write.ctx
            var curLoc        = touch0
            var lastLoc       = this.data.write.lastLoc
            var currTimestamp = new Date().getTime()
            var s             = this.writeCalcDistance(curLoc, lastLoc)
            var t             = currTimestamp - this.data.write.lastTimestamp
            var lineWidth     = this.writeCalcLineWidth(t, s)
            ctx.beginPath()
            ctx.moveTo(lastLoc.x, lastLoc.y)
            ctx.lineTo(curLoc.x, curLoc.y)
            ctx.setStrokeStyle('black')
            ctx.setLineCap('round')
            ctx.setLineJoin('round')
            ctx.setLineWidth(lineWidth)

            ctx.stroke()
            ctx.draw(true)
            //console.log(touch0, touch1);
            this.setWriteData({
                lastLoc      : curLoc,
                lastTimestamp: currTimestamp,
                lastLineWidth: lineWidth
            })
        }

    },
    writeRetDraw       : function () {
        this.data.write.ctx.clearRect(0, 0, 700, 730)
        this.data.write.ctx.draw()
        //this.data.write.ctx.restore()
        //this.writeDrawBg()
    },
    writeCalcLineWidth : function (t, s) {
        return 3;
        var v = s / t
        var retLineWidth
        if (v <= 0.1) {
            retLineWidth = 10
        } else if (v >= 10) {
            retLineWidth = 1
        } else {
            retLineWidth = 10 - (v - 0.1) / (10 - 0.1) * (10 - 1)
        }

        if (this.data.write.lastLineWidth == -1)
            return retLineWidth

        return this.data.write.lastLineWidth * 9 / 10 + retLineWidth * 1 / 10
    },
    writeCalcDistance  : function (loc1, loc2) {
        return Math.sqrt((loc1.x - loc2.y) * (loc1.x - loc2.y) + (loc1.y - loc2.y) * (loc1.y - loc2.y))
    },
    writeUploadScaleEnd: function () {
        this.setWriteData({
            lastLineWidth: -1,
            lastTimestamp: new Date().getTime()
        })
    },
    writePageOnLoad    : function () {
        var id  = this.data.write.id
        var ctx = wx.createCanvasContext(id)
        this.setWriteData({
            ctx: ctx
        })
    },
    writeGetSysInfo    : function () {
        var that = this
        wx.getSystemInfo({
            success: function (res) {
                var pix = res.pixelRatio
                that.setWriteData({
                    width : res.windowWidth * pix,
                    height: res.windowHeight * pix
                })
            }
        })
    },
    writeDrawBg        : function () {
        var that = this
        wx.getImageInfo({
            src    : '/image/qian.png',
            success: function (res) {
                var id  = that.data.id
                var ctx = wx.createCanvasContext(id)
                ctx.drawImage('/image/qian.png', 0, 0, res.width, res.height)
                ctx.save()
                ctx.draw(true)
                that.setWriteData({
                    ctx: ctx
                })
            }
        })
    },
    writeSubCanvas     : function () {
        var that       = this;
        let canvasPath = () => {
            showToast();
            wx.canvasToTempFilePath({
                canvasId: 'canvas-write__canvas',
                success : function (res) {
                },
                fail    : function (res) {
                    // console.log(res)
                    // this.runEvent('writeCanvas',false);
                },
                complete: function (res) {
                    console.log(res, 'canvas生成图片返回')
                    try {
                        that.runEvent('writeCanvas', res.tempFilePath)
                    } catch (e) {
                        that.runEvent('writeCanvas', false);
                    }
                }
            })
        };
        wx.showModal({
            title  : '确定',
            success: function (res) {
                if (res.confirm) return canvasPath();
            }
        });
    },
};
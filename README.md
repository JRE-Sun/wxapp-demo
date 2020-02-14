
# 框架
小程序框架我只用过mpvue开发,用起来的感受怎么说呢,一言难尽...，所以我写了这个wxapp,目前wxapp已经在公司的5个小程序上运行，微信小程序还是用它自己的原生语法开发爽。
  
**蹬蹬蹬，框架wxapp** 

准确的说`wxapp`不是一个框架，它只是一个基于原生小程序封装了一些前端常用方法的一个集合,但是它更改了小程序的生命周期，并且触发事件几乎全部采用订阅者模式,支持scss、代码压缩。开发小程序还是原生那样写，只不过需要遵循一些规则，熟悉`wxapp`之后,开发速度那是嗖嗖嗖的。

# 入门wxapp

目录结构

```
├── README.md
├── gulpfile.js              // gulp配置文件
├── package.json
├── dist  // 经过gulp编译src后生成的小程序代码
└── src                    // 开发源代码
    ├── app.js               
    ├── app.json
    ├── app.scss
    ├── image
    ├── pages
    ├── project.config.json
    ├── components           // 微信小程序官方推荐的 组件
    ├── tpl                  // 组件文件夹
    │   ├── js               // 组件js部分
    │       ├── run.js       // 核心代码
    │   ├── scss             // scss
    │   └── views            // 视图 
    └── utils                
        ├── host1-api.js     // hosr1域名对应的ajax接口文件
        ├── host2-api.js     // hosr2域名对应的ajax接口文件
        ├── config.js        // 项目配置文件
        ├── miment.js        // 
        ├── thread.js        // http封装
        ├── lodash.min.js
        ├── share.js          // 页面分享逻辑
        ├── runtime-module.js // 让小程序支持es7属性->async/asait
        ├── runtime.js        // 同上
        ├── util.js           // 封装了n多常用方法           
        ├── util.wxs          // 视图层的js
        └── xapp.js           // 合并小程序核心js
```



每个页面和组件都有自己的**mix混合变量**,mix存放那些不需要传递给视图层的"多余"数据,以减少来回setData造成性能消耗。

使用方法:
1. 从git上clone到本地
2. 进入文件夹执行`cnpm i`安装项目依赖
3. 全局安装gulp `cnpm i g gulp`
4. 安装成功后,在当前目录执行`gulp`
5. 小程序官方工具选取编译后的dist文件夹

# 页面生命周期

小程序默认生命周期是几乎同时运行onLoad/onShow,onLoad比inShow大约快了30ms左右,so一些复杂的需求实现起来有些难度,wxapp修改了小程序的生命周期,它会先运行onLoad,在运行onLoad结束后才会运行onShow,原理无非就是有一个runOnLoad变量来给onShow加锁.

下面是完整的流程图:

![wxapp生命周期.png](https://jresun-1253349116.cos.ap-beijing.myqcloud.com/blog/img/wxapp%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F.png)

# 组件(runEvent)

原理：订阅者模式。由于小程序是一个page(options)，所以可以对这个options进行操作。每个组件单独弄成js，在页面的运行js文件中引入，然后合并到options。具体逻辑在`utils/xapp.js`里面。我还封装了不少常用的功能,全部在utils.js里面，可以打开瞟一眼。

**注意：小程序刚上线，我这边就直接开发，初版有很多功能不存在比如官方的components，所以我才弄出来一个tpl组件，目前不推荐用tpl，需要使用组件可以直接采用components开发。**

目前tpl除了是一个组件，还能实现公有方法共用！

```js
// weather文件，程序会自动去tpl/js下面寻找，寻找到会合并到主程序
xapp.runPage(setting, ['weather']);
```


## 如何实现组件

需求:页面上有一个城市选择器,选择不同的城市,下方显示该城市的天气.

页面index.js,最后渲染到index.wxml

```js
import xapp from '../../utils/xapp';
import regeneratorRuntime from '../../utils/runtime-module';

let setting = {
    data: {
        
    
    },
    
    mix : {
        __event : {
            pageOnLoad  : ['h5OnLoad'],
        }
    },
    
    h5OnLoad(options) {
    
    },
    
    /**
     * 城市改变事件
     */
    changeCityEvent(){
        let cityInfo =  获取cityInfo
        // 把城市改变后的值,发送到'changeCity'key上
        this.runEvent('changeCity',cityInfo)
    }
};
// 页面引入weather.js=>路径 tpl/js/weather.js
xapp.runPage(setting, ['weather']);
```

tpl/js/weather.js

```js
/**
 * weather组件
 */
import regeneratorRuntime from '../../utils/runtime-module';
import {
    getWeatherByCityId,
} from '../../utils/api';

export default {
    // 组件上的data会自动合并到default.js的data上
    data: {
        weather: false,
    },

    mix: {
        // 这里是对应key接收
        __event: {
            'changeCity': ['getWeatherCity']
        }
    },

    /**
     * 获取天气数据
     * @param cityInfo
     */
    getWeatherCity(cityInfo) {
        getWeatherByCityId(cityInfo, res => {
            // setPageData=>对setData的封装采用diff
            this.setPageData({
                weather: res.data
            });
        });
    },
};
```

现在需求改变。城市改变需要出现一个弹窗,不需要修改原有逻辑只需要在`tpl/js/b.js`路径创建b组件,接收changeCity。同时页面index.js在引入weather的基础上再次引入b

```js
xapp.runPage(setting, ['weather','b']);
```

* `mix`:data挂上大量数据会导致小程序运行缓慢卡顿,是因为data上的数据会传递到view层(渲染层),所以wxapp把一些js逻辑需要用到,但页面不需要渲染的数据挂在了mix上来优化性能

## 如何页面传值

需求:A页面每显示一次,页面上的count自增+1，同时B页面也需要同步显示A页面显示多少次，即A里的count改变B的count也要改变。

`$store`:页面运行期间的全局状态管理.

在run.js上的mix挂着isMergeStore默认true,默认所有页面都可以合并app.js->store属性,可以在view里通过$store获取.

A.js

```js
import xapp from "../../utils/xapp";
// 让小程序支持es7 async/asait,如果不用可以不引入
import regeneratorRuntime from "../../utils/runtime-module";

let setting = {
    data: {},
    // mix 是页面混合数据,里面存放不需要在页面上渲染的数据
    mix : {
        __event: {
            pageOnLoad: ["indexOnLoad"],
            pageOnShow: ['indexOnShow']
        }
    },
    indexOnLoad() {
        this.storeLink(['count']);
    },
    indexOnShow() {
        let count = ++this.data.$store.count;
        this.setStore({count});
    },
};

// 如果页面不需要其他组件,直接 xapp.runPage(setting);
xapp.runPage(setting);
```

B.js

```js
import xapp from "../../utils/xapp";
import regeneratorRuntime from "../../utils/runtime-module";
import {testObj} from '../../utils/util';

let setting = {
    data: {},
    mix : {
        __event: {
            pageOnLoad: ["userOnLoad"],
            pageOnShow: ["userOnShow"],
        }
    },
    userOnLoad() {
        this.storeLink(['count']);
    },
    userOnShow() {
        
    },
};
xapp.runPage(setting);
```

当然不一定是这两个页面,可以多个页面..那就得自己去自由组合了.

## 完成复杂的分享

当前页面路径pages/test/a

*  转发当前页面
*  转发其他页面
*  转发当前页面(前面插入pages/index/home)
*  转发其他页面(前面插入pages/index/home)

步骤(就一步贼简单):

1. 在转发之前(例如在onLoad方法)调用`this.setShareData()`,

```js
 {
            insert: '', // 页面分享是否 需要插入前缀 路径
            title : '', // 分享标题
            img   : '', // 分享图
            path  : '', // 分享路径
            query : '', // 分享参数
            track : '', // 追踪信息,是单独在最外面
  }
  
  默认会把config.js里面的share合并过来,分享的路径path和页面参数为当前页面
  
  {
            title: share.title,
            img  : share.img,
            path : this.route,
            query: this.options
  }
```

*  转发当前页面:调用setShareData后,直接点击右上角分享就ok.
*  在A页面想转发B页面,参数是a=1

```js
        this.setShareData({
            path : 'pages/index/b',
            query: {a:1}
        })
```

* 转发当前页面并在前面插入pages/index/home,并且加上追踪消息

```js
        this.setShareData({
            insert:'index/home',
            query: {a:1},
            track:{b:2}
        })
```

* 再说一种,页面需要关闭右上角分享,通过按钮转发,并在前面插上pages/index/home等等

```js
可以调用setShareData都无所谓
如果调用该方法后,会在data上直接插入share变量,可以直接在view上面使用.

如果没有调用该方法,需要自己去拼接类似share的变量,绑定到view对应的变量上
```

```html
<button open-type="share"
        data-share-img="{{ share.img }}"
        data-share-insert="{{ share.insert }}"
        data-share-title="{{ share.title }}"
        data-share-path="{{ share.path }}"
        data-share-query="{{ share.query }}"
        data-share-track="{{ share.track }}">
    分享
</button>
```

如果转发参数含有`insert`,从该链接(可以是海报/小程序卡片)进入会先进入insert页面,处理相应逻辑完成后,跳转(打开新页面)跳转到分享目标页面

## 其他的小功能

小功能我就不写name详细了,只在这里列出方法名和注释

* openMap               => 打开地图
* showModal
* tencent2baidu         =>腾轩转百度
* badidu2tencent        =>百度坐标转换腾讯坐标
* getDisByLocation      =>计算两个坐标之间的距离
* getMonthHasDayCounts  =>获取一个月多少天
* getDateDay            =>获取某天是周几
* storage               =>缓存
* formatMillis          =>根据毫秒,获取=>{day,hour,minute,second}
* getSecondByTwoTimer   =>根据两个时间,获取时间的差值,返回的是 秒
* compose               =>管道(从右到左)
* curry                 =>柯里化
* deleteArrayKeys       =>删除数组里keys
* deleteKeys            =>删除对象里keys
* pipe                  =>从左到右的管道
* Maybe                 =>函子
* _typeOf               =>变量类型
* jsonString            =>对象转字符串
* isObject              =>变量是否是对象
* isString              =>变量是否字符串
* isArray               =>变量是否数组
* getArrayLength        =>获取数组长度
* arrFirst              =>获取数组第一个元素
* addDiff               =>diff算法
* deepClone             =>简单克隆不含有function的对象
* checkImgSetting       =>检查是否有保存图片权限,如果没有直接打开授权页
* downloadImg           =>下载网络图片到缓存
* showToast
* hideToast
* getLocationSet        =>判断是否有定位权限
* updateApp             =>更新app
* hideShareMenu         =>隐藏右上角分享
* showShareMenu         =>显示右上角分享
* getCityInfoByBaiDu    =>根据腾讯坐标获取当前定位城市信息
* networkChangeEvent    =>监听网络变化
* saveImageToAlbum      =>保存图片到本地
* querySelector         =>获取元素的宽高top之类的属性
* setNavTitle           =>设置页面标题

....等等

<a 
target="_blank"
href="https://dev.tencent.com/u/jresun/p/coding/git/tree/master/wechat/wxapp">
coding:wxapp
</a>


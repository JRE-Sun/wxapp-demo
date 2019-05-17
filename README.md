
# 框架
小程序框架我只用过mpvue开发,这里我就说一下mpvue,可能是我道行不够深,mpvue是我用过最垃圾的框架,我写了一个版本的小程序,最后又用原生重写了一遍.

mpvue:在苹果上还凑活,在安卓上运行时间长了手机巨热,而且巨卡...
  
**蹬蹬蹬** 

最终我根据小程序和在公司写小程序的经验写了一套开发小程序的`框架wxapp`,准确的说`wxapp`不是框架只是一个基于原生小程序封装了一些方法,采用订阅者模式,支持scss的一个环境.开发小程序还是原生那样写,只不过需要遵循一些规则.熟悉`wxapp`之后,开发速度那是嗖嗖嗖的.

关于`wxapp`的介绍和说明这里就不写了,可以在github上去看.地址:[github:wxapp](https://github.com/JRE-Sun/wxapp-demo)

# 入门wxapp

目录结构

```
├── README.md
├── gulpfile.js              // gulp配置文件
├── package.json
└── wxapp                    // 把小程序代码写这个里面,最好不要改名称
    ├── app.js               // 小程序页面共有代码放在这里
    ├── app.json
    ├── app.scss
    ├── app.wxss
    ├── image
    ├── pages
    ├── project.config.json
    ├── tpl                  // 组件文件夹  
    │   ├── js               // 组件js部分
    │       ├── default.js   // 每个页面默认方法
    │   ├── scss             // scss
    │   └── views            // 视图 
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



每个页面和组件里面都有自己的mix是混合变量,该变量存放不需要传递给视图层的"多余"数据,以减少setData对视图层无用数据

使用方法:
1. 从git上clone到本地,修改最外层`wxapp-demo`文件夹名称为项目名称
2. 进入文件夹执行`cnpm i`安装项目依赖
3. 全局安装gulp `cnpm i g gulp`
4. 安装成功后,在当前目录执行`gulp`

**注意:** 文件夹`wxapp`存放小程序代码,每次新建scss文件需要重启gulp,否则gulp监听不到

# 使用规范


# runEvent
runEvent是整个框架的核心(订阅者模式),也就是事件分发这里不详细解释其原理,只说使用方法.

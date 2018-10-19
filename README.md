## wxapp
目录结构

```
├── README.md
├── gulpfile.js              // gulp配置文件
├── package.json
└── wxapp                    // 把小程序代码写这个里面,最好不要改名称
    ├── app.js
    ├── app.json
    ├── app.scss
    ├── app.wxss
    ├── image
    ├── pages
    ├── project.config.json
    ├── tpl                  // 组件文件夹  
    │   ├── js               // 组件js部分
    │   ├── scss             // scss
    │   └── views            // 视图 
    └── utils                
        ├── api.js           // ajax请求文件
        ├── config.js        // 项目配置文件
        ├── default.js       // 每个页面默认方法
        ├── fly.js
        ├── http.js
        ├── lodash.min.js
        ├── mock.js
        ├── runtime-module.js // 让小程序支持es7属性->async/asait
        ├── runtime.js        // 同上
        ├── util.js          
        ├── util.wxs
        └── xapp.js           // 合并小程序核心js
```

使用方法:
1. 从git上clone到本地,修改最外层`wxapp-demo`文件夹名称为项目名称
2. 进入文件夹执行`cnpm/npm i`安装项目依赖
3. 全局安装gulp `cnpm/npm i g gulp`
4. 安装成功后,在当前目录执行`gulp`

**注意:** 文件夹`wxapp`存放小程序代码,每次新建scss文件需要重启gulp,否则gulp监听不到



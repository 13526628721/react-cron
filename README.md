# React-cron

## 概述
    基于react和antd完成的一个创建cron的插件。核心代码在src/cron/index.js。

## 本地安装引用
```js
    import ReactCron from '@/cron/index.js'
    require("@/cron/index.css)

    class App extends React.Component {
        return <div>
            <ReactCron
                presetCRONExp={"* * * * * ? *"}     // 初始cron 默认 "* * * * * ? *"
                onCRONExpChanged={onCRONExpChanged}     // 修改时的回调
                i18n={"zh"}  //语言资源 "zh" || "en"
            />
        </div>
    }
```

## 下载后项目启动
```bash
# install dependencies
npm install
# Start the service
npm run start
# build for development 
npm run dev
# build for production 
npm run umd
```

# node-koa2-zhihu

接口文档地址
https://documenter.getpostman.com/view/9795002/2s8YzTTN8W

### 项目运行
``` js
yarn
// or
npm install

// 开发调试
yarn start:dist

// 构建打包
yarn build
```

### 简介
该项目为一个后端项目，该项目仿"知乎"，模拟实现了：
- JWT用户认证、授权模块
- 上传图片模块
- 个人资料模块
- 关注与粉丝模块
- 话题模块
- 问题模块
- 答案模块
- 评论模块

共计45个接口，代码规范遵循RESTful规范。

技术栈为：
- Koa2
- MongoDB
- PM2
- Nginx
- Webpack

项目使用了Webpack，进行构建压缩

### 下阶段计划
为其开发一个前端项目，进行数据承载
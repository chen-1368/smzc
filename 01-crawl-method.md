# 造梦无双客户端配置文件爬取方法

## 一、目标

入口 URL：`https://client-zmxyol.3304399.net/client/`

## 二、关键发现

游戏使用 **Cocos2d-js 引擎** 打包（H5 在线版），其 Web 入口 `index.html` 引用了 `main.df292.js` 与 `src/settings.2bf7a.js`。

`settings.<hash>.js` 内嵌了一个完整的 `jsList`，即**所有配置文件**的相对路径及哈希后缀列表。只需解析此文件即可获得全量配置清单，再通过 HTTP 直接下载。

> 注意：直接访问 `https://client-zmxyol.3304399.net/client/src/assets/script/config/` 会被网关返回 **403 Forbidden**（openresty 拒绝了目录枚举）。
> 解决办法：不去枚举目录，而是从 `settings.js` 拿到精确文件名后，**逐个文件 GET**（200 OK）。

## 三、整体流程

```
1. GET /client/index.html
       ↓ (提取 main.<hash>.js 和 src/settings.<hash>.js 的 URL)
2. GET /client/main.<hash>.js
       ↓ (可有可无，主要用于核对启动逻辑)
3. GET /client/src/settings.<hash>.js
       ↓ (window._CCSettings.jsList 数组就是全量配置清单)
4. 对 jsList 中每一项：
       GET https://client-zmxyol.3304399.net/client/<path>
       保存到本地
5. 每个文件内容形如：
       var tmp = [["header1","header2",...], [row1], [row2], ...];
       (window.__IS_SERVER__ ? module.exports=tmp : (window.configData ||= {}, window.configData.<name>=tmp));
   即"标题行 + 数据行"的二维表。首行即为字段名。
```

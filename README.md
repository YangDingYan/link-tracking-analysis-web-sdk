# link-tracking-analysis-web-sdk
## 全链路trace跟踪方案-简版

### 仓库使用手册
```
pnpm install     // 安装依赖
pnpm run dev     // 启动前端服务
pnpm run server  // 启动node服务
```

### 需求背景
* 业务：系统(app: [name、type]) + 项目(projectId) + 中心(siteId) +  用户(user)  + ...
* 实现：页面(page: [name、path]) 
* 校验位：时间戳(date)
* <strong>痛点</strong>：前后端在查看日志，定位问题的过程中，发现所有的日志都是混合在一起，不能及时定位到：使用者、系统、业务范围、指定接口及相关业务流程 等。因此，希望通过某种方式，可以支持对输出的日志进行关键词过滤，并从过滤结果中获取丰富的链路信息，实现快速定位问题代码。 

### 前端实践
* link-tracking-web-sdk 方法 【前端通用trace封装，提供对traceInfo信息构造、管理和写入的能力】
* axios 拦截封装(interceptors.request) 【拦截请求，并在header中添加trace信息】
* router.beforeach 【全路由拦截，自定义路由元信息，并拓展trace的路由信息】
* permission 权限拦截 【指定权限拦截，并拓展trace的权限信息】
* .......

### 后端实践
* 拦截接口，获取接口中的请求头trace信息 【请求拦截器、通用的请求入口函数等】
* 在各接口的执行流程中，输出日志 + 上述trace信息 【日志可按traceId过滤】
* .......

### 前端代码
#### SDK-Plugin
```ts
// axios的 headers参数
interface IHeader {
  [x: string]: any;
  'trace-id'?: string | number; // 每个请求生成的 uuid ，用于链路追踪, 生成规则：系统code + uuid + 当前时间戳
  'trace-page-name'?: string; // 页面名称，用于标识当前页面
  'trace-page-path'?: string; // 页面路径，用于标识当前页面
  'trace-app-name'?: string; // 每个系统对应的 code 用于识别系统
  'trace-app-type'?: string; // 应用类型 web/wap/app/manager-web
  'trace-api-path'?: string; // api路径，用于标识api使用场景
}

interface ILinkTrackingParams {
  traceId?: string | number; // 每个请求生成的uuid ，用于链路追踪, 生成规则：系统code + uuid + 当前时间戳
  tracePageName?: string; // 页面名称，用于标识当前页面
  tracePagePath?: string; // 页面路径，用于标识当前页面
  traceAppName?: string; //  每个系统对应的 code 用于识别系统
  traceAppType?: string; // 应用类型 web/wap/app/manager-web
  traceApiPath?: string; // api路径，用于标识api使用场景
  extend?: any; // 扩展字段，用于填充新参数
}

interface ILinkTrackingTools extends ILinkTrackingParams {
  setOptions(): void;
  generateUUId(): string;
}

/**
 * 驼峰转短横线
 * @param str
 * @returns
 */
function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, ($1) => `-${$1.toLocaleLowerCase()}`).replace(/^-/, '');
}

export default class LinkTrackingTools implements ILinkTrackingTools {
  [key: string]: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  getEncodingValue(value: string) {
    // 查询字符串是否包含中文字符集
    if (/[\u4e00-\u9fa5]/.test(value)) {
      return encodeURIComponent(value);
    }
    return value;
  }

  setOptions(options: ILinkTrackingParams = {}): void {
    // http请求头header参数Accept-Charset：iso-8859-5，浏览器可以接受的字符编码集。（前端转码，后端解码）
    this.tracePageName = this.getEncodingValue(options.tracePageName || '');
    this.tracePagePath = this.getEncodingValue(options.tracePagePath || '');
    this.traceAppName = this.getEncodingValue(options.traceAppName || '');
    this.traceAppType = this.getEncodingValue(options.traceAppType || '');
    this.traceApiPath = this.getEncodingValue(options.traceApiPath || '');
    this.extend = { ...this.extend, ...options.extend };
  }

  setHeaders(headers: IHeader): void {
    const { extend, tracePageName, tracePagePath, traceAppName, traceAppType, traceApiPath } = this;
    this.traceId = `${traceAppName}_${this.generateUUId()}_${Date.now()}`;

    // 将拓展字段中的属性提取到 headers 中
    if (extend) {
      Object.keys(extend).forEach((prop: string) => {
        headers[camelToKebab(prop)] = this.getEncodingValue(extend[prop]);
      });
    }

    headers['trace-id'] = this.traceId;
    headers['trace-page-name'] = tracePageName;
    headers['trace-page-path'] = tracePagePath;
    headers['trace-app-name'] = traceAppName;
    headers['trace-app-type'] = traceAppType;
    headers['trace-api-path'] = traceApiPath;
  }

  getHeaders(): IHeader {
    const {
      extend,
      traceId,
      tracePageName,
      tracePagePath,
      traceAppName,
      traceAppType,
      traceApiPath
    } = this;

    const headers = {};
    // 将拓展字段中的属性提取到 headers 中
    if (extend) {
      Object.keys(extend).forEach((prop: string) => {
        headers[camelToKebab(prop)] = extend[prop];
      });
    }

    return {
      ...headers,
      'trace-id': traceId || `${traceAppName}_${this.generateUUId()}_${Date.now()}`,
      'trace-page-name': tracePageName,
      'trace-page-path': tracePagePath,
      'trace-app-name': traceAppName,
      'trace-app-type': traceAppType,
      'trace-api-path': traceApiPath
    };
  }

  generateUUId(): string {
    const tempUrl = URL.createObjectURL(new Blob());
    const uuid = tempUrl.toString();
    URL.revokeObjectURL(tempUrl);
    return uuid.substr(uuid.lastIndexOf('/') + 1);
  }
}
```

#### 项目应用-SDK初始化
```ts
import LinkTrackingTools from "tracking-analysis-web-sdk";

// 端链路SDK
export const linkTrackingTools = new LinkTrackingTools();

// 端链路SDK-默认设置
linkTrackingTools.setOptions({
  tracePageName: "首页",
  tracePagePath: "/home",
  traceAppName: "pmcp",
  traceAppType: "web",
  extend: {
    tracePageLoadedTime: Date.now(),
  },
});
```

#### 项目应用-请求拦截器
```ts
import Axios from "axios";
import { linkTrackingTools } from "@/core/link-tracking-tools.ts";

let reqInterceptor = null || {};
Axios.interceptors.request.eject(reqInterceptor);
reqInterceptor = Axios.interceptors.request.use(
	(config) => {
  	// ...
    linkTrackingTools.traceApiPath = config.url;
    linkTrackingTools.setHeaders(config.headers);
  },
  (error) => {
    return Promise.reject(error);
  }
)
```
```ts
import axios from "axios";
import { linkTrackingTools } from "@/core/link-tracking-tools";

axios.defaults.baseURL = "/link-tracking";
class ProxyHttp {
    reqIntercepter;
    constructor() {
        this.initInterceptors();
    }
    initInterceptors() {
        axios.interceptors.request.eject(this.reqIntercepter);
        axios.interceptors.request.use((config) => {
            linkTrackingTools.traceApiPath = config.url;
            linkTrackingTools.setHeaders(config.headers);
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
    }
    fullfilled = (res) => {
        return new Promise((resolve, reject) => {
            resolve(res.data);
        });
    };
    get(api, params, path) {
        let url = api;
        if (path) {
            const param = path.join("/");
            url += "/" + param;
        }
        return axios.get(url, { params }).then(this.fullfilled);
    }
    post() {
        return axios;
    }
}
export const proxyHttp = new ProxyHttp();
```

#### 项目应用-路由拦截器
```ts
import VueRouter from "vue-router";
import { linkTrackingTools } from '@/core/link-tracking-tools.ts'
import store from "./core/store";

Vue.use(VueRouter);
const router = new VueRouter({
   base: ;
   mode: "history",
   routes,
   scrollBehavior: (to, from, savedPosition) => {
    	return savedPosition || { x: 0, y: 0 }
   }
})

router.beforeEach(async (to, from, next) => {
	const user = store.getters.getAccountInfo.adminUser;
  store.commit("SET_DEFAULT_ORGANIZATION", store.getters.getAccountInfo);
  
  // 端链路SDK-设置
  linkTrackingTools.setOptions({
    ...linkTrackingTools,
    tracePageName: to.name,
    tracePagePath: to.path,
    extend: {
      traceUserId: user?.id,
      traceRealName: user?.realName,
      traceSiteId: to?.params?.sid || "",
      traceProjectId: to?.params?.pid || "",
      tracePageLoadedTime: Date.now(),
    },
  });
})
```

#### 项目应用-demo页面发送请求
```html
<template>
  <div>Home</div>
  <button @click="handleClick1">业务请求1</button>
  <h4>{{ click1Data }}</h4>
  <button @click="handleClick2">业务请求2</button>
  <h4>{{ click2Data }}</h4>
</template>

<script lang="ts">
import {Vue} from "vue-class-component";
import axios from "@/axios/index";
import { proxyHttp } from "@/axios/index";

export default class Home extends Vue {
  click1Data:any = null;
  click2Data:any = null;

  handleClick1() {
    // axios({url: "/demo/v1/3333", method: "get"})
    axios.get("/demo/v1/3333")
    .then(response => {
      this.click1Data = response.data;
      return;
    })
    .catch(error => {
      return;
    })
  }

  async handleClick2() {
    const result = await proxyHttp.get("/demo/v2", null, ["4444"]);
    this.click2Data = result;
    return;
  }
}
</script>
```

### 后端代码
#### 服务应用-请求拦截
```ts
const express = require("express");
const app = new express();

app.all("*", function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', ' 3.2.1')
  res.header('Content-Type', 'application/json;charset=utf-8')

  global.traceInfo = {
    traceAppType: req.get("trace-app-type"),
    traceAppName: req.get("trace-app-name"),
    tracePagePath: req.get("trace-page-path"),
    tracePageName: req.get("trace-page-name"),
    tracePageLoadedTime: req.get("trace-page-loaded-time"),
    traceApiPath: req.get("trace-api-path"),
    traceId: req.get("trace-id"),
  }
  next()
})
```

#### 服务应用-API定义
```ts
const { getLoadSystemMenuList1, getLoadSystemMenuList2 }  = require("../service/index.ts")
const controllers = [
  {
    path: "/demo/v1/:code",
    method: "get",
    callback: function(req, res){
      res.send(getLoadSystemMenuList1(req));
    }
  },
  {
    path: "/demo/v2/:id",
    method: "get",
    callback: function(req, res){
      res.send(getLoadSystemMenuList2(req));
    }
  }
];
exports.controllers = controllers;
```

#### 服务应用-业务实现+日志输出
```ts
function handleData1() {
  const data = { message: "successV1", code: "200" };
  console.info(global.traceInfo, "handleData1");
  return data;
}

function handleData2() {
  const data = { message: "error", code: "304" };
  console.info(global.traceInfo, "handleData2");
  return data;
}

exports.getLoadSystemMenuList1 = function (req) {
  const data = handleData1();
  console.warn(global.traceInfo, "getLoadSystemMenuList1");
  return data;
}

exports.getLoadSystemMenuList2 = function (req) {
  const data = handleData2();
  console.warn(global.traceInfo, "getLoadSystemMenuList2");
  return data;
}
```
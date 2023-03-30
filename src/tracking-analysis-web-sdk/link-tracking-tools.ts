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

    const headers = {} as any;
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
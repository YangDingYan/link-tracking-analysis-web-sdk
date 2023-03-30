/**
 * 驼峰转短横线
 * @param str
 * @returns
 */
function camelToKebab(str) {
    return str.replace(/([A-Z])/g, ($1) => `-${$1.toLocaleLowerCase()}`).replace(/^-/, '');
}
export default class LinkTrackingTools {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    getEncodingValue(value) {
        // 查询字符串是否包含中文字符集
        if (/[\u4e00-\u9fa5]/.test(value)) {
            return encodeURIComponent(value);
        }
        return value;
    }
    setOptions(options = {}) {
        // http请求头header参数Accept-Charset：iso-8859-5，浏览器可以接受的字符编码集。（前端转码，后端解码）
        this.tracePageName = this.getEncodingValue(options.tracePageName || '');
        this.tracePagePath = this.getEncodingValue(options.tracePagePath || '');
        this.traceAppName = this.getEncodingValue(options.traceAppName || '');
        this.traceAppType = this.getEncodingValue(options.traceAppType || '');
        this.traceApiPath = this.getEncodingValue(options.traceApiPath || '');
        this.extend = { ...this.extend, ...options.extend };
    }
    setHeaders(headers) {
        const { extend, tracePageName, tracePagePath, traceAppName, traceAppType, traceApiPath } = this;
        this.traceId = `${traceAppName}_${this.generateUUId()}_${Date.now()}`;
        // 将拓展字段中的属性提取到 headers 中
        if (extend) {
            Object.keys(extend).forEach((prop) => {
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
    getHeaders() {
        const { extend, traceId, tracePageName, tracePagePath, traceAppName, traceAppType, traceApiPath } = this;
        const headers = {};
        // 将拓展字段中的属性提取到 headers 中
        if (extend) {
            Object.keys(extend).forEach((prop) => {
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
    generateUUId() {
        const tempUrl = URL.createObjectURL(new Blob());
        const uuid = tempUrl.toString();
        URL.revokeObjectURL(tempUrl);
        return uuid.substr(uuid.lastIndexOf('/') + 1);
    }
}
//# sourceMappingURL=link-tracking-tools.js.map
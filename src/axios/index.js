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
export default axios;
//# sourceMappingURL=index.js.map
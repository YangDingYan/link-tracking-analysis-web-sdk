import axios, {AxiosResponse} from "axios";
import { linkTrackingTools } from "@/core/link-tracking-tools";

axios.defaults.baseURL = "/link-tracking";

// const reqIntercepter: any = {};
// reqIntercepter =
class ProxyHttp {
  private reqIntercepter:any;
  constructor() {
    this.initInterceptors()
  }
  initInterceptors() {
    axios.interceptors.request.eject(this.reqIntercepter);
    axios.interceptors.request.use(
      (config:any) => {
        linkTrackingTools.traceApiPath = config.url;
        linkTrackingTools.setHeaders(config.headers);
        return config;
      },  
      (error:any) => {
        return Promise.reject(error);
      } 
    );
  }
  private fullfilled = <T>(res: AxiosResponse) => {
    return new Promise<T>((resolve:any, reject:any) => {
      resolve(res.data)
    })
  }
  public get<T, K>(api:string, params: K, path?: string[]): Promise<T> {
    let url = api;
    if(path) {
      const param = path.join("/");
      url += "/" + param;
    }
    return axios.get(url, {params}).then<T>(this.fullfilled)
  }
  public post() {
    return axios
  }
}

export const proxyHttp = new ProxyHttp();
export default axios;
import { BaseService } from "./base.serv";

export interface ITaskLinkService {
  getUserById(id:number): Promise<any>;
}

type TaskLinkServiceCtor = new () => TaskLinkService;
export function createTaskLinkService(ctor: TaskLinkServiceCtor): ITaskLinkService {
  return new ctor();
}

export class TaskLinkService extends BaseService implements ITaskLinkService { 
  constructor() { super() }

  getUserById(id: number): Promise<any> {
    return this.proxHttp.get("getUserById",{}, [id]);
  }
}


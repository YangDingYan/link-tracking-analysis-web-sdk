import { createTaskLinkService, ITaskLinkService, TaskLinkService } from './task-link.serv';

export class Services {
  static taskLinkService: ITaskLinkService;
  static createTaskLinkService() {
    if(this.taskLinkService) {
      return this.taskLinkService;
    }
    this.taskLinkService = createTaskLinkService(TaskLinkService);
    return this.taskLinkService;
  }
}
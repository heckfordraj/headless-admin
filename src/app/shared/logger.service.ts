import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

@Injectable()
export class LoggerService {
  log(val: any, ...params: any[]) {
    if (environment.production) return;

    console.log(val, ...params);
  }

  warn(val: any, ...params: any[]) {
    console.warn(val, ...params);
  }

  error(val: any, ...params: any[]) {
    console.error(val, ...params);
  }
}

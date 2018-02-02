import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const noop = () => undefined;

@Injectable()
export class LoggerService {
  constructor() {
    if (environment.production) {
      return {
        log: noop,
        warn: noop,
        error: noop
      };
    }
  }

  log(val: any, ...params: any[]) {
    console.log(val, ...params);
  }

  warn(val: any, ...params: any[]) {
    console.warn(val, ...params);
  }

  error(val: any, ...params: any[]) {
    console.error(val, ...params);
  }
}

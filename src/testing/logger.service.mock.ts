export { LoggerService } from 'shared';

export class MockLoggerService {
  log(val: any, ...params: any[]) {
    return;
  }

  warn(val: any, ...params: any[]) {
    return;
  }

  error(val: any, ...params: any[]) {
    return;
  }
}

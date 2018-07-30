export { LoggerService } from 'shared';

export class MockLoggerService {
  log(_val: any, ..._params: any[]) {
    return;
  }

  warn(_val: any, ..._params: any[]) {
    return;
  }

  error(_val: any, ..._params: any[]) {
    return;
  }
}

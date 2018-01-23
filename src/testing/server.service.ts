import { Observable } from 'rxjs/Observable';

export class ServerServiceStub {
  getCollection(): Observable<any> {
    return Observable.of(null);
  }
}

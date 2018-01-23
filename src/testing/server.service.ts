import { Observable } from 'rxjs/Observable';

import { Pages } from './pages';
import { Page } from '../app/shared/page';

export class ServerServiceStub {
  getCollection(): Observable<Page[]> {
    return Observable.of(Pages);
  }
}

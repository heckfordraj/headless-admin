import { Observable } from 'rxjs/Observable';

import { Pages } from './pages';
import { Page } from '../app/shared/page';

export class ServerServiceStub {
  createId(): string {
    return 'abcdefg';
  }

  getCollection(): Observable<Page[]> {
    return Observable.of(Pages);
  }

  addPage(page: Page): Promise<void> {
    return Promise.resolve(null);
  }
}

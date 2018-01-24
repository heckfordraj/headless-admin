import { Observable } from 'rxjs/Observable';

import { Pages } from './pages';
import { Page } from '../app/shared/page';

export class ServerServiceStub {
  createId(): string {
    return 'abcdefg';
  }

  getPage(id: string): Observable<Page> {
    return Observable.of(Pages.find((page: Page) => page.id === id));
  }

  getCollection(): Observable<Page[]> {
    return Observable.of(Pages);
  }

  addPage(page: Page): Promise<void> {
    return Promise.resolve(null);
  }

  updatePage(currentPage: Page, newPage: Page): Promise<void> {
    return Promise.resolve(null);
  }

  removePage(page: Page): Promise<void> {
    return Promise.resolve(null);
  }
}

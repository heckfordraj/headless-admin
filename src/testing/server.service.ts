export { Page } from '../app/shared/page';
export { Block } from '../app/shared/block';

import { Observable } from 'rxjs/Observable';

import { Pages, Blocks } from './pages';
import { Page } from '../app/shared/page';
import { Block } from '../app/shared/block';

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

  publishPage(page: Page): Promise<void> {
    return Promise.resolve(null);
  }

  getBlocks(page: Page): Observable<Block.Base[]> {
    let block = Object.keys(Blocks).find((key: string) => key === page.dataId);

    return Observable.of(Blocks[block]);
  }
}

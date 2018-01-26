import { Observable } from 'rxjs/Observable';

import { Page } from './page';
import { Block } from './block';
import { Pages, Blocks } from './data';

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

  addBlock(page: Page, block: Block.Base): Promise<void> {
    return Promise.resolve(null);
  }

  removeBlock(page: Page, block: Block.Base): Promise<void> {
    return Promise.resolve(null);
  }
}

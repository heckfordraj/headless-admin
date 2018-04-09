import { Observable } from 'rxjs/Observable';

import { Page } from './page';
import { Block } from './block';
import { Pages, Blocks } from './data';

export class ServerServiceStub {
  createTimestamp(): number {
    return Date.now();
  }

  createId(): string {
    return 'abcdefg';
  }

  updateBlockContent() {
    return;
  }

  getBlockContent() {
    return;
  }

  getPage(id: string): Observable<Page> {
    let index = Pages.find((page: Page) => page.id === id);

    if (index) {
      let page = JSON.stringify(index);

      return Observable.of(JSON.parse(page));
    }
    return Observable.of(undefined);
  }

  getCollection(): Observable<Page[]> {
    let pages = JSON.stringify(Pages);

    return Observable.of(JSON.parse(pages));
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
    let index = Object.keys(Blocks).find((key: string) => key === page.dataId);

    if (index) {
      let block = JSON.stringify(Blocks[index]);

      return Observable.of(JSON.parse(block));
    }
    return Observable.of(undefined);
  }

  addBlock(page: Page, block: Block.Base): Promise<void> {
    return Promise.resolve(null);
  }

  removeBlock(page: Page, block: Block.Base): Promise<void> {
    return Promise.resolve(null);
  }

  updateBlock(
    page: Page,
    block: Block.Base,
    data: Block.Data.Base
  ): Promise<void> {
    return Promise.resolve(null);
  }

  orderBlock(
    page: Page,
    block: Block.Base,
    blockReplaced: Block.Base
  ): Promise<void> {
    return Promise.resolve(null);
  }
}

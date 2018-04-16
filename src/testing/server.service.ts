import { EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { Page } from './page';
import { Block } from './block';
import { Pages, Blocks } from './data';

export class ServerServiceStub {
  blockContent: EventEmitter<Block.Data.Base> = new EventEmitter();
  content: Block.Data.TextData[] = [];

  constructor() {
    this.blockContent.subscribe(data => (this.content[data.id] = data));
  }

  createTimestamp(): number {
    return Date.now();
  }

  createId(): string {
    return 'abcdefg';
  }

  updateBlockContent(block: Block.Base, data: Block.Data.TextData) {
    return {
      transaction: (
        transactionUpdate: (a: any) => any,
        onComplete?: (a: Error | null, b: boolean, c: any) => void
      ): Promise<any> => {
        class Deferred {
          promise: Promise<any>;
          reject;
          resolve;
          constructor() {
            this.promise = new Promise((resolve, reject) => {
              this.resolve = resolve;
              this.reject = reject;
            });
          }
        }

        const deferred = new Deferred();

        if (!transactionUpdate || !onComplete) {
          this.content[data.id] = { id: null, user: null };

          setTimeout(() => {
            this.blockContent.emit(data);
            deferred.resolve(true);
          }, 200);

          return;
        }

        if (this.content[data.id]) {
          transactionUpdate(this.content[data.id]);
          onComplete(null, false, data);
          deferred.resolve(false);
        } else {
          setTimeout(() => {
            this.blockContent.emit(data);
            onComplete(null, true, data);
            deferred.resolve(true);
          }, 200);
        }
        return deferred.promise;
      }
    };
  }

  getBlockContent(block: Block.Base): Observable<Block.Data.Base> {
    return this.blockContent;
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

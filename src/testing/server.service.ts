import { EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { Page, User } from './page';
import { Block } from './block';
import { Pages, Blocks } from './data';

export class ServerServiceStub {
  private blockContent: EventEmitter<Block.Data.Base> = new EventEmitter();
  private content: Block.Data.TextData[] = [];

  constructor() {
    this.blockContent.subscribe(data => (this.content[data.id] = data));
  }

  getUser(): User {
    return {
      id: 'abc',
      colour: '#000'
    };
  }

  createTimestamp(): number {
    return Date.now();
  }

  createId(): string {
    return 'abcdefg';
  }

  updateBlockContent(
    block: Block.Base,
    data: Block.Data.TextData
  ): Promise<void> {
    return Promise.resolve();
  }

  updateTextBlockContent(
    block: Block.Base,
    data: Block.Data.TextData,
    delayConfirm?: boolean
  ) {
    return new Promise((resolve, reject) => {
      if (delayConfirm) {
        this.content[data.id] = { id: null, user: null };

        return setTimeout(() => {
          this.blockContent.emit(data);
          resolve();
        }, 200);
      }

      if (this.content[data.id]) return reject();

      return setTimeout(() => {
        this.blockContent.emit(data);
        resolve();
      }, 200);
    });
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

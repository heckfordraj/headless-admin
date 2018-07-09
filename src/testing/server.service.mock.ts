import { EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { Page } from './page';
import { Block } from './block';
import { User } from './user';
import { Data } from './data';

export { ServerService } from 'shared';

export class MockServerService {
  private blockContent: EventEmitter<Block.Data.Base> = new EventEmitter();
  private content: Block.Data.TextData[] = [];

  constructor() {
    this.getUser = spyOn(this, 'getUser').and.callThrough();
    this.updateUser = spyOn(this, 'updateUser').and.callThrough();
    this.getUsers = spyOn(this, 'getUsers').and.callThrough();
    this.createTimestamp = spyOn(this, 'createTimestamp').and.callThrough();
    this.createId = spyOn(this, 'createId').and.callThrough();
    this.updateBlockContent = spyOn(this, 'updateBlockContent').and.callThrough();
    this.updateTextBlockContent = spyOn(this, 'updateTextBlockContent').and.callThrough();
    this.getBlockContent = spyOn(this, 'getBlockContent').and.callThrough();
    this.getPage = spyOn(this, 'getPage').and.callThrough();
    this.getCollection = spyOn(this, 'getCollection').and.callThrough();
    this.addPage = spyOn(this, 'addPage').and.callThrough();
    this.updatePage = spyOn(this, 'updatePage').and.callThrough();
    this.removePage = spyOn(this, 'removePage').and.callThrough();
    this.publishPage = spyOn(this, 'publishPage').and.callThrough();
    this.getBlocks = spyOn(this, 'getBlocks').and.callThrough();
    this.addBlock = spyOn(this, 'addBlock').and.callThrough();
    this.removeBlock = spyOn(this, 'removeBlock').and.callThrough();
    this.updateBlock = spyOn(this, 'updateBlock').and.callThrough();
    this.orderBlock = spyOn(this, 'orderBlock').and.callThrough();

    this.blockContent.subscribe(data => (this.content[data.id] = data));
  }

  getUser(): User {
    return {
      id: 'abc',
      colour: '#000'
    };
  }

  updateUser(
    { id: pageId }: Page,
    { current: { blockId, data } }: User = {
      id: null,
      colour: null,
      current: { blockId: null, data: null }
    }
  ): Promise<void> {
    return Promise.resolve();
  }

  getUsers(): Observable<User[]> {
    return Observable.of(Data.Users);
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
    let index = Data.Pages.find((page: Page) => page.id === id);

    if (index) {
      let page = JSON.stringify(index);

      return Observable.of(JSON.parse(page));
    }
    return Observable.of(undefined);
  }

  getCollection(): Observable<Page[]> {
    let pages = JSON.stringify(Data.Pages);

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
    let index = Object.keys(Data.Blocks).find((key: string) => key === page.dataId);

    if (index) {
      let block = JSON.stringify(Data.Blocks[index]);

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

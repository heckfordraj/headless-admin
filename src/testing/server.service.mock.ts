import { EventEmitter } from '@angular/core';

import { Observable, of } from 'rxjs';

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
    this.updateBlockContent = spyOn(
      this,
      'updateBlockContent'
    ).and.callThrough();
    this.updateTextBlockContent = spyOn(
      this,
      'updateTextBlockContent'
    ).and.callThrough();
    this.getBlockContent = spyOn(this, 'getBlockContent').and.callThrough();
    this.getPage = spyOn(this, 'getPage').and.callThrough();
    this.getCollection = spyOn(this, 'getCollection').and.callThrough();
    this.addPage = spyOn(this, 'addPage').and.callThrough();
    this.updatePage = spyOn(this, 'updatePage').and.callThrough();
    this.removePage = spyOn(this, 'removePage').and.callThrough();
    this.archivePage = spyOn(this, 'archivePage').and.callThrough();
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
    _page: Page,
    _user: User = {
      id: null,
      colour: null,
      current: { blockId: null, data: null }
    }
  ): Promise<void> {
    return Promise.resolve();
  }

  getUsers(): Observable<User[]> {
    return of(Data.getUsers());
  }

  createTimestamp(): object {
    return {
      date: 'ddmmyyyy'
    };
  }

  createId(): string {
    return 'abcdefg';
  }

  updateBlockContent(
    _block: Block.Base,
    _data: Block.Data.TextData
  ): Promise<void> {
    return Promise.resolve();
  }

  updateTextBlockContent(
    _block: Block.Base,
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
    if (block && block.type === 'text') return this.blockContent;

    return of(Data.getImageBlockData());
  }

  getPage(id: string): Observable<Page> {
    return of(Data.getPages(id));
  }

  getCollection(_name: string, _status: string): Observable<Page[]> {
    return of(Data.getPages<void>());
  }

  addPage(_page: Page): Promise<void> {
    return Promise.resolve(null);
  }

  updatePage(_currentPage: Page, _newPage: Page): Promise<void> {
    return Promise.resolve(null);
  }

  archivePage(_page: Page): Promise<void> {
    return Promise.resolve(null);
  }

  removePage(_page: Page): Promise<void> {
    return Promise.resolve(null);
  }

  publishPage(_page: Page): Promise<void> {
    return Promise.resolve(null);
  }

  getBlocks(_page: Page): Observable<Block.Base[]> {
    return of(Data.getBlocks<void>());
  }

  addBlock(_page: Page, _block: Block.Base): Promise<void> {
    return Promise.resolve(null);
  }

  removeBlock(_page: Page, _block: Block.Base): Promise<void> {
    return Promise.resolve(null);
  }

  updateBlock(
    _page: Page,
    _block: Block.Base,
    _data: Block.Data.Base
  ): Promise<void> {
    return Promise.resolve(null);
  }

  orderBlock(
    _page: Page,
    _block: Block.Base,
    _blockReplaced: Block.Base
  ): Promise<void> {
    return Promise.resolve(null);
  }
}

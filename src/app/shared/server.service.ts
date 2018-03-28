import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { AngularFireDatabase, DatabaseSnapshot } from 'angularfire2/database';
import * as firebase from 'firebase';

import { LoggerService } from './logger.service';
import { HumanizePipe } from '../shared/humanize.pipe';
import { Page } from './page';
import { Block } from './block';
import { TextData } from '../content/content';

@Injectable()
export class ServerService {
  constructor(
    private db: AngularFireDatabase,
    private logger: LoggerService,
    private humanize: HumanizePipe
  ) {}

  createTimestamp(): object {
    return firebase.database.ServerValue.TIMESTAMP;
  }

  updateContent(user: number, ops: Quill.DeltaOperation[]) {
    ops.forEach(op => {
      for (let attr in op.attributes) {
        return (op.attributes[attr] = op.attributes[attr] || false);
      }
    });

    const content: TextData = {
      user: user,
      ops: ops
    };
    return this.db.list('content').push(content);
  }

  updateBlockContent(block: Block.Base, data: Block.Data.Base): Promise<void> {
    return this.db.object(`content/${block.id}/${data.id}`).set(data);
  }

  getBlockContent(block: Block.Base): Observable<Block.Data.Base> {
    return this.db
      .list(`content/${block.id}`)
      .stateChanges(['child_added'])
      .map(content => content.payload.val())
      .pipe(
        tap(content => this.logger.log('getBlockContent', content)),
        catchError(this.handleError<Block.Data.Base>('getBlockContent'))
      );
  }

  getContent(): Observable<TextData> {
    return this.db
      .list('content')
      .stateChanges(['child_added'])
      .map(content => content.payload.val())
      .pipe(catchError(this.handleError<Page[]>('getContent')));
  }

  createId(): string {
    return this.db.createPushId();
  }

  getCollection(name: string): Observable<Page[]> {
    return this.db
      .list<Page>(name, ref => ref.orderByChild('lastModified'))
      .valueChanges()
      .map(pages => pages.reverse())
      .pipe(
        tap(res => this.logger.log('getCollection', res)),
        catchError(this.handleError<Page[]>('getCollection', []))
      );
  }

  getPage(id: string): Observable<Page> {
    return this.db
      .object<Page>(`pages/${id}`)
      .valueChanges()
      .pipe(
        tap(res => this.logger.log('getPage', res)),
        catchError(this.handleError<Page>('getPage'))
      );
  }

  getBlocks(page: Page): Observable<Block.Base[]> {
    return this.db
      .list<Block.Base>(
        `data/${page.dataId}/${page.revisions.currentId}`,
        ref => ref.orderByChild('order')
      )
      .valueChanges()
      .pipe(
        tap(res => this.logger.log('getBlocks', res)),
        catchError(this.handleError<Block.Base[]>('getBlocks', []))
      );
  }

  addPage(page: Page): Promise<void> {
    return this.db.object<Page>(`pages/${page.id}`).set(page);
  }

  orderBlock(
    page: Page,
    block: Block.Base,
    blockReplaced: Block.Base
  ): Promise<void> {
    const updates = {
      [`${block.id}/order`]: block.order,
      [`${blockReplaced.id}/order`]: blockReplaced.order
    };

    return this.db.database
      .ref(`data/${page.dataId}/${page.revisions.currentId}`)
      .update(updates);
  }

  addBlock(page: Page, block: Block.Base): Promise<void> {
    return this.db
      .list<Block.Base>(`data/${page.dataId}/${page.revisions.currentId}`)
      .set(block.id, block);
  }

  updatePage(currentPage: Page, newId: string): Promise<void> {
    const newName = this.humanize.transform(newId);

    const newPage: Page = {
      id: newId,
      name: newName,
      dataId: currentPage.dataId,
      revisions: { currentId: currentPage.revisions.currentId },
      lastModified: this.createTimestamp()
    };

    const updates = {
      [newPage.id]: newPage,
      [currentPage.id]: null
    };

    return this.db.database.ref('pages').update(updates);
  }

  updateBlock(
    page: Page,
    block: Block.Base,
    data: Block.Data.Base
  ): Promise<void> {
    return this.db
      .list<Block.Data.Base>(
        `data/${page.dataId}/${page.revisions.currentId}/${block.id}/data`
      )
      .set(data.id, data);
  }

  removePage(page: Page): Promise<void> {
    const updates = {
      [`pages/${page.id}`]: null,
      [`data/${page.dataId}`]: null
    };

    return this.db.database.ref().update(updates);
  }

  removeBlock(page: Page, block: Block.Base): Promise<void> {
    return this.db
      .list<Block.Base>(`data/${page.dataId}/${page.revisions.currentId}`)
      .remove(block.id);
  }

  publishPage(page: Page): Promise<void> {
    const newId = this.createId();

    return this.db.database
      .ref(`data/${page.dataId}/${page.revisions.currentId}`)
      .once('value')
      .then((blocks: DatabaseSnapshot) =>
        this.db.database.ref(`data/${page.dataId}/${newId}`).set(blocks.val())
      )
      .then(_ =>
        this.db.database.ref(`pages/${page.id}/revisions/`).update({
          publishedId: page.revisions.currentId,
          currentId: newId
        })
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.logger.error(operation, error);
      return of(result as T);
    };
  }
}

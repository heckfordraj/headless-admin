import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { catchError, tap } from 'rxjs/operators';
import 'rxjs/add/observable/throw';

import { AngularFireDatabase, DatabaseSnapshot } from 'angularfire2/database';

import { Page } from './page';
import { Block } from './block';

@Injectable()
export class ServerService {
  constructor(private db: AngularFireDatabase) {}

  createId(): string {
    return this.db.createPushId();
  }

  getCollection(name: string): Observable<Page[]> {
    return this.db
      .list<Page>('pages')
      .valueChanges()
      .pipe(
        tap((res: any) => console.dir(res)),
        catchError(this.handleError<Page>('getCollection'))
      );
  }

  getPage(id: string): Observable<Page> {
    return this.db
      .object<Page>(`pages/${id}`)
      .valueChanges()
      .pipe(
        tap((res: any) => console.log(res)),
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
        tap((res: any) => console.dir(res)),
        catchError(this.handleError<Block.Base>('getBlocks'))
      );
  }

  addPage(page: Page): Promise<void> {
    return this.db
      .object<Page>(`pages/${page.id}`)
      .set(page)
      .catch((err: Error) => console.error(err));
  }

  orderBlock(page: Page, block: Block.Base, blockReplaced: Block.Base) {
    const updates = {
      [`${block.id}/order`]: block.order,
      [`${blockReplaced.id}/order`]: blockReplaced.order
    };

    return this.db.database
      .ref(`data/${page.dataId}/${page.revisions.currentId}`)
      .update(updates)
      .then((res: any) => console.log(res))
      .catch((err: Error) => console.error(err));
  }

  addBlock(page: Page, block: Block.Base): Promise<void> {
    return this.db
      .list<Block.Base>(`data/${page.dataId}/${page.revisions.currentId}`)
      .set(block.id, block)
      .then((res: any) => console.log(res))
      .catch((err: Error) => console.error(err));
  }

  updatePage(currentPage: Page, newPage: Page): Promise<void> {
    const updates = {
      [newPage.id]: newPage,
      [currentPage.id]: null
    };

    return this.db.database
      .ref('pages')
      .update(updates)
      .catch((err: Error) => console.error(err));
  }

  updateBlock(page: Page, blockId: string, data: Block.Data.Base) {
    return this.db
      .list<Block.Data.Base>(
        `data/${page.dataId}/${page.revisions.currentId}/${blockId}/data`
      )
      .set(data.id, data)
      .then((res: any) => console.log(res))
      .catch((err: Error) => console.error(err));
  }

  removePage(page: Page): Promise<void> {
    const updates = {
      [`pages/${page.id}`]: null,
      [`data/${page.dataId}`]: null
    };

    return this.db.database
      .ref()
      .update(updates)
      .catch((err: Error) => console.error(err));
  }

  removeBlock(page: Page, block: Block.Base) {
    return this.db
      .list<Block.Base>(`data/${page.dataId}/${page.revisions.currentId}`)
      .remove(block.id)
      .then((res: any) => console.log(res))
      .catch((err: Error) => console.error(err));
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
      )
      .catch((err: Error) => console.error(err));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return Observable.throw(error as T);
    };
  }
}

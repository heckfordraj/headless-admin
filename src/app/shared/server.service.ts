import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { catchError, tap } from 'rxjs/operators';
import 'rxjs/add/observable/throw';

import { AngularFireDatabase } from 'angularfire2/database';

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

  getBlocks(id: string): Observable<Block.Base[]> {
    return this.db
      .list<Block.Base>(`data/${id}`, ref => ref.orderByChild('order'))
      .valueChanges()
      .pipe(
        tap((res: any) => console.log(res)),
        catchError(this.handleError<Block.Base>('getBlocks'))
      );
  }

  addPage(page: Page) {
    return this.db
      .object<Page>(`pages/${page.id}`)
      .set(page)
      .catch((err: Error) => console.error(err));
  }

  orderBlock(dataId: string, block: Block.Base, blockReplaced: Block.Base) {
    const updates = {
      [`${block.id}/order`]: block.order,
      [`${blockReplaced.id}/order`]: blockReplaced.order
    };

    return this.db.database
      .ref(`data/${dataId}`)
      .update(updates)
      .then((res: any) => console.log(res))
      .catch((err: Error) => console.error(err));
  }

  addBlock(dataId: string, block: Block.Base) {
    return this.db
      .list<Block.Base>(`data/${dataId}`)
      .set(block.id, block)
      .then((res: any) => console.log(res))
      .catch((err: Error) => console.error(err));
  }

  updatePage(currentPage: Page, newPage: Page) {
    const updates = {
      [newPage.id]: newPage,
      [currentPage.id]: null
    };

    return this.db.database.ref('pages').update(updates);
  }

  updateBlock(dataId: string, blockId: string, data: Block.Data.Base) {
    return this.db
      .list<Block.Data.Base>(`data/${dataId}/${blockId}/data`)
      .set(data.id, data)
      .then((res: any) => console.log(res))
      .catch((err: Error) => console.error(err));
  }

  removePage(page: Page) {
    const updates = {
      [`pages/${page.id}`]: null,
      [`data/${page.dataId}`]: null
    };

    return this.db.database.ref().update(updates);
  }

  removeBlock(dataId: string, block: Block.Base) {
    return this.db
      .list<Block.Base>(`data/${dataId}`)
      .remove(block.id)
      .then((res: any) => console.log(res))
      .catch((err: Error) => console.error(err));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return Observable.throw(error as T);
    };
  }
}

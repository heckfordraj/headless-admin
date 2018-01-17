import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, tap, map, flatMap } from 'rxjs/operators';
import 'rxjs/add/observable/throw';

import { AngularFireDatabase } from 'angularfire2/database';

import { Page } from './page';
import { Block } from './block';

namespace Response {
  export interface Page {
    _id: string;
    data: any[] | any;
    name: string;
    slug: string;
    type: string;
    __v: boolean;
  }

  export interface Block {
    _id: string;
    type: string;
    data: any[] | any;
  }
}

@Injectable()
export class ServerService {
  constructor(private http: HttpClient, private db: AngularFireDatabase) {}

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
      .list<Block.Base>(`data/${id}`)
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

  addFile(file: File): Observable<any> {
    return;
    // const url = 'http://localhost:4100/upload';
    //
    // const formData = new FormData();
    // formData.append('image', file);
    //
    // return this.http
    //   .post<any>(url, formData)
    //   .pipe(
    //     tap((res: any) => console.log('addFile')),
    //     catchError(this.handleError<any>('addFile'))
    //   );
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
      [`data/${page.data}`]: null
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

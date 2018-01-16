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
    return;
    // return this.db
    //   .collection<Page[]>('pages')
    //   .doc(id)
    //   .collection('data', ref => ref.orderBy('timestamp'))
    //   .valueChanges()
    //   .pipe(
    //     tap((res: any) => console.log(res)),
    //     catchError(this.handleError<Page>('getBlocks'))
    //   );
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

  addBlock(page: Page, block: Block.Base) {
    return;
    // return this.db
    //   .collection<Page[]>('pages')
    //   .doc(page.id)
    //   .collection('data')
    //   .doc(block.id)
    //   .set(block);
  }

  updatePage(currentPage: Page, newPage: Page) {
    const updates = {
      [newPage.id]: newPage,
      [currentPage.id]: null
    };

    return this.db.database.ref('pages').update(updates);
  }

  updateBlock(page: Page): Observable<Block.Base> {
    return;
    // const url = 'http://localhost:4100/api/update/field';
    // const httpOptions = {
    //   headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    // };
    //
    // return this.http
    //   .put<Response.Block>(url, page, httpOptions)
    //   .pipe(
    //     tap((res: Response.Block) => console.log(`updated block ${res.type}`)),
    //     map(
    //       (res: Response.Block) => new Block.Base(res.type, res._id, res.data)
    //     ),
    //     catchError(this.handleError<Block.Base>('updateBlock'))
    //   );
  }

  removePage(page: Page) {
    const updates = {
      [`pages/${page.id}`]: null,
      [`data/${page.data}`]: null
    };

    return this.db.database.ref().update(updates);
  }

  removeBlock(page: Page, block: Block.Base): Observable<any> {
    return;
    // const url = `http://localhost:4100/api/remove/${page.id}/${block.id}`;
    //
    // return this.http
    //   .delete(url)
    //   .pipe(
    //     tap((res: any) =>
    //       console.log(`removed block ${page.name} ${block.type}`)
    //     ),
    //     catchError(this.handleError<any>('removeBlock'))
    //   );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return Observable.throw(error as T);
    };
  }
}

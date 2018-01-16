import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, tap, map, flatMap } from 'rxjs/operators';
import 'rxjs/add/observable/throw';

import { AngularFireDatabase } from 'angularfire2/database';
import { slugify } from 'underscore.string';

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
    return;
    // return this.db
    //   .collection<Page[]>('pages')
    //   .doc(id)
    //   .valueChanges()
    //   .pipe(
    //     tap((res: any) => console.log(res)),
    //     catchError(this.handleError<Page>('getPage'))
    //   );
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
      .object<Page>(`pages/${slugify(page.title)}`)
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

  updatePage(page: Page, current: string = '') {
    return;
    // this.addPage(page);
    //
    // const pages = this.db.collection('pages');
    // const newPageRef = pages.doc(page.id).ref;
    // const currentPageRef = pages.doc(current).ref;
    //
    // const batch = this.db.firestore.batch();
    //
    // pages
    //   .doc(current)
    //   .collection('data')
    //   .ref.get()
    //   .then(res => {
    //     var collection = pages.doc(page.id).collection('data');
    //
    //     return res.docs.forEach(doc => {
    //       let docRef = collection.doc(doc.id).ref;
    //
    //       return batch.set(docRef, doc.data());
    //     });
    //   })
    //   .then(() => batch.commit())
    //   .catch(err => console.error(err));
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
    return;
    // return this.db
    //   .collection<Page[]>('pages')
    //   .doc(page.id)
    //   .delete()
    //   .catch((err: Error) => console.error(err));
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

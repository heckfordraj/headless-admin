import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, tap, map, flatMap } from 'rxjs/operators';
import 'rxjs/add/observable/throw';

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
  constructor(private http: HttpClient) {}

  getPages(id: string = ''): Observable<Page> {
    const url = `http://localhost:4100/api/get/pages/${id}`;

    return this.http
      .get<Response.Page[]>(url)
      .pipe(
        tap((res: Response.Page[]) => console.dir(res)),
        flatMap((res: Response.Page[]) => res),
        map(
          (res: Response.Page) =>
            new Page(
              res.type,
              res._id,
              res.name,
              res.data.map(
                (block: Response.Block) =>
                  new Block.Base(block.type, block._id, block.data)
              ),
              res.slug
            )
        ),
        catchError(this.handleError<Page>(`getPages`))
      );
  }

  addPage(page: Page): Observable<Page> {
    const url = 'http://localhost:4100/api/add';
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http
      .post<Response.Page>(url, page, httpOptions)
      .pipe(
        tap((res: Response.Page) => console.log(`added page ${res.name}`)),
        map(
          (res: Response.Page) =>
            new Page(res.type, res._id, res.name, res.data, res.slug)
        ),
        catchError(this.handleError<Page>('addPage'))
      );
  }

  addFile(file: File): Observable<any> {
    const url = 'http://localhost:4100/upload';

    const formData = new FormData();
    formData.append('image', file);

    return this.http
      .post<any>(url, formData)
      .pipe(
        tap((res: any) => console.log('addFile')),
        catchError(this.handleError<any>('addFile'))
      );
  }

  addBlock(page: Page): Observable<Block.Base> {
    const url = 'http://localhost:4100/api/add/field';
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http
      .post<Response.Block>(url, page, httpOptions)
      .pipe(
        tap((res: Response.Block) => console.log(`added block ${res.type}`)),
        map(
          (res: Response.Block) => new Block.Base(res.type, res._id, res.data)
        ),
        catchError(this.handleError<Block.Base>('addBlock'))
      );
  }

  updatePage(page: Page): Observable<Page> {
    const url = 'http://localhost:4100/api/update';
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http
      .put<Response.Page>(url, page, httpOptions)
      .pipe(
        tap((res: Response.Page) => console.log(`updated page ${res.name}`)),
        map(
          (res: Response.Page) =>
            new Page(res.type, res._id, res.name, res.data, res.slug)
        ),
        catchError(this.handleError<Page>('updatePage'))
      );
  }

  updateBlock(page: Page): Observable<Block.Base> {
    const url = 'http://localhost:4100/api/update/field';
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http
      .put<Response.Block>(url, page, httpOptions)
      .pipe(
        tap((res: Response.Block) => console.log(`updated block ${res.type}`)),
        map(
          (res: Response.Block) => new Block.Base(res.type, res._id, res.data)
        ),
        catchError(this.handleError<Block.Base>('updateBlock'))
      );
  }

  removePage(page: Page): Observable<any> {
    const url = `http://localhost:4100/api/remove/${page.id}`;

    return this.http
      .delete(url)
      .pipe(
        tap((res: any) => console.log(`removed page ${page.name}`)),
        catchError(this.handleError<any>('removePage'))
      );
  }

  removeBlock(page: Page, block: Block.Base): Observable<any> {
    const url = `http://localhost:4100/api/remove/${page.id}/${block.id}`;

    return this.http
      .delete(url)
      .pipe(
        tap((res: any) =>
          console.log(`removed block ${page.name} ${block.type}`)
        ),
        catchError(this.handleError<any>('removeBlock'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return Observable.throw(error as T);
    };
  }
}

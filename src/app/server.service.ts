import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, tap, map, flatMap } from 'rxjs/operators';
import 'rxjs/add/observable/throw';

import { Page } from './page';


interface Response {
  _id: string;
  data: Array<any>;
  name: string;
  slug: string;
  type: string;
  __v: boolean;
}


@Injectable()
export class ServerService {

  constructor(
    private http: HttpClient
  ){}


  getPages(): Observable<Page> {

    const url = 'http://localhost:4100/api/get/pages';

    return this.http.get<Response[]>(url)
    .pipe(
      tap((res: Response[]) => console.dir(res)),
      flatMap((res: Response[]) => res),
      map((res: Response) => new Page(res.type, res._id, res.name, res.data, res.slug)),
      catchError(this.handleError<Page>(`getPages`))
    );
  }

  addPage(page: Page): Observable<Page> {

    const url = 'http://localhost:4100/api/add';
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.post<Response>(url, page, httpOptions).pipe(
      tap((res: Response) => console.log(`added page ${res.name}`)),
      map((res: Response) => new Page(res.type, res._id, res.name, res.data, res.slug)),
      catchError(this.handleError<Page>('addPage'))
    );
  }

  addBlock(page: Page): Observable<Page> {

    const url = 'http://localhost:4100/api/add/field';
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.post<Response>(url, page, httpOptions).pipe(
      tap((res: Response) => console.log(res)),
      map((res: Response) => new Page(res.type, res._id, res.name, res.data, res.slug)),
      catchError(this.handleError<Page>('addBlock'))
    );
  }

  updatePage(page: Page): Observable<Page> {

    const url = 'http://localhost:4100/api/update';
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.put<Response>(url, page, httpOptions).pipe(
      tap((res: Response) => console.log(`updated page ${res.name}`)),
      map((res: Response) => new Page(res.type, res._id, res.name, res.data, res.slug)),
      catchError(this.handleError<Page>('updatePage'))
    );
  }

  removePage(page: Page): Observable<any> {

    const url = `http://localhost:4100/api/remove/${page.id}`;

    return this.http.delete<Page>(url).pipe(
      tap((res: any) => console.log(`removed page ${page.name}`)),
      catchError(this.handleError<any>('removePage'))
    );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error);
      return Observable.throw(error as T);
    };
  }

}

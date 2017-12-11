import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, tap, map, flatMap } from 'rxjs/operators';
import 'rxjs/add/observable/throw';

import { Page } from './page';


@Injectable()
export class ServerService {

  constructor(
    private http: HttpClient
  ){}


  getPages(): Observable<Page> {

    const url = 'http://localhost:4100/api/get/pages';

    return this.http.get<Page[]>(url)
    .pipe(
      tap((res: Page[]) => console.dir(res)),
      flatMap((res: Page[]) => res),
      map((res: Page) => new Page(res.name)),
      catchError(this.handleError<any>(`getPages`))
    );
  }

  addPage(page: Page): Observable<any> {

    const url = 'http://localhost:4100/api/add';
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.post<Page>(url, page, httpOptions).pipe(
      tap(_ => console.log(`added page`)),
      catchError(this.handleError<any>('addPage'))
    );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error);
      return Observable.throw(error as T);
    };
  }

}

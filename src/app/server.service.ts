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
      tap((res: any) => console.dir(res)),
      flatMap((res: any) => res),
      map((res: any) => new Page(res.name, res._id)),
      catchError(this.handleError<any>(`getPages`))
    );
  }

  addPage(page: Page): Observable<Page> {

    const url = 'http://localhost:4100/api/add';
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.post<Page>(url, page, httpOptions).pipe(
      tap((res: any) => console.log(`added page ${res.name}`)),
      map((res: any) => new Page(res.name, res._id)),
      catchError(this.handleError<Page>('addPage'))
    );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error);
      return Observable.throw(error as T);
    };
  }

}

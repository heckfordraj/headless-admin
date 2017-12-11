import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, flatMap } from 'rxjs/operators';

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
      flatMap((res: Page[]) => {

        console.dir(res)
        return res;
      }),
      map((res: Page) => new Page(res.name)),
      catchError(this.handleError<any>(`getPages`))
    );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error);
      return of(result as T);
    };
  }

}

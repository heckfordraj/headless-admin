import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, retry } from 'rxjs/operators';


interface Response {
  data: any[];
}


@Injectable()
export class ServerService {

  constructor(
    private http: HttpClient
  ){}


  getPages(): Observable<any> {

    const url = 'http://localhost:4100/api/get/pages';

    return this.http.get<Response>(url)
    .pipe(
      map((res: Response) => res.data),
      catchError(this.handleError<Response>(`getPages`))
    );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error);
      return of(result as T);
    };
  }

}

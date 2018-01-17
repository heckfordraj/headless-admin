import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import * as sha1 from 'sha1';
import { environment } from '../../../../environments/environment';

interface Response {
  public_id: string;
  secure_url: string;
  url: string;
}

@Injectable()
export class ImageService {
  url = `https://api.cloudinary.com/v1_1/${
    environment.cloudinary.cloudName
  }/auto/upload`;

  constructor(private http: HttpClient) {}

  uploadImage(id: string, image: File): Observable<Response> {
    const timestamp = Date.now();

    const signature = sha1(
      `public_id=${id}&` +
        `timestamp=${timestamp}` +
        `${environment.cloudinary.apiSecret}`
    );

    const formData = new FormData();
    formData.append('file', image);
    formData.append('public_id', id);
    formData.append('api_key', environment.cloudinary.apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    return this.http.post<Response>(this.url, formData);
  }
}

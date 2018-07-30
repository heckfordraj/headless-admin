import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// import crypto from 'crypto-browserify';
import { humanize } from 'underscore.string';
import { environment } from 'environment';

import { Block } from '../../../shared/block';

export interface Response {
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

  uploadImage(image: File): Observable<Block.Data.ImageData> {
    const timestamp = Date.now();
    const name = image.name.replace(/\.[^/.]+$/, '');
    // const id = `${name}_${crypto.randomBytes(3).toString('hex')}`;

    // const signature = crypto
    //   .createHash('sha1')
    //   .update(
    //     `public_id=${id}&` +
    //       `timestamp=${timestamp}` +
    //       `${environment.cloudinary.apiSecret}`
    //   )
    //   .digest('hex');

    const formData = new FormData();
    formData.append('file', image);
    // formData.append('public_id', id);
    formData.append('api_key', environment.cloudinary.apiKey);
    formData.append('timestamp', timestamp.toString());
    // formData.append('signature', signature);

    return this.http.post<Response>(this.url, formData).pipe(
      map((res: Response) => {
        return {
          id: res.public_id,
          alt: humanize(name),
          url: res.secure_url
        };
      })
    );
  }
}

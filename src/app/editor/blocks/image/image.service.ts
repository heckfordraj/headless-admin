import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { humanize } from 'underscore.string';
import { environment } from 'environment';

import { Block } from 'shared';

export interface Response {
  public_id: string;
  secure_url: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  url = `https://api.cloudinary.com/v1_1/${
    environment.cloudinary.cloudName
  }/auto/upload`;

  constructor(private http: HttpClient) {}

  uploadImage(image: File): Observable<Block.Data.ImageData> {
    const name = image.name.replace(/\.[^/.]+$/, '');

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);

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

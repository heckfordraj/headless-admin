import { Observable, of } from 'rxjs';

import { Data } from 'testing';
import { Block } from 'shared';

export { ImageService } from '../app/editor/blocks/image/image.service';

export class MockImageService {
  constructor() {
    this.uploadImage = spyOn(this, 'uploadImage').and.callThrough();
  }

  uploadImage(image: File): Observable<Block.Data.ImageData> {
    return of(Data.ImageBlockData);
  }
}

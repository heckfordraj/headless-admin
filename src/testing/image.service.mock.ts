import { Observable } from 'rxjs/Observable';

import { Block } from 'shared';

export { ImageService } from '../app/editor/blocks/image/image.service';

export class MockImageService {
  constructor() {
    this.uploadImage = spyOn(this, 'uploadImage').and.callThrough();
  }

  uploadImage(image: File): Observable<Block.Data.ImageData> {
    const data: Block.Data.ImageData = {
      id: 1,
      alt: 'Picture',
      url: 'http://via.placeholder.com/350x150'
    };

    return Observable.of(data);
  }
}

import { TestBed, async } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { Block, isImageData } from 'testing';

import { environment } from 'environment';
import { ImageService, Response } from './image.service';

let mockHttp: HttpTestingController;
let imageService: ImageService;

describe('ImageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ImageService]
    });
  });

  beforeEach(async(() => createService()));

  it('should create service', () => {
    expect(imageService).toBeTruthy();
  });

  it('should set url with env cloudinary cloudName', () => {
    expect(imageService.url).toContain(environment.cloudinary.cloudName);
  });

  describe('uploadImage', () => {
    let response: Block.Data.ImageData;

    beforeEach(() => {
      const file: File = new File([''], 'image');
      imageService.uploadImage(file).subscribe(res => (response = res));
    });

    it('should call HttpClient POST', () => {
      mockHttp.expectOne(req => req.method === 'POST');
    });

    it(`should call HttpClient POST to 'api.cloudinary.com'`, () => {
      mockHttp.expectOne(req => req.url.includes('api.cloudinary.com'));
    });

    it(`should set request FormData 'file'`, () => {
      const {
        request: { body }
      }: { request: { body: FormData } } = mockHttp.expectOne(req =>
        req.url.includes('api.cloudinary.com')
      );
      const file: any = body.get('file').valueOf();

      expect(file).toBeDefined();
      expect(file.name).toBe('image');
    });

    it(`should set request FormData 'upload_preset' as environment cloudinary uploadPreset`, () => {
      const {
        request: { body }
      }: { request: { body: FormData } } = mockHttp.expectOne(req =>
        req.url.includes('api.cloudinary.com')
      );

      expect(body.get('upload_preset')).toBe('uploadPreset');
    });

    it('should return ImageData', () => {
      const res: Response = {
        public_id: '1',
        secure_url: 'https://via.placeholder.com/350x150',
        url: 'http://via.placeholder.com/350x150'
      };
      mockHttp
        .expectOne(req => req.url.includes('api.cloudinary.com'))
        .flush(res);

      expect(isImageData(response)).toBe(true);
    });

    it(`should return humanized 'alt'`, () => {
      const res: Response = {
        public_id: '1',
        secure_url: 'https://via.placeholder.com/350x150',
        url: 'http://via.placeholder.com/350x150'
      };
      mockHttp
        .expectOne(req => req.url.includes('api.cloudinary.com'))
        .flush(res);

      expect(response.alt).toBe('Image');
    });
  });
});

function createService() {
  imageService = TestBed.get(ImageService);
  mockHttp = TestBed.get(HttpTestingController);
}

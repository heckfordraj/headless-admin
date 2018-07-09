import { Component } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  LoggerService,
  MockLoggerService,
  ServerService,
  MockServerService,
  ImageService,
  MockImageService,
  Data
} from 'testing';

import { Block } from 'shared';
import { ImageComponent } from './image.component';

@Component({
  template: '<app-image [block]="block"></app-image>'
})
class HostComponent {
  block: Block.Base;
}

let compHost: HostComponent;
let comp: ImageComponent;
let fixture: ComponentFixture<HostComponent>;
let serverService: ServerService;
let imageService: ImageService;
let page: Page;

describe('ImageComponent', () => {
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [HostComponent, ImageComponent],
        providers: [
          { provide: LoggerService, useClass: MockLoggerService },
          { provide: ServerService, useClass: MockServerService },
          { provide: ImageService, useClass: MockImageService }
        ]
      }).compileComponents();
    })
  );

  beforeEach(async(() => createComponent()));

  beforeEach(() => {
    compHost.block = Data.ImageBlock;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(comp).toBeTruthy();
  });

  describe('OnInit', () => {
    it('should call ServerService getBlockContent', () => {
      expect(serverService.getBlockContent).toHaveBeenCalled();
    });

    it('should call ServerService getBlockContent with block arg', () => {
      comp.ngOnInit();

      expect(serverService.getBlockContent).toHaveBeenCalledWith(
        Data.ImageBlock
      );
    });

    it('should set image', () => {
      expect(comp.image).toBe(Data.ImageBlockData);
    });

    it('should display image', () => {
      expect(page.image).toBeTruthy();
    });
  });

  describe('addImage', () => {
    it('should be called on input change', () => {
      page.input.dispatchEvent(new Event('change'));

      expect(page.addImage).toHaveBeenCalled();
    });

    it('should call ImageService uploadImage', () => {
      page.input.dispatchEvent(new Event('change'));

      expect(imageService.uploadImage).toHaveBeenCalled();
    });

    it('should call ServerService updateBlockContent', () => {
      page.input.dispatchEvent(new Event('change'));

      expect(serverService.updateBlockContent).toHaveBeenCalled();
    });

    it('should call ServerService updateBlockContent with block and data args', () => {
      page.input.dispatchEvent(new Event('change'));

      expect(serverService.updateBlockContent).toHaveBeenCalledWith(
        Data.ImageBlock,
        Data.ImageBlockData
      );
    });
  });
});

function createComponent() {
  fixture = TestBed.createComponent(HostComponent);
  compHost = fixture.componentInstance;
  comp = fixture.debugElement.query(By.directive(ImageComponent))
    .componentInstance;
  serverService = fixture.debugElement.injector.get(ServerService);
  imageService = fixture.debugElement.injector.get(ImageService);
  page = new Page();

  fixture.detectChanges();
  return fixture.whenStable().then(_ => fixture.detectChanges());
}

class Page {
  addImage: jasmine.Spy;

  get image() {
    return this.query<HTMLImageElement>('img');
  }
  get input() {
    return this.query<HTMLInputElement>('input');
  }

  constructor() {
    this.addImage = spyOn(comp, 'addImage').and.callThrough();
  }

  private query<T>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }

  private queryAll<T>(selector: string): T[] {
    return fixture.nativeElement.querySelectorAll(selector);
  }
}

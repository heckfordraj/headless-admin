import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import {
  RouterTestingModule,
  LoggerService,
  MockLoggerService,
  ServerService,
  MockServerService,
  SlugifyPipe,
  MockSlugifyPipe,
  Data
} from 'testing';

import { PagesComponent } from './pages.component';

let comp: PagesComponent;
let fixture: ComponentFixture<PagesComponent>;
let serverService: ServerService;
let slugifyPipe: jasmine.Spy;
let page: Page;

describe('PagesComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [PagesComponent],
      providers: [
        { provide: LoggerService, useClass: MockLoggerService },
        { provide: ServerService, useClass: MockServerService },
        { provide: SlugifyPipe, useClass: MockSlugifyPipe }
      ]
    }).compileComponents();
  }));

  beforeEach(async(() => createComponent()));

  it('should create component', () => {
    expect(comp).toBeTruthy();
  });

  describe('OnInit', () => {
    it('should call ServerService getCollection', () => {
      expect(serverService.getCollection).toHaveBeenCalled();
    });

    it(`should call ServerService getCollection with 'pages' arg`, () => {
      expect(serverService.getCollection).toHaveBeenCalledWith('pages');
    });

    it('should set pages', () => {
      expect(comp.pages).toEqual(Data.Pages);
    });
  });

  describe('addPage', () => {
    it('should be called on enter key press', () => {
      page.pageAdd.dispatchEvent(new KeyboardEvent('keyup', { key: 'enter' }));

      expect(page.addPage).toHaveBeenCalled();
    });

    it('should be called on enter key press with input value arg', () => {
      page.pageAdd.value = 'Title';
      page.pageAdd.dispatchEvent(new KeyboardEvent('keyup', { key: 'enter' }));

      expect(page.addPage).toHaveBeenCalledWith('Title');
    });

    it('should not be called on other key press', () => {
      page.pageAdd.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));

      expect(page.addPage).not.toHaveBeenCalled();
    });

    it('should call SlugifyPipe', () => {
      comp.addPage(null);

      expect(slugifyPipe).toHaveBeenCalled();
    });

    it('should call SlugifyPipe with input value', () => {
      comp.addPage('Title');

      expect(slugifyPipe).toHaveBeenCalledWith('Title');
    });

    it('should call ServerService createId twice', () => {
      comp.addPage(null);

      expect(serverService.createId).toHaveBeenCalledTimes(2);
    });

    it('should call ServerService createTimestamp', () => {
      comp.addPage(null);

      expect(serverService.createTimestamp).toHaveBeenCalled();
    });

    it('should call ServerService addPage', () => {
      comp.addPage(null);

      expect(serverService.addPage).toHaveBeenCalled();
    });

    it('should call ServerService addPage with new page arg', () => {
      comp.addPage('Title');

      expect(serverService.addPage).toHaveBeenCalledWith({
        id: 'slugified: Title',
        name: 'Title',
        dataId: 'abcdefg',
        revisions: {
          currentId: 'abcdefg'
        },
        lastModified: {
          date: 'ddmmyyyy'
        }
      });
    });
  });

  describe('removePage', () => {
    it('should be called on remove button click', () => {
      page.pageDelete.click();

      expect(page.removePage).toHaveBeenCalled();
    });

    it('should be called on remove button click with page arg', () => {
      page.pageDelete.click();

      expect(page.removePage).toHaveBeenCalledWith(Data.Pages[0]);
    });

    it('should call ServerService removePage', () => {
      comp.removePage(Data.Pages[0]);

      expect(serverService.removePage).toHaveBeenCalled();
    });

    it('should call ServerService removePage with page arg', () => {
      comp.removePage(Data.Pages[0]);

      expect(serverService.removePage).toHaveBeenCalledWith(Data.Pages[0]);
    });
  });
});

function createComponent() {
  fixture = TestBed.createComponent(PagesComponent);
  comp = fixture.componentInstance;
  serverService = fixture.debugElement.injector.get(ServerService);
  slugifyPipe = spyOn(MockSlugifyPipe.prototype, 'transform').and.callThrough();
  page = new Page();

  fixture.detectChanges();
  return fixture.whenStable().then(_ => fixture.detectChanges());
}

class Page {
  addPage: jasmine.Spy;
  removePage: jasmine.Spy;

  get pages() {
    return this.query<HTMLLIElement>('li');
  }
  get pageName() {
    return this.query<HTMLAnchorElement>('a');
  }
  get pageDelete() {
    return this.query<HTMLButtonElement>('button');
  }
  get pageAdd() {
    return this.query<HTMLInputElement>('#add-page');
  }

  constructor() {
    this.addPage = spyOn(comp, 'addPage').and.callThrough();
    this.removePage = spyOn(comp, 'removePage').and.callThrough();
  }

  private query<T>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }
}

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

    it('should call ServerService getCollection with `pages` and null args', () => {
      expect(serverService.getCollection).toHaveBeenCalledWith('pages', null);
    });

    it('should set pages', () => {
      expect(comp.pages).toEqual(Data.Pages);
    });
  });

  describe('filterPages', () => {
    it('should be called by filter current button click', () => {
      page.pagesFilterCurrent.click();

      expect(comp.filterPages).toHaveBeenCalled();
    });

    it('should be called by filter current button click with void arg', () => {
      page.pagesFilterCurrent.click();

      expect(comp.filterPages).toHaveBeenCalledWith();
    });

    it('should be called by filter archived button click', () => {
      page.pagesFilterArchived.click();

      expect(comp.filterPages).toHaveBeenCalled();
    });

    it('should be called by filter archived button click with `archived` arg', () => {
      page.pagesFilterArchived.click();

      expect(comp.filterPages).toHaveBeenCalledWith('archived');
    });

    it('should trigger ServerService getCollection', () => {
      comp.filterPages('new');

      expect(serverService.getCollection).toHaveBeenCalled();
    });

    it('should trigger ServerService getCollection with status arg', () => {
      comp.filterPages('new');

      expect(serverService.getCollection).toHaveBeenCalledWith('pages', 'new');
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
        status: {
          draft: true
        },
        lastModified: {
          date: 'ddmmyyyy'
        }
      });
    });
  });

  describe('removePage', () => {
    it('should be called on remove button click', () => {
      page.pageRemove.click();

      expect(page.removePage).toHaveBeenCalled();
    });

    it('should be called on remove button click with page arg', () => {
      page.pageRemove.click();

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

  describe('archivePage', () => {
    it('should be called on archive button click', () => {
      page.pageArchive.click();

      expect(page.archivePage).toHaveBeenCalled();
    });

    it('should be called on archive button click with page arg', () => {
      page.pageArchive.click();

      expect(page.archivePage).toHaveBeenCalledWith(Data.Pages[0]);
    });

    it('should call ServerService archivePage', () => {
      comp.archivePage(Data.Pages[0]);

      expect(serverService.archivePage).toHaveBeenCalled();
    });

    it('should call ServerService archivePage with page arg', () => {
      comp.archivePage(Data.Pages[0]);

      expect(serverService.archivePage).toHaveBeenCalledWith(Data.Pages[0]);
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
  archivePage: jasmine.Spy;
  removePage: jasmine.Spy;
  filterPages: jasmine.Spy;

  get pages() {
    return this.query<HTMLLIElement>('li');
  }
  get pageName() {
    return this.query<HTMLAnchorElement>('a');
  }
  get pageRemove() {
    return this.query<HTMLButtonElement>('.remove');
  }
  get pageArchive() {
    return this.query<HTMLButtonElement>('.archive');
  }
  get pageAdd() {
    return this.query<HTMLInputElement>('#add-page');
  }
  get pagesFilterCurrent() {
    return this.query<HTMLButtonElement>('#filter-current');
  }
  get pagesFilterArchived() {
    return this.query<HTMLButtonElement>('#filter-archived');
  }

  constructor() {
    this.addPage = spyOn(comp, 'addPage').and.callThrough();
    this.archivePage = spyOn(comp, 'archivePage').and.callThrough();
    this.removePage = spyOn(comp, 'removePage').and.callThrough();
    this.filterPages = spyOn(comp, 'filterPages').and.callThrough();
  }

  private query<T>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }
}

import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import {
  RouterTestingModule,
  Router,
  ActivatedRoute,
  ActivatedRouteStub,
  LoggerService,
  MockLoggerService,
  ServerService,
  MockServerService,
  SlugifyPipe,
  MockSlugifyPipe,
  Data
} from 'testing';

import { EditorComponent } from './editor.component';

let comp: EditorComponent;
let fixture: ComponentFixture<EditorComponent>;
let activatedRoute: ActivatedRouteStub;
let serverService: ServerService;
let slugifyPipe: jasmine.Spy;
let router: RouterStub;
let page: Page;

describe('EditorComponent', () => {
  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub();
    activatedRoute.testParamMap = { id: 'page-1' };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule],
      declarations: [EditorComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: LoggerService, useClass: MockLoggerService },
        { provide: ServerService, useClass: MockServerService },
        { provide: SlugifyPipe, useClass: MockSlugifyPipe }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(async(() => createComponent()));

  it('should create component', () => {
    expect(comp).toBeTruthy();
  });

  describe('OnInit', () => {
    describe('initial page', () => {
      it('should call ServerService getPage', () => {
        expect(serverService.getPage).toHaveBeenCalled();
      });

      it('should call ServerService getPage with page id', () => {
        expect(serverService.getPage).toHaveBeenCalledWith('page-1');
      });

      it('should call ServerService updateUser', () => {
        expect(serverService.updateUser).toHaveBeenCalled();
      });

      it('should call ServerService updateUser with page', () => {
        expect(serverService.updateUser).toHaveBeenCalledWith(
          Data.getPages('page-1')
        );
      });

      it('should call ServerService getUsers', () => {
        expect(serverService.getUsers).toHaveBeenCalled();
      });

      it('should set page', () => {
        expect(comp.page).toEqual(Data.getPages('page-1'));
      });

      it('should set users', () => {
        expect(comp.users).toBeDefined();
      });

      it('should set users as filtered to include current page only', () => {
        comp.users.forEach(user => expect(user.current.pageId).toBe('page-1'));
      });

      it('should set page input value', () => {
        fixture.detectChanges();
        expect(page.pageInput.value).toBe('page-1');
      });
    });

    describe('param change', () => {
      beforeEach(() => {
        activatedRoute.testParamMap = { id: 'page-2' };
        fixture.detectChanges();
        return fixture.whenStable();
      });

      it('should call ServerService getPage', () => {
        expect(serverService.getPage).toHaveBeenCalledTimes(2);
      });

      it('should call ServerService getPage with page id', () => {
        expect(serverService.getPage).toHaveBeenCalledWith('page-2');
      });

      it('should call ServerService updateUser', () => {
        expect(serverService.updateUser).toHaveBeenCalled();
      });

      it('should call ServerService updateUser with page', () => {
        expect(serverService.updateUser).toHaveBeenCalledWith(
          Data.getPages('page-2')
        );
      });

      it('should call ServerService getUsers', () => {
        expect(serverService.getUsers).toHaveBeenCalled();
      });

      it('should set page', () => {
        expect(comp.page).toEqual(Data.getPages('page-2'));
      });

      it('should set users', () => {
        expect(comp.users).toBeDefined();
      });

      it('should set users as filtered to include current page only', () => {
        comp.users.forEach(user => expect(user.current.pageId).toBe('page-2'));
      });

      it('should set page input value', () => {
        fixture.detectChanges();
        expect(page.pageInput.value).toBe('page-2');
      });
    });
  });

  describe('slugChange', () => {
    it('should be called on input change', () => {
      page.pageInput.value = 'Page Title';
      page.pageInput.dispatchEvent(new Event('input'));

      expect(comp.slugChange).toHaveBeenCalled();
    });

    it('should be called on input change with input arg', () => {
      page.pageInput.value = 'Page Title';
      page.pageInput.dispatchEvent(new Event('input'));

      expect(comp.slugChange).toHaveBeenCalledWith('Page Title');
    });

    it('should call SlugifyPipe', () => {
      comp.slugChange('Page Title');

      expect(slugifyPipe).toHaveBeenCalled();
    });

    it('should call SlugifyPipe with input arg', () => {
      comp.slugChange('Page Title');

      expect(slugifyPipe).toHaveBeenCalledWith('Page Title');
    });

    it('should set inputSlug', () => {
      comp.slugChange('Page Title');

      expect(comp.inputSlug).toBeDefined();
    });

    it('should set inputSlug as SlugifyPipe return', () => {
      comp.slugChange('Page Title');

      expect(comp.inputSlug).toBe('slugified: Page Title');
    });
  });

  describe('updatePage', () => {
    it('should be called on page input enter key press', () => {
      page.pageInput.dispatchEvent(
        new KeyboardEvent('keyup', { key: 'enter' })
      );

      expect(comp.updatePage).toHaveBeenCalled();
    });

    it('should not be called on page input other key press', () => {
      page.pageInput.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));

      expect(comp.updatePage).not.toHaveBeenCalled();
    });

    it('should call ServerService updatePage', () => {
      comp.inputSlug = 'title';
      comp.updatePage();

      expect(serverService.updatePage).toHaveBeenCalled();
    });

    it('should call ServerService updatePage with page and inputSlug args', () => {
      comp.inputSlug = 'title';
      comp.updatePage();

      expect(serverService.updatePage).toHaveBeenCalledWith(
        Data.getPages('page-1'),
        'title'
      );
    });

    it('should not call ServerService updatePage if no inputSlug', () => {
      comp.inputSlug = '';
      comp.updatePage();

      expect(serverService.updatePage).not.toHaveBeenCalled();
    });

    it('should not call ServerService updatePage if inputSlug is current page id', () => {
      comp.inputSlug = 'page-1';
      comp.updatePage();

      expect(serverService.updatePage).not.toHaveBeenCalled();
    });

    it('should call Router navigate on ServerService updatePage resolve', () => {
      comp.inputSlug = 'new-title';
      comp.updatePage();

      return fixture.whenStable().then(_ => {
        expect(router.navigate).toHaveBeenCalled();
      });
    });

    it('should call Router navigate with inputSlug arg on ServerService updatePage resolve', () => {
      comp.inputSlug = 'new-title';
      comp.updatePage();

      return fixture.whenStable().then(_ => {
        expect(router.navigate).toHaveBeenCalledWith(
          ['/page', 'new-title'],
          jasmine.anything()
        );
      });
    });

    it('should not call Router navigate on ServerService updatePage reject', () => {
      (serverService.updatePage as jasmine.Spy).and.callFake(() =>
        Promise.reject()
      );
      comp.inputSlug = 'new-title';

      return fixture.whenStable().then(_ => {
        expect(router.navigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('publishPage', () => {
    it('should be called on publish button click', () => {
      page.pagePublish.click();

      expect(page.publishPage).toHaveBeenCalled();
    });

    it('should call ServerService publishPage', () => {
      comp.publishPage();

      expect(serverService.publishPage).toHaveBeenCalled();
    });

    it('should call ServerService publishPage with page arg', () => {
      comp.publishPage();

      expect(serverService.publishPage).toHaveBeenCalledWith(
        Data.getPages('page-1')
      );
    });
  });

  describe('archivePage', () => {
    it('should be called on archive button click', () => {
      page.pageArchive.click();

      expect(page.archivePage).toHaveBeenCalled();
    });

    it('should call ServerService archivePage', () => {
      comp.archivePage();

      expect(serverService.archivePage).toHaveBeenCalled();
    });

    it('should call ServerService archivePage with page arg', () => {
      comp.archivePage();

      expect(serverService.archivePage).toHaveBeenCalledWith(
        Data.getPages('page-1')
      );
    });

    it('should call Router navigate on ServerService archivePage resolve', () => {
      comp.archivePage();

      return fixture.whenStable().then(_ => {
        expect(router.navigate).toHaveBeenCalled();
      });
    });

    it(`should call Router navigate with '/pages' on ServerService archivePage resolve`, () => {
      comp.archivePage();

      return fixture.whenStable().then(_ => {
        expect(router.navigate).toHaveBeenCalledWith(
          ['/pages'],
          jasmine.anything()
        );
      });
    });

    it('should not call Router navigate on ServerService archivePage reject', () => {
      (serverService.archivePage as jasmine.Spy).and.returnValue(
        Promise.reject(null)
      );
      comp.archivePage();

      return fixture.whenStable().then(_ => {
        expect(router.navigate).not.toHaveBeenCalled();
      });
    });
  });
});

function createComponent() {
  fixture = TestBed.createComponent(EditorComponent);
  comp = fixture.componentInstance;
  serverService = fixture.debugElement.injector.get(ServerService);
  slugifyPipe = spyOn(MockSlugifyPipe.prototype, 'transform').and.callThrough();
  router = new RouterStub();
  page = new Page();

  fixture.detectChanges();
  return fixture.whenStable().then(_ => fixture.detectChanges());
}

class RouterStub {
  navigate: jasmine.Spy;

  constructor() {
    const router = fixture.debugElement.injector.get(Router);

    this.navigate = spyOn(router, 'navigate').and.callFake(() => undefined);
  }
}

class Page {
  updatePage: jasmine.Spy;
  publishPage: jasmine.Spy;
  archivePage: jasmine.Spy;
  slugChange: jasmine.Spy;

  get pageInput() {
    return this.query<HTMLInputElement>('.page-input');
  }
  get pagePublish() {
    return this.query<HTMLButtonElement>('#publish');
  }
  get pageArchive() {
    return this.query<HTMLButtonElement>('#archive');
  }

  constructor() {
    this.updatePage = spyOn(comp, 'updatePage').and.callThrough();
    this.archivePage = spyOn(comp, 'archivePage').and.callThrough();
    this.publishPage = spyOn(comp, 'publishPage').and.callThrough();
    this.slugChange = spyOn(comp, 'slugChange').and.callThrough();
  }

  private query<T>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }
}

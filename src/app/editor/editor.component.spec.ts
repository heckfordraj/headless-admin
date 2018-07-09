import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  DebugElement,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA
} from '@angular/core';

import {
  newEvent,
  Router,
  RouterStub,
  ActivatedRoute,
  ActivatedRouteStub,
  LoggerService,
  MockLoggerService,
  ServerService,
  MockServerService,
  isPage
} from 'testing';

import { SlugifyPipe } from 'shared';
import { EditorComponent } from './editor.component';

let comp: EditorComponent;
let fixture: ComponentFixture<EditorComponent>;
let activatedRoute: ActivatedRouteStub;
let serverService: ServerService;
let page: Page;

describe('EditorComponent', () => {
  beforeEach(
    async(() => {
      activatedRoute = new ActivatedRouteStub();
      activatedRoute.testParamMap = { id: 'page-1' };

      TestBed.configureTestingModule({
        imports: [FormsModule],
        declarations: [EditorComponent],
        providers: [
          { provide: Router, useClass: RouterStub },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: LoggerService, useClass: MockLoggerService },
          { provide: ServerService, useClass: MockServerService },
          SlugifyPipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(async(() => createComponent()));

  it('should call ServerService getPage on load', () => {
    expect(serverService.getPage).toHaveBeenCalled();
  });

  it('should call ServerService getPage with page id', () => {
    expect(serverService.getPage).toHaveBeenCalledWith('page-1');
  });

  it('should get initial page', () => {
    expect(comp.page).toBeDefined();
    expect(comp.page).not.toBeNull();
  });

  it('should display initial page name', () => {
    expect(page.pageName.textContent).toBe('Page 1');
  });

  it('should call ServerService getPage on param change', () => {
    activatedRoute.testParamMap = { id: 'page-2' };

    expect(serverService.getPage).toHaveBeenCalledTimes(2);
  });

  it('should call ServerService getPage with new page id', () => {
    activatedRoute.testParamMap = { id: 'page-2' };

    expect(serverService.getPage).toHaveBeenCalledWith('page-2');
  });

  it('should get new page', () => {
    activatedRoute.testParamMap = { id: 'page-2' };

    expect(comp.page.id).toBe('page-2');
  });

  it('should display new page name', () => {
    activatedRoute.testParamMap = { id: 'page-2' };
    fixture.detectChanges();

    expect(page.pageName.textContent).toBe('Page 2');
  });

  xit('should not get nonexistent page', () => {
    activatedRoute.testParamMap = { id: 'no-page' };

    expect(comp.page.id).toBe('page-1');
  });

  describe('Slug Change', () => {
    it('should call SlugifyPipe', () => {
      comp.slugChange('Page Title');

      expect(page.slugify).toHaveBeenCalled();
    });

    it('should call SlugifyPipe with input param', () => {
      comp.slugChange('Page Title');

      expect(page.slugify).toHaveBeenCalledWith('Page Title');
    });
  });

  describe('Page Update', () => {
    it('should have initial page id value', () => {
      expect(page.pageInput.nativeElement.value).toBe('page-1');
    });

    it('should slugify value on key press', () => {
      page.pageInput.nativeElement.value = 'Page Title';
      page.pageInput.nativeElement.dispatchEvent(newEvent('input'));
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(page.pageInput.nativeElement.value).toBe('page-title');
      });
    });

    it('should set inputSlug as slugified value on key press', () => {
      page.pageInput.nativeElement.value = 'Page Title';
      page.pageInput.nativeElement.dispatchEvent(newEvent('input'));
      fixture.detectChanges();

      expect(comp.inputSlug).toBe('page-title');
    });

    it('should not change page id on key press', () => {
      page.pageInput.nativeElement.value = 'Page Title';
      page.pageInput.nativeElement.dispatchEvent(newEvent('input'));
      fixture.detectChanges();

      expect(comp.page.id).toBe('page-1');
    });

    it('should not call updatePage on key press', () => {
      page.pageInput.triggerEventHandler('keyup', null);

      expect(page.updatePage).not.toHaveBeenCalled();
    });

    it('should call updatePage on enter press', () => {
      page.pageInput.triggerEventHandler('keyup.enter', null);

      expect(page.updatePage).toHaveBeenCalled();
    });

    it('should call ServerService updatePage', () => {
      comp.inputSlug = 'new-page';
      page.pageInput.triggerEventHandler('keyup.enter', null);

      expect(serverService.updatePage).toHaveBeenCalled();
    });

    it('should call ServerService updatePage with current Page object', () => {
      comp.inputSlug = 'new-page';
      page.pageInput.triggerEventHandler('keyup.enter', null);
      const arg = (serverService.updatePage as jasmine.Spy).calls.mostRecent()
        .args[0];

      expect(isPage(arg)).toBeTruthy();
    });

    it('should call ServerService updatePage with slug input', () => {
      comp.inputSlug = 'abc';
      page.pageInput.triggerEventHandler('keyup.enter', null);

      expect(serverService.updatePage).toHaveBeenCalledWith(
        jasmine.anything(),
        'abc'
      );
    });

    it('should not call ServerService updatePage on unmodified input', () => {
      page.pageInput.nativeElement.dispatchEvent(newEvent('input'));
      page.pageInput.triggerEventHandler('keyup.enter', null);

      expect(serverService.updatePage).not.toHaveBeenCalled();
    });

    it('should not call ServerService updatePage on trailing whitespace input', () => {
      page.pageInput.nativeElement.value += ' ';
      page.pageInput.nativeElement.dispatchEvent(newEvent('input'));
      page.pageInput.triggerEventHandler('keyup.enter', null);

      expect(serverService.updatePage).not.toHaveBeenCalled();
    });

    it(
      'should call router',
      async(() => {
        comp.inputSlug = 'new-page';
        page.pageInput.triggerEventHandler('keyup.enter', null);

        fixture.whenStable().then(_ => {
          expect(page.navigate).toHaveBeenCalled();
        });
      })
    );

    it(
      'should call router with new page id',
      async(() => {
        comp.inputSlug = 'new-page';
        page.pageInput.triggerEventHandler('keyup.enter', null);

        fixture.whenStable().then(_ => {
          expect(page.navigate).toHaveBeenCalledWith(
            ['/page', 'new-page'],
            jasmine.anything()
          );
        });
      })
    );
  });

  describe('Page Publish', () => {
    it('should call publishPage on click', () => {
      page.pagePublish.triggerEventHandler('click', null);

      expect(page.publishPage).toHaveBeenCalled();
    });

    it('should call ServerService publishPage', () => {
      page.pagePublish.triggerEventHandler('click', null);

      expect(serverService.publishPage).toHaveBeenCalled();
    });
  });

  describe('Page Remove', () => {
    it('should call removePage on click', () => {
      page.pageRemove.triggerEventHandler('click', null);

      expect(page.removePage).toHaveBeenCalled();
    });

    it('should call ServerService removePage', () => {
      page.pageRemove.triggerEventHandler('click', null);

      expect(serverService.removePage).toHaveBeenCalled();
    });

    it('should call router', () => {
      page.pageRemove.triggerEventHandler('click', null);

      fixture.whenStable().then(_ => {
        expect(page.navigate).toHaveBeenCalled();
      });
    });

    it('should call router with /pages', () => {
      page.pageRemove.triggerEventHandler('click', null);

      fixture.whenStable().then(_ => {
        expect(page.navigate).toHaveBeenCalledWith(
          ['/pages'],
          jasmine.anything()
        );
      });
    });
  });
});

function createComponent() {
  fixture = TestBed.createComponent(EditorComponent);
  comp = fixture.componentInstance;
  serverService = fixture.debugElement.injector.get(ServerService);
  page = new Page();

  fixture.detectChanges();
  return fixture.whenStable().then(_ => {
    fixture.detectChanges();
    page.addElements();
  });
}

class Page {
  navigate: jasmine.Spy;
  updatePage: jasmine.Spy;
  publishPage: jasmine.Spy;
  removePage: jasmine.Spy;
  slugify: jasmine.Spy;

  pageName: HTMLElement;
  pageInput: DebugElement;
  pagePublish: DebugElement;
  pageRemove: DebugElement;

  constructor() {
    const router = fixture.debugElement.injector.get(Router);
    const slugifyPipe = fixture.debugElement.injector.get(SlugifyPipe);

    this.navigate = spyOn(router, 'navigate').and.callThrough();
    this.updatePage = spyOn(comp, 'updatePage').and.callThrough();
    this.removePage = spyOn(comp, 'removePage').and.callThrough();
    this.publishPage = spyOn(comp, 'publishPage').and.callThrough();
    this.slugify = spyOn(slugifyPipe, 'transform').and.callThrough();
  }

  addElements() {
    if (comp.page) {
      this.pageName = fixture.debugElement.query(By.css('h2')).nativeElement;
      this.pageInput = fixture.debugElement.query(
        de => de.references['pageInput']
      );
      this.pagePublish = fixture.debugElement.query(By.css('#publish'));
      this.pageRemove = fixture.debugElement.query(By.css('#remove'));
    }
  }
}

import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  DebugElement,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA
} from '@angular/core';
import {
  Router,
  RouterStub,
  ActivatedRoute,
  ActivatedRouteStub
} from '../../testing/router';
import { ServerServiceStub } from '../../testing/server.service';
import { isPage } from '../../testing/page';

import { EditorComponent } from './editor.component';
import { LoggerService } from '../shared/logger.service';
import { ServerService } from '../shared/server.service';

let comp: EditorComponent;
let fixture: ComponentFixture<EditorComponent>;
let activatedRoute: ActivatedRouteStub;
let page: Page;

describe('EditorComponent', () => {
  beforeEach(
    async(() => {
      activatedRoute = new ActivatedRouteStub();
      activatedRoute.testParamMap = { id: 'page-1' };

      TestBed.configureTestingModule({
        declarations: [EditorComponent],
        providers: [
          LoggerService,
          { provide: Router, useClass: RouterStub },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: ServerService, useClass: ServerServiceStub }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(async(() => createComponent()));

  it('should call ServerService getPage on load', () => {
    expect(page.onInit.calls.any()).toBe(true);
  });

  it('should call ServerService getPage with page id', () => {
    let arg = page.onInit.calls.mostRecent().args[0];

    expect(arg).toBe('page-1');
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

    expect(page.onInit.calls.count()).toBe(2);
  });

  it('should call ServerService getPage with new page id', () => {
    activatedRoute.testParamMap = { id: 'page-2' };
    let arg = page.onInit.calls.mostRecent().args[0];

    expect(arg).toBe('page-2');
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

  it('should not get nonexistent page', () => {
    activatedRoute.testParamMap = { id: 'no-page' };

    expect(comp.page).not.toBeDefined();
  });

  describe('Page Update', () => {
    it('should have initial page name value', () => {
      expect(page.pageInput.nativeElement.value).toBe('Page 1');
    });

    it('should not call updatePage on key press', () => {
      page.pageInput.triggerEventHandler('keyup', null);
      page.pageInput.triggerEventHandler('input', null);

      expect(page.updatePage.calls.any()).toBeFalsy();
    });

    it('should call updatePage on enter press', () => {
      page.pageInput.triggerEventHandler('keyup.enter', null);
      expect(page.updatePage.calls.count()).toBe(1);
    });

    it('should call updatePage with input value', () => {
      page.pageInput.nativeElement.value = 'abc';
      page.pageInput.triggerEventHandler('keyup.enter', null);

      let arg = page.updatePage.calls.mostRecent().args[0];

      expect(arg).toBe('abc');
    });

    it('should call ServerService updatePage', () => {
      page.pageInput.triggerEventHandler('keyup.enter', null);

      expect(page.serverUpdatePage.calls.count()).toBe(1);
    });

    describe('create new Page', () => {
      let currentPage;
      let newPage;

      beforeEach(() => {
        page.pageInput.nativeElement.value = 'Updated Title';
        page.pageInput.triggerEventHandler('keyup.enter', null);

        currentPage = page.serverUpdatePage.calls.mostRecent().args[0];
        newPage = page.serverUpdatePage.calls.mostRecent().args[1];
      });

      it('should set new name as input value', () => {
        expect(newPage.name).toBe('Updated Title');
      });

      it('should set new id as slugified input value', () => {
        expect(newPage.id).toBe('updated-title');
      });

      it('should set unchanged dataId', () => {
        expect(newPage.dataId).toBe('1');
      });

      it('should set unchanged revisions currentId', () => {
        expect(newPage.revisions.currentId).toBe('a');
      });

      it('should not set revisions publishedId', () => {
        expect(newPage.revisions.publishedId).toBeUndefined();
      });

      it('should not modify current Page', () => {
        expect(currentPage.id).toBe('page-1');
        expect(currentPage.name).toBe('Page 1');
      });
    });

    it('should call ServerService updatePage with current Page object', () => {
      page.pageInput.triggerEventHandler('keyup.enter', null);
      let arg = page.serverUpdatePage.calls.mostRecent().args[0];

      expect(isPage(arg)).toBeTruthy();
    });

    it('should call ServerService updatePage with new Page object', () => {
      page.pageInput.triggerEventHandler('keyup.enter', null);
      let arg = page.serverUpdatePage.calls.mostRecent().args[1];

      expect(isPage(arg)).toBeTruthy();
    });

    it(
      'should call router',
      async(() => {
        page.pageInput.triggerEventHandler('keyup.enter', null);

        fixture.whenStable().then(_ => {
          expect(page.navigate.calls.any()).toBeTruthy();
        });
      })
    );

    it(
      'should call router with new page id',
      async(() => {
        page.pageInput.nativeElement.value = 'New Page';
        page.pageInput.triggerEventHandler('keyup.enter', null);

        fixture.whenStable().then(_ => {
          let arg = page.navigate.calls.mostRecent().args[0];

          expect(arg).toEqual(['/page', 'new-page']);
        });
      })
    );
  });

  describe('Page Publish', () => {
    it('should call publishPage on click', () => {
      page.pagePublish.triggerEventHandler('click', null);

      expect(page.publishPage.calls.count()).toBe(1);
    });

    it('should call ServerService publishPage', () => {
      page.pagePublish.triggerEventHandler('click', null);

      expect(page.serverPublishPage.calls.count()).toBe(1);
    });
  });

  describe('Page Remove', () => {
    it('should call removePage on click', () => {
      page.pageRemove.triggerEventHandler('click', null);

      expect(page.removePage.calls.count()).toBe(1);
    });

    it('should call ServerService removePage', () => {
      page.pageRemove.triggerEventHandler('click', null);

      expect(page.serverRemovePage.calls.count()).toBe(1);
    });
  });
});

function createComponent() {
  fixture = TestBed.createComponent(EditorComponent);
  comp = fixture.componentInstance;
  page = new Page();

  fixture.detectChanges();
  return fixture.whenStable().then(_ => {
    fixture.detectChanges();
    page.addElements();
  });
}

class Page {
  onInit: jasmine.Spy;
  navigate: jasmine.Spy;
  updatePage: jasmine.Spy;
  publishPage: jasmine.Spy;
  removePage: jasmine.Spy;
  serverUpdatePage: jasmine.Spy;
  serverPublishPage: jasmine.Spy;
  serverRemovePage: jasmine.Spy;

  pageName: HTMLElement;
  pageInput: DebugElement;
  pagePublish: DebugElement;
  pageRemove: DebugElement;

  constructor() {
    const serverService = fixture.debugElement.injector.get(ServerService);
    const router = fixture.debugElement.injector.get(Router);

    this.onInit = spyOn(serverService, 'getPage').and.callThrough();
    this.navigate = spyOn(router, 'navigate').and.callThrough();
    this.updatePage = spyOn(comp, 'updatePage').and.callThrough();
    this.removePage = spyOn(comp, 'removePage').and.callThrough();
    this.publishPage = spyOn(comp, 'publishPage').and.callThrough();
    this.serverUpdatePage = spyOn(
      serverService,
      'updatePage'
    ).and.callThrough();
    this.serverPublishPage = spyOn(
      serverService,
      'publishPage'
    ).and.callThrough();
    this.serverRemovePage = spyOn(
      serverService,
      'removePage'
    ).and.callThrough();
  }

  addElements() {
    if (comp.page) {
      this.pageName = fixture.debugElement.query(By.css('h1')).nativeElement;
      this.pageInput = fixture.debugElement.query(
        de => de.references['pageInput']
      );
      this.pagePublish = fixture.debugElement.query(By.css('#publish'));
      this.pageRemove = fixture.debugElement.query(By.css('#remove'));
    }
  }
}

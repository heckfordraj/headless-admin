import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';

import {
  RouterLinkStub,
  LoggerService,
  MockLoggerService,
  ServerService,
  MockServerService,
  isPage
} from 'testing';

import { PagesComponent } from './pages.component';

let comp: PagesComponent;
let fixture: ComponentFixture<PagesComponent>;
let serverService: ServerService;
let page: Page;

describe('PagesComponent', () => {
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [PagesComponent, RouterLinkStub],
        providers: [
          { provide: LoggerService, useClass: MockLoggerService },
          { provide: ServerService, useClass: MockServerService }
        ]
      }).compileComponents();
    })
  );

  beforeEach(async(() => createComponent()));

  it('should call ServerService getCollection on load', () => {
    expect(serverService.getCollection).toHaveBeenCalled();
  });

  it('should get pages', () => {
    expect(comp.pages.length).toBe(5);
  });

  it('should display pages', () => {
    expect(page.pages.length).toBe(5);
  });

  it('should display page name', () => {
    expect(page.pageName.textContent).toBe('Page 1');
  });

  xit('should display newly added page', () => {});

  describe('Routing', () => {
    it('should display links in template', () => {
      expect(page.links.length).toBe(5);
    });

    it('should display correct link url', () => {
      expect(page.links[0].linkParams).toEqual(['/page', 'page-1']);
    });
  });

  describe('Page Add', () => {
    it('should have empty intial value', () => {
      expect(page.pageAdd.nativeElement.value).toBe('');
    });

    it('should not call addPage on key press', () => {
      page.pageAdd.triggerEventHandler('keyup', null);
      page.pageAdd.triggerEventHandler('input', null);

      expect(page.addPage).not.toHaveBeenCalled();
    });

    it('should call addPage on enter press', () => {
      page.pageAdd.triggerEventHandler('keyup.enter', null);

      expect(page.addPage).toHaveBeenCalled();
    });

    it('should call addPage with input value', () => {
      page.pageAdd.nativeElement.value = 'abc';
      page.pageAdd.triggerEventHandler('keyup.enter', null);

      expect(page.addPage).toHaveBeenCalledWith('abc');
    });

    it('should call ServerService addPage', () => {
      page.pageAdd.triggerEventHandler('keyup.enter', null);

      expect(serverService.addPage).toHaveBeenCalled();
    });

    describe('create new Page', () => {
      let newPage;

      beforeEach(() => {
        page.pageAdd.nativeElement.value = 'New Title';
        page.pageAdd.triggerEventHandler('keyup.enter', null);

        newPage = (serverService.addPage as jasmine.Spy).calls.mostRecent()
          .args[0];
      });

      it('should set name as input value', () => {
        expect(newPage.name).toBe('New Title');
      });

      it('should set id as slugified input value', () => {
        expect(newPage.id).toBe('new-title');
      });

      it('should set dataId', () => {
        expect(newPage.dataId).toBe('abcdefg');
      });

      it('should set revisions currentId', () => {
        expect(newPage.revisions.currentId).toBe('abcdefg');
      });

      it('should not set revisions publishedId', () => {
        expect(newPage.revisions.publishedId).toBeUndefined();
      });
    });

    it('should call ServerService addPage with Page object', () => {
      page.pageAdd.nativeElement.value = 'abc';
      page.pageAdd.triggerEventHandler('keyup.enter', null);

      const arg = (serverService.addPage as jasmine.Spy).calls.mostRecent()
        .args[0];

      expect(isPage(arg)).toBeTruthy();
    });
  });

  describe('Page Remove', () => {
    it('should call removePage on click', () => {
      page.pageDelete.triggerEventHandler('click', null);

      expect(page.removePage).toHaveBeenCalled();
    });

    it('should call removePage with Page object', () => {
      page.pageDelete.triggerEventHandler('click', null);
      const arg = page.removePage.calls.mostRecent().args[0];

      expect(isPage(arg)).toBeTruthy();
    });

    it('should call removePage with correct Page', () => {
      page.pageDelete.triggerEventHandler('click', null);

      expect(page.removePage).toHaveBeenCalledWith({
        name: 'Page 1',
        id: jasmine.any(String),
        dataId: jasmine.any(String),
        revisions: jasmine.anything(),
        lastModified: jasmine.any(Number)
      });
    });

    it('should call ServerService removePage', () => {
      page.pageDelete.triggerEventHandler('click', null);

      expect(serverService.removePage).toHaveBeenCalled();
    });

    it('should call ServerService removePage with Page object', () => {
      page.pageDelete.triggerEventHandler('click', null);
      const arg = (serverService.removePage as jasmine.Spy).calls.mostRecent()
        .args[0];

      expect(isPage(arg)).toBeTruthy();
    });
  });
});

function createComponent() {
  fixture = TestBed.createComponent(PagesComponent);
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
  addPage: jasmine.Spy;
  removePage: jasmine.Spy;

  pages: DebugElement[];
  pageName: HTMLElement;
  pageDelete: DebugElement;
  pageAdd: DebugElement;
  links: RouterLinkStub[];
  linkDes: DebugElement[];

  constructor() {
    this.addPage = spyOn(comp, 'addPage').and.callThrough();
    this.removePage = spyOn(comp, 'removePage').and.callThrough();
  }

  addElements() {
    if (comp.pages) {
      this.pages = fixture.debugElement.queryAll(By.css('li'));

      this.pageName = fixture.debugElement.query(By.css('a')).nativeElement;

      this.pageDelete = fixture.debugElement.query(By.css('button'));

      this.pageAdd = fixture.debugElement.query(By.css('#add-page'));

      this.linkDes = fixture.debugElement.queryAll(
        By.directive(RouterLinkStub)
      );

      this.links = this.linkDes.map(
        de => de.injector.get(RouterLinkStub) as RouterLinkStub
      );
    }
  }
}

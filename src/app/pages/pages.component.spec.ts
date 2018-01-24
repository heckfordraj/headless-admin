import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterLinkStub } from '../../testing/router';
import { ServerServiceStub } from '../../testing/server.service';
import { isPage } from '../../testing/page';

import { PagesComponent } from './pages.component';
import { ServerService } from '../shared/server.service';

let comp: PagesComponent;
let fixture: ComponentFixture<PagesComponent>;
let page: Page;

beforeEach(
  async(() => {
    TestBed.configureTestingModule({
      declarations: [PagesComponent, RouterLinkStub],
      providers: [{ provide: ServerService, useClass: ServerServiceStub }]
    }).compileComponents();
  })
);

describe('PagesComponent', () => {
  beforeEach(async(() => createComponent()));

  it('should call getCollection on load', () => {
    expect(page.onInit.calls.any()).toBe(true);
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

  it('should display initial page name in input', () => {
    expect(page.pageInput.value).toBe('Page 1');
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
    it('should have empty text value', () => {
      expect(page.pageAdd.nativeElement.value).toBe('');
    });

    it('should not call addPage on key press', () => {
      page.pageAdd.triggerEventHandler('keyup', null);
      page.pageAdd.triggerEventHandler('input', null);

      expect(page.addPage.calls.any()).toBeFalsy();
    });

    it('should call addPage on enter press', () => {
      page.pageAdd.triggerEventHandler('keyup.enter', null);
      expect(page.addPage.calls.count()).toBe(1);
    });

    it('should get text value from input', () => {
      page.pageAdd.nativeElement.value = 'abc';
      page.pageAdd.triggerEventHandler('keyup.enter', null);

      expect(page.addPage.calls.mostRecent().args).toEqual(['abc']);
    });

    it('should call addPage', () => {
      page.pageAdd.triggerEventHandler('keyup.enter', null);
      expect(page.serverAddPage.calls.count()).toBe(1);
    });

    it('should call addPage with Page object', () => {
      page.pageAdd.nativeElement.value = 'abc';
      page.pageAdd.triggerEventHandler('keyup.enter', null);

      let arg = page.serverAddPage.calls.mostRecent().args[0];

      expect(isPage(arg)).toBeTruthy();
    });

    describe('create new Page', () => {
      let newPage;

      beforeEach(() => {
        page.pageAdd.nativeElement.value = 'New Title';
        page.pageAdd.triggerEventHandler('keyup.enter', null);

        newPage = page.serverAddPage.calls.mostRecent().args[0];
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
  });
});

function createComponent() {
  fixture = TestBed.createComponent(PagesComponent);
  comp = fixture.componentInstance;
  page = new Page();

  fixture.detectChanges();
  return fixture.whenStable().then(() => {
    fixture.detectChanges();
    page.addElements();
  });
}

class Page {
  onInit: jasmine.Spy;
  addPage: jasmine.Spy;

  serverAddPage: jasmine.Spy;

  pages: DebugElement[];
  pageName: HTMLElement;
  pageInput: HTMLInputElement;
  pageDelete: HTMLInputElement;
  pageAdd: DebugElement;
  links: RouterLinkStub[];
  linkDes: DebugElement[];

  constructor() {
    const serverService = fixture.debugElement.injector.get(ServerService);

    this.onInit = spyOn(serverService, 'getCollection').and.callThrough();
    this.addPage = spyOn(comp, 'addPage').and.callThrough();
    this.serverAddPage = spyOn(serverService, 'addPage').and.callThrough();
  }

  addElements() {
    if (comp.pages) {
      this.pages = fixture.debugElement.queryAll(By.css('li'));

      this.pageName = fixture.debugElement.query(By.css('a')).nativeElement;

      this.pageInput = fixture.debugElement.query(
        By.css('input')
      ).nativeElement;

      this.pageDelete = fixture.debugElement.query(
        By.css('button')
      ).nativeElement;

      this.pageAdd = fixture.debugElement.query(de => de.references['add']);

      this.linkDes = fixture.debugElement.queryAll(
        By.directive(RouterLinkStub)
      );

      this.links = this.linkDes.map(
        de => de.injector.get(RouterLinkStub) as RouterLinkStub
      );
    }
  }
}

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
let pages: Pages;

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
    expect(pages.onInit.calls.any()).toBe(true);
  });

  it('should get pages', () => {
    expect(comp.pages.length).toBe(5);
  });

  it('should display pages', () => {
    expect(pages.pages.length).toBe(5);
  });

  it('should display page name', () => {
    expect(pages.pageName.textContent).toBe('Page 1');
  });

  it('should display initial page name in input', () => {
    expect(pages.pageInput.value).toBe('Page 1');
  });

  describe('Routing', () => {
    it('should display links in template', () => {
      expect(pages.links.length).toBe(5);
    });

    it('should display correct link url', () => {
      expect(pages.links[0].linkParams).toEqual(['/page', 'page-1']);
      expect(pages.links[1].linkParams).toEqual(['/page', 'page-2']);
      expect(pages.links[2].linkParams).toEqual(['/page', 'page-3']);
      expect(pages.links[3].linkParams).toEqual(['/page', 'page-4']);
      expect(pages.links[4].linkParams).toEqual(['/page', 'page-5']);
    });
  });

  describe('Page Add', () => {
    it('should have empty text value', () => {
      expect(pages.pageAdd.nativeElement.value).toBe('');
    });

    it('should not call addPage on key press', () => {
      pages.pageAdd.triggerEventHandler('keyup', null);
      pages.pageAdd.triggerEventHandler('input', null);

      expect(pages.addPage.calls.any()).toBeFalsy();
    });

    it('should call addPage on enter press', () => {
      pages.pageAdd.triggerEventHandler('keyup.enter', null);
      expect(pages.addPage.calls.count()).toBe(1);
    });

    it('should get text value from input', () => {
      pages.pageAdd.nativeElement.value = 'abc';
      pages.pageAdd.triggerEventHandler('keyup.enter', null);

      expect(pages.addPage.calls.mostRecent().args).toEqual(['abc']);
    });

    xdescribe('create new Page', () => {
      xit('should set name as input value', () => {});

      xit('should set id as slugified input value', () => {});

      xit('should set revisions currentId', () => {});

      xit('should not set revisions publishedId', () => {});
    });

    it('should call addPage', () => {
      pages.pageAdd.triggerEventHandler('keyup.enter', null);
      expect(pages.serverAddPage.calls.count()).toEqual(1);
    });

    it('should call addPage with Page object', () => {
      pages.pageAdd.nativeElement.value = 'abc';
      pages.pageAdd.triggerEventHandler('keyup.enter', null);

      let arg = pages.serverAddPage.calls.mostRecent().args[0];

      expect(isPage(arg)).toBeTruthy();
    });
  });
});

function createComponent() {
  fixture = TestBed.createComponent(PagesComponent);
  comp = fixture.componentInstance;
  pages = new Pages();

  fixture.detectChanges();
  return fixture.whenStable().then(() => {
    fixture.detectChanges();
    pages.addElements();
  });
}

class Pages {
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

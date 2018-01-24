import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterLinkStub } from '../../testing/router';
import { ServerServiceStub } from '../../testing/server.service';

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

  pages: DebugElement[];
  pageName: HTMLElement;
  pageInput: HTMLInputElement;
  pageDelete: HTMLInputElement;
  pageAdd: HTMLInputElement;
  links: RouterLinkStub[];
  linkDes: DebugElement[];

  constructor() {
    const serverService = fixture.debugElement.injector.get(ServerService);

    this.onInit = spyOn(serverService, 'getCollection').and.callThrough();
    this.addPage = spyOn(comp, 'addPage').and.callThrough();
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

      this.pageAdd = fixture.debugElement.query(
        de => de.references['add']
      ).nativeElement;

      this.linkDes = fixture.debugElement.queryAll(
        By.directive(RouterLinkStub)
      );

      this.links = this.linkDes.map(
        de => de.injector.get(RouterLinkStub) as RouterLinkStub
      );
    }
  }
}

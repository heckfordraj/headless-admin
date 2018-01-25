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
});

function createComponent() {
  fixture = TestBed.createComponent(EditorComponent);
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

  pageName: HTMLElement;
  pageInput: DebugElement;
  pagePublish: DebugElement;
  pageRemove: DebugElement;

  constructor() {
    const serverService = fixture.debugElement.injector.get(ServerService);

    this.onInit = spyOn(serverService, 'getPage').and.callThrough();
  }

  addElements() {
    if (comp.page) {
      this.pageName = fixture.debugElement.query(By.css('h1')).nativeElement;
      this.pageInput = fixture.debugElement.query(
        de => de.references['pageInput']
      );
      this.pagePublish = fixture.debugElement.query(
        de => de.references['publish']
      );
      this.pageRemove = fixture.debugElement.query(
        de => de.references['remove']
      );
    }
  }
}

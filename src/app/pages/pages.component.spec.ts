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

  it('should set pages', () => {
    expect(comp.pages.length).toBe(5);
  });

  it('should display pages', () => {
    expect(pages.pages.length).toBe(5);
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
  addPage: jasmine.Spy;

  pages: DebugElement[];
  pageName: HTMLElement;
  pageInput: HTMLInputElement;

  constructor() {
    const serverService = fixture.debugElement.injector.get(ServerService);

    this.addPage = spyOn(comp, 'addPage').and.callThrough();
  }

  addElements() {
    if (comp.pages) {
      this.pages = fixture.debugElement.queryAll(By.css('li'));
      this.pageName = fixture.debugElement.query(By.css('a')).nativeElement;
      this.pageInput = fixture.debugElement.query(
        By.css('input')
      ).nativeElement;
    }
  }
}

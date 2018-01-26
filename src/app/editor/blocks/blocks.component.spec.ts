import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ServerServiceStub } from '../../../testing/server.service';
import { isPage } from '../../../testing/page';
import { Pages } from '../../../testing/pages';

import { BlocksComponent } from './blocks.component';
import { ServerService } from '../../shared/server.service';

@Component({
  template: '<app-blocks [page]="page"></app-blocks>'
})
class HostComponent {
  page: any;
}

let comp: HostComponent;
let fixture: ComponentFixture<HostComponent>;
let page: Page;

describe('BlocksComponent', () => {
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [HostComponent, BlocksComponent],
        providers: [{ provide: ServerService, useClass: ServerServiceStub }],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(async(() => createComponent()));

  xit('should not call ServerService getPage on init');

  describe('initial page', () => {
    beforeEach(() => {
      comp.page = Pages[2];

      fixture.detectChanges();
      page.addElements();
    });

    it('should call ServerService getPage on change', () => {
      expect(page.onChanges.calls.any()).toBe(true);
    });
  });

  describe('new page', () => {
    beforeEach(() => {
      comp.page = Pages[3];

      fixture.detectChanges();
      page.addElements();
    });

    it('should call ServerService getPage on change', () => {
      expect(page.onChanges.calls.any()).toBe(true);
    });
  });
});

function createComponent() {
  fixture = TestBed.createComponent(HostComponent);
  comp = fixture.componentInstance;
  comp.page = Pages[0];
  page = new Page();

  fixture.detectChanges();
  return fixture.whenStable();
}

class Page {
  onChanges: jasmine.Spy;

  blockAdd: DebugElement;
  blockRemove: DebugElement;
  blockUp: DebugElement;
  blockDown: DebugElement;

  constructor() {
    const serverService = fixture.debugElement.injector.get(ServerService);

    this.onChanges = spyOn(serverService, 'getBlocks').and.callThrough();
  }

  addElements() {
    this.blockAdd = fixture.debugElement.query(de => de.references['remove']);
    this.blockRemove = fixture.debugElement.query(
      de => de.references['remove']
    );
    this.blockUp = fixture.debugElement.query(de => de.references['up']);
    this.blockDown = fixture.debugElement.query(de => de.references['down']);
  }
}

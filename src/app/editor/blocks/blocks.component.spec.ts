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

let compHost: HostComponent;
let comp: BlocksComponent;
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

  it('should not have page set on init', () => {
    expect(comp.page).toBeUndefined();
  });

  it('should not have blocks set on init', () => {
    expect(comp.blocks.length).toBe(0);
  });

  it('should not call ServerService getBlocks on init', () => {
    expect(page.onChanges.calls.any()).toBe(false);
  });

  describe('initial page', () => {
    beforeEach(() => {
      compHost.page = Pages[2];

      fixture.detectChanges();
      page.addElements();
    });

    it('should have page set', () => {
      expect(comp.page).toBeDefined();
    });

    it('should have identical page to host', () => {
      expect(comp.page).toEqual(compHost.page);
    });

    it('should call ServerService getBlocks on change', () => {
      expect(page.onChanges.calls.any()).toBe(true);
    });

    it('should call ServerService getBlocks with page', () => {
      let arg = page.onChanges.calls.mostRecent().args[0];

      expect(arg).toEqual(comp.page);
    });

    it('should get blocks', () => {
      expect(comp.blocks).toBeDefined();
      expect(comp.blocks).not.toBeNull();
    });

    it('should display blocks type', () => {
      expect(page.blockType.textContent).toBe('text');
    });
  });

  describe('new page', () => {
    beforeEach(() => {
      compHost.page = Pages[3];

      fixture.detectChanges();
      page.addElements();
    });

    it('should have identical page to host', () => {
      expect(comp.page).toEqual(compHost.page);
    });

    it('should call ServerService getBlocks on change', () => {
      expect(page.onChanges.calls.any()).toBe(true);
    });

    it('should call ServerService getBlocks with page', () => {
      let arg = page.onChanges.calls.mostRecent().args[0];

      expect(arg).toEqual(comp.page);
    });

    it('should display blocks type', () => {
      expect(page.blockType.textContent).toBe('image');
    });
  });
});

function createComponent() {
  fixture = TestBed.createComponent(HostComponent);
  compHost = fixture.componentInstance;
  comp = fixture.debugElement.query(By.directive(BlocksComponent))
    .componentInstance;
  page = new Page();

  fixture.detectChanges();
  return fixture.whenStable();
}

class Page {
  onChanges: jasmine.Spy;

  blockType: HTMLElement;
  blockAdd: DebugElement;
  blockRemove: DebugElement;
  blockUp: DebugElement;
  blockDown: DebugElement;

  constructor() {
    const serverService = fixture.debugElement.injector.get(ServerService);

    this.onChanges = spyOn(serverService, 'getBlocks').and.callThrough();
  }

  addElements() {
    this.blockType = fixture.debugElement.query(By.css('b')).nativeElement;
    this.blockAdd = fixture.debugElement.query(de => de.references['remove']);
    this.blockRemove = fixture.debugElement.query(
      de => de.references['remove']
    );
    this.blockUp = fixture.debugElement.query(de => de.references['up']);
    this.blockDown = fixture.debugElement.query(de => de.references['down']);
  }
}

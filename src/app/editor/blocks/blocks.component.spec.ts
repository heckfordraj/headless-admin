import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ServerServiceStub } from '../../../testing/server.service';
import { isPage } from '../../../testing/page';
import { isBlock } from '../../../testing/block';
import { Pages } from '../../../testing/data';

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

    it('should call ServerService getBlocks with Page', () => {
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

    it('should call ServerService getBlocks with Page', () => {
      let arg = page.onChanges.calls.mostRecent().args[0];

      expect(arg).toEqual(comp.page);
    });

    it('should display blocks type', () => {
      expect(page.blockType.textContent).toBe('image');
    });
  });

  describe('Add Block', () => {
    beforeEach(() => {
      compHost.page = Pages[0];

      fixture.detectChanges();
      page.addElements();
    });

    it('should call addBlock on text click', () => {
      page.blockAddText.triggerEventHandler('click', null);

      expect(page.addBlock.calls.count()).toBe(1);
      page.addBlock.calls.reset();
    });

    it('should call addBlock on image click', () => {
      page.blockAddText.triggerEventHandler('click', null);

      expect(page.addBlock.calls.count()).toBe(1);
      page.addBlock.calls.reset();
    });

    it('should call addBlock with bare Block', () => {
      page.blockAddText.triggerEventHandler('click', null);
      let arg = page.addBlock.calls.mostRecent().args[0];

      expect(arg.type).toBeDefined();
      expect(arg.data).toBeDefined();
    });

    it('should call ServerService addBlock', () => {
      page.blockAddText.triggerEventHandler('click', null);

      expect(page.serverAddBlock.calls.count()).toBe(1);
    });

    describe('create Block', () => {
      let bareBlock;
      let newBlock;

      beforeEach(() => {
        page.blockAddText.triggerEventHandler('click', null);

        bareBlock = page.addBlock.calls.mostRecent().args[0];
        newBlock = page.serverAddBlock.calls.mostRecent().args[1];
      });

      it('should set id', () => {
        expect(newBlock.id).toBe('abcdefg');
      });

      it('should set order', () => {
        expect(newBlock.order).toBeDefined();
      });

      it('should set order to be last block', () => {
        let blocksNum = comp.blocks.length;

        expect(newBlock.order).toBe(blocksNum + 1);
      });

      it('should set merged type', () => {
        expect(newBlock.type).toBe(bareBlock.type);
      });

      it('should set merged data', () => {
        expect(newBlock.data).toBe(bareBlock.data);
      });
    });

    it('should call ServerService addBlock with this page', () => {
      page.blockAddText.triggerEventHandler('click', null);
      let arg = page.serverAddBlock.calls.mostRecent().args[0];

      expect(arg).toEqual(comp.page);
    });

    it('should call ServerService addBlock with Block', () => {
      page.blockAddText.triggerEventHandler('click', null);
      let arg = page.serverAddBlock.calls.mostRecent().args[1];

      expect(isBlock(arg)).toBe(true);
    });
  });

  describe('Remove Block', () => {
    beforeEach(() => {
      compHost.page = Pages[0];

      fixture.detectChanges();
      page.addElements();
    });

    it('should call removeBlock on click', () => {
      page.blockRemove.triggerEventHandler('click', null);

      expect(page.removeBlock.calls.count()).toBe(1);
    });

    it('should call ServerService removeBlock on click', () => {
      page.blockRemove.triggerEventHandler('click', null);

      expect(page.serverRemoveBlock.calls.count()).toBe(1);
    });

    it('should call ServerService removeBlock with this page', () => {
      page.blockRemove.triggerEventHandler('click', null);
      let arg = page.serverRemoveBlock.calls.mostRecent().args[0];

      expect(arg).toEqual(comp.page);
    });

    it('should call ServerService removeBlock with correct block', () => {
      page.blockRemove.triggerEventHandler('click', null);
      let arg = page.serverRemoveBlock.calls.mostRecent().args[1];

      expect(arg.id).toBe('1');
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
  addBlock: jasmine.Spy;
  removeBlock: jasmine.Spy;
  serverAddBlock: jasmine.Spy;
  serverRemoveBlock: jasmine.Spy;

  blockType: HTMLElement;
  blockAddText: DebugElement;
  blockAddImage: DebugElement;
  blockRemove: DebugElement;
  blockUp: DebugElement;
  blockDown: DebugElement;

  constructor() {
    const serverService = fixture.debugElement.injector.get(ServerService);

    this.onChanges = spyOn(serverService, 'getBlocks').and.callThrough();
    this.addBlock = spyOn(comp, 'addBlock').and.callThrough();
    this.removeBlock = spyOn(comp, 'removeBlock').and.callThrough();
    this.serverAddBlock = spyOn(serverService, 'addBlock').and.callThrough();
    this.serverRemoveBlock = spyOn(
      serverService,
      'removeBlock'
    ).and.callThrough();
  }

  addElements() {
    this.blockType = fixture.debugElement.query(By.css('b')).nativeElement;
    this.blockAddText = fixture.debugElement.query(By.css('#add-text'));
    this.blockAddImage = fixture.debugElement.query(By.css('#add-image'));
    this.blockRemove = fixture.debugElement.query(
      de => de.references['remove']
    );
    this.blockUp = fixture.debugElement.query(de => de.references['up']);
    this.blockDown = fixture.debugElement.query(de => de.references['down']);
  }
}

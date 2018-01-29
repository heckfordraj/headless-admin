import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ServerServiceStub } from '../../../testing/server.service';
import { isPage } from '../../../testing/page';
import { isBlock } from '../../../testing/block';
import { Pages, Blocks, Data } from '../../../testing/data';

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

  xdescribe('initial page', () => {
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
      expect(comp.blocks.length).toBe(3);
    });

    it('should display blocks type', () => {
      expect(page.blocksType[0].nativeElement.textContent).toBe('text');
      expect(page.blocksType[1].nativeElement.textContent).toBe('image');
      expect(page.blocksType[2].nativeElement.textContent).toBe('text');
    });
  });

  xdescribe('new page', () => {
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
      expect(page.blocksType[0].nativeElement.textContent).toBe('image');
      expect(page.blocksType[1].nativeElement.textContent).toBe('text');
      expect(page.blocksType[2].nativeElement.textContent).toBe('image');
    });
  });

  xdescribe('Add Block', () => {
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

  xdescribe('Remove Block', () => {
    beforeEach(() => {
      compHost.page = Pages[1];

      fixture.detectChanges();
      page.addElements();
    });

    it('should call removeBlock on click', () => {
      page.blocksRemove[1].triggerEventHandler('click', null);

      expect(page.removeBlock.calls.count()).toBe(1);
    });

    it('should call ServerService removeBlock on click', () => {
      page.blocksRemove[1].triggerEventHandler('click', null);

      expect(page.serverRemoveBlock.calls.count()).toBe(1);
    });

    it('should call ServerService removeBlock with this page', () => {
      page.blocksRemove[1].triggerEventHandler('click', null);
      let arg = page.serverRemoveBlock.calls.mostRecent().args[0];

      expect(arg).toEqual(comp.page);
    });

    it('should call ServerService removeBlock with correct block', () => {
      page.blocksRemove[1].triggerEventHandler('click', null);
      let arg = page.serverRemoveBlock.calls.mostRecent().args[1];

      expect(arg.id).toBe('2');
    });
  });

  xdescribe('Update Block', () => {
    let block = Blocks['4'][0];
    let data = Data[2];

    beforeEach(() => {
      compHost.page = Pages[0];

      fixture.detectChanges();
      page.addElements();
      comp.updateBlock(block, data);
    });

    it('should call ServerService updateBlock', () => {
      expect(page.serverUpdateBlock.calls.count()).toBe(1);
    });

    it('should call ServerService updateBlock with this page', () => {
      let arg = page.serverUpdateBlock.calls.mostRecent().args[0];

      expect(arg).toEqual(comp.page);
    });

    it('should call ServerService updateBlock with unchanged block param', () => {
      let arg = page.serverUpdateBlock.calls.mostRecent().args[1];

      expect(arg).toEqual(block);
    });

    it('should call ServerService updateBlock with unchanged data param', () => {
      let arg = page.serverUpdateBlock.calls.mostRecent().args[2];

      expect(arg).toEqual(data);
    });
  });

  describe('Order Block', () => {
    beforeEach(() => {
      compHost.page = Pages[0];
      fixture.detectChanges();

      page.addElements();
    });

    it('should call orderBlock on up click', () => {
      page.blocksUp[1].triggerEventHandler('click', null);

      expect(page.orderBlock.calls.count()).toBe(1);
    });

    it('should call orderBlock on down click', () => {
      page.blocksDown[1].triggerEventHandler('click', null);

      expect(page.orderBlock.calls.count()).toBe(1);
    });

    it('should call orderBlock with correct index', () => {
      page.blocksDown[1].triggerEventHandler('click', null);
      let arg = page.orderBlock.calls.mostRecent().args[0];

      expect(arg).toBe(1);
    });

    it('should call orderBlock with up direction', () => {
      page.blocksUp[1].triggerEventHandler('click', null);
      let arg = page.orderBlock.calls.mostRecent().args[1];

      expect(arg).toBe(-1);
    });

    it('should call orderBlock with down direction', () => {
      page.blocksDown[1].triggerEventHandler('click', null);
      let arg = page.orderBlock.calls.mostRecent().args[1];

      expect(arg).toBe(1);
    });

    it('should call ServerService orderBlock', () => {
      page.blocksUp[1].triggerEventHandler('click', null);

      expect(page.serverOrderBlock.calls.count()).toBe(1);
    });

    it('should call ServerService orderBlock on first block down click', () => {
      page.blocksDown[0].triggerEventHandler('click', null);

      expect(page.serverOrderBlock.calls.count()).toBe(1);
    });

    it('should call ServerService orderBlock on last block up click', () => {
      page.blocksUp[2].triggerEventHandler('click', null);

      expect(page.serverOrderBlock.calls.count()).toBe(1);
    });

    it('should not call ServerService orderBlock on first block up click', () => {
      page.blocksUp[0].triggerEventHandler('click', null);

      expect(page.serverOrderBlock.calls.count()).toBe(0);
    });

    it('should not call ServerService orderBlock on last block down click', () => {
      page.blocksDown[2].triggerEventHandler('click', null);

      expect(page.serverOrderBlock.calls.count()).toBe(0);
    });

    it('should not set both blocks with identical order', () => {
      page.blocksDown[0].triggerEventHandler('click', null);

      let block = page.serverOrderBlock.calls.mostRecent().args[1];
      let blockReplaced = page.serverOrderBlock.calls.mostRecent().args[2];

      expect(block.order).not.toBe(blockReplaced.order);
    });

    it('should decrement block order on up click', () => {
      console.log(comp.blocks);

      let initial = comp.blocks[1].order;

      page.blocksUp[1].triggerEventHandler('click', null);
      let current = page.serverOrderBlock.calls.mostRecent().args[1];

      expect(current.order).toBe(initial - 1);
    });

    xit('should increment replaced block order', () => {});

    xit('should increment block order on down click', () => {});

    xit('should decrement replaced block order', () => {});

    xit('should always have sequential order numbers', () => {});

    xit('should never have multiple blocks with identical order numbers', () => {});
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
  orderBlock: jasmine.Spy;
  serverAddBlock: jasmine.Spy;
  serverUpdateBlock: jasmine.Spy;
  serverRemoveBlock: jasmine.Spy;
  serverOrderBlock: jasmine.Spy;

  blocksType: DebugElement[];
  blockAddText: DebugElement;
  blockAddImage: DebugElement;
  blocksRemove: DebugElement[];
  blocksUp: DebugElement[];
  blocksDown: DebugElement[];

  constructor() {
    const serverService = fixture.debugElement.injector.get(ServerService);

    this.onChanges = spyOn(serverService, 'getBlocks').and.callThrough();
    this.addBlock = spyOn(comp, 'addBlock').and.callThrough();
    this.removeBlock = spyOn(comp, 'removeBlock').and.callThrough();
    this.orderBlock = spyOn(comp, 'orderBlock').and.callThrough();
    this.serverAddBlock = spyOn(serverService, 'addBlock').and.callThrough();
    this.serverUpdateBlock = spyOn(
      serverService,
      'updateBlock'
    ).and.callThrough();
    this.serverRemoveBlock = spyOn(
      serverService,
      'removeBlock'
    ).and.callThrough();
    this.serverOrderBlock = spyOn(
      serverService,
      'orderBlock'
    ).and.callThrough();
  }

  addElements() {
    this.blocksType = fixture.debugElement.queryAll(By.css('b'));
    this.blockAddText = fixture.debugElement.query(By.css('#add-text'));
    this.blockAddImage = fixture.debugElement.query(By.css('#add-image'));
    this.blocksRemove = fixture.debugElement.queryAll(
      de => de.references['remove']
    );
    this.blocksUp = fixture.debugElement.queryAll(de => de.references['up']);
    this.blocksDown = fixture.debugElement.queryAll(
      de => de.references['down']
    );
  }
}

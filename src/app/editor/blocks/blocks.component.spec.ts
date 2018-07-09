import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import {
  LoggerService,
  MockLoggerService,
  ServerService,
  MockServerService,
  isPage,
  isBlock,
  Data
} from 'testing';
import { BlocksComponent } from './blocks.component';

@Component({
  template: '<app-blocks [page]="page"></app-blocks>'
})
class HostComponent {
  page: any;
}

let compHost: HostComponent;
let comp: BlocksComponent;
let fixture: ComponentFixture<HostComponent>;
let serverService: ServerService;
let page: Page;

describe('BlocksComponent', () => {
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [HostComponent, BlocksComponent],
        providers: [
          LoggerService,
          { provide: LoggerService, useClass: MockLoggerService },
          { provide: ServerService, useClass: MockServerService }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(async(() => createComponent()));

  describe('OnInit', () => {
    it('should not have page set', () => {
      expect(comp.page).toBeUndefined();
    });

    it('should not have blocks set', () => {
      expect(comp.blocks.length).toBe(0);
    });

    it('should not call ServerService getBlocks', () => {
      expect(serverService.getBlocks).not.toHaveBeenCalled();
    });
  });

  describe('initial page', () => {
    beforeEach(() => {
      compHost.page = Data.Pages[2];

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
      expect(serverService.getBlocks).toHaveBeenCalled();
    });

    it('should call ServerService getBlocks with Page', () => {
      expect(serverService.getBlocks).toHaveBeenCalledWith(comp.page);
    });

    it('should get blocks', () => {
      expect(comp.blocks.length).toBe(3);
    });

    it('should display blocks type', () => {
      expect(page.blocksType[0].nativeElement.textContent).toBe('text');
      expect(page.blocksType[1].nativeElement.textContent).toBe('image');
      expect(page.blocksType[2].nativeElement.textContent).toBe('text');
    });

    it('should display correct block component', () => {
      expect(page.blocksSwitch[0].name).toBe('app-text');
      expect(page.blocksSwitch[1].name).toBe('app-image');
      expect(page.blocksSwitch[2].name).toBe('app-text');
    });
  });

  describe('new page', () => {
    beforeEach(() => {
      compHost.page = Data.Pages[3];

      fixture.detectChanges();
      page.addElements();
    });

    it('should have identical page to host', () => {
      expect(comp.page).toEqual(compHost.page);
    });

    it('should call ServerService getBlocks on change', () => {
      expect(serverService.getBlocks).toHaveBeenCalled();
    });

    it('should call ServerService getBlocks with Page', () => {
      expect(serverService.getBlocks).toHaveBeenCalledWith(comp.page);
    });

    it('should display blocks type', () => {
      expect(page.blocksType[0].nativeElement.textContent).toBe('image');
      expect(page.blocksType[1].nativeElement.textContent).toBe('text');
      expect(page.blocksType[2].nativeElement.textContent).toBe('image');
    });

    it('should display correct block component', () => {
      expect(page.blocksSwitch[0].name).toBe('app-image');
      expect(page.blocksSwitch[1].name).toBe('app-text');
      expect(page.blocksSwitch[2].name).toBe('app-image');
    });
  });

  describe('Add Block', () => {
    beforeEach(() => {
      compHost.page = Data.Pages[0];

      fixture.detectChanges();
      page.addElements();
    });

    it('should call addBlock on text click', () => {
      page.blockAddText.triggerEventHandler('click', null);

      expect(page.addBlock).toHaveBeenCalledTimes(1);
      page.addBlock.calls.reset();
    });

    it('should call addBlock on image click', () => {
      page.blockAddImage.triggerEventHandler('click', null);

      expect(page.addBlock).toHaveBeenCalledTimes(1);
      page.addBlock.calls.reset();
    });

    it('should call addBlock with bare Block', () => {
      page.blockAddText.triggerEventHandler('click', null);

      expect(page.addBlock).toHaveBeenCalledWith({ type: jasmine.any(String) });
    });

    it('should call ServerService addBlock', () => {
      page.blockAddText.triggerEventHandler('click', null);

      expect(serverService.addBlock).toHaveBeenCalledTimes(1);
    });

    describe('create Block', () => {
      let bareBlock;
      let newBlock;

      beforeEach(() => {
        page.blockAddText.triggerEventHandler('click', null);

        bareBlock = page.addBlock.calls.mostRecent().args[0];
        newBlock = (serverService.addBlock as jasmine.Spy).calls.mostRecent()
          .args[1];
      });

      it('should set id', () => {
        expect(newBlock.id).toBe('abcdefg');
      });

      it('should set order', () => {
        expect(newBlock.order).toBeDefined();
      });

      it('should set order to be last block', () => {
        const blocksNum = comp.blocks.length;

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

      expect(serverService.addBlock).toHaveBeenCalledWith(
        comp.page,
        jasmine.anything()
      );
    });

    it('should call ServerService addBlock with Block', () => {
      page.blockAddText.triggerEventHandler('click', null);
      const arg = (serverService.addBlock as jasmine.Spy).calls.mostRecent()
        .args[1];

      expect(isBlock(arg)).toBe(true);
    });
  });

  describe('Remove Block', () => {
    beforeEach(() => {
      compHost.page = Data.Pages[1];

      fixture.detectChanges();
      page.addElements();
    });

    it('should call removeBlock on click', () => {
      page.blocksRemove[1].triggerEventHandler('click', null);

      expect(page.removeBlock).toHaveBeenCalled();
    });

    it('should call ServerService removeBlock on click', () => {
      page.blocksRemove[1].triggerEventHandler('click', null);

      expect(serverService.removeBlock).toHaveBeenCalled();
    });

    it('should call ServerService removeBlock with this page', () => {
      page.blocksRemove[1].triggerEventHandler('click', null);

      expect(serverService.removeBlock).toHaveBeenCalledWith(
        comp.page,
        jasmine.anything()
      );
    });

    it('should call ServerService removeBlock with correct block', () => {
      page.blocksRemove[1].triggerEventHandler('click', null);

      expect(serverService.removeBlock).toHaveBeenCalledWith(
        jasmine.anything(),
        { id: '2', type: jasmine.any(String), order: jasmine.any(Number) }
      );
    });
  });

  xdescribe('Update Block', () => {
    let block = Data.Blocks['4'][0];
    let data = Data.Data[2];

    beforeEach(() => {
      compHost.page = Data.Pages[0];

      fixture.detectChanges();
      page.addElements();
      // comp.updateBlock(block, data);
    });

    // it('should call ServerService updateBlock', () => {
    //   expect(serverService.updateBlock.calls.count()).toBe(1);
    // });
    //
    // it('should call ServerService updateBlock with this page', () => {
    //   let arg = serverService.updateBlock.calls.mostRecent().args[0];
    //
    //   expect(arg).toEqual(comp.page);
    // });
    //
    // it('should call ServerService updateBlock with unchanged block param', () => {
    //   let arg = serverService.updateBlock.calls.mostRecent().args[1];
    //
    //   expect(arg).toEqual(block);
    // });
    //
    // it('should call ServerService updateBlock with unchanged data param', () => {
    //   let arg = serverService.updateBlock.calls.mostRecent().args[2];
    //
    //   expect(arg).toEqual(data);
    // });
  });

  describe('Order Block', () => {
    beforeEach(() => {
      compHost.page = Data.Pages[0];
      fixture.detectChanges();

      page.addElements();
    });

    it('should call orderBlock on up click', () => {
      page.blocksUp[1].triggerEventHandler('click', null);

      expect(page.orderBlock).toHaveBeenCalled();
    });

    it('should call orderBlock on down click', () => {
      page.blocksDown[1].triggerEventHandler('click', null);

      expect(page.orderBlock).toHaveBeenCalled();
    });

    it('should call orderBlock with correct index', () => {
      page.blocksDown[1].triggerEventHandler('click', null);

      expect(page.orderBlock).toHaveBeenCalledWith(1, jasmine.any(Number));
    });

    it('should call orderBlock with up direction', () => {
      page.blocksUp[1].triggerEventHandler('click', null);

      expect(page.orderBlock).toHaveBeenCalledWith(jasmine.any(Number), -1);
    });

    it('should call orderBlock with down direction', () => {
      page.blocksDown[1].triggerEventHandler('click', null);

      expect(page.orderBlock).toHaveBeenCalledWith(jasmine.any(Number), 1);
    });

    it('should call ServerService orderBlock', () => {
      page.blocksUp[1].triggerEventHandler('click', null);

      expect(serverService.orderBlock).toHaveBeenCalled();
    });

    it('should call ServerService orderBlock on first block down click', () => {
      page.blocksDown[0].triggerEventHandler('click', null);

      expect(serverService.orderBlock).toHaveBeenCalled();
    });

    it('should call ServerService orderBlock on last block up click', () => {
      page.blocksUp[2].triggerEventHandler('click', null);

      expect(serverService.orderBlock).toHaveBeenCalled();
    });

    it('should not call ServerService orderBlock on first block up click', () => {
      page.blocksUp[0].triggerEventHandler('click', null);

      expect(serverService.orderBlock).not.toHaveBeenCalled();
    });

    it('should not call ServerService orderBlock on last block down click', () => {
      page.blocksDown[2].triggerEventHandler('click', null);

      expect(serverService.orderBlock).not.toHaveBeenCalled();
    });

    it('should not set both blocks with identical order', () => {
      page.blocksDown[0].triggerEventHandler('click', null);

      const block = (serverService.orderBlock as jasmine.Spy).calls.mostRecent()
        .args[1];
      const blockReplaced = (serverService.orderBlock as jasmine.Spy).calls.mostRecent()
        .args[2];

      expect(block.order).not.toBe(blockReplaced.order);
    });

    it('should decrement block order on up click', () => {
      page.blocksUp[2].triggerEventHandler('click', null);

      expect(serverService.orderBlock).toHaveBeenCalledWith(
        jasmine.anything(),
        { order: 2, id: jasmine.any(String), type: jasmine.any(String) },
        jasmine.anything()
      );
    });

    it('should increment replaced block order', () => {
      page.blocksUp[2].triggerEventHandler('click', null);

      expect(serverService.orderBlock).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.anything(),
        { order: 3, id: jasmine.any(String), type: jasmine.any(String) }
      );
    });

    it('should increment block order on down click', () => {
      page.blocksDown[0].triggerEventHandler('click', null);

      expect(serverService.orderBlock).toHaveBeenCalledWith(
        jasmine.anything(),
        { order: 2, id: jasmine.any(String), type: jasmine.any(String) },
        jasmine.anything()
      );
    });

    it('should decrement replaced block order', () => {
      page.blocksDown[0].triggerEventHandler('click', null);

      expect(serverService.orderBlock).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.anything(),
        { order: 1, id: jasmine.any(String), type: jasmine.any(String) }
      );
    });

    it('should always have sequential order numbers', () => {
      page.blocksUp.forEach(button =>
        button.triggerEventHandler('click', null)
      );
      page.blocksDown.forEach(button =>
        button.triggerEventHandler('click', null)
      );

      const orders = comp.blocks.map(blocks => blocks.order).sort();

      expect(orders).toEqual(
        Array.from({ length: orders.length }, (v, k) => k + 1)
      );
    });

    it('should never have multiple blocks with identical order numbers', () => {
      page.blocksDown.forEach(button =>
        button.triggerEventHandler('click', null)
      );
      page.blocksUp.forEach(button =>
        button.triggerEventHandler('click', null)
      );

      const orders = comp.blocks.map(blocks => blocks.order);

      const isUnique = array => {
        const temp = [];

        return array.map(arr => {
          if (temp.includes(arr)) return true;

          temp.push(arr);
          return false;
        });
      };

      expect(isUnique(orders)).toEqual(Array(orders.length).fill(false));
    });
  });
});

function createComponent() {
  fixture = TestBed.createComponent(HostComponent);
  compHost = fixture.componentInstance;
  comp = fixture.debugElement.query(By.directive(BlocksComponent))
    .componentInstance;
  serverService = fixture.debugElement.injector.get(ServerService);
  page = new Page();

  fixture.detectChanges();
  return fixture.whenStable();
}

class Page {
  addBlock: jasmine.Spy;
  removeBlock: jasmine.Spy;
  orderBlock: jasmine.Spy;

  blocksType: DebugElement[];
  blocksSwitch: DebugElement[];
  blockAddText: DebugElement;
  blockAddImage: DebugElement;
  blocksRemove: DebugElement[];
  blocksUp: DebugElement[];
  blocksDown: DebugElement[];

  constructor() {
    this.addBlock = spyOn(comp, 'addBlock').and.callThrough();
    this.removeBlock = spyOn(comp, 'removeBlock').and.callThrough();
    this.orderBlock = spyOn(comp, 'orderBlock').and.callThrough();
  }

  addElements() {
    this.blocksType = fixture.debugElement.queryAll(By.css('b'));
    this.blocksSwitch = fixture.debugElement.queryAll(By.css('.switch-block'));
    this.blockAddText = fixture.debugElement.query(By.css('#add-text'));
    this.blockAddImage = fixture.debugElement.query(By.css('#add-image'));
    this.blocksRemove = fixture.debugElement.queryAll(By.css('.block-remove'));
    this.blocksUp = fixture.debugElement.queryAll(By.css('.order-up'));
    this.blocksDown = fixture.debugElement.queryAll(By.css('.order-down'));
  }
}

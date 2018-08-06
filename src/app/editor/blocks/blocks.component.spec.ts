import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import {
  LoggerService,
  MockLoggerService,
  ServerService,
  MockServerService,
  Block,
  TextUserData,
  Data,
  makeImmutable
} from 'testing';

import { TextComponent } from './text/text.component';
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
let textComponent: TextComponent;
let page: Page;

describe('BlocksComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HostComponent, BlocksComponent, TextComponent],
      providers: [
        LoggerService,
        { provide: LoggerService, useClass: MockLoggerService },
        { provide: ServerService, useClass: MockServerService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(async(() => createComponent()));

  it('should create component', () => {
    expect(comp).toBeTruthy();
  });

  describe('OnInit', () => {
    it('should not set page', () => {
      expect(comp.page).toBeUndefined();
    });

    it('should not set blocks', () => {
      expect(comp.blocks.length).toBe(0);
    });

    it('should not call ServerService getBlocks', () => {
      expect(serverService.getBlocks).not.toHaveBeenCalled();
    });
  });

  describe('initial page', () => {
    beforeEach(() => {
      compHost.page = Data.getPages('page-3');
      fixture.detectChanges();
    });

    it('should set page', () => {
      expect(comp.page).toEqual(Data.getPages('page-3'));
    });

    it('should call ServerService getBlocks', () => {
      expect(serverService.getBlocks).toHaveBeenCalled();
    });

    it('should call ServerService getBlocks with page arg', () => {
      expect(serverService.getBlocks).toHaveBeenCalledWith(
        Data.getPages('page-3')
      );
    });

    it('should set blocks', () => {
      expect(comp.blocks.length).toBe(3);
    });

    it('should display correct block component', () => {
      expect(page.blocksSwitch[0].nodeName.toLowerCase()).toBe('app-text');
      expect(page.blocksSwitch[1].nodeName.toLowerCase()).toBe('app-image');
      expect(page.blocksSwitch[2].nodeName.toLowerCase()).toBe('app-text');
    });
  });

  describe('page change', () => {
    beforeEach(() => {
      compHost.page = Data.getPages('page-3');
      fixture.detectChanges();
      compHost.page = Data.getPages('page-4');
      fixture.detectChanges();
    });

    it('should set page', () => {
      expect(comp.page).toEqual(Data.getPages('page-4'));
    });

    it('should call ServerService getBlocks', () => {
      expect(serverService.getBlocks).toHaveBeenCalledTimes(2);
    });

    it('should call ServerService getBlocks with page arg', () => {
      expect(serverService.getBlocks).toHaveBeenCalledWith(
        Data.getPages('page-4')
      );
    });

    it('should display correct block component', () => {
      expect(page.blocksSwitch[0].nodeName.toLowerCase()).toBe('app-text');
      expect(page.blocksSwitch[1].nodeName.toLowerCase()).toBe('app-image');
      expect(page.blocksSwitch[2].nodeName.toLowerCase()).toBe('app-text');
    });
  });

  describe('addBlock', () => {
    beforeEach(() => {
      compHost.page = Data.getPages('page-1');
      fixture.detectChanges();
    });

    it('should be called on text block click', () => {
      page.blockAddText.click();

      expect(page.addBlock).toHaveBeenCalled();
    });

    it('should be called on text block click with Block.Base arg', () => {
      page.blockAddText.click();

      expect(page.addBlock).toHaveBeenCalledWith({ type: 'text' });
    });

    it('should be called on image block click', () => {
      page.blockAddImage.click();

      expect(page.addBlock).toHaveBeenCalled();
    });

    it('should be called on image block click with Block.Base arg', () => {
      page.blockAddImage.click();

      expect(page.addBlock).toHaveBeenCalledWith({ type: 'image' });
    });

    it('should call ServerService createId', () => {
      comp.addBlock({ type: null } as any);

      expect(serverService.createId).toHaveBeenCalled();
    });

    it('should call ServerService addBlock', () => {
      comp.addBlock({ type: null } as any);

      expect(serverService.addBlock).toHaveBeenCalled();
    });

    it('should call ServerService addBlock with page and block args', () => {
      const block: Block.Base = makeImmutable({
        type: null,
        id: 'abcdefg',
        order: 4
      });
      comp.addBlock({ type: null } as any);

      expect(serverService.addBlock).toHaveBeenCalledWith(
        Data.getPages('page-1'),
        block
      );
    });

    it('should call ServerService addBlock with page and block args with block order as incremented blocks array length', () => {
      const block: Block.Base = makeImmutable({
        type: null,
        id: 'abcdefg',
        order: null
      });
      comp.blocks = [null, null, null, null];
      comp.addBlock({ type: null } as any);

      expect(serverService.addBlock).toHaveBeenCalledWith(jasmine.anything(), {
        ...block,
        order: 5
      });
    });
  });

  describe('removeBlock', () => {
    const block: Block.Base = makeImmutable({
      type: 'text',
      id: '1',
      order: 1
    });

    beforeEach(() => {
      compHost.page = Data.getPages('page-2');
      fixture.detectChanges();
    });

    it('should be called on button click', () => {
      page.blocksRemove[1].click();

      expect(page.removeBlock).toHaveBeenCalled();
    });

    it('should call ServerService removeBlock', () => {
      comp.removeBlock(block);

      expect(serverService.removeBlock).toHaveBeenCalled();
    });

    it('should call ServerService removeBlock with page and block args', () => {
      comp.removeBlock(block);

      expect(serverService.removeBlock).toHaveBeenCalledWith(
        Data.getPages('page-2'),
        block
      );
    });
  });

  describe('updateActiveBlock', () => {
    const textUserData: TextUserData = makeImmutable({ index: 1, length: 2 });

    beforeEach(() => {
      compHost.page = Data.getPages('page-1');
      fixture.detectChanges();
      textComponent = fixture.debugElement.query(By.directive(TextComponent))
        .componentInstance;
    });

    it('should be called on TextComponent selection emit', () => {
      textComponent.selection.emit(null);

      expect(comp.updateActiveBlock).toHaveBeenCalled();
    });

    it('should be called with block and TextComponent selection range args', () => {
      textComponent.selection.emit(textUserData);

      expect(comp.updateActiveBlock).toHaveBeenCalledWith(
        Data.getBlocks('text'),
        textUserData
      );
    });

    it('should call ServerService updateUser', () => {
      comp.updateActiveBlock(Data.getBlocks('text'), textUserData);

      expect(serverService.updateUser).toHaveBeenCalled();
    });

    it('should call ServerService updateUser with page and user args', () => {
      comp.updateActiveBlock(Data.getBlocks('text'), textUserData);

      expect(serverService.updateUser).toHaveBeenCalledWith(
        Data.getPages('page-1'),
        {
          id: null,
          colour: null,
          current: { blockId: '1', data: textUserData }
        }
      );
    });
  });

  describe('orderBlock', () => {
    beforeEach(() => {
      compHost.page = Data.getPages('page-1');
      fixture.detectChanges();
    });

    it('should be called on up button click', () => {
      page.blocksUp[1].click();

      expect(page.orderBlock).toHaveBeenCalled();
    });

    it('should be called on up button click with index and up args', () => {
      page.blocksUp[1].click();

      expect(page.orderBlock).toHaveBeenCalledWith(1, -1);
    });

    it('should be called on down button click', () => {
      page.blocksDown[1].click();

      expect(page.orderBlock).toHaveBeenCalled();
    });

    it('should be called on down button click with index and down args', () => {
      page.blocksDown[1].click();

      expect(page.orderBlock).toHaveBeenCalledWith(1, 1);
    });

    it('should call ServerService orderBlock if block to be moved', () => {
      comp.orderBlock(0, 1);

      expect(serverService.orderBlock).toHaveBeenCalled();
    });

    it('should call ServerService orderBlock if block to be moved with page, block, block replaced args', () => {
      comp.orderBlock(0, 1);

      expect(serverService.orderBlock).toHaveBeenCalledWith(
        Data.getPages('page-1'),
        { ...Data.getBlocks('text'), order: jasmine.any(Number) },
        { ...Data.getBlocks('image'), order: jasmine.any(Number) }
      );
    });

    it('should call ServerService orderBlock if block to be moved with swapped block args', () => {
      comp.orderBlock(0, 1);

      expect(serverService.orderBlock).toHaveBeenCalledWith(
        Data.getPages('page-1'),
        { ...Data.getBlocks('text'), order: 2 },
        { ...Data.getBlocks('image'), order: 1 }
      );
    });

    it('should not call ServerService orderBlock if no block to be moved', () => {
      comp.orderBlock(0, -1);

      expect(serverService.orderBlock).not.toHaveBeenCalled();
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
  updateActiveBlock: jasmine.Spy;

  get blocksSwitch() {
    return this.queryAll<HTMLElement>('.switch-block');
  }
  get blockAddText() {
    return this.query<HTMLButtonElement>('#add-text');
  }
  get blockAddImage() {
    return this.query<HTMLButtonElement>('#add-image');
  }
  get blocksRemove() {
    return this.queryAll<HTMLButtonElement>('.block-remove');
  }
  get blocksUp() {
    return this.queryAll<HTMLButtonElement>('.order-up');
  }
  get blocksDown() {
    return this.queryAll<HTMLButtonElement>('.order-down');
  }

  constructor() {
    this.addBlock = spyOn(comp, 'addBlock').and.callThrough();
    this.removeBlock = spyOn(comp, 'removeBlock').and.callThrough();
    this.orderBlock = spyOn(comp, 'orderBlock').and.callThrough();
    this.updateActiveBlock = spyOn(comp, 'updateActiveBlock').and.callThrough();
  }

  private query<T>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }

  private queryAll<T>(selector: string): T[] {
    return fixture.nativeElement.querySelectorAll(selector);
  }
}

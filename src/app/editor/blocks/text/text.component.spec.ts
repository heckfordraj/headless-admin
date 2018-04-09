import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, EventEmitter } from '@angular/core';
import { RouterLinkStub } from '../../../../testing/router';
import { ServerServiceStub } from '../../../../testing/server.service';

import * as Quill from 'quill';
const Delta: Quill.DeltaStatic = Quill.import('delta');

import { TextComponent } from './text.component';
import { LoggerService } from '../../../shared/logger.service';
import { ServerService } from '../../../shared/server.service';
import { Block } from '../../../shared/block';

let comp: TextComponent;
let fixture: ComponentFixture<TextComponent>;
let page: Page;
let serverService: ServerServiceMock;

fdescribe('TextComponent', () => {
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [TextComponent, RouterLinkStub],
        providers: [
          LoggerService,
          { provide: ServerService, useClass: ServerServiceStub }
        ]
      }).compileComponents();
    })
  );

  beforeEach(async(() => createComponent()));

  it('should call ServerService getBlockContent on load', () => {
    expect(serverService.getBlockContent).toHaveBeenCalled();
  });

  describe('initial text', () => {
    beforeEach(() => {
      const initialData = {
        user: 'client1',
        id: 0,
        ops: [{ insert: 'abc' }]
      };
      serverService.blockContent.emit(initialData);
    });

    it('should set initial text', () => {
      expect(comp.text).toBeDefined();
    });

    it('should set initial editor text', () => {
      expect(page.editorEl.innerText.trim()).toBe('abc');
    });

    it('should add to initial text without overwriting', () => {
      page.addText(page.editorEl, '123');

      expect(page.editorEl.innerText.trim()).toBe('123abc');
    });
  });

  describe('insert text', () => {
    it('should insert text into editor', () => {
      page.addText(page.editorEl, '1');

      expect(page.editorEl.innerText.trim()).toBe('1');
    });

    it(
      'should call textChange',
      async(() => {
        page.addText(page.editorEl, '1');

        return setTimeout(() => {
          expect(page.textChange).toHaveBeenCalled();
        });
      })
    );
  });

  describe('conflict 1', () => {
    // Client 1                                      Server                                        Client 2
    // abd                                           abd                                           abd
    // bd----------------{ delete: 1 }-------------->bd  <-x-[{ retain: 2 }, { insert: 'c' }]------abcd
    // bd                                            bd----------------{ delete: 1 }-------------->bcd { delete: 1 }
    // bd                                            bcd<-----[{ retain: 1 }, { insert: 'c' }]-----bcd
    // bcd<-----[{ retain: 1 }, { insert: 'c' }]-----bcd                                           bcd

    const client1Data = [{ delete: 1 }];
    const client2Data = [{ retain: 2 }, { insert: 'c' }];

    beforeEach(
      async(() => {
        const initialData = {
          user: 'client1',
          id: 0,
          ops: [{ insert: 'abd' }]
        };
        serverService.blockContent.emit(initialData);

        comp.user = 'client1';
        comp.textChange(new Delta(client1Data), null, 'user');
        comp.user = 'client2';
        fixture.detectChanges();
        page.addText(page.editorEl, 'c', 2);
      })
    );

    it(
      'should set resolved text in editor',
      async(() =>
        setTimeout(() => {
          expect(page.editorEl.innerText.trim()).toBe('bcd');
        })
      )
    );

    it('should have resolved data on server', () => {
      expect(serverService.content[1]).toEqual({
        id: 1,
        user: 'client1',
        ops: client1Data
      });
      expect(serverService.content[2]).toEqual({
        id: 2,
        user: 'client2',
        ops: [{ retain: 1 }, { insert: 'c' }]
      });
    });
  });
});

function createComponent() {
  fixture = TestBed.createComponent(TextComponent);
  comp = fixture.componentInstance;
  page = new Page();
  serverService = new ServerServiceMock();

  fixture.detectChanges();
  return fixture.whenStable().then(_ => {
    fixture.detectChanges();
    page.addElements();
  });
}

class ServerServiceMock {
  getBlockContent: jasmine.Spy;
  updateBlockContent: jasmine.Spy;
  blockContent: EventEmitter<Block.Data.TextData> = new EventEmitter();
  content: Block.Data.TextData[] = [];

  constructor() {
    const serverService = fixture.debugElement.injector.get(ServerService);

    const updateBlockContent = (
      block: Block.Base,
      data: Block.Data.TextData
    ) => {
      return {
        transaction: (
          transactionUpdate: (a: any) => any,
          onComplete?: (a: Error | null, b: boolean, c: any) => void
        ): Promise<any> => {
          class Deferred {
            promise: Promise<any>;
            reject;
            resolve;
            constructor() {
              this.promise = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
              });
            }
          }

          const deferred = new Deferred();

          if (this.content[data.id]) {
            transactionUpdate(this.content[data.id]);
            onComplete(null, false, null);
            deferred.resolve(false);
          } else {
            this.content.push(data);
            onComplete(null, true, null);
            deferred.resolve(true);
          }
          return deferred.promise;
        }
      };
    };

    this.getBlockContent = spyOn(serverService, 'getBlockContent').and.callFake(
      () => this.blockContent
    );
    this.blockContent.subscribe(res => this.content.push(res));
    this.updateBlockContent = spyOn(
      serverService,
      'updateBlockContent'
    ).and.callFake(updateBlockContent);
  }
}

class Page {
  textChange: jasmine.Spy;

  editorEl: HTMLElement;
  addText = (editor: HTMLElement, text: string, offset: number = 0) => {
    editor.focus();
    const sel = window.getSelection();
    sel.setPosition(sel.anchorNode, offset);
    const range = sel.getRangeAt(0);
    range.insertNode(document.createTextNode(text));
  };

  constructor() {
    this.textChange = spyOn(comp, 'textChange').and.callThrough();
  }

  addElements() {
    if (!comp.user) return;

    this.editorEl = (fixture.debugElement.query(By.css('.ql-container'))
      .nativeElement as HTMLElement).querySelector('.ql-editor');
  }
}

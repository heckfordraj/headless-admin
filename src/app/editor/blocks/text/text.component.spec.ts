import {
  ComponentFixture,
  TestBed,
  async,
  fakeAsync,
  tick
} from '@angular/core/testing';
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
let quill: QuillStub;

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

    const initialData = {
      user: 'client1',
      id: 0,
      ops: [{ insert: 'abd' }]
    };
    const client1Data = [{ delete: 1 }];
    const client2Data = [{ retain: 2 }, { insert: 'c' }];

    beforeEach(
      fakeAsync(() => {
        serverService.blockContent.emit(initialData);

        comp.user = 'client1';
        comp.textChange(new Delta(client1Data), null, 'user');
        tick(200);
        comp.user = 'client2';
        page.spyReset();
      })
    );

    it('should set initial data on server', () => {
      expect(serverService.content[0]).toEqual(initialData);
    });

    it(
      'should set client 1 data on server',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(serverService.content[1]).toEqual({
          id: 1,
          user: 'client1',
          ops: client1Data
        });
      })
    );

    it(
      'should reject client 2 data',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(2);
      })
    );

    it(
      'should call Quill setContents with own transformed changes',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(quill.updateContents).toHaveBeenCalledWith(
          new Delta([{ delete: 1 }])
        );
      })
    );

    it(
      'should set transformed client 2 data on server',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(serverService.content[2]).toEqual({
          id: 2,
          user: 'client2',
          ops: [{ retain: 1 }, { insert: 'c' }]
        });
      })
    );
  });

  describe('conflict 2', () => {
    // Client 1                                      Server                                        Client 2
    // acd                                           acd                                           acd
    // ac-------[{ retain: 2 }, { delete: 1 }]------>ac  <-x-[{ retain: 1 }, { insert: 'b' }]------abcd
    // ac                                            ac-------[{ retain: 2 }, { delete: 1 }]------>abc [{ retain: 3 }, { delete: 1 }]
    // ac                                            abc<-----[{ retain: 1 }, { insert: 'b' }]-----abc
    // abc<-----[{ retain: 1 }, { insert: 'b' }]-----abc                                           abc

    const initialData = {
      user: 'client1',
      id: 0,
      ops: [{ insert: 'acd' }]
    };
    const client1Data = [{ retain: 2 }, { delete: 1 }];
    const client2Data = [{ retain: 1 }, { insert: 'b' }];

    beforeEach(
      fakeAsync(() => {
        serverService.blockContent.emit(initialData);

        comp.user = 'client1';
        comp.textChange(new Delta(client1Data), null, 'user');
        comp.pendingTransaction = false;
        tick(200);
        comp.user = 'client2';
        page.spyReset();
      })
    );

    it('should set initial data on server', () => {
      expect(serverService.content[0]).toEqual(initialData);
    });

    it(
      'should set client 1 data on server',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(serverService.content[1]).toEqual({
          id: 1,
          user: 'client1',
          ops: client1Data
        });
      })
    );

    it(
      'should reject client 2 data',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(2);
      })
    );

    it(
      'should call Quill setContents with own transformed changes',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(quill.updateContents).toHaveBeenCalledWith(
          new Delta([{ retain: 3 }, { delete: 1 }])
        );
      })
    );

    it(
      'should set transformed client 2 data on server',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(serverService.content[2]).toEqual({
          id: 2,
          user: 'client2',
          ops: [{ retain: 1 }, { insert: 'b' }]
        });
      })
    );
  });

  describe('conflict 3', () => {
    // Client 1                                          Server                                            Client 2
    // a                                                 a                                                 a
    // ab------1: [{ retain: 1 }, { insert: 'b' }]------>ab  <-x- 1: [{ retain: 1 }, { insert: '1' }]------a1
    // ab                                                ab------1: [{ retain: 1 }, { insert: 'b' }]------>ab1 [{ retain: 1 }, { insert: 'b' }]
    // abc-----2: [{ retain: 2 }, { insert: 'c' }]------>abc  <-x- 2: [{ retain: 2 }, { insert: '1' }]-----ab1
    // abc                                               abc-----2: [{ retain: 2 }, { insert: 'c' }]------>abc1 [{ retain: 2 }, { insert: 'c' }]
    // abc                                               abc1<-----3: [{ retain: 3 }, { insert: '1' }]-----abc1
    // abc1<-----3: [{ retain: 3 }, { insert: '1' }]-----abc1                                              abc1

    const initialData = {
      user: 'client1',
      id: 0,
      ops: [{ insert: 'a' }]
    };
    const client1Data1 = [{ retain: 1 }, { insert: 'b' }];
    const client1Data2 = [{ retain: 2 }, { insert: 'c' }];
    const client2Data = [{ retain: 1 }, { insert: '1' }];

    beforeEach(
      fakeAsync(() => {
        serverService.blockContent.emit(initialData);

        comp.user = 'client1';
        comp.textChange(new Delta(client1Data1), null, 'user');
        tick(200);
        comp.text.id = 1;
        comp.textChange(new Delta(client1Data2), null, 'user');
        tick(200);
        comp.user = 'client2';
        comp.text.id = 0;
        page.spyReset();
      })
    );

    it('should set initial data on server', () => {
      expect(serverService.content[0]).toEqual(initialData);
    });

    it(
      'should set client 1 data 1 on server',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(serverService.content[1]).toEqual({
          id: 1,
          user: 'client1',
          ops: client1Data1
        });
      })
    );

    it(
      'should reject client 2 data twice',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(3);
      })
    );

    it(
      'should call Quill setContents with own transformed changes (1)',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(quill.updateContents).toHaveBeenCalledWith(
          new Delta([{ retain: 1 }, { insert: 'b' }])
        );
      })
    );

    it(
      'should set client 1 data 2 on server',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(serverService.content[2]).toEqual({
          id: 2,
          user: 'client1',
          ops: client1Data2
        });
      })
    );

    it(
      'should call Quill setContents with own transformed changes (2)',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(quill.updateContents).toHaveBeenCalledWith(
          new Delta([{ retain: 2 }, { insert: 'c' }])
        );
      })
    );

    it(
      'should set transformed client 2 data on server',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data), null, 'user');
        tick(200);

        expect(serverService.content[3]).toEqual({
          id: 3,
          user: 'client2',
          ops: [{ retain: 3 }, { insert: '1' }]
        });
      })
    );
  });

  describe('conflict 4', () => {
    // Two rejections, merge new changes with pending transactions
    // Client 1                                                            Server                                                              Client 2
    // a                                                                   a                                                                   a
    // ab--------------1: [{ retain: 1 }, { insert: 'b' }]---------------->ab  <------x------1: [{ retain: 1 }, { insert: ')' }]---------------a)
    // ab                                                                  ab----------------1: [{ retain: 1 }, { insert: 'b' }]-------------->ab) [{ retain: 1 }, { insert: 'b' }]
    // abc-------------2: [{ retain: 2 }, { insert: 'c' }]---------------->abc  <-----x----- 2: [{ retain: 2 }, { insert: ')' }]---------------ab)
    // abc                                                                 abc---------------2: [{ retain: 2 }, { insert: 'c' }]-------------->abc) [{ retain: 2 }, { insert: 'c' }]
    // abc                                                                 (abc)<-----3: [{ insert: '(' }, { retain: 3 }, { insert: ')' }]-----(abc)
    // (abc)<-----3: [{ insert: '(' }, { retain: 3 }, { insert: ')' }]-----(abc)                                                               (abc)

    const initialData = {
      user: 'client1',
      id: 0,
      ops: [{ insert: 'a' }]
    };
    const client1Data1 = [{ retain: 1 }, { insert: 'b' }];
    const client1Data2 = [{ retain: 2 }, { insert: 'c' }];
    const client2Data1 = [{ retain: 1 }, { insert: ')' }];
    const client2Data2 = [{ insert: '(' }];

    beforeEach(
      fakeAsync(() => {
        serverService.blockContent.emit(initialData);

        comp.user = 'client1';
        comp.textChange(new Delta(client1Data1), null, 'user');
        comp.text.id = 1;
        tick(200);
        comp.textChange(new Delta(client1Data2), null, 'user');
        tick(200);
        comp.user = 'client2';
        comp.text.id = 0;
        page.spyReset();
      })
    );

    it('should set initial data on server', () => {
      expect(serverService.content[0]).toEqual(initialData);
    });

    it(
      'should set client 1 data 1 on server',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data1), null, 'user');
        tick(100);
        comp.textChange(new Delta(client2Data2), null, 'user');
        tick(100);

        expect(serverService.content[1]).toEqual({
          id: 1,
          user: 'client1',
          ops: client1Data1
        });
      })
    );

    it(
      'should reject client 2 data twice',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data1), null, 'user');
        tick(100);
        comp.textChange(new Delta(client2Data2), null, 'user');
        tick(100);

        expect(page.tryTransaction).toHaveBeenCalledTimes(3);
      })
    );

    it(
      'should call Quill setContents with own transformed changes (1)',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data1), null, 'user');
        tick(100);
        comp.textChange(new Delta(client2Data2), null, 'user');
        tick(100);

        expect(quill.updateContents).toHaveBeenCalledWith(
          new Delta([{ retain: 1 }, { insert: 'b' }])
        );
      })
    );

    it(
      'should set client 1 data 2 on server',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data1), null, 'user');
        tick(100);
        comp.textChange(new Delta(client2Data2), null, 'user');
        tick(100);

        expect(serverService.content[2]).toEqual({
          id: 2,
          user: 'client1',
          ops: client1Data2
        });
      })
    );

    it(
      'should call Quill setContents with own transformed changes (2)',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data1), null, 'user');
        tick(100);
        comp.textChange(new Delta(client2Data2), null, 'user');
        tick(100);

        expect(quill.updateContents).toHaveBeenCalledWith(
          new Delta([{ retain: 2 }, { insert: 'c' }])
        );
      })
    );

    it(
      'should set merged and transformed client 2 data on server',
      fakeAsync(() => {
        comp.textChange(new Delta(client2Data1), null, 'user');
        tick(100);
        comp.textChange(new Delta(client2Data2), null, 'user');
        tick(100);

        expect(serverService.content[3]).toEqual({
          id: 3,
          user: 'client2',
          ops: [{ insert: '(' }, { retain: 3 }, { insert: ')' }]
        });
      })
    );
  });
});

function createComponent() {
  fixture = TestBed.createComponent(TextComponent);
  comp = fixture.componentInstance;
  page = new Page();
  serverService = new ServerServiceMock();

  fixture.detectChanges();
  quill = new QuillStub();
  return fixture.whenStable().then(_ => {
    fixture.detectChanges();
    page.addElements();
  });
}

class QuillStub {
  updateContents: jasmine.Spy;

  constructor() {
    this.updateContents = spyOn(
      comp.editor,
      'updateContents'
    ).and.callThrough();
  }
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
            onComplete(null, false, data.ops);
            deferred.resolve(false);
          } else {
            setTimeout(() => {
              this.content.push(data);
              onComplete(null, true, data);
              deferred.resolve(true);
            }, 200);
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
  tryTransaction: jasmine.Spy;

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
    this.tryTransaction = spyOn(comp, 'tryTransaction').and.callThrough();
  }

  spyReset() {
    this.textChange.calls.reset();
    this.tryTransaction.calls.reset();
  }

  addElements() {
    if (!comp.user) return;

    this.editorEl = (fixture.debugElement.query(By.css('.ql-container'))
      .nativeElement as HTMLElement).querySelector('.ql-editor');
  }
}

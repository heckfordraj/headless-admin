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
let serverService: ServerServiceStub;
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

  xdescribe('initial text', () => {
    beforeEach(() => {
      const initialData: Block.Data.TextData = {
        user: 'client1',
        id: 0,
        delta: new Delta([{ insert: 'abc' }])
      };
      serverService.blockContent.emit(initialData);
    });

    it('should set initial editor text', () => {
      expect(page.editorEl.innerText.trim()).toBe('abc');
    });

    it('should add to initial text without overwriting', () => {
      page.addText(page.editorEl, '123');

      expect(page.editorEl.innerText.trim()).toBe('123abc');
    });
  });

  xdescribe('insert text', () => {
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

    const initialData: Block.Data.TextData = {
      user: 'client1',
      id: 0,
      delta: new Delta([{ insert: 'abd' }])
    };
    const client1Data: Block.Data.TextData = {
      user: 'client1',
      id: 1,
      delta: new Delta([{ delete: 1 }])
    };
    const client2Delta = new Delta([{ retain: 2 }, { insert: 'c' }]);

    beforeEach(
      fakeAsync(() => {
        serverService.updateBlockContent(null, initialData).transaction(null);
        tick(200);
      })
    );

    it('should call Quill updateContents with initial data delta', () => {
      expect(quill.updateContents).toHaveBeenCalledWith(initialData.delta);
    });

    it('should set state pending', () => {
      serverService.updateBlockContent(null, client1Data).transaction(null);
      comp.textChange(client2Delta, null, 'user');

      expect(comp.state.pending).toEqual({
        id: 1,
        user: 'client2',
        delta: client2Delta
      });
    });

    it(
      'should call tryTransaction (1)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data).transaction(null);
        comp.textChange(client2Delta, null, 'user');

        expect(page.tryTransaction).toHaveBeenCalledTimes(1);
        tick(400);
      })
    );

    it(
      'should abort client 2 transaction',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(page.transactionCallback).toHaveBeenCalledTimes(1);
        expect(page.transactionCallback).toHaveBeenCalledWith(
          null,
          false,
          jasmine.anything()
        );
        tick(200);
      })
    );

    it(
      'should call Quill updateContents with transformed client 1 data ops',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(quill.updateContents).toHaveBeenCalledWith(
          new Delta([{ delete: 1 }])
        );
        tick(200);
      })
    );

    it(
      'should set state pending as transformed client 2 data',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(comp.state.pending).toEqual({
          id: 2,
          user: 'client2',
          delta: new Delta([{ retain: 1 }, { insert: 'c' }])
        });
        tick(200);
      })
    );

    it(
      'should call tryTransaction (2)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(2);
        tick(200);
      })
    );

    it(
      'should not have any pending or buffer ops',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(400);

        expect(comp.state.pending.delta).toBeNull();
        expect(comp.state.buffer).toBeUndefined();
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

    const initialData: Block.Data.TextData = {
      user: 'client1',
      id: 0,
      delta: new Delta([{ insert: 'acd' }])
    };
    const client1Data: Block.Data.TextData = {
      user: 'client1',
      id: 1,
      delta: new Delta([{ retain: 2 }, { delete: 1 }])
    };
    const client2Delta = new Delta([{ retain: 1 }, { insert: 'b' }]);

    beforeEach(
      fakeAsync(() => {
        serverService.updateBlockContent(null, initialData).transaction(null);
        tick(200);
      })
    );

    it('should call Quill updateContents with initial data delta', () => {
      expect(quill.updateContents).toHaveBeenCalledWith(initialData.delta);
    });

    it('should set state pending', () => {
      serverService.updateBlockContent(null, client1Data).transaction(null);
      comp.textChange(client2Delta, null, 'user');

      expect(comp.state.pending).toEqual({
        id: 1,
        user: 'client2',
        delta: client2Delta
      });
    });

    it(
      'should call tryTransaction (1)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data).transaction(null);
        comp.textChange(client2Delta, null, 'user');

        expect(page.tryTransaction).toHaveBeenCalledTimes(1);
        tick(400);
      })
    );

    it(
      'should abort client 2 transaction',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(page.transactionCallback).toHaveBeenCalledTimes(1);
        expect(page.transactionCallback).toHaveBeenCalledWith(
          null,
          false,
          jasmine.anything()
        );
        tick(200);
      })
    );

    it(
      'should call Quill updateContents with transformed client 1 data ops',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(quill.updateContents).toHaveBeenCalledWith(
          new Delta([{ retain: 3 }, { delete: 1 }])
        );
        tick(200);
      })
    );

    it(
      'should set state pending as transformed client 2 data',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(comp.state.pending).toEqual({
          id: 2,
          user: 'client2',
          delta: new Delta([{ retain: 1 }, { insert: 'b' }])
        });
        tick(200);
      })
    );

    it(
      'should call tryTransaction (2)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(2);
        tick(200);
      })
    );

    it(
      'should not have any pending or buffer ops',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(400);

        expect(comp.state.pending.delta).toBeNull();
        expect(comp.state.buffer).toBeUndefined();
      })
    );
  });

  describe('conflict 3', () => {
    // Two rejections, merge new changes with outstanding
    // Client 1                                          Server                                            Client 2
    // a                                                 a                                                 a
    // ab------1: [{ retain: 1 }, { insert: 'b' }]------>ab  <-x- 1: [{ retain: 1 }, { insert: '1' }]------a1
    // ab                                                ab------1: [{ retain: 1 }, { insert: 'b' }]------>ab1 [{ retain: 1 }, { insert: 'b' }]
    // abc-----2: [{ retain: 2 }, { insert: 'c' }]------>abc  <-x- 2: [{ retain: 2 }, { insert: '1' }]-----ab1
    // abc                                               abc-----2: [{ retain: 2 }, { insert: 'c' }]------>abc1 [{ retain: 2 }, { insert: 'c' }]
    // abc                                               abc1<-----3: [{ retain: 3 }, { insert: '1' }]-----abc1
    // abc1<-----3: [{ retain: 3 }, { insert: '1' }]-----abc1                                              abc1

    const initialData: Block.Data.TextData = {
      user: 'client1',
      id: 0,
      delta: new Delta([{ insert: 'a' }])
    };
    const client1Data1: Block.Data.TextData = {
      user: 'client1',
      id: 1,
      delta: new Delta([{ retain: 1 }, { insert: 'b' }])
    };
    const client1Data2: Block.Data.TextData = {
      user: 'client1',
      id: 2,
      delta: new Delta([{ retain: 2 }, { insert: 'c' }])
    };
    const client2Delta = new Delta([{ retain: 1 }, { insert: '1' }]);

    beforeEach(
      fakeAsync(() => {
        serverService.updateBlockContent(null, initialData).transaction(null);
        tick(200);
      })
    );

    it('should call Quill updateContents with initial data delta', () => {
      expect(quill.updateContents).toHaveBeenCalledWith(initialData.delta);
    });

    it('should set state pending', () => {
      serverService.updateBlockContent(null, client1Data1).transaction(null);
      comp.textChange(client2Delta, null, 'user');

      expect(comp.state.pending).toEqual({
        id: 1,
        user: 'client2',
        delta: client2Delta
      });
    });

    it(
      'should call tryTransaction (1)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta, null, 'user');

        expect(page.tryTransaction).toHaveBeenCalledTimes(1);
        tick(400);
      })
    );

    it(
      'should abort client 2 transaction (1)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(page.transactionCallback).toHaveBeenCalledTimes(1);
        expect(page.transactionCallback).toHaveBeenCalledWith(
          null,
          false,
          jasmine.anything()
        );
        tick(200);
      })
    );

    it(
      'should call Quill updateContents with transformed client 1 data 1 ops',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(quill.updateContents).toHaveBeenCalledWith(
          new Delta([{ retain: 1 }, { insert: 'b' }])
        );
        tick(200);
      })
    );

    it(
      'should set state pending as transformed client 2 data (1)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(comp.state.pending).toEqual({
          id: 2,
          user: 'client2',
          delta: new Delta([{ retain: 2 }, { insert: '1' }])
        });
        tick(200);
      })
    );

    it(
      'should call tryTransaction (2)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(2);
        tick(200);
      })
    );

    it(
      'should abort client 2 transaction (2)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        serverService.updateBlockContent(null, client1Data2).transaction(null);
        tick(200);

        expect(page.transactionCallback).toHaveBeenCalledTimes(2);
        expect(page.transactionCallback.calls.allArgs()).toEqual([
          [null, false, jasmine.anything()],
          [null, false, jasmine.anything()]
        ]);
        tick(200);
      })
    );

    it(
      'should call Quill updateContents with transformed client 1 data 2 ops',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        serverService.updateBlockContent(null, client1Data2).transaction(null);
        tick(200);

        expect(quill.updateContents).toHaveBeenCalledWith(
          new Delta([{ retain: 2 }, { insert: 'c' }])
        );
        tick(200);
      })
    );

    it(
      'should set deltas outstanding as transformed client 2 data (2)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        serverService.updateBlockContent(null, client1Data2).transaction(null);
        tick(200);

        expect(comp.state.pending).toEqual({
          id: 3,
          user: 'client2',
          delta: new Delta([{ retain: 3 }, { insert: '1' }])
        });
        tick(200);
      })
    );

    it(
      'should call tryTransaction (3)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        serverService.updateBlockContent(null, client1Data2).transaction(null);
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(3);
        tick(200);
      })
    );

    it(
      'should not have any pending or buffer ops',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta, null, 'user');
        serverService.updateBlockContent(null, client1Data2).transaction(null);
        tick(400);

        expect(comp.state.pending.delta).toBeNull();
        expect(comp.state.buffer).toBeUndefined();
      })
    );
  });

  describe('conflict 4', () => {
    // Two rejections, merge new changes with outstanding and buffer
    // Client 1                                                            Server                                                              Client 2
    // a                                                                   a                                                                   a
    // ab--------------1: [{ retain: 1 }, { insert: 'b' }]---------------->ab  <------x------1: [{ retain: 1 }, { insert: ')' }]---------------a)
    // ab                                                                  ab----------------1: [{ retain: 1 }, { insert: 'b' }]-------------->ab) [{ retain: 1 }, { insert: 'b' }]
    // abc-------------2: [{ retain: 2 }, { insert: 'c' }]---------------->abc  <-----x----- 2: [{ retain: 2 }, { insert: ')' }]---------------ab)
    // abc                                                                 abc---------------2: [{ retain: 2 }, { insert: 'c' }]-------------->(abc) [{ retain: 3 }, { insert: 'c' }]
    // abc                                                                 (abc)<-----3: [{ insert: '(' }, { retain: 3 }, { insert: ')' }]-----(abc)
    // (abc)<-----3: [{ insert: '(' }, { retain: 3 }, { insert: ')' }]-----(abc)                                                               (abc)

    const initialData: Block.Data.TextData = {
      user: 'client1',
      id: 0,
      delta: new Delta([{ insert: 'a' }])
    };
    const client1Data1: Block.Data.TextData = {
      user: 'client1',
      id: 1,
      delta: new Delta([{ retain: 1 }, { insert: 'b' }])
    };
    const client1Data2: Block.Data.TextData = {
      user: 'client1',
      id: 2,
      delta: new Delta([{ retain: 2 }, { insert: 'c' }])
    };
    const client2Delta1 = new Delta([{ retain: 1 }, { insert: ')' }]);
    const client2Delta2 = new Delta([{ insert: '(' }]);

    beforeEach(
      fakeAsync(() => {
        serverService.updateBlockContent(null, initialData).transaction(null);
        tick(200);
      })
    );

    it('should call Quill updateContents with initial data delta', () => {
      expect(quill.updateContents).toHaveBeenCalledWith(initialData.delta);
    });

    it('should set state pending', () => {
      serverService.updateBlockContent(null, client1Data1).transaction(null);
      comp.textChange(client2Delta1, null, 'user');

      expect(comp.state.pending).toEqual({
        id: 1,
        user: 'client2',
        delta: client2Delta1
      });
    });

    it(
      'should call tryTransaction (1)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta1, null, 'user');

        expect(page.tryTransaction).toHaveBeenCalledTimes(1);
        tick(400);
      })
    );

    it(
      'should abort client 2 data 1 transaction (1)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta1, null, 'user');
        tick(200);

        expect(page.transactionCallback).toHaveBeenCalledTimes(1);
        expect(page.transactionCallback).toHaveBeenCalledWith(
          null,
          false,
          jasmine.anything()
        );
        tick(200);
      })
    );

    it(
      'should call Quill updateContents with transformed client 1 data 1 ops',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta1, null, 'user');
        tick(200);

        expect(quill.updateContents).toHaveBeenCalledWith(
          new Delta([{ retain: 1 }, { insert: 'b' }])
        );
        tick(200);
      })
    );

    it(
      'should set state pending as transformed client 2 data 1',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta1, null, 'user');
        tick(200);

        expect(comp.state.pending).toEqual({
          id: 2,
          user: 'client2',
          delta: new Delta([{ retain: 2 }, { insert: ')' }])
        });
        tick(200);
      })
    );

    it(
      'should call tryTransaction (2)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta1, null, 'user');
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(2);
        tick(200);
      })
    );

    it(
      'should abort client 2 data 1 transaction (2)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        comp.textChange(client2Delta1, null, 'user');
        serverService.updateBlockContent(null, client1Data2).transaction(null);
        tick(200);

        expect(page.transactionCallback).toHaveBeenCalledTimes(2);
        expect(page.transactionCallback.calls.allArgs()).toEqual([
          [null, false, jasmine.anything()],
          [null, false, jasmine.anything()]
        ]);
        tick(200);
      })
    );

    it(
      'should set state buffer',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        tick(1);
        comp.textChange(client2Delta1, null, 'user');
        tick(1);
        serverService.updateBlockContent(null, client1Data2).transaction(null);
        tick(199);
        comp.textChange(client2Delta2, null, 'user');

        expect(comp.state.buffer).toEqual(client2Delta2);
        tick(400);
      })
    );

    it(
      'should merge pending and buffer',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        tick(1);
        comp.textChange(client2Delta1, null, 'user');
        tick(1);
        serverService.updateBlockContent(null, client1Data2).transaction(null);
        tick(199);
        comp.textChange(client2Delta2, null, 'user');
        tick(1);

        expect(comp.state.buffer).toBeUndefined();
        tick(200);
      })
    );

    it(
      'should call Quill updateContents with transformed client 1 data 2 ops',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        tick(1);
        comp.textChange(client2Delta1, null, 'user');
        tick(1);
        serverService.updateBlockContent(null, client1Data2).transaction(null);
        tick(199);
        comp.textChange(client2Delta2, null, 'user');
        tick(1);

        expect(quill.updateContents).toHaveBeenCalledWith(
          new Delta([{ retain: 3 }, { insert: 'c' }])
        );
        tick(200);
      })
    );

    it(
      'should set state pending as transformed client 2 data 1 and data 2',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        tick(1);
        comp.textChange(client2Delta1, null, 'user');
        tick(1);
        serverService.updateBlockContent(null, client1Data2).transaction(null);
        tick(199);
        comp.textChange(client2Delta2, null, 'user');
        tick(1);

        expect(comp.state.pending).toEqual({
          id: 3,
          user: 'client2',
          delta: new Delta([{ insert: '(' }, { retain: 3 }, { insert: ')' }])
        });
        tick(200);
      })
    );

    it(
      'should call tryTransaction (3)',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        tick(1);
        comp.textChange(client2Delta1, null, 'user');
        tick(1);
        serverService.updateBlockContent(null, client1Data2).transaction(null);
        tick(199);
        comp.textChange(client2Delta2, null, 'user');
        tick(1);

        expect(page.tryTransaction).toHaveBeenCalledTimes(3);
        tick(200);
      })
    );

    it(
      'should not have any pending or buffer ops',
      fakeAsync(() => {
        serverService.updateBlockContent(null, client1Data1).transaction(null);
        tick(1);
        comp.textChange(client2Delta1, null, 'user');
        tick(1);
        serverService.updateBlockContent(null, client1Data2).transaction(null);
        tick(199);
        comp.textChange(client2Delta2, null, 'user');
        tick(201);

        expect(comp.state.pending.delta).toBeNull();
        expect(comp.state.buffer).toBeUndefined();
      })
    );
  });
});

function createComponent() {
  fixture = TestBed.createComponent(TextComponent);
  comp = fixture.componentInstance;
  page = new Page();

  fixture.detectChanges();
  quill = new QuillStub();
  return fixture.whenStable().then(_ => {
    fixture.detectChanges();
    comp.state.pending.user = 'client2';
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

class Page {
  textChange: jasmine.Spy;
  tryTransaction: jasmine.Spy;
  transactionCallback: jasmine.Spy;

  editorEl: HTMLElement;
  addText = (editor: HTMLElement, text: string, offset: number = 0) => {
    editor.focus();
    const sel = window.getSelection();
    sel.setPosition(sel.anchorNode, offset);
    const range = sel.getRangeAt(0);
    range.insertNode(document.createTextNode(text));
  };

  constructor() {
    serverService = <any>fixture.debugElement.injector.get(ServerService);

    this.textChange = spyOn(comp, 'textChange').and.callThrough();
    this.tryTransaction = spyOn(comp, 'tryTransaction').and.callThrough();
    this.transactionCallback = spyOn(
      comp,
      'transactionCallback'
    ).and.callThrough();
  }

  addElements() {
    this.editorEl = (fixture.debugElement.query(By.css('.ql-container'))
      .nativeElement as HTMLElement).querySelector('.ql-editor');
  }
}

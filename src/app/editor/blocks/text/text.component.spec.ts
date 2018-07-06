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

describe('TextComponent', () => {
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

  describe('initial text', () => {
    beforeEach(
      fakeAsync(() => {
        const initialData: Block.Data.TextData = {
          user: 'client1',
          id: 0,
          delta: new Delta([{ insert: 'abc' }])
        };
        serverService.updateTextBlockContent(null, initialData, true);
        tick(200);
      })
    );

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

    it(
      'should call textChange with delta param',
      async(() => {
        page.addText(page.editorEl, '1');

        return setTimeout(() => {
          expect(page.textChange).toHaveBeenCalledWith(
            new Delta([{ insert: '1' }]),
            jasmine.anything(),
            'user'
          );
        });
      })
    );
  });

  describe('remove text', () => {
    beforeEach(
      fakeAsync(() => {
        const initialData: Block.Data.TextData = {
          user: 'client1',
          id: 0,
          delta: new Delta([{ insert: 'abc' }])
        };
        serverService.updateTextBlockContent(null, initialData, true);
        tick(200);
      })
    );

    it(
      'should remove text from the editor',
      async(() => {
        page.removeText(page.editorEl, 1);

        return setTimeout(() => {
          expect(page.editorEl.innerText.trim()).toBe('ac');
        });
      })
    );

    it(
      'should call textChange',
      async(() => {
        page.removeText(page.editorEl, 1);

        return setTimeout(() => {
          expect(page.textChange).toHaveBeenCalled();
        });
      })
    );

    it(
      'should call textChange with delta param',
      async(() => {
        page.removeText(page.editorEl, 1);

        return setTimeout(() => {
          expect(page.textChange).toHaveBeenCalledWith(
            new Delta([{ retain: 1 }, { delete: 1 }]),
            jasmine.anything(),
            'user'
          );
        });
      })
    );
  });

  describe('replace text', () => {
    beforeEach(
      fakeAsync(() => {
        const initialData: Block.Data.TextData = {
          user: 'client1',
          id: 0,
          delta: new Delta([{ insert: 'abcd' }])
        };
        serverService.updateTextBlockContent(null, initialData, true);
        tick(200);
      })
    );

    it(
      'should replace text in the editor',
      async(() => {
        page.replaceText(page.editorEl, '123', 3);

        return setTimeout(() => {
          expect(page.editorEl.innerText.trim()).toBe('abc123');
        });
      })
    );

    it(
      'should call textChange',
      async(() => {
        page.replaceText(page.editorEl, '123', 3);

        return setTimeout(() => {
          expect(page.textChange).toHaveBeenCalled();
        });
      })
    );

    it(
      'should call textChange with delta param',
      async(() => {
        page.replaceText(page.editorEl, '123', 3);

        return setTimeout(() => {
          expect(page.textChange).toHaveBeenCalledWith(
            new Delta([{ retain: 3 }, { insert: '123' }, { delete: 1 }]),
            jasmine.anything(),
            'user'
          );
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
        serverService.updateTextBlockContent(null, initialData, true);
        tick(200);
      })
    );

    it('should call Quill updateContents with initial data delta', () => {
      expect(quill.updateContents).toHaveBeenCalledWith(initialData.delta);
    });

    it('should set state pending', () => {
      serverService.updateTextBlockContent(null, client1Data, true);
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
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta, null, 'user');

        expect(page.tryTransaction).toHaveBeenCalledTimes(1);
        tick(400);
      })
    );

    it(
      'should abort client 2 transaction',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta, null, 'user');
        const state = new StateStub();
        tick(200);

        expect(state.pendingRejected).toHaveBeenCalledTimes(1);
        expect(state.pendingRejected).toHaveBeenCalledWith(client1Data);
        tick(200);
      })
    );

    it(
      'should call Quill updateContents with transformed client 1 data ops',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
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
        serverService.updateTextBlockContent(null, client1Data, true);
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
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(2);
        tick(200);
      })
    );

    it(
      'should not have any pending or buffer ops',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
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
        serverService.updateTextBlockContent(null, initialData, true);
        tick(200);
      })
    );

    it('should call Quill updateContents with initial data delta', () => {
      expect(quill.updateContents).toHaveBeenCalledWith(initialData.delta);
    });

    it('should set state pending', () => {
      serverService.updateTextBlockContent(null, client1Data, true);
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
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta, null, 'user');

        expect(page.tryTransaction).toHaveBeenCalledTimes(1);
        tick(400);
      })
    );

    it(
      'should abort client 2 transaction',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta, null, 'user');
        const state = new StateStub();
        tick(200);

        expect(state.pendingRejected).toHaveBeenCalledTimes(1);
        expect(state.pendingRejected).toHaveBeenCalledWith(client1Data);
        tick(200);
      })
    );

    it(
      'should call Quill updateContents with transformed client 1 data ops',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
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
        serverService.updateTextBlockContent(null, client1Data, true);
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
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(2);
        tick(200);
      })
    );

    it(
      'should not have any pending or buffer ops',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta, null, 'user');
        tick(400);

        expect(comp.state.pending.delta).toBeNull();
        expect(comp.state.buffer).toBeUndefined();
      })
    );
  });

  describe('conflict 3', () => {
    // Two rejections, merge new changes with outstanding
    //
    // Client 1                          Server                        Client 2
    // a                                   a                                  a
    //
    // ab------1: [{ retain: 1 }, ------->ab  <-x- 1: [{ retain: 1 }, -------a1
    //            { insert: 'b' }]                    { insert: '1' }]
    //
    // ab                                 ab------1: [{ retain: 1 }, ------>ab1 [{ retain: 1 },
    //                                               { insert: 'b' }]           { insert: 'b' }]
    //
    // abc-----2: [{ retain: 2 }, ------>abc  <-x- 2: [{ retain: 2 }, ------ab1
    //            { insert: 'c' }]                    { insert: '1' }]
    //
    // abc                               abc-----2: [{ retain: 2 }, ------>abc1 [{ retain: 2 },
    //                                              { insert: 'c' }]            { insert: 'c' }]
    //
    // abc                               abc1<-----3: [{ retain: 3 }, -----abc1
    //                                                { insert: '1' }]
    //
    // abc1<-----3: [{ retain: 3 }, -----abc1                              abc1
    //              { insert: '1' }]

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
        serverService.updateTextBlockContent(null, initialData, true);
        tick(200);
      })
    );

    it('should call Quill updateContents with initial data delta', () => {
      expect(quill.updateContents).toHaveBeenCalledWith(initialData.delta);
    });

    it('should set state pending', () => {
      serverService.updateTextBlockContent(null, client1Data1, true);
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
        serverService.updateTextBlockContent(null, client1Data1, true);
        comp.textChange(client2Delta, null, 'user');

        expect(page.tryTransaction).toHaveBeenCalledTimes(1);
        tick(400);
      })
    );

    it(
      'should abort client 2 transaction (1)',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data1, true);
        comp.textChange(client2Delta, null, 'user');
        const state = new StateStub();
        tick(200);

        expect(state.pendingRejected).toHaveBeenCalledTimes(1);
        expect(state.pendingRejected).toHaveBeenCalledWith(client1Data1);
        tick(200);
      })
    );

    it(
      'should call Quill updateContents with transformed client 1 data 1 ops',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data1, true);
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
        serverService.updateTextBlockContent(null, client1Data1, true);
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
        serverService.updateTextBlockContent(null, client1Data1, true);
        comp.textChange(client2Delta, null, 'user');
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(2);
        tick(200);
      })
    );

    it(
      'should abort client 2 transaction (2)',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data1, true);
        comp.textChange(client2Delta, null, 'user');
        serverService.updateTextBlockContent(null, client1Data2, true);
        const state = new StateStub();
        tick(200);

        expect(state.pendingRejected).toHaveBeenCalledTimes(2);
        expect(state.pendingRejected).toHaveBeenCalledWith(client1Data1);
        tick(200);
      })
    );

    it(
      'should call Quill updateContents with transformed client 1 data 2 ops',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data1, true);
        comp.textChange(client2Delta, null, 'user');
        serverService.updateTextBlockContent(null, client1Data2, true);
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
        serverService.updateTextBlockContent(null, client1Data1, true);
        comp.textChange(client2Delta, null, 'user');
        serverService.updateTextBlockContent(null, client1Data2, true);
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
        serverService.updateTextBlockContent(null, client1Data1, true);
        comp.textChange(client2Delta, null, 'user');
        serverService.updateTextBlockContent(null, client1Data2, true);
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(3);
        tick(200);
      })
    );

    it(
      'should not have any pending or buffer ops',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data1, true);
        comp.textChange(client2Delta, null, 'user');
        serverService.updateTextBlockContent(null, client1Data2, true);
        tick(400);

        expect(comp.state.pending.delta).toBeNull();
        expect(comp.state.buffer).toBeUndefined();
      })
    );
  });

  describe('conflict 4', () => {
    // Two rejections, merge new changes with outstanding and buffer
    //
    // Client 1                             Server                              Client 2
    // a                                      a                                        a
    //
    // ab-----1: [{ retain: 1 }, ----------->ab  <---x---1: [{ retain: 1 }, ----------a)
    //           { insert: 'b' }]                            { insert: ')' }]
    //
    // ab                                    ab----------1: [{ retain: 1 }, -------->ab) [{ retain: 1 },
    //                                                      { insert: 'b' }]              { insert: 'b' }]
    //
    // abc-----2: [{ retain: 2 }, ---------->abc  <--x-- 2: [{ retain: 2 }, ---------ab)
    //            { insert: 'c' }]                          { insert: ')' }]
    //
    // abc                                   abc---------2: [{ retain: 2 }, ------>(abc) [{ retain: 3 },
    //                                                      { insert: 'c' }]              { insert: 'c' }]
    //
    // abc                                  (abc)<-------3: [{ insert: '(' }, -----(abc)
    //                                                      { retain: 3 },
    //                                                      { insert: ')' }]
    //
    // (abc)<-----3: [{ insert: '(' }, -----(abc)                                  (abc)
    //               { retain: 3 },
    //               { insert: ')' }]

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
        serverService.updateTextBlockContent(null, initialData, true);
        tick(200);
      })
    );

    it('should call Quill updateContents with initial data delta', () => {
      expect(quill.updateContents).toHaveBeenCalledWith(initialData.delta);
    });

    it('should set state pending', () => {
      serverService.updateTextBlockContent(null, client1Data1, true);
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
        serverService.updateTextBlockContent(null, client1Data1, true);
        comp.textChange(client2Delta1, null, 'user');

        expect(page.tryTransaction).toHaveBeenCalledTimes(1);
        tick(400);
      })
    );

    it(
      'should abort client 2 data 1 transaction (1)',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data1, true);
        comp.textChange(client2Delta1, null, 'user');
        const state = new StateStub();
        tick(200);

        expect(state.pendingRejected).toHaveBeenCalledTimes(1);
        expect(state.pendingRejected).toHaveBeenCalledWith(client1Data1);
        tick(200);
      })
    );

    it(
      'should call Quill updateContents with transformed client 1 data 1 ops',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data1, true);
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
        serverService.updateTextBlockContent(null, client1Data1, true);
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
        serverService.updateTextBlockContent(null, client1Data1, true);
        comp.textChange(client2Delta1, null, 'user');
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(2);
        tick(200);
      })
    );

    it(
      'should abort client 2 data 1 transaction (2)',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data1, true);
        comp.textChange(client2Delta1, null, 'user');
        serverService.updateTextBlockContent(null, client1Data2, true);
        const state = new StateStub();
        tick(200);

        expect(state.pendingRejected).toHaveBeenCalledTimes(2);
        expect(state.pendingRejected).toHaveBeenCalledWith(client1Data2);
        tick(200);
      })
    );

    it(
      'should set state buffer',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data1, true);
        tick(1);
        comp.textChange(client2Delta1, null, 'user');
        tick(1);
        serverService.updateTextBlockContent(null, client1Data2, true);
        tick(199);
        comp.textChange(client2Delta2, null, 'user');

        expect(comp.state.buffer).toEqual(client2Delta2);
        tick(400);
      })
    );

    it(
      'should merge pending and buffer',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data1, true);
        tick(1);
        comp.textChange(client2Delta1, null, 'user');
        tick(1);
        serverService.updateTextBlockContent(null, client1Data2, true);
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
        serverService.updateTextBlockContent(null, client1Data1, true);
        tick(1);
        comp.textChange(client2Delta1, null, 'user');
        tick(1);
        serverService.updateTextBlockContent(null, client1Data2, true);
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
        serverService.updateTextBlockContent(null, client1Data1, true);
        tick(1);
        comp.textChange(client2Delta1, null, 'user');
        tick(1);
        serverService.updateTextBlockContent(null, client1Data2, true);
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
        serverService.updateTextBlockContent(null, client1Data1, true);
        tick(1);
        comp.textChange(client2Delta1, null, 'user');
        tick(1);
        serverService.updateTextBlockContent(null, client1Data2, true);
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
        serverService.updateTextBlockContent(null, client1Data1, true);
        tick(1);
        comp.textChange(client2Delta1, null, 'user');
        tick(1);
        serverService.updateTextBlockContent(null, client1Data2, true);
        tick(199);
        comp.textChange(client2Delta2, null, 'user');
        tick(201);

        expect(comp.state.pending.delta).toBeNull();
        expect(comp.state.buffer).toBeUndefined();
      })
    );
  });

  describe('conflict 5', () => {
    // Single rejection followed by multiple successes
    //
    // Client 1                        Server                              Client 2
    // hllo                             hllo                               hllo
    //
    // hello-----[{ retain: 1 }, ------>hello  <--x--[{ retain: 4 }, ------hllo
    //           { insert: 'e' }]                    { insert: ' ' }]
    //
    // hello                            hello--------[{ retain: 1 }, ----->hello  [{ retain: 1 },
    //                                               { insert: 'e' }]             { insert: 'e' }]
    //
    // hello                            hello  <-----[{ retain: 5 }, -----hello
    //                                                { insert: ' ' }]
    //
    // hello                            hello  <-----[{ retain: 6 }, -----hello world
    //                                             { insert: 'world' }]
    // abc<-----[{ retain: 6 }, -----hello world                          hello world
    //        { insert: 'world' }]

    const initialData: Block.Data.TextData = {
      user: 'client1',
      id: 0,
      delta: new Delta([{ insert: 'hllo' }])
    };
    const client1Data: Block.Data.TextData = {
      user: 'client1',
      id: 1,
      delta: new Delta([{ retain: 1 }, { insert: 'e' }])
    };
    const client2Delta1 = new Delta([{ retain: 4 }, { insert: ' ' }]);
    const client2Delta2 = new Delta([{ retain: 6 }, { insert: 'world' }]);

    beforeEach(
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, initialData, true);
        tick(200);
      })
    );

    it('should call Quill updateContents with initial data delta', () => {
      expect(quill.updateContents).toHaveBeenCalledWith(initialData.delta);
    });

    it('should set state pending', () => {
      serverService.updateTextBlockContent(null, client1Data, true);
      comp.textChange(client2Delta1, null, 'user');

      expect(comp.state.pending).toEqual({
        id: 1,
        user: 'client2',
        delta: client2Delta1
      });
    });

    it('should call tryTransaction (1)', () => {
      serverService.updateTextBlockContent(null, client1Data, true);
      comp.textChange(client2Delta1, null, 'user');

      expect(page.tryTransaction).toHaveBeenCalledTimes(1);
    });

    it(
      'should abort client 2 data 1 transaction',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta1, null, 'user');
        const state = new StateStub();
        tick(200);

        expect(state.pendingRejected).toHaveBeenCalledTimes(1);
        expect(state.pendingRejected).toHaveBeenCalledWith(client1Data);
        tick(200);
      })
    );

    it(
      'should call Quill updateContents with transformed client 1 data 1 ops',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta1, null, 'user');
        tick(200);

        expect(quill.updateContents).toHaveBeenCalledWith(
          new Delta([{ retain: 1 }, { insert: 'e' }])
        );
        tick(200);
      })
    );

    it(
      'should set state pending as transformed client 2 data 1',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta1, null, 'user');
        tick(200);

        expect(comp.state.pending).toEqual({
          id: 2,
          user: 'client2',
          delta: new Delta([{ retain: 5 }, { insert: ' ' }])
        });
        tick(200);
      })
    );

    it(
      'should call tryTransaction (2)',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta1, null, 'user');
        tick(200);

        expect(page.tryTransaction).toHaveBeenCalledTimes(2);
        tick(200);
      })
    );

    it(
      'should not have any pending or buffer ops',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta1, null, 'user');
        tick(400);

        expect(comp.state.pending.delta).toBeNull();
        expect(comp.state.buffer).toBeUndefined();
      })
    );

    it(
      'should set state pending',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta1, null, 'user');
        tick(400);
        comp.textChange(client2Delta2, null, 'user');

        expect(comp.state.pending).toEqual({
          id: 3,
          user: 'client2',
          delta: client2Delta2
        });
        tick(200);
      })
    );

    it(
      'should call tryTransaction (3)',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta1, null, 'user');
        tick(400);
        comp.textChange(client2Delta2, null, 'user');

        expect(page.tryTransaction).toHaveBeenCalledTimes(3);
        tick(200);
      })
    );

    it(
      'should not have any pending or buffer ops',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, client1Data, true);
        comp.textChange(client2Delta1, null, 'user');
        tick(400);
        comp.textChange(client2Delta2, null, 'user');
        tick(200);

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
    comp.users = [];
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

class StateStub {
  pendingRejected: jasmine.Spy;

  constructor() {
    this.pendingRejected = spyOn(
      comp.state,
      'pendingRejected'
    ).and.callThrough();
  }
}

class Page {
  textChange: jasmine.Spy;
  tryTransaction: jasmine.Spy;
  transactionCallback: jasmine.Spy;

  editorEl: HTMLElement;

  private getRange(editor: HTMLElement, offset: number) {
    editor.focus();
    const sel = window.getSelection();
    sel.setPosition(sel.anchorNode, offset);
    return sel.getRangeAt(0);
  }

  addText(editor: HTMLElement, text: string, offset: number = 0) {
    const range = this.getRange(editor, offset);
    range.insertNode(document.createTextNode(text));
  }

  removeText(editor: HTMLElement, offset: number = 0) {
    const range = this.getRange(editor, offset);
    const sel = window.getSelection();
    range.setEnd(sel.anchorNode, offset + 1);
    range.deleteContents();
  }

  replaceText(editor: HTMLElement, text: string, offset: number = 0) {
    const range = this.getRange(editor, offset);
    const sel = window.getSelection();
    range.setEnd(sel.anchorNode, offset + 1);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
  }

  constructor() {
    serverService = <any>fixture.debugElement.injector.get(ServerService);

    this.textChange = spyOn(comp, 'textChange').and.callThrough();
    this.tryTransaction = spyOn(comp, 'tryTransaction').and.callThrough();

    const block: Block.Base = {
      id: '1',
      type: 'text',
      order: 1
    };
    comp.block = block;
  }

  addElements() {
    this.editorEl = (fixture.debugElement.query(By.css('.ql-container'))
      .nativeElement as HTMLElement).querySelector('.ql-editor');
  }
}

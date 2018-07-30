import {
  ComponentFixture,
  TestBed,
  async,
  fakeAsync,
  tick
} from '@angular/core/testing';
import {
  LoggerService,
  MockLoggerService,
  ServerService,
  MockServerService,
  Data
} from 'testing';

import * as Quill from 'quill';
const Delta: Quill.DeltaStatic = Quill.import('delta');

import { Block } from 'shared';
import { State, PendingState } from './state';
import { TextComponent } from './text.component';

let comp: TextComponent;
let fixture: ComponentFixture<TextComponent>;
let page: Page;
let windowStub: WindowStub;
let serverService: MockServerService;
let quill: QuillStub;
let state: StateStub;

describe('TextComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TextComponent],
      providers: [
        { provide: LoggerService, useClass: MockLoggerService },
        { provide: ServerService, useClass: MockServerService }
      ]
    }).compileComponents();
  }));

  beforeEach(async(() => createComponent()));

  it('should create component', () => {
    expect(comp).toBeTruthy();
  });

  describe('OnInit', () => {
    it('should call ServerService getUser', () => {
      expect(serverService.getUser).toHaveBeenCalled();
    });

    it('should call State setUser', () => {
      expect(state.setUser).toHaveBeenCalled();
    });

    it('should call State setUser with id arg', () => {
      expect(state.setUser).toHaveBeenCalledWith('abc');
    });

    it('should set editor as Quill', () => {
      expect(comp.editor.constructor).toEqual(Quill);
    });

    it('should call ServerService getBlockContent', () => {
      expect(serverService.getBlockContent).toHaveBeenCalled();
    });

    it('should call ServerService getBlockContent with block arg', () => {
      expect(serverService.getBlockContent).toHaveBeenCalledWith({
        id: '1',
        type: 'text',
        order: 1
      });
    });

    it(
      'should call State receiveServer',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, Data.TextBlockData, false);
        tick(200);

        expect(state.receiveServer).toHaveBeenCalled();
      })
    );

    it(
      'should call State receiveServer with text arg',
      fakeAsync(() => {
        serverService.updateTextBlockContent(null, Data.TextBlockData, false);
        tick(200);

        expect(state.receiveServer).toHaveBeenCalledWith(Data.TextBlockData);
      })
    );

    it('should call ServerService getUsers', () => {
      expect(serverService.getUsers).toHaveBeenCalled();
    });

    it('should set users', () => {
      expect(comp.users.length).toBeGreaterThan(0);
    });

    it('should filter users with different blockId', () => {
      comp.ngOnInit();
      expect(comp.block.id).toBe('1');

      comp.users.forEach(user => expect(user.current.blockId).toBe('1'));
    });

    it('should filter current user', () => {
      comp.ngOnInit();
      expect(comp.state.pending.user).toBe('abc');

      comp.users.forEach(user => expect(user.current.blockId).not.toBe('abc'));
    });

    it('should call Quill getBounds', () => {
      expect(quill.getBounds).toHaveBeenCalled();
    });

    it('should call Quill getBounds with user current data index and length args', () => {
      expect(quill.getBounds).toHaveBeenCalledWith(
        jasmine.any(Number),
        jasmine.any(Number)
      );
    });

    it('should set user current data as bounds', () => {
      comp.users.forEach(user => {
        expect(user.current.data.index).toBeUndefined();
        expect(user.current.data.length).toBeUndefined();
        expect(user.current.data.top).toBeDefined();
        expect(user.current.data.left).toBeDefined();
        expect(user.current.data.right).toBeDefined();
        expect(user.current.data.bottom).toBeDefined();
        expect(user.current.data.width).toBeDefined();
        expect(user.current.data.height).toBeDefined();
      });
    });
  });

  describe('formatLinkClick', () => {
    it('should be called by link button click', () => {
      page.linkButton.click();

      expect(page.formatLinkClick).toHaveBeenCalled();
    });

    it('should call Quill getFormat', () => {
      comp.formatLinkClick();

      expect(quill.getFormat).toHaveBeenCalled();
    });

    describe('new link', () => {
      beforeEach(() => {
        comp.editor.pasteHTML('<p>Title</p><p>Text.Link.Text.</p>');
        comp.editor.setSelection(11, 4);
        comp.formatLinkClick();
      });

      it('should call prompt', () => {
        expect(windowStub.prompt).toHaveBeenCalled();
      });

      it('should call Quill removeFormat', () => {
        expect(quill.removeFormat).toHaveBeenCalled();
      });

      it('should call Quill removeFormat with index and length args', () => {
        expect(quill.removeFormat).toHaveBeenCalledWith(11, 4);
      });

      it('should call Quill format', () => {
        expect(quill.format).toHaveBeenCalled();
      });

      it('should call Quill format with link add and prompt args', () => {
        expect(quill.format).toHaveBeenCalledWith(
          'link',
          'http://example.com/image.jpg',
          'user'
        );
      });

      it('should add anchor', () => {
        expect(page.editorLink.length).toBe(1);
      });

      it('should set anchor href', () => {
        expect(page.editorLink[0].href).toBe('http://example.com/image.jpg');
      });

      it('should set anchor content', () => {
        expect(page.editorLink[0].innerText).toBe('Link');
      });

      it(`should set anchor target as '_blank'`, () => {
        expect(page.editorLink[0].target).toBe('_blank');
      });
    });

    describe('existing link', () => {
      it('should call Quill format', () => {
        comp.editor.pasteHTML(
          '<p>Title</p><p>Text.<a href="http://example.com/image.jpg">Link</a>.Text.</p>'
        );
        comp.editor.setSelection(11, 4);
        comp.formatLinkClick();

        expect(quill.format).toHaveBeenCalled();
      });

      it('should call Quill format with link remove args', () => {
        comp.editor.pasteHTML(
          '<p>Title</p><p>Text.<a href="http://example.com/image.jpg">Link</a>.Text.</p>'
        );
        comp.editor.setSelection(11, 4);
        comp.formatLinkClick();

        expect(quill.format).toHaveBeenCalledWith('link', false, 'user');
      });

      it('should not call prompt', () => {
        comp.editor.pasteHTML(
          '<p>Title</p><p>Text.<a href="http://example.com/image.jpg">Link</a>.Text.</p>'
        );
        comp.editor.setSelection(11, 4);
        comp.formatLinkClick();

        expect(windowStub.prompt).not.toHaveBeenCalled();
      });

      it('should not call Quill removeFormat', () => {
        comp.editor.pasteHTML(
          '<p>Title</p><p>Text.<a href="http://example.com/image.jpg">Link</a>.Text.</p>'
        );
        comp.editor.setSelection(11, 4);
        comp.formatLinkClick();

        expect(quill.removeFormat).not.toHaveBeenCalled();
      });

      it('should remove anchor on anchor selection', () => {
        comp.editor.pasteHTML(
          '<p>Title</p><p>Text.<a href="http://example.com/image.jpg">Link</a>.Text.</p>'
        );
        comp.editor.setSelection(11, 4);
        comp.formatLinkClick();

        expect(page.editorLink.length).toBe(0);
      });

      it('should not remove unselected anchor on anchor selection', () => {
        comp.editor.pasteHTML(
          '<p>Title</p><p>Text.<a href="http://example.com/image.jpg">Link</a>.Text.<a href="#">Another link</a>.</p>'
        );
        comp.editor.setSelection(11, 4);
        comp.formatLinkClick();

        expect(page.editorLink[0].textContent).toBe('Another link');
      });

      it('should split and remove anchor on partial anchor selection', () => {
        comp.editor.pasteHTML(
          '<p>Title</p><p>Text.<a href="http://example.com/image.jpg">Link</a>.Text.</p>'
        );
        comp.editor.setSelection(12, 1);
        comp.formatLinkClick();

        expect(page.editorLink.length).toBe(2);
        expect(page.editorLink[0].textContent).toBe('L');
        expect(page.editorLink[1].textContent).toBe('nk');
      });

      it('should not remove unselected anchor on partial anchor selection', () => {
        comp.editor.pasteHTML(
          '<p>Title</p><p>Text.<a href="http://example.com/image.jpg">Link</a>.Text.<a href="#">Another link</a>.</p>'
        );
        comp.editor.setSelection(12, 1);
        comp.formatLinkClick();

        expect(page.editorLink[2].textContent).toBe('Another link');
      });
    });
  });

  describe('formatHeadingClick', () => {
    it('should be called by heading button click', () => {
      page.headingButton.click();

      expect(page.formatHeadingClick).toHaveBeenCalled();
    });

    it('should call Quill getFormat', () => {
      comp.formatHeadingClick();

      expect(quill.getFormat).toHaveBeenCalled();
    });

    it('should call removeBlockFormat', () => {
      comp.formatHeadingClick();

      expect(comp.removeBlockFormat).toHaveBeenCalled();
    });

    it('should call Quill format', () => {
      comp.formatHeadingClick();

      expect(quill.format).toHaveBeenCalled();
    });

    it('should call Quill format with title args', () => {
      comp.formatHeadingClick();

      expect(quill.format).toHaveBeenCalledWith('title', 0 || 1, 'user');
    });

    describe('new heading', () => {
      it('should add heading', () => {
        comp.editor.pasteHTML('<p>Title of the content</p><p>Text.Text.</p>');
        comp.editor.setSelection(0, 20);
        comp.formatHeadingClick();

        expect(page.editorHeading.length).toBe(1);
      });

      it('should set heading content', () => {
        comp.editor.pasteHTML('<p>Title of the content</p><p>Text.Text.</p>');
        comp.editor.setSelection(0, 20);
        comp.formatHeadingClick();

        expect(page.editorHeading[0].textContent).toBe('Title of the content');
      });

      it('should add heading to entire block on partial selection', () => {
        comp.editor.pasteHTML('<p>Title of the content</p><p>Text.Text.</p>');
        comp.editor.setSelection(5, 5);
        comp.formatHeadingClick();

        expect(page.editorHeading[0].textContent).toBe('Title of the content');
      });

      it('should not merge headings on selection bridge', () => {
        comp.editor.pasteHTML(
          '<p>Title of the content</p><h3>Another title</h3>'
        );
        comp.editor.setSelection(15, 10);
        comp.formatHeadingClick();

        expect(page.editorHeading[0].textContent).toBe('Title of the content');
        expect(page.editorHeading[1].textContent).toBe('Another title');
      });
    });

    describe('existing heading', () => {
      it('should remove heading on heading selection', () => {
        comp.editor.pasteHTML('<h3>Title of the content</h3><p>Text.Text.</p>');
        comp.editor.setSelection(0, 20);
        comp.formatHeadingClick();

        expect(page.editorHeading.length).toBe(0);
      });

      it('should not remove unselected heading on heading selection', () => {
        comp.editor.pasteHTML(
          '<h3>Title of the content</h3><h3>Another title</h3><p>Text.Text.</p>'
        );
        comp.editor.setSelection(0, 20);
        comp.formatHeadingClick();

        expect(page.editorHeading[0].textContent).toBe('Another title');
      });

      it('should remove heading on partial heading selection', () => {
        comp.editor.pasteHTML('<h3>Title of the content</h3><p>Text.Text.</p>');
        comp.editor.setSelection(10, 5);
        comp.formatHeadingClick();

        expect(page.editorHeading.length).toBe(0);
      });

      it('should not remove unselected heading on partial heading selection', () => {
        comp.editor.pasteHTML(
          '<h3>Title of the content</h3><h3>Another title</h3><p>Text.Text.</p>'
        );
        comp.editor.setSelection(10, 5);
        comp.formatHeadingClick();

        expect(page.editorHeading[0].textContent).toBe('Another title');
      });
    });
  });

  describe('tryTransaction', () => {
    const block: Block.Base = {
      id: '1',
      type: 'text',
      order: 1
    };
    const pending: Block.Data.TextData = {
      id: 1,
      user: 'me'
    };

    beforeEach(() => {
      comp.block = block;
      comp.state.pending = pending;

      comp.tryTransaction();
    });

    it('should call ServerService updateTextBlockContent', () => {
      expect(serverService.updateTextBlockContent).toHaveBeenCalled();
    });

    it('should call ServerService updateTextBlockContent with block and pending args', () => {
      expect(serverService.updateTextBlockContent).toHaveBeenCalledWith(
        block,
        pending
      );
    });
  });

  describe('selectionChange', () => {
    let selection;

    beforeEach(() => comp.selection.subscribe(sel => (selection = sel)));

    it('should not emit selection if no range', () => {
      comp.selectionChange(null);

      expect(selection).toBeUndefined();
    });

    it('should emit selection if range', () => {
      comp.selectionChange({ index: 0, length: 1 } as any);

      expect(selection).toEqual({ index: 0, length: 1 });
    });
  });

  describe('textChange', () => {
    it('should call State addText', () => {
      comp.textChange(new Delta([{ insert: 'abc' }]), null, 'user');

      expect(state.addText).toHaveBeenCalled();
    });

    it('should call State addText with delta arg', () => {
      comp.textChange(new Delta([{ insert: 'abc' }]), null, 'user');

      expect(state.addText).toHaveBeenCalledWith(
        new Delta([{ insert: 'abc' }])
      );
    });

    it('should call State addText with null delta attributes replaced as false', () => {
      comp.textChange(
        new Delta([
          {
            insert: 'abc',
            attributes: { heading: null, color: '#000', link: null }
          },
          { insert: 'def', attributes: { link: null } }
        ]),
        null,
        'user'
      );

      expect(state.addText).toHaveBeenCalledWith(
        new Delta([
          {
            insert: 'abc',
            attributes: { heading: false, color: '#000', link: false }
          },
          { insert: 'def', attributes: { link: false } }
        ])
      );
    });

    it('should set State as PendingState', () => {
      comp.textChange(new Delta([{ insert: 'abc' }]), null, 'user');

      expect(comp.state.constructor).toEqual(PendingState);
    });

    it(`should not call State addText if source is not 'user'`, () => {
      comp.textChange(new Delta([{ insert: 'abc' }]), null, 'other');

      expect(state.addText).not.toHaveBeenCalled();
    });
  });

  describe('Text', () => {
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

      it('should call textChange', async(() => {
        page.addText(page.editorEl, '1');

        return setTimeout(() => {
          expect(page.textChange).toHaveBeenCalled();
        });
      }));

      it('should call textChange with delta param', async(() => {
        page.addText(page.editorEl, '1');

        return setTimeout(() => {
          expect(page.textChange).toHaveBeenCalledWith(
            new Delta([{ insert: '1' }]),
            jasmine.anything(),
            'user'
          );
        });
      }));
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

      it('should remove text from the editor', async(() => {
        page.removeText(page.editorEl, 1);

        return setTimeout(() => {
          expect(page.editorEl.innerText.trim()).toBe('ac');
        });
      }));

      it('should call textChange', async(() => {
        page.removeText(page.editorEl, 1);

        return setTimeout(() => {
          expect(page.textChange).toHaveBeenCalled();
        });
      }));

      it('should call textChange with delta param', async(() => {
        page.removeText(page.editorEl, 1);

        return setTimeout(() => {
          expect(page.textChange).toHaveBeenCalledWith(
            new Delta([{ retain: 1 }, { delete: 1 }]),
            jasmine.anything(),
            'user'
          );
        });
      }));
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

      it('should replace text in the editor', async(() => {
        page.replaceText(page.editorEl, '123', 3);

        return setTimeout(() => {
          expect(page.editorEl.innerText.trim()).toBe('abc123');
        });
      }));

      it('should call textChange', async(() => {
        page.replaceText(page.editorEl, '123', 3);

        return setTimeout(() => {
          expect(page.textChange).toHaveBeenCalled();
        });
      }));

      it('should call textChange with delta param', async(() => {
        page.replaceText(page.editorEl, '123', 3);

        return setTimeout(() => {
          expect(page.textChange).toHaveBeenCalledWith(
            new Delta([{ retain: 3 }, { insert: '123' }, { delete: 1 }]),
            jasmine.anything(),
            'user'
          );
        });
      }));
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
          const state = new ComponentStateStub();
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
          const state = new ComponentStateStub();
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
          const state = new ComponentStateStub();
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
          const state = new ComponentStateStub();
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
          const state = new ComponentStateStub();
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
          const state = new ComponentStateStub();
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
          const state = new ComponentStateStub();
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
});

function createComponent() {
  windowStub = new WindowStub();
  quill = new QuillStub();
  state = new StateStub();
  fixture = TestBed.createComponent(TextComponent);
  comp = fixture.componentInstance;
  serverService = fixture.debugElement.injector.get(ServerService as any);
  page = new Page();

  fixture.detectChanges();
  return fixture.whenStable().then(_ => {
    fixture.detectChanges();
    comp.state.pending.user = 'client2';
  });
}

class QuillStub {
  updateContents: jasmine.Spy;
  getBounds: jasmine.Spy;
  getFormat: jasmine.Spy;
  getSelection: jasmine.Spy;
  format: jasmine.Spy;
  removeFormat: jasmine.Spy;
  getLeaf: jasmine.Spy;

  constructor() {
    this.updateContents = spyOn(
      Quill.prototype,
      'updateContents'
    ).and.callThrough();
    this.getBounds = spyOn(Quill.prototype, 'getBounds').and.callThrough();
    this.getFormat = spyOn(Quill.prototype, 'getFormat').and.callThrough();
    this.getSelection = spyOn(
      Quill.prototype,
      'getSelection'
    ).and.callThrough();
    this.format = spyOn(Quill.prototype, 'format').and.callThrough();
    this.removeFormat = spyOn(
      Quill.prototype,
      'removeFormat'
    ).and.callThrough();
    this.getLeaf = spyOn(Quill.prototype, 'getLeaf').and.callThrough();
  }
}

class StateStub {
  setUser: jasmine.Spy;
  receiveServer: jasmine.Spy;
  addText: jasmine.Spy;

  constructor() {
    this.setUser = spyOn(State.prototype, 'setUser').and.callThrough();
    this.receiveServer = spyOn(
      State.prototype,
      'receiveServer'
    ).and.callThrough();
    this.addText = spyOn(State.prototype, 'addText').and.callThrough();
  }
}

class ComponentStateStub {
  pendingRejected: jasmine.Spy;

  constructor() {
    this.pendingRejected = spyOn(
      comp.state,
      'pendingRejected'
    ).and.callThrough();
  }
}

class WindowStub {
  prompt: jasmine.Spy;

  constructor() {
    this.prompt = spyOn(window, 'prompt').and.callFake(
      () => 'http://example.com/image.jpg'
    );
  }
}

class Page {
  textChange: jasmine.Spy;
  tryTransaction: jasmine.Spy;
  transactionCallback: jasmine.Spy;
  formatLinkClick: jasmine.Spy;
  formatHeadingClick: jasmine.Spy;
  removeBlockFormat: jasmine.Spy;

  get editorEl() {
    return this.query<HTMLDivElement>('.ql-editor');
  }

  get editorHeading() {
    return this.queryAll<HTMLHeadingElement>('.ql-editor h3');
  }

  get editorLink() {
    return this.queryAll<HTMLAnchorElement>('.ql-editor a');
  }

  get linkButton() {
    return this.query<HTMLButtonElement>('#button-link');
  }

  get headingButton() {
    return this.query<HTMLButtonElement>('#button-heading');
  }

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
    this.textChange = spyOn(comp, 'textChange').and.callThrough();
    this.tryTransaction = spyOn(comp, 'tryTransaction').and.callThrough();
    this.formatLinkClick = spyOn(comp, 'formatLinkClick').and.callThrough();
    this.formatHeadingClick = spyOn(
      comp,
      'formatHeadingClick'
    ).and.callThrough();
    this.removeBlockFormat = spyOn(comp, 'removeBlockFormat').and.callThrough();

    const block: Block.Base = {
      id: '1',
      type: 'text',
      order: 1
    };
    comp.block = block;
  }

  private query<T>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }

  private queryAll<T>(selector: string): T[] {
    return fixture.nativeElement.querySelectorAll(selector);
  }
}

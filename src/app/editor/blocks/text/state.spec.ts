import {
  MockLoggerService,
  LoggerService,
  MockServerService,
  ServerService,
  Block,
  Data
} from 'testing';
import * as Quill from 'quill';
const Delta: Quill.DeltaStatic = Quill.import('delta');

import { TextComponent } from './text.component';
import { State, PendingState, PendingBufferState } from './state';

let loggerService: LoggerService;
let serverService: ServerService;
let textComponent: TextComponent;
let textComponentStub: TextComponentStub;
let state: State;
let stateStub: StateStub;
let pendingStateStub: PendingStateStub;
let pendingBufferStateStub: PendingBufferStateStub;

describe('State', () => {
  beforeEach(() => {
    loggerService = new MockLoggerService();
    serverService = new MockServerService() as any;
    textComponent = new TextComponent(loggerService, serverService);
    textComponent.editor = new Quill('head');
    textComponentStub = new TextComponentStub();
    state = new State(textComponent, loggerService);
    stateStub = new StateStub();
    pendingStateStub = new PendingStateStub();
    pendingBufferStateStub = new PendingBufferStateStub();
  });

  it('should create an instance', () => {
    expect(state).toBeTruthy();
  });

  describe('Initial', () => {
    it(`should set state as 'synced'`, () => {
      expect(state.state).toBe('synced');
    });

    it('should set pending id as -1', () => {
      expect(state.pending.id).toBe(-1);
    });

    it('should set pending user as null', () => {
      expect(state.pending.user).toBe(null);
    });
  });

  describe('State', () => {
    it(`should set state as 'synced'`, () => {
      expect(state.state).toBe('synced');
    });

    it('should not have pending delta', () => {
      expect(state.pending.delta).toBeUndefined();
    });

    it('should not have buffer', () => {
      expect(state.buffer).toBeUndefined();
    });

    describe('addText', () => {
      const pending: Block.Data.TextData = {
        id: 1,
        user: 'Name'
      };

      beforeEach(() => {
        state.pending = pending;
        state = state.addText(Data.TextBlockDataDelta[0]);
      });

      it('should set pending delta', () => {
        expect(state.pending.delta).toEqual(Data.TextBlockDataDelta[0]);
      });

      it('should not have buffer', () => {
        expect(state.buffer).toBeUndefined();
      });

      it('should return PendingState', () => {
        expect(state.constructor).toEqual(PendingState);
      });

      it('should return PendingState with component, logger, and pending args', () => {
        expect(state.state).toBe('pending');
        expect(state.component).toEqual(textComponent);
        expect(state.logger).toEqual(loggerService);
        expect(state.pending).toEqual({
          ...pending,
          delta: Data.TextBlockDataDelta[0]
        });
      });
    });

    describe('pendingConfirmed', () => {
      beforeEach(() => (state = state.pendingConfirmed()));

      it('should return State', () => {
        expect(state.constructor).toEqual(State);
      });
    });

    describe('pendingRejected', () => {
      beforeEach(() => (state = state.pendingRejected(null)));

      it('should return State', () => {
        expect(state.constructor).toEqual(State);
      });
    });

    describe('setUser', () => {
      beforeEach(() => {
        state.pending.id = 1;
        state.pending.delta = Data.TextBlockDataDelta[0];
        state.setUser('Name Surname');
      });

      it('should set pending user', () => {
        expect(state.pending.user).toBe('Name Surname');
      });

      it('should not modify pending id', () => {
        expect(state.pending.id).toBe(1);
      });

      it('should not modify pending delta', () => {
        expect(state.pending.delta).toBe(Data.TextBlockDataDelta[0]);
      });
    });

    describe('sendServer', () => {
      beforeEach(() => {
        state.pending.id = 1;
        state.sendServer();
      });

      it('should increment pending id', () => {
        expect(state.pending.id).toBe(2);
      });

      it('should call TextComponent tryTransaction', () => {
        expect(textComponentStub.tryTransaction).toHaveBeenCalled();
      });
    });

    describe('updateCursor', () => {
      describe('existing user', () => {
        beforeEach(() => {
          textComponent.users = [{ id: 'person', colour: '#fff', current: {} }];
          state.updateCursor(Data.TextBlockData);
        });

        it('should call TextComponent editor getBounds', () => {
          expect(textComponentStub.editor.getBounds).toHaveBeenCalled();
        });

        it('should call TextComponent editor getBounds with number args', () => {
          expect(textComponentStub.editor.getBounds).toHaveBeenCalledWith(
            jasmine.any(Number),
            jasmine.any(Number)
          );
        });

        it('should call TextComponent editor getBounds with delta op concat arg', () => {
          state.updateCursor({
            id: 0,
            user: 'person',
            delta: new Delta([{ insert: 'hello' }])
          });
          expect(textComponentStub.editor.getBounds).toHaveBeenCalledWith(
            5,
            jasmine.any(Number)
          );

          state.updateCursor({
            id: 0,
            user: 'person',
            delta: new Delta([{ retain: 4 }])
          });
          expect(textComponentStub.editor.getBounds).toHaveBeenCalledWith(
            4,
            jasmine.any(Number)
          );

          state.updateCursor({
            id: 0,
            user: 'person',
            delta: new Delta([{ retain: 2 }, { insert: 'a' }])
          });
          expect(textComponentStub.editor.getBounds).toHaveBeenCalledWith(
            3,
            jasmine.any(Number)
          );

          state.updateCursor({
            id: 0,
            user: 'person',
            delta: new Delta([{ delete: 1 }, { retain: 1 }, { insert: 'a' }])
          });
          expect(textComponentStub.editor.getBounds).toHaveBeenCalledWith(
            2,
            jasmine.any(Number)
          );

          state.updateCursor({
            id: 0,
            user: 'person',
            delta: new Delta([{ delete: 1 }, { retain: 1 }])
          });
          expect(textComponentStub.editor.getBounds).toHaveBeenCalledWith(
            1,
            jasmine.any(Number)
          );

          state.updateCursor({
            id: 0,
            user: 'person',
            delta: new Delta([{ delete: 1 }])
          });
          expect(textComponentStub.editor.getBounds).toHaveBeenCalledWith(
            0,
            jasmine.any(Number)
          );
        });

        it('should set user current data', () => {
          expect(textComponent.users[0].current.data).toEqual({
            top: 5,
            bottom: 5,
            left: 5,
            right: 5,
            width: 20,
            height: 10
          });
        });
      });

      describe('new user', () => {
        it('should not call TextComponent editor getBounds', () => {
          expect(textComponentStub.editor.getBounds).not.toHaveBeenCalled();
        });
      });
    });

    describe('updateContents', () => {
      beforeEach(() => state.updateContents(Data.TextBlockData));

      it('should call TextComponent editor updateContents', () => {
        expect(textComponentStub.editor.updateContents).toHaveBeenCalled();
      });

      it('should call TextComponent editor updateContents with delta arg', () => {
        expect(textComponentStub.editor.updateContents).toHaveBeenCalledWith(
          Data.TextBlockData.delta
        );
      });

      it('should call updateCursor', () => {
        expect(stateStub.updateCursor).toHaveBeenCalled();
      });

      it('should call updateCursor with text arg', () => {
        expect(stateStub.updateCursor).toHaveBeenCalledWith(Data.TextBlockData);
      });
    });

    describe('receiveServer', () => {
      describe('', () => {
        beforeEach(() => {
          state.pending.user = 'Name';
          state.pending.delta = Data.TextBlockDataDelta[0];
          state = state.receiveServer(Data.TextBlockData);
        });

        it('should set pending id as text id', () => {
          expect(state.pending.id).toBe(1);
        });

        it('should not modify pending user', () => {
          expect(state.pending.user).toBe('Name');
        });

        it('should not modify pending delta', () => {
          expect(state.pending.delta).toEqual(Data.TextBlockDataDelta[0]);
        });

        it('should return State', () => {
          expect(state.constructor).toEqual(State);
        });
      });

      describe('this user', () => {
        beforeEach(() => {
          state.pending.user = 'person';
          state = state.receiveServer(Data.TextBlockData);
        });

        it('should not call updateContents', () => {
          expect(stateStub.updateContents).not.toHaveBeenCalled();
        });
      });

      describe('other user', () => {
        beforeEach(() => {
          state.pending.user = 'other';
          state = state.receiveServer(Data.TextBlockData);
        });

        it('should call updateContents', () => {
          expect(stateStub.updateContents).toHaveBeenCalled();
        });

        it('should call updateContents with text arg', () => {
          expect(stateStub.updateContents).toHaveBeenCalledWith({
            ...Data.TextBlockData,
            delta: jasmine.anything()
          });
        });

        it('should call updateContents with text delta arg as Delta', () => {
          expect(stateStub.updateContents).toHaveBeenCalledWith({
            ...Data.TextBlockData,
            delta: new Delta(Data.TextBlockData.delta.ops)
          });
        });
      });
    });

    describe('transform', () => {
      const textData: Block.Data.TextData = {
        id: 1,
        user: 'other',
        delta: { ops: [{ retain: 1 }, { insert: '1' }] } as Quill.DeltaStatic
      };

      beforeEach(() => {
        state.pending.delta = new Delta([{ retain: 1 }, { insert: 'b' }]);
        state.transform(textData);
      });

      it('should set pending delta as other transform', () => {
        expect(state.pending.delta).toEqual(
          new Delta([{ retain: 2 }, { insert: 'b' }])
        );
      });

      it('should call updateContents', () => {
        expect(stateStub.updateContents).toHaveBeenCalled();
      });

      it('should call updateContents with text arg', () => {
        expect(stateStub.updateContents).toHaveBeenCalledWith({
          ...textData,
          delta: jasmine.anything()
        });
      });

      it('should call updateContents with text delta arg as self transform', () => {
        expect(stateStub.updateContents).toHaveBeenCalledWith({
          ...textData,
          delta: new Delta([{ retain: 1 }, { insert: '1' }])
        });
      });
    });

    describe('PendingState', () => {
      beforeEach(
        () =>
          (state = new PendingState(
            textComponent,
            loggerService,
            Data.TextBlockData
          ))
      );

      it(`should set state as 'pending'`, () => {
        expect(state.state).toBe('pending');
      });

      it('should set pending delta', () => {
        expect(state.pending.delta).toEqual(Data.TextBlockData.delta);
      });

      it('should not have buffer', () => {
        expect(state.buffer).toBeUndefined();
      });

      it('should call sendServer', () => {
        expect(stateStub.sendServer).toHaveBeenCalled();
      });

      describe('addText', () => {
        const pending: Block.Data.TextData = {
          id: 0,
          user: 'Name',
          delta: Data.TextBlockDataDelta[0]
        };

        beforeEach(() => {
          state.pending = pending;
          state = state.addText(Data.TextBlockDataDelta[1]);
        });

        it('should set buffer', () => {
          expect(state.buffer).toEqual(Data.TextBlockDataDelta[1]);
        });

        it('should not modify pending', () => {
          expect(state.pending).toEqual(pending);
        });

        it('should return PendingBufferState', () => {
          expect(state.constructor).toEqual(PendingBufferState);
        });

        it('should return PendingBufferState with component, logger, pending, and buffer args', () => {
          expect(state.state).toBe('pendingBuffer');
          expect(state.component).toEqual(textComponent);
          expect(state.logger).toEqual(loggerService);
          expect(state.pending).toEqual(pending);
          expect(state.buffer).toEqual(Data.TextBlockDataDelta[1]);
        });
      });

      describe('pendingConfirmed', () => {
        const pending: Block.Data.TextData = {
          id: 0,
          user: 'Name',
          delta: Data.TextBlockDataDelta[0]
        };

        beforeEach(() => {
          state.pending = pending;
          state = state.pendingConfirmed();
        });

        it('should set pending delta as null', () => {
          expect(state.pending.delta).toBeNull();
        });

        it('should not modify pending id', () => {
          expect(state.pending.id).toBe(0);
        });

        it('should not modify pending user', () => {
          expect(state.pending.user).toBe('Name');
        });

        it('should return State', () => {
          expect(state.constructor).toEqual(State);
        });

        it('should return State with component, logger, and pending args', () => {
          expect(state.state).toBe('synced');
          expect(state.component).toEqual(textComponent);
          expect(state.logger).toEqual(loggerService);
          expect(state.pending).toEqual({ ...pending, delta: null });
        });
      });

      describe('pendingRejected', () => {
        beforeEach(() => (state = state.pendingRejected(Data.TextBlockData)));

        it('should call transform', () => {
          expect(pendingStateStub.transform).toHaveBeenCalled();
        });

        it('should call transform with text arg', () => {
          expect(pendingStateStub.transform).toHaveBeenCalledWith(
            Data.TextBlockData
          );
        });

        it('should call sendServer', () => {
          expect(stateStub.sendServer).toHaveBeenCalled();
        });
      });

      describe('receiveServer', () => {
        describe('pending block', () => {
          const textData: Block.Data.TextData = {
            id: 0,
            user: 'me',
            delta: new Delta([{ insert: 'abc' }])
          };

          beforeEach(() => {
            state.pending = textData;
            state = state.receiveServer(textData);
          });

          it('should call pendingConfirmed', () => {
            expect(pendingStateStub.pendingConfirmed).toHaveBeenCalled();
          });

          it('should not call pendingRejected', () => {
            expect(pendingStateStub.pendingRejected).not.toHaveBeenCalled();
          });
        });

        describe('other block', () => {
          it('should call pendingRejected', () => {
            state.pending = {
              id: 0,
              user: 'me',
              delta: new Delta([{ insert: 'abc' }])
            };
            const textData: Block.Data.TextData = {
              id: 0,
              user: 'other',
              delta: new Delta([{ insert: 'abc' }])
            };
            state = state.receiveServer(textData);

            expect(pendingStateStub.pendingRejected).toHaveBeenCalled();
          });

          it('should call pendingRejected with text arg', () => {
            state.pending = {
              id: 0,
              user: 'me',
              delta: new Delta([{ insert: 'abc' }])
            };
            const textData: Block.Data.TextData = {
              id: 0,
              user: 'other',
              delta: new Delta([{ insert: 'abc' }])
            };
            state = state.receiveServer(textData);

            expect(pendingStateStub.pendingRejected).toHaveBeenCalledWith(
              textData
            );
          });

          it('should not call pendingConfirmed if identical user', () => {
            state.pending = {
              id: 0,
              user: 'me',
              delta: new Delta([{ insert: 'abc' }])
            };
            const textData: Block.Data.TextData = {
              id: 1,
              user: 'me',
              delta: new Delta([{ insert: 'abc' }])
            };
            state = state.receiveServer(textData);

            expect(pendingStateStub.pendingConfirmed).not.toHaveBeenCalled();
          });

          it('should not call pendingConfirmed if identical id', () => {
            state.pending = {
              id: 0,
              user: 'me',
              delta: new Delta([{ insert: 'abc' }])
            };
            const textData: Block.Data.TextData = {
              id: 0,
              user: 'other',
              delta: new Delta([{ insert: 'abc' }])
            };
            state = state.receiveServer(textData);

            expect(pendingStateStub.pendingConfirmed).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('PendingBufferState', () => {
      beforeEach(
        () =>
          (state = new PendingBufferState(
            textComponent,
            loggerService,
            Data.TextBlockData,
            Data.TextBlockDataDelta[1]
          ))
      );

      it(`should set state as 'pendingBuffer'`, () => {
        expect(state.state).toBe('pendingBuffer');
      });

      it('should set pending delta', () => {
        expect(state.pending.delta).toEqual(Data.TextBlockData.delta);
      });

      it('should set buffer', () => {
        expect(state.buffer).toEqual(Data.TextBlockDataDelta[1]);
      });

      describe('addText', () => {
        beforeEach(() => {
          state.pending = Data.TextBlockData;
          state.buffer = new Delta([{ insert: 'heklo' }]);
          state = state.addText(
            new Delta([{ retain: 2 }, { insert: 'l' }, { delete: 1 }])
          );
        });

        it('should add to buffer', () => {
          expect(state.buffer).toEqual(new Delta([{ insert: 'hello' }]));
        });

        it('should not modify pending', () => {
          expect(state.pending).toEqual(Data.TextBlockData);
        });

        it('should return PendingBufferState', () => {
          expect(state.constructor).toEqual(PendingBufferState);
        });
      });

      describe('pendingConfirmed', () => {
        beforeEach(() => {
          state.pending = Data.TextBlockData;
          state.buffer = Data.TextBlockDataDelta[1];
          state = state.pendingConfirmed();
        });

        it('should set pending delta as buffer', () => {
          expect(state.pending.delta).toEqual(Data.TextBlockDataDelta[1]);
        });

        it('should not modify pending user', () => {
          expect(state.pending.user).toBe('person');
        });

        it('should unset buffer', () => {
          expect(state.buffer).toBeFalsy();
        });

        it('should return PendingState', () => {
          expect(state.constructor).toEqual(PendingState);
        });
      });

      describe('pendingRejected', () => {
        const textData: Block.Data.TextData = {
          id: 1,
          user: 'other',
          delta: new Delta([{ retain: 1 }, { insert: '1' }])
        };

        beforeEach(() => {
          state.pending = {
            id: 1,
            user: 'me',
            delta: new Delta([{ insert: 'b' }])
          };
          state.buffer = new Delta([{ retain: 1 }, { insert: 'c' }]);
          state = state.pendingRejected(textData);
        });

        it('should set pending delta as delta combined with buffer', () => {
          expect(state.pending.delta).toEqual(new Delta([{ insert: 'bc' }]));
        });

        it('should not modify pending user', () => {
          expect(state.pending.user).toBe('me');
        });

        it('should unset buffer', () => {
          expect(state.buffer).toBeFalsy();
        });

        it('should call transform', () => {
          expect(pendingBufferStateStub.transform).toHaveBeenCalled();
        });

        it('should call transform with text arg', () => {
          expect(pendingBufferStateStub.transform).toHaveBeenCalledWith(
            textData
          );
        });
      });

      describe('pendingConfirmed', () => {
        beforeEach(() => {
          state.pending = Data.TextBlockData;
          state.buffer = Data.TextBlockDataDelta[1];
          state = state.pendingConfirmed();
        });

        it('should set pending delta as buffer', () => {
          expect(state.pending.delta).toEqual(Data.TextBlockDataDelta[1]);
        });

        it('should not modify pending user', () => {
          expect(state.pending.user).toBe('person');
        });

        it('should unset buffer', () => {
          expect(state.buffer).toBeFalsy();
        });

        it('should return PendingState', () => {
          expect(state.constructor).toEqual(PendingState);
        });
      });

      describe('receiveServer', () => {
        describe('pending block', () => {
          const textData: Block.Data.TextData = {
            id: 0,
            user: 'me',
            delta: new Delta([{ insert: 'abc' }])
          };

          beforeEach(() => {
            state.pending = textData;
            state = state.receiveServer(textData);
          });

          it('should call pendingConfirmed', () => {
            expect(pendingBufferStateStub.pendingConfirmed).toHaveBeenCalled();
          });

          it('should not call pendingRejected', () => {
            expect(
              pendingBufferStateStub.pendingRejected
            ).not.toHaveBeenCalled();
          });
        });

        describe('other block', () => {
          it('should call pendingRejected', () => {
            state.pending = {
              id: 0,
              user: 'me',
              delta: new Delta([{ insert: 'abc' }])
            };
            const textData: Block.Data.TextData = {
              id: 0,
              user: 'other',
              delta: new Delta([{ insert: 'abc' }])
            };
            state = state.receiveServer(textData);

            expect(pendingBufferStateStub.pendingRejected).toHaveBeenCalled();
          });

          it('should call pendingRejected with text arg', () => {
            state.pending = {
              id: 0,
              user: 'me',
              delta: new Delta([{ insert: 'abc' }])
            };
            const textData: Block.Data.TextData = {
              id: 0,
              user: 'other',
              delta: new Delta([{ insert: 'abc' }])
            };
            state = state.receiveServer(textData);

            expect(pendingBufferStateStub.pendingRejected).toHaveBeenCalledWith(
              textData
            );
          });

          it('should not call pendingConfirmed if identical user', () => {
            state.pending = {
              id: 0,
              user: 'me',
              delta: new Delta([{ insert: 'abc' }])
            };
            const textData: Block.Data.TextData = {
              id: 1,
              user: 'me',
              delta: new Delta([{ insert: 'abc' }])
            };
            state = state.receiveServer(textData);

            expect(
              pendingBufferStateStub.pendingConfirmed
            ).not.toHaveBeenCalled();
          });

          it('should not call pendingConfirmed if identical id', () => {
            state.pending = {
              id: 0,
              user: 'me',
              delta: new Delta([{ insert: 'abc' }])
            };
            const textData: Block.Data.TextData = {
              id: 0,
              user: 'other',
              delta: new Delta([{ insert: 'abc' }])
            };
            state = state.receiveServer(textData);

            expect(
              pendingBufferStateStub.pendingConfirmed
            ).not.toHaveBeenCalled();
          });
        });
      });
    });
  });
});

class StateStub {
  updateCursor: jasmine.Spy;
  updateContents: jasmine.Spy;
  sendServer: jasmine.Spy;

  constructor() {
    this.updateCursor = spyOn(
      State.prototype,
      'updateCursor'
    ).and.callThrough();
    this.updateContents = spyOn(
      State.prototype,
      'updateContents'
    ).and.callThrough();
    this.sendServer = spyOn(State.prototype, 'sendServer').and.callThrough();
  }
}

class PendingStateStub {
  transform: jasmine.Spy;
  pendingConfirmed: jasmine.Spy;
  pendingRejected: jasmine.Spy;

  constructor() {
    this.transform = spyOn(
      PendingState.prototype,
      'transform'
    ).and.callThrough();
    this.pendingConfirmed = spyOn(
      PendingState.prototype,
      'pendingConfirmed'
    ).and.callThrough();
    this.pendingRejected = spyOn(
      PendingState.prototype,
      'pendingRejected'
    ).and.callThrough();
  }
}

class PendingBufferStateStub {
  transform: jasmine.Spy;
  pendingConfirmed: jasmine.Spy;
  pendingRejected: jasmine.Spy;

  constructor() {
    this.transform = spyOn(
      PendingBufferState.prototype,
      'transform'
    ).and.callThrough();
    this.pendingConfirmed = spyOn(
      PendingBufferState.prototype,
      'pendingConfirmed'
    ).and.callThrough();
    this.pendingRejected = spyOn(
      PendingBufferState.prototype,
      'pendingRejected'
    ).and.callThrough();
  }
}

class TextComponentStub {
  tryTransaction: jasmine.Spy;
  editor = {
    getBounds: null,
    updateContents: null
  };

  constructor() {
    this.tryTransaction = spyOn(
      textComponent,
      'tryTransaction'
    ).and.callThrough();
    this.editor.getBounds = spyOn(
      textComponent.editor,
      'getBounds'
    ).and.callFake(() => {
      return { top: 5, bottom: 5, left: 5, right: 5, width: 20, height: 10 };
    });
    this.editor.updateContents = spyOn(
      textComponent.editor,
      'updateContents'
    ).and.callFake(() => undefined);
  }
}

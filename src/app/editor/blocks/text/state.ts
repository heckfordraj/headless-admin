import * as Quill from 'quill';
const Delta: Quill.DeltaStatic = Quill.import('delta');

import { TextComponent } from './text.component';
import { LoggerService } from '../../../shared/logger.service';
import { Block } from '../../../shared/block';

export class State {
  state: 'synced' | 'pending' | 'pendingBuffer';
  pending: Block.Data.TextData;
  buffer: Quill.DeltaStatic;

  constructor(
    public component: TextComponent,
    public logger: LoggerService,
    pending?: Block.Data.TextData
  ) {
    this.state = 'synced';
    this.pending = pending || {
      id: -1,
      user: null
    };
  }

  addText(delta: Quill.DeltaStatic): PendingState | PendingBufferState {
    this.logger.log('State', 'addText');
    this.pending.delta = delta;

    return new PendingState(this.component, this.logger, this.pending);
  }

  pendingConfirmed(): State | PendingState | PendingBufferState {
    this.logger.error('State', 'pendingConfirmed');
    return this;
  }

  pendingRejected(
    text: Quill.DeltaOperation[]
  ): State | PendingState | PendingBufferState {
    this.logger.error('State', 'pendingRejected');
    return this;
  }

  setUser(name: string) {
    this.pending.user = name;
  }

  sendServer() {
    ++this.pending.id;
    this.component.tryTransaction();
  }

  receiveServer(
    text: Block.Data.TextData
  ): State | PendingState | PendingBufferState {
    this.logger.log('State', 'receiveServer');

    this.pending.id = text.id;

    if (text.user !== this.pending.user) {
      this.component.editor.updateContents(new Delta(text.delta.ops));
    }

    return this;
  }

  transform(otherDelta: Quill.DeltaStatic) {
    this.logger.log('State', 'transform');

    const transformOthers = otherDelta.transform(this.pending.delta, true);
    const transformSelf = this.pending.delta.transform(otherDelta, false);

    this.logger.log(
      'transform self: ',
      transformSelf,
      'transform others: ',
      transformOthers
    );

    this.pending.delta = transformOthers;
    this.component.editor.updateContents(transformSelf);
  }
}

export class PendingState extends State {
  constructor(
    public component: TextComponent,
    public logger: LoggerService,
    pending: Block.Data.TextData
  ) {
    super(component, logger);

    this.logger.log('PendingState');
    this.state = 'pending';
    this.pending = pending;
    this.sendServer();
  }

  addText(delta: Quill.DeltaStatic) {
    this.logger.log('PendingState', 'addText');

    this.buffer = delta;
    return new PendingBufferState(
      this.component,
      this.logger,
      this.pending,
      this.buffer
    );
  }

  pendingConfirmed() {
    this.logger.log('PendingState', 'pendingConfirmed');

    this.pending.delta = null;
    return new State(this.component, this.logger, this.pending);
  }

  pendingRejected(otherOps: Quill.DeltaOperation[]) {
    this.logger.log('PendingState', 'pendingRejected');

    this.transform(new Delta(otherOps));
    this.sendServer();
    return this;
  }

  receiveServer(text: Block.Data.TextData) {
    this.logger.log('PendingState', 'receiveServer');

    if (text.user == this.pending.user && text.id === this.pending.id)
      return this.pendingConfirmed();

    return this.pendingRejected(text.delta.ops);
  }
}

export class PendingBufferState extends State {
  constructor(
    public component: TextComponent,
    public logger: LoggerService,
    pending: Block.Data.TextData,
    buffer: Quill.DeltaStatic
  ) {
    super(component, logger);

    this.logger.log('PendingBufferState');
    this.state = 'pendingBuffer';
    this.pending = pending;
    this.buffer = buffer;
  }

  addText(delta: Quill.DeltaStatic) {
    this.logger.log('PendingBufferState', 'addText');

    this.buffer = this.buffer.compose(delta);
    return this;
  }

  pendingConfirmed() {
    this.logger.log('PendingBufferState', 'pendingConfirmed');

    this.pending.delta = this.buffer;
    this.buffer = null;
    return new PendingState(this.component, this.logger, this.pending);
  }

  pendingRejected(otherOps: Quill.DeltaOperation[]) {
    this.logger.log('PendingBufferState', 'pendingRejected');

    this.pending.delta = this.pending.delta.compose(this.buffer);
    this.buffer = null;
    this.transform(new Delta(otherOps));

    return new PendingState(this.component, this.logger, this.pending);
  }

  receiveServer(text: Block.Data.TextData) {
    this.logger.log('PendingBufferState', 'receiveServer');

    if (text.user == this.pending.user && text.id === this.pending.id)
      return this.pendingConfirmed();

    return this.pendingRejected(text.delta.ops);
  }
}

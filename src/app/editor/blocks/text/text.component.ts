import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { map } from 'rxjs/operators';

import * as Quill from 'quill';
const Delta: Quill.DeltaStatic = Quill.import('delta');

import {
  LoggerService,
  ServerService,
  Block,
  User,
  TextUserData
} from 'shared';
import { TitleBlock } from './quill';
import { State } from './state';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit, OnDestroy {
  constructor(
    private logger: LoggerService,
    private serverService: ServerService
  ) {}

  @Input() block: Block.Base;
  @Output() selection: EventEmitter<TextUserData> = new EventEmitter();

  users$: Subscription;
  users: User[] = [];

  text$: Subscription;
  editor: Quill.Quill;
  @ViewChild('editor') editorEl: ElementRef;

  state: State = new State(this, this.logger);

  textChange(
    delta: Quill.DeltaStatic,
    oldDelta: Quill.DeltaStatic,
    source: string
  ) {
    if (source !== 'user') return;

    delta.ops.forEach(op => {
      for (let attr in op.attributes)
        op.attributes[attr] = op.attributes[attr] || false;
    });

    this.logger.log('textChange', delta);
    this.state = this.state.addText(delta);
  }

  selectionChange(range: Quill.RangeStatic) {
    if (!range) return;

    this.logger.log('selectionChange', range);
    this.selection.emit(range);
  }

  tryTransaction() {
    this.logger.log('tryTransaction', {
      state: JSON.parse(JSON.stringify(this.state.state || null)),
      pending: JSON.parse(JSON.stringify(this.state.pending || null)),
      buffer: JSON.parse(JSON.stringify(this.state.buffer || null))
    });

    this.serverService
      .updateTextBlockContent(this.block, this.state.pending)
      .then(_ => this.logger.log('updateTextBlockContent', 'update confirmed'))
      .catch(_ => this.logger.log('updateTextBlockContent', 'update rejected'));
  }

  removeBlockFormat() {
    // REVIEW: not selecting entire block reliably
    // TODO: replace with immutable and undeletable block?

    const selection = this.editor.getSelection();

    if (selection.length === 0) {
      const [leaf, offset] = (this.editor as any).getLeaf(selection.index);

      return this.editor.removeFormat(
        selection.index - offset,
        selection.index + leaf.domNode.length,
        'user'
      );
    }

    this.editor.removeFormat(selection.index, selection.length, 'user');
  }

  formatHeadingClick() {
    const { title } = this.editor.getFormat();
    const hasExistingFormat = !title;

    this.removeBlockFormat();
    this.editor.format('title', +hasExistingFormat, 'user');
  }

  formatLinkClick() {
    const { link } = this.editor.getFormat();
    const { index, length } = this.editor.getSelection();

    if (link) return this.editor.format('link', false, 'user');

    const url = prompt('Enter URL');

    this.editor.removeFormat(index, length);
    this.editor.format('link', url, 'user');
  }

  ngOnInit() {
    const { id } = this.serverService.getUser();
    this.state.setUser(id);

    this.editor = new Quill(this.editorEl.nativeElement);
    this.editor.on('text-change', this.textChange.bind(this));
    this.editor.on('selection-change', this.selectionChange.bind(this));
    Quill.register(TitleBlock, true);

    this.text$ = this.serverService
      .getBlockContent(this.block)
      .subscribe(
        (text: Block.Data.TextData) =>
          (this.state = this.state.receiveServer(text))
      );

    this.users$ = this.serverService
      .getUsers()
      .pipe(
        map(users =>
          users.filter(
            user =>
              user.current.blockId === this.block.id &&
              user.id !== this.state.pending.user
          )
        ),
        map(users =>
          users.map(user => {
            user.current.data = this.editor.getBounds(
              user.current.data.index,
              user.current.data.length
            );
            return user;
          })
        )
      )
      .subscribe(users => (this.users = users));
  }

  ngOnDestroy() {
    this.text$.unsubscribe();
    this.users$.unsubscribe();
  }
}

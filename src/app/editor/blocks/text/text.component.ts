import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import * as Quill from 'quill';
const Delta: Quill.DeltaStatic = Quill.import('delta');

import { LoggerService } from '../../../shared/logger.service';
import { ServerService } from '../../../shared/server.service';
import { User, TextUser } from '../../../shared/page';
import { Block } from '../../../shared/block';
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
  @Input() users: User[];
  @Output() selection: EventEmitter<TextUser> = new EventEmitter();

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
      for (let attr in op.attributes) {
        return (op.attributes[attr] = op.attributes[attr] || false);
      }
    });

    this.logger.log('textChange', delta);
    this.state = this.state.addText(delta);
  }

  selectionChange(
    range: Quill.RangeStatic,
    oldRange: Quill.RangeStatic,
    source: string
  ) {
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

    return this.serverService
      .updateTextBlockContent(this.block, this.state.pending)
      .then(_ => this.logger.log('updateTextBlockContent', 'update confirmed'))
      .catch(_ => this.logger.log('updateTextBlockContent', 'update rejected'));
  }

  removeBlockFormat() {
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
    const currentFormats = this.editor.getFormat();
    const hasExistingFormat = !currentFormats.title;

    this.removeBlockFormat();
    this.editor.format('title', +hasExistingFormat, 'user');
  }

  formatLinkClick() {
    const currentFormats = this.editor.getFormat();
    const selection = this.editor.getSelection();

    if (currentFormats.link) return this.editor.format('link', false, 'user');

    const url = prompt('Enter URL');

    this.editor.removeFormat(selection.index, selection.length);
    this.editor.format('link', url, 'user');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.users || !changes.users.currentValue) return;

    this.users = this.users
      .filter(
        user =>
          user.currentBlockId === this.block.id &&
          user.id !== this.serverService.getUser().id
      )
      .map(user => {
        if (!this.editor) return user;

        const bounds = this.editor.getBounds(user.data.index, user.data.length);
        return { ...user, data: bounds };
      });
  }

  ngOnInit() {
    this.state.setUser(this.serverService.getUser().id);

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
  }

  ngOnDestroy() {
    this.text$.unsubscribe();
  }
}

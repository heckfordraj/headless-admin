import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  ElementRef
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import * as Quill from 'quill';
const Delta = Quill.import('delta');

import { LoggerService } from '../../../shared/logger.service';
import { ServerService } from '../../../shared/server.service';
import { Block } from '../../../shared/block';
import { TitleBlock } from './quill';

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

  text$: Subscription;
  text: Block.Data.TextData;

  user: string;
  editor: Quill.Quill;
  @ViewChild('editor') editorEl: ElementRef;

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

    const data: Block.Data.TextData = {
      id: this.serverService.createId(),
      user: this.user,
      ops: delta.ops
    };

    this.serverService
      .updateBlockContent(this.block, data)
      .then(_ =>
        this.logger.log(
          'updateBlockContent',
          `updated ${this.block.type} block content`
        )
      );
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

  ngOnInit() {
    this.user = this.serverService.createId();

    this.editor = new Quill(this.editorEl.nativeElement);
    this.editor.on('text-change', this.textChange.bind(this));
    Quill.register(TitleBlock, true);

    this.text$ = this.serverService
      .getBlockContent(this.block)
      .subscribe((text: Block.Data.TextData) => {
        if (text.user === this.user) return;

        this.editor.updateContents(new Delta(text.ops));
      });
  }

  ngOnDestroy() {
    this.text$.unsubscribe();
  }
}

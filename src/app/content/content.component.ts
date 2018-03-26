import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import * as Quill from 'quill';
const Delta = Quill.import('delta');

import { ServerService } from '../shared/server.service';
import { TextData } from './content';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  user: number = Math.random();
  editor: Quill.Quill;
  @ViewChild('editor') editorEl: ElementRef;

  constructor(private serverService: ServerService) {}

  textChange(
    delta: Quill.DeltaStatic,
    oldDelta: Quill.DeltaStatic,
    source: string
  ) {
    if (source !== 'user') return;

    this.serverService.updateContent(this.user, delta.ops);
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
    const hasExistingFormat = currentFormats.header;

    const value = hasExistingFormat ? false : 1;

    this.removeBlockFormat();
    this.editor.format('title', value, 'user');
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
    this.editor = new Quill(this.editorEl.nativeElement);
    this.editor.on('text-change', this.textChange.bind(this));

    const Block = Quill.import('blots/block');
    class TitleBlock extends Block {
      formatAt(index, length, name, value) {
        if (name !== 'title') return;

        super.format(name, value);
      }
    }
    TitleBlock.blotName = 'title';
    TitleBlock.tagName = ['H3'];

    this.serverService.getContent().subscribe((textData: TextData) => {
      if (textData.user === this.user) return;

      this.editor.updateContents(new Delta(textData.ops));
    });
  }
}

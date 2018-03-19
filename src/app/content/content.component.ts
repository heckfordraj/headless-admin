import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { ServerService } from '../shared/server.service';
import * as Delta from 'quill-delta';

interface DeltaOps {
  insert: string;
  attributes?: any;
  prevLength: number;
}

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  content: any;

  @ViewChild('textArea') textArea: ElementRef;
  @ViewChild('contentEditable') contentEditable: ElementRef;

  private _delta: Delta;
  set delta(delta: Delta) {
    console.log(delta);
    delta.reduce((total: number, op: DeltaOps) => {
      op.prevLength = total;
      return total + op.insert.length;
    }, 0);
    this._delta = delta;
  }
  get delta() {
    return this._delta;
  }

  constructor(private serverService: ServerService) {
    document.addEventListener('selectionchange', event => {
      // console.log('selection')
    });
  }

  getSelection() {
    const selection = window.getSelection();
    const selectionStartOffset = selection.anchorOffset;
    const selectionEndOffset = selection.extentOffset;
    const selectionStartIndex = +selection.anchorNode.parentElement.getAttribute(
      'data-index'
    );
    const selectionEndIndex = +selection.extentNode.parentElement.getAttribute(
      'data-index'
    );

    const start =
      this.delta.ops[selectionStartIndex].prevLength + selection.anchorOffset;
    const end =
      this.delta.ops[selectionEndIndex].prevLength + selection.extentOffset;
    const startPos = Math.min(start, end);
    const endPos = Math.max(start, end);
    const startOffset = Math.min(selectionStartOffset, selectionEndOffset);
    const endOffset = Math.max(selectionStartOffset, selectionEndOffset);

    console.log({ startPos, endPos });
    return {
      startPos,
      endPos,
      startOffset,
      endOffset,
      selectionStartIndex,
      selectionStartOffset
    };
  }

  viewSelection() {
    console.log(window.getSelection());
  }

  setSelection(selectionStartIndex: number, selectionStartOffset: number) {
    const selection = window.getSelection();
    const selectionStartNode = (this.contentEditable
      .nativeElement as HTMLElement).children[selectionStartIndex].firstChild;

    console.log('setSelection', selectionStartNode, selectionStartOffset);
    selection.setPosition(selectionStartNode, selectionStartOffset);
  }

  formatChange() {
    const selection = this.getSelection();

    const changes = new Delta()
      .retain(selection.startPos)
      .retain(selection.endPos - selection.startPos, { bold: true });
    this.delta = this.delta.compose(changes);
  }

  contentChange(event: KeyboardEvent) {
    event.preventDefault();

    const input = event.key;
    const selection = this.getSelection();

    console.log('contentChange', input);

    let changes;

    if (input === 'Backspace') {
      changes = new Delta().retain(selection.startPos - 1).delete(1);
      selection.startOffset--;
    } else {
      changes = new Delta()
        .retain(selection.startPos)
        .insert(input)
        .delete(selection.endPos - selection.startPos);
      selection.startOffset++;
    }

    this.delta = this.delta.compose(changes);

    // TODO: use delta transformPosition with fake cursor instead of setting real cursor (error prone)
    setTimeout(() => {
      this.setSelection(selection.selectionStartIndex, selection.startOffset);
    });
  }

  ngOnInit() {
    this.serverService.getContent().subscribe(res => {
      this.content = res;
      this.delta = new Delta(res);
    });
  }
}

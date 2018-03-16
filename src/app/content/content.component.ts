import { Component, OnInit } from '@angular/core';

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
  private _delta: Delta;

  set delta(delta: Delta) {
    delta.reduce((total: number, op: DeltaOps) => {
      op.prevLength = total;
      return total + op.insert.length;
    }, 0);
    this._delta = delta;
  }

  get delta() {
    return this._delta;
  }

  constructor(private serverService: ServerService) {}

  getRange() {
    const selection = window.getSelection();
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

    console.log({ startPos, endPos });
    return { startPos, endPos };
  }

  formatChange() {
    const range = this.getRange();

    const changes = new Delta()
      .retain(range.startPos)
      .retain(range.endPos - range.startPos, { bold: true });
    this.delta = this.delta.compose(changes);
  }

  inputChange(pos: number, input: string) {
    let changes;

    if (input === 'Backspace') {
      changes = new Delta().retain(pos).delete(1);
    } else {
      changes = new Delta().retain(pos - 1).insert(input);
    }

    console.log('inputChange', pos, input);
    this.delta = this.delta.compose(changes);
  }

  ngOnInit() {
    this.serverService.getContent().subscribe(res => {
      this.content = res;
      this.delta = new Delta(res);
    });
  }
}

import { Component, OnInit } from '@angular/core';

import { ServerService } from '../shared/server.service';
import * as Delta from 'quill-delta';

interface DeltaOps {
  insert: string;
  attributes?: any;
  prevLength: number;
}

interface Delta {
  ops: DeltaOps[];
  compose: any;
  reduce: any;
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
    const selectionStartOffset = selection.anchorOffset;
    const selectionStartIndex = +selection.anchorNode.parentElement.getAttribute(
      'data-index'
    );
    const selectionEndOffset = selection.extentOffset;
    const selectionEndIndex = +selection.extentNode.parentElement.getAttribute(
      'data-index'
    );

    const startPos =
      this.delta.ops[selectionStartIndex].prevLength + selectionStartOffset;
    const endPos =
      this.delta.ops[selectionEndIndex].prevLength + selectionEndOffset;

    console.log('start pos', startPos);
    console.log('end pos', endPos);
    return { startPos, endPos };
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

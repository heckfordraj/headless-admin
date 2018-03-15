import { Component, OnInit } from '@angular/core';

import { ServerService } from '../shared/server.service';
import * as Delta from 'quill-delta';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  content: any;
  _delta: any;

  set delta(delta: any) {
    delta.reduce((total, op) => {
      op.length = total;
      return total + op.insert.length;
    }, 0);
    this._delta = delta;
  }

  get delta() {
    return this._delta;
  }

  constructor(private serverService: ServerService) {}

  testFormat() {
    const selection = window.getSelection();
    const selectionStartNode = selection.anchorNode.parentElement;
    const selectionEndNode = selection.extentNode.parentElement;

    console.log(selection);
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

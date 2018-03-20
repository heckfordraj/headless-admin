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

  ngOnInit() {
    this.editor = new Quill(this.editorEl.nativeElement);
    this.editor.on('text-change', this.textChange.bind(this));

    this.serverService.getContent().subscribe((textData: TextData) => {
      if (textData.user === this.user) return;

      this.editor.updateContents(new Delta(textData.ops));
    });
  }
}

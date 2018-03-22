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

  formats = [
    {
      title: 'Bold',
      name: 'bold'
    },
    {
      title: 'Italic',
      name: 'italic'
    }
  ];

  constructor(private serverService: ServerService) {}

  textChange(
    delta: Quill.DeltaStatic,
    oldDelta: Quill.DeltaStatic,
    source: string
  ) {
    if (source !== 'user') return;

    this.serverService.updateContent(this.user, delta.ops);
  }

  formatClick(name: string) {
    if (!name) return;

    const currentFormats = this.editor.getFormat();
    const hasNewFormat = currentFormats[name];

    this.editor.format(name, !hasNewFormat);
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

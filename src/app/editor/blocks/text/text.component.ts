import { Component, Input } from '@angular/core';

import { BlockInterface } from '../block.interface';
import { EditorComponent } from '../../editor.component';

@Component({
  selector: 'text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements BlockInterface {

  constructor(
    private editorComponent: EditorComponent
  ){ }

  @Input() block: any;

}

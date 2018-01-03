import { Component, Input } from '@angular/core';

import { BlockInterface } from '../block.interface';
import { EditorComponent } from '../../editor.component';

@Component({
  selector: 'image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements BlockInterface {

  constructor(
    private editorComponent: EditorComponent
  ){ }

  @Input() block: any;

}

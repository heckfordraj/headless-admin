import { Component, Input } from '@angular/core';

import { BlockInterface } from '../block.interface';
import { EditorComponent } from '../../editor.component';
import { Block } from '../../../shared/block';

@Component({
  selector: 'text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements BlockInterface {

  constructor(
    private editorComponent: EditorComponent
  ){ }

  private _block: any;

  @Input()
  set block(block: Block.Base) {

    this._block = new Block.text(block.id,
      block.data.map((data: Block.BaseData) =>
      new Block.textdata(data.text)
    ));
  }
  get block(): Block.Base { return this._block; }


  updateText(text: string) {

    let block = new Block.text(this.block.id, [ new Block.textdata(text) ]);
    this.editorComponent.updateBlock(block);
  }

}

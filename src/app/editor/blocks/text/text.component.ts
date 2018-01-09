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

  private _block: Block.Text;

  @Input()
  set block(block: Block.Base) {

    this._block = new Block.Text(block.id,
      block.data.map((data: Block.Data.Base) =>
      new Block.Data.TextData(data.text)
    ));
  }
  get block(): Block.Base { return this._block; }


  updateText(text: string) {

    let block = new Block.Text(this.block.id, [ new Block.Data.TextData(text) ]);
    this.editorComponent.updateBlock(block);
  }

}

import { Component, Input } from '@angular/core';

import { BlockInterface } from '../block.interface';
import { EditorComponent } from '../../editor.component';
import { Block } from '../../../shared/block';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements BlockInterface {
  constructor(private editorComponent: EditorComponent) {}

  private _block: Block.Text;

  @Input()
  set block(block: Block.Text) {
    this._block = {
      type: 'text',
      id: block.id,
      data: block.data.map((data: Block.Data.TextData) => {
        return { text: data.text };
      })
    };
  }
  get block() {
    return this._block;
  }

  updateText(text: string) {
    // const block = new Block.Text(this.block.id, [
    //   new Block.Data.TextData(text)
    // ]);
    // this.editorComponent.updateBlock(block);
  }
}

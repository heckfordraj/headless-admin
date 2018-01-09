import { Component, Input } from '@angular/core';

import { BlockInterface } from '../block.interface';
import { EditorComponent } from '../../editor.component';
import { Block } from '../../../shared/block';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements BlockInterface {
  constructor(private editorComponent: EditorComponent) {}

  private _block: Block.Image;

  @Input()
  set block(block: Block.Base) {
    this._block = new Block.Image(
      block.id,
      block.data.map(
        (data: Block.Data.ImageData) => new Block.Data.ImageData(data.url)
      )
    );
  }
  get block() {
    return this._block;
  }

  updateURL(url: string) {
    const block = new Block.Image(this.block.id, [
      new Block.Data.ImageData(url)
    ]);
    this.editorComponent.updateBlock(block);
  }
}

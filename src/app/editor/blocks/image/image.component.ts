import { Component, Input } from '@angular/core';

import { BlockInterface } from '../block.interface';
import { ServerService } from '../../../shared/server.service';
import { EditorComponent } from '../../editor.component';
import { Block } from '../../../shared/block';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements BlockInterface {
  constructor(
    private serverService: ServerService,
    private editorComponent: EditorComponent
  ) {}

  private _block: Block.Image;

  @Input()
  set block(block: Block.Image) {
    this._block = {
      type: 'image',
      id: block.id,
      data: block.data.map((data: Block.Data.ImageData) => {
        return {
          xs: data.xs,
          sm: data.sm,
          md: data.md,
          lg: data.lg
        };
      }),
      timestamp: block.timestamp
    };
  }
  get block() {
    return this._block;
  }

  addFile(files: FileList) {
    // this.serverService
    //   .addFile(files[0])
    //   .subscribe((res: Block.Data.ImageData) => {
    //     const block = new Block.Image(this.block.id, [
    //       new Block.Data.ImageData(res.xs, res.sm, res.md, res.lg)
    //     ]);
    //     this.editorComponent.updateBlock(block);
    //   });
  }
}

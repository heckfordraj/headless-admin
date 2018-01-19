import { Component, Input } from '@angular/core';

import { ServerService } from '../../../shared/server.service';
import { ImageService } from './image.service';
import { BlocksComponent } from '../blocks.component';
import { Block } from '../../../shared/block';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent {
  constructor(
    private serverService: ServerService,
    private imageService: ImageService,
    private blocksComponent: BlocksComponent
  ) {}

  private _block: Block.Image;

  @Input()
  set block(block: Block.Image) {
    this._block = {
      type: 'image',
      id: block.id,
      data: block.data || [],
      order: block.order
    };
  }
  get block() {
    return this._block;
  }

  addImage(files: FileList) {
    const id = this.serverService.createId();

    this.imageService.uploadImage(id, files[0]).subscribe(res => {
      const data: Block.Data.ImageData = {
        id: res.public_id,
        url: res.secure_url
      };

      this.blocksComponent.updateBlock(this.block.id, data);
    });
  }
}

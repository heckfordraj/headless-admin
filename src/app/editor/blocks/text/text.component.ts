import { Component, Input } from '@angular/core';

import { ServerService } from '../../../shared/server.service';
import { BlocksComponent } from '../blocks.component';
import { Block } from '../../../shared/block';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent {
  constructor(
    private serverService: ServerService,
    private blocksComponent: BlocksComponent
  ) {}

  private _block: Block.Text;

  @Input()
  set block(block: Block.Text) {
    this._block = {
      type: 'text',
      id: block.id,
      data: block.data || [],
      order: block.order
    };
  }
  get block() {
    return this._block;
  }

  addText(text: string) {
    const data: Block.Data.TextData = {
      id: this.serverService.createId(),
      text: text
    };

    this.blocksComponent.updateBlock(this.block.id, data);
  }
}

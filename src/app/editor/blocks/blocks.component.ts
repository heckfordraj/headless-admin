import { Component, OnChanges, SimpleChanges, Input } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { ServerService } from '../../shared/server.service';
import { Blocks, Block } from '../../shared/block';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss']
})
export class BlocksComponent implements OnChanges {
  @Input('dataId') id: string;

  blocks: {} = Blocks;
  blocks$: Observable<Block.Base[]>;

  constructor(private serverService: ServerService) {}

  updateBlock(blockId: string, data: Block.Data.Base) {
    this.serverService.updateBlock(this.id, blockId, data);
  }

  removeBlock(block: Block.Base) {
    this.serverService.removeBlock(this.id, block);
  }

  addBlock(base: Block.Base) {
    const block = { id: this.serverService.createId(), ...base };
    this.serverService.addBlock(this.id, block);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.id.currentValue) {
      this.blocks$ = this.serverService.getBlocks(this.id);
    }
  }
}

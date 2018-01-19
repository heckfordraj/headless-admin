import {
  Component,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  Input
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { ServerService } from '../../shared/server.service';
import { Blocks, Block } from '../../shared/block';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss']
})
export class BlocksComponent implements OnChanges, OnDestroy {
  @Input('dataId') id: string;

  baseBlocks: {} = Blocks;

  blocks$: Subscription;
  blocks: Block.Base[];

  constructor(private serverService: ServerService) {}

  orderBlock(index: number, direction: string) {
    let indexReplaced;

    switch (direction) {
      case 'up':
        indexReplaced = -1;
        break;

      case 'down':
        indexReplaced = 1;
        break;
    }

    const block = this.blocks[index];
    const blockReplaced = this.blocks[index + indexReplaced];

    if (blockReplaced) {
      const blockOrder = block.order;
      const blockReplacedOrder = blockReplaced.order;

      block.order = blockReplacedOrder;
      blockReplaced.order = blockOrder;

      this.serverService.orderBlock(this.id, block, blockReplaced);
    }
  }

  updateBlock(blockId: string, data: Block.Data.Base) {
    this.serverService.updateBlock(this.id, blockId, data);
  }

  removeBlock(block: Block.Base) {
    this.serverService.removeBlock(this.id, block);
  }

  addBlock(base: Block.Base) {
    const block = {
      id: this.serverService.createId(),
      order: (this.blocks.length || 0) + 1,
      ...base
    };
    this.serverService.addBlock(this.id, block);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.id.currentValue) {
      this.blocks$ = this.serverService
        .getBlocks(this.id)
        .subscribe((blocks: Block.Base[]) => (this.blocks = blocks));
    }
  }

  ngOnDestroy() {
    this.blocks$.unsubscribe();
  }
}

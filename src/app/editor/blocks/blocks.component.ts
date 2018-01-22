import {
  Component,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  Input
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { ServerService } from '../../shared/server.service';
import { Page } from '../../shared/page';
import { Blocks, Block } from '../../shared/block';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss']
})
export class BlocksComponent implements OnChanges, OnDestroy {
  @Input() page: Page;

  baseBlocks: {} = Blocks;

  blocks$: Subscription;
  blocks: Block.Base[] = [];

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

      this.serverService.orderBlock(this.page, block, blockReplaced);
    }
  }

  updateBlock(blockId: string, data: Block.Data.Base) {
    this.serverService.updateBlock(this.page, blockId, data);
  }

  removeBlock(block: Block.Base) {
    this.serverService.removeBlock(this.page, block);
  }

  addBlock(base: Block.Base) {
    const block = {
      id: this.serverService.createId(),
      order: this.blocks.length + 1,
      ...base
    };
    this.serverService.addBlock(this.page, block);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.page.currentValue) {
      this.blocks$ = this.serverService
        .getBlocks(this.page.dataId)
        .subscribe((blocks: Block.Base[]) => (this.blocks = blocks));
    }
  }

  ngOnDestroy() {
    this.blocks$.unsubscribe();
  }
}

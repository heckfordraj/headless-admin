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

  baseBlocks = Blocks;

  blocks$: Subscription;
  blocks: Block.Base[] = [];

  constructor(private serverService: ServerService) {}

  orderBlock(index: number, direction: number) {
    const block = this.blocks[index];
    const blockReplaced = this.blocks[index + direction];

    if (blockReplaced) {
      [block.order, blockReplaced.order] = [blockReplaced.order, block.order];

      this.serverService.orderBlock(this.page, block, blockReplaced);
    }
  }

  updateBlock(block: Block.Base, data: Block.Data.Base) {
    this.serverService.updateBlock(this.page, block, data);
  }

  removeBlock(block: Block.Base) {
    this.serverService.removeBlock(this.page, block);
  }

  addBlock(base: Block.Base) {
    const block: Block.Base = {
      id: this.serverService.createId(),
      order: this.blocks.length + 1,
      ...base
    };
    this.serverService.addBlock(this.page, block);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.page.currentValue) {
      this.blocks$ = this.serverService
        .getBlocks(this.page)
        .subscribe((blocks: Block.Base[]) => (this.blocks = blocks));
    }
  }

  ngOnDestroy() {
    if (this.blocks$) this.blocks$.unsubscribe();
  }
}

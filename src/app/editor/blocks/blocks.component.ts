import {
  Component,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  Input
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../../shared/logger.service';
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

  constructor(
    private logger: LoggerService,
    private serverService: ServerService
  ) {}

  trackBy(index, block) {
    return block.id;
  }

  orderBlock(index: number, direction: number) {
    const block = this.blocks[index];
    const blockReplaced = this.blocks[index + direction];

    if (blockReplaced) {
      [block.order, blockReplaced.order] = [blockReplaced.order, block.order];

      return this.serverService
        .orderBlock(this.page, block, blockReplaced)
        .then(_ =>
          this.logger.log(
            'orderBlock',
            `moved ${block.type} block ${direction === 1 ? 'down' : 'up'}`
          )
        )
        .catch(err => this.logger.error('orderBlock', err));
    }
  }

  removeBlock(block: Block.Base) {
    return this.serverService
      .removeBlock(this.page, block)
      .then(_ => this.logger.log('removeBlock', `removed ${block.type} block`))
      .catch(err => this.logger.error('removeBlock', err));
  }

  addBlock(base: Block.Base) {
    const block: Block.Base = {
      id: this.serverService.createId(),
      order: this.blocks.length + 1,
      ...base
    };
    return this.serverService
      .addBlock(this.page, block)
      .then(_ => this.logger.log('addBlock', `added ${block.type} block`))
      .catch(err => this.logger.error('addBlock', err));
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

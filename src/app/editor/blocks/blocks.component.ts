import { Component, OnDestroy, Input } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import {
  LoggerService,
  ServerService,
  Page,
  Blocks,
  Block,
  User,
  TextUserData
} from 'shared';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss']
})
export class BlocksComponent implements OnDestroy {
  private _page: Page;

  @Input()
  set page(page: Page) {
    if (!page) return;

    this._page = page;

    this.blocks$ = this.serverService
      .getBlocks(page)
      .subscribe((blocks: Block.Base[]) => (this.blocks = blocks));
  }
  get page(): Page {
    return this._page;
  }

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

  updateActiveBlock({ id }: Block.Base, data: TextUserData) {
    const userData: User = {
      id: null,
      colour: null,
      current: {
        blockId: id,
        data: data
      }
    };
    this.serverService.updateUser(this.page, userData);
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

  ngOnDestroy() {
    if (this.blocks$) this.blocks$.unsubscribe();
  }
}

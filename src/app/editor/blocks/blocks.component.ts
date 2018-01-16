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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.id.currentValue) {
      this.blocks$ = this.serverService.getBlocks(this.id);
    }
  }
}

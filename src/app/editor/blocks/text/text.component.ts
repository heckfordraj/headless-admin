import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../../../shared/logger.service';
import { ServerService } from '../../../shared/server.service';
import { Block } from '../../../shared/block';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit, OnDestroy {
  constructor(
    private logger: LoggerService,
    private serverService: ServerService
  ) {}

  @Input() block: Block.Text;

  text$: Subscription;
  text: Block.Data.TextData;

  addText(text: string) {
    const data: Block.Data.TextData = {
      id: this.serverService.createId(),
      text: text
    };

    this.serverService
      .updateBlockContent(this.block, data)
      .then(_ =>
        this.logger.log(
          'updateBlockContent',
          `updated ${this.block.type} block content`
        )
      );
  }

  ngOnInit() {
    this.text$ = this.serverService
      .getBlockContent(this.block)
      .subscribe((text: Block.Data.TextData) => (this.text = text));
  }

  ngOnDestroy() {
    this.text$.unsubscribe();
  }
}

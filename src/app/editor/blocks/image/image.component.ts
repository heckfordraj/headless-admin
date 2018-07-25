import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Subscription } from 'rxjs';

import { LoggerService, ServerService, Block } from 'shared';
import { ImageService } from './image.service';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit, OnDestroy {
  constructor(
    private logger: LoggerService,
    private serverService: ServerService,
    private imageService: ImageService
  ) {}

  @Input() block: Block.Base;

  image$: Subscription;
  image: Block.Data.ImageData;

  addImage(files: FileList) {
    this.imageService
      .uploadImage(files.item(0))
      .subscribe((data: Block.Data.ImageData) =>
        this.serverService
          .updateBlockContent(this.block, data)
          .then(_ =>
            this.logger.log(
              'updateBlockContent',
              `updated ${this.block.type} block content`
            )
          )
      );
  }

  ngOnInit() {
    this.image$ = this.serverService
      .getBlockContent(this.block)
      .subscribe((image: Block.Data.ImageData) => (this.image = image));
  }

  ngOnDestroy() {
    this.image$.unsubscribe();
  }
}

import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../../../shared/logger.service';
import { ServerService } from '../../../shared/server.service';
import { ImageService } from './image.service';
import { Block } from '../../../shared/block';

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
    const id = this.serverService.createId();

    this.imageService.uploadImage(id, files[0]).subscribe(res => {
      const data: Block.Data.ImageData = {
        id: res.public_id,
        url: res.secure_url
      };

      this.serverService
        .updateBlockContent(this.block, data)
        .then(_ =>
          this.logger.log(
            'updateBlockContent',
            `updated ${this.block.type} block content`
          )
        );
    });
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

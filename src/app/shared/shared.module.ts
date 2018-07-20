import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoggerService } from './logger.service';
import { ServerService } from './server.service';

import { SlugifyPipe } from './slugify.pipe';
import { HumanizePipe } from './humanize.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [SlugifyPipe, HumanizePipe],
  providers: [ServerService, LoggerService, SlugifyPipe, HumanizePipe]
})
export class SharedModule {}

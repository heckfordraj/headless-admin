import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlugifyPipe } from './slugify.pipe';
import { HumanizePipe } from './humanize.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [SlugifyPipe, HumanizePipe],
  providers: [SlugifyPipe, HumanizePipe]
})
export class SharedModule {}

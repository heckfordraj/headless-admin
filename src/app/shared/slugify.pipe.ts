import { Pipe, PipeTransform } from '@angular/core';

import { slugify } from 'underscore.string';

@Pipe({
  name: 'slugify'
})
export class SlugifyPipe implements PipeTransform {
  transform(val: string): string {
    return slugify(val);
  }
}

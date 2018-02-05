import { Pipe, PipeTransform } from '@angular/core';

import { humanize, titleize } from 'underscore.string';

@Pipe({
  name: 'humanize'
})
export class HumanizePipe implements PipeTransform {
  transform(val: string): string {
    return titleize(humanize(val));
  }
}

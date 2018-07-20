import { Pipe, PipeTransform } from '@angular/core';

export { SlugifyPipe } from 'shared';

@Pipe({
  name: 'slugify'
})
export class MockSlugifyPipe implements PipeTransform {
  transform(val: string): string {
    return `slugified: ${val}`;
  }
}

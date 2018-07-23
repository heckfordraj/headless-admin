import { Pipe, PipeTransform } from '@angular/core';

export { HumanizePipe } from 'shared';

@Pipe({
  name: 'humanize'
})
export class MockHumanizePipe implements PipeTransform {
  transform(val: string): string {
    return `humanized: ${val}`;
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unwrap'
})
export class UnwrapPipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return;

    return value.map(val => val.insert).join('');
  }
}

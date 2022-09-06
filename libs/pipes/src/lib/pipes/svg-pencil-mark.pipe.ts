import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'svgPencilMark',
  standalone: true,
})
export class SvgPencilMarkPipe implements PipeTransform {
  transform(numbersToHide: number[], numberToShow: number): boolean {
    return !numbersToHide.includes(numberToShow);
  }
}

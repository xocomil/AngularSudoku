import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'svgPencilMark',
  standalone: true,
})
export class SvgPencilMarkPipe implements PipeTransform {
  transform(numbersToDisplay: number[], numberToShow: number): boolean {
    return numbersToDisplay.includes(numberToShow);
  }
}

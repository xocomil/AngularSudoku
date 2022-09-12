import { Pipe, PipeTransform } from '@angular/core';
import { CellState, CellValue } from '@sud/domain';

@Pipe({
  name: 'numbersToHide',
  standalone: true,
})
export class NumbersToHidePipe implements PipeTransform {
  transform(cellState: CellState): CellValue[] {
    return [
      ...cellState.rowValuesToHide,
      ...cellState.regionValuesToHide,
      ...cellState.columnValuesToHide,
    ];
  }
}

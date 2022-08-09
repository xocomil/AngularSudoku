import { Pipe, PipeTransform } from '@angular/core';
import { CellState } from '@sud/domain';
import { FocusStates } from './models/focus-state';

@Pipe({
  name: 'gridCellSelect',
  standalone: true,
})
export class GridCellSelectPipe implements PipeTransform {
  transform(
    selected: readonly [number, number, number] | undefined,
    cellState: CellState
  ): FocusStates {
    if (selected) {
      const [row, col, region] = selected;

      if (cellState.column === col && cellState.row === row) return 'self';

      if (cellState.region === region) {
        if (cellState.row === row) return 'region-row';
        if (cellState.column === col) return 'region-col';

        return 'region';
      }
      if (cellState.column === col) return 'col';
      if (cellState.row === row) return 'row';
    }

    return '';
  }
}

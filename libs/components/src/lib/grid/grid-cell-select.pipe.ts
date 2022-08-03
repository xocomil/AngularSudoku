import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CellState } from '@sud/domain';
import { FocusStates } from './models/focus-state';

@Pipe({
  name: 'gridCellSelect',
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

@NgModule({
  declarations: [GridCellSelectPipe],
  exports: [GridCellSelectPipe],
})
export class GridCellSelectPipeModule {}

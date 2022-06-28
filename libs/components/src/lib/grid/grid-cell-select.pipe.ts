import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CellState, RegionCoordinate } from '@sud/domain';
import { FocusStates } from './models/focus-state';

@Pipe({
  name: 'gridCellSelect',
})
export class GridCellSelectPipe implements PipeTransform {
  transform(
    [row, col, region]: [number, number, RegionCoordinate],
    cellState: CellState
  ): FocusStates {
    if (cellState.column === col && cellState.row === row) return 'self';

    const { column: regionColumn, row: regionRow } = cellState.region;

    if (regionColumn === region.column && regionRow === region.row) {
      if (cellState.row === row) return 'region-row';
      if (cellState.column === col) return 'region-col';

      return 'region';
    }
    if (cellState.column === col) return 'col';
    if (cellState.row === row) return 'row';

    return '';
  }
}

@NgModule({
  declarations: [GridCellSelectPipe],
  exports: [GridCellSelectPipe],
})
export class GridCellSelectPipeModule {}

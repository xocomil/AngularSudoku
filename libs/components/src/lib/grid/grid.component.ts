import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule,
} from '@angular/core';
import { CellState, createCellState } from '@sud/domain';
import { CellComponentModule } from '../cell/cell.component';
import { GridCellSelectPipeModule } from './grid-cell-select.pipe';

const ITEMS_TO_TAKE = 3 as const;

@Component({
  selector: 'sud-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
  @Input() grid: CellState[][] = createGridState();

  selected: [number, number, number] = [-1, -1, -1];

  cellFocused(cellState: CellState): void {
    this.selected = [cellState.row, cellState.column, cellState.region];
  }

  #analyzeErrors(cellState: CellState): void {
    // const errorCoordinates = this.#getErrors();
    // Reset cell state
    // rowCells.forEach((cellState) => (cellState.valid = true));
    // columnCells.forEach((cellState) => (cellState.valid = true));
    // regionCells.forEach((cellState) => (cellState.valid = true));
    // Getting errors
    // const rowErrors = errorAnalyzer(rowCells);
    // const columnErrors = errorAnalyzer(columnCells);
    // const regionErrors = errorAnalyzer(regionCells);
    // Setting the error state of the cells
    // rowErrors.forEach((gridCoordinate) => this.#setErrorState(gridCoordinate));
    // columnErrors.forEach((gridCoordinate) =>
    //   this.#setErrorState(gridCoordinate)
    // );
    // regionErrors.forEach((gridCoordinate) =>
    //   this.#setErrorState(gridCoordinate)
    // );
  }

  // #getErrors(): RegionCoordinate[] {
  //   const rowErrors = this.#getRowErrors();
  // }
  //
  // #getRowErrors(): RegionCoordinate[] {
  //   const errors = Array.from({ length: 9 }, (_, index) =>
  //     errorAnalyzer(this.#getRowToAnalyze(index))
  //   );
  //
  //   return errors.flat();
  // }

  // #getCellsToAnalyze(
  //   cellState: CellState
  // ): Record<'rowCells' | 'columnCells' | 'regionCells', CellState[]> {
  //   const rowCells = this.#getRowToAnalyze(cellState.row);
  //   const columnCells = this.#getColumnToAnalyze(cellState.column);
  //   const regionCells = this.#getRegionToAnalyze(cellState.region);
  //
  //   return { rowCells, columnCells, regionCells };
  // }

  // #setErrorState(coordinates: RegionCoordinate): void {
  //   this.grid[coordinates.row][coordinates.column].valid = false;
  // }

  #getRowToAnalyze(row: number): CellState[] {
    return this.grid[row];
  }

  #getColumnToAnalyze(column: number): CellState[] {
    return this.grid.map((row) => row[column]);
  }

  // #getRegionToAnalyze(region: number): CellState[] {
  //   const rowStart = region.row * ITEMS_TO_TAKE;
  //   const columnStart = region.column * ITEMS_TO_TAKE;
  //
  //   const rows = this.grid.slice(rowStart, rowStart + ITEMS_TO_TAKE);
  //
  //   return rows
  //     .map((row) => row.slice(columnStart, columnStart + ITEMS_TO_TAKE))
  //     .flat();
  // }

  cellValueChanged(cellState: CellState): void {
    this.#analyzeErrors(cellState);
  }
}

@NgModule({
  imports: [CommonModule, CellComponentModule, GridCellSelectPipeModule],
  declarations: [GridComponent],
  exports: [GridComponent],
})
export class GridComponentModule {}

const calcGridRegion = (col: number, row: number): number => {
  const gridColumn = Math.trunc(col / 3);
  const gridRow = row - (row % 3);
  return gridColumn + gridRow;
};

const createGridState = (): CellState[][] => {
  return Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, value) =>
      createCellState({
        row,
        column: value,
        region: calcGridRegion(value, row),
      })
    )
  );
};

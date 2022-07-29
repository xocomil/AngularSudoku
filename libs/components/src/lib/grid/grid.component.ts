import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { PushModule } from '@ngrx/component';
import { CellState, GridDirection } from '@sud/domain';
import { errorAnalyzer } from '@sud/fast-analayzers';
import produce from 'immer';
import { CellComponent, CellComponentModule } from '../cell/cell.component';
import { GridCellSelectPipeModule } from './grid-cell-select.pipe';
import { GridStore } from './store/grid.store';

const ITEMS_TO_TAKE = 3 as const;

export function write<S>(updater: (state: S) => void): (state: S) => S {
  return function (state) {
    return produce(state, (draft) => {
      updater(draft as S);
    });
  };
}

@Component({
  selector: 'sud-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
  readonly grid$ = this._gridStore.grid$;

  selected: [number, number, number] = [-1, -1, -1];
  nextToFocus: [number, number, number] = [-1, -1, -1];

  constructor(private readonly _gridStore: GridStore) {}

  cellFocused(cellState: CellState): void {
    this.selected = [cellState.row, cellState.column, cellState.region];
    this.nextToFocus = [-1, -1, -1];
  }

  #analyzeErrors(): void {
    this.#resetCellErrors();

    for (let i = 0; i < 9; i++) {
      this.#checkRowForErrors(i);
      this.#checkColumnForErrors(i);
      this.#checkRegionForErrors(i);
    }
  }

  #resetCellErrors(): void {
    const makeCellValidTrue = write((draft: CellState) => {
      draft.valid = true;
    });

    this.grid.forEach((row) =>
      row.forEach((cellState) => {
        this.grid[cellState.row][cellState.column] =
          makeCellValidTrue(cellState);
      })
    );
  }

  #checkRowForErrors(row: number): void {
    this.#markCellsWithErrors(this.#getRowToAnalyze(row));
  }

  #getRowToAnalyze(row: number): CellState[] {
    return this.grid[row];
  }

  #checkColumnForErrors(column: number): void {
    this.#markCellsWithErrors(this.#getColumnToAnalyze(column));
  }

  #getColumnToAnalyze(column: number): CellState[] {
    return this.grid.map((row) => row[column]);
  }

  #checkRegionForErrors(region: number): void {
    this.#markCellsWithErrors(this.#getRegionToAnalyze(region));
  }

  #getRegionToAnalyze(region: number): CellState[] {
    const column = (region % 3) * 3;
    const row = region - (region % 3);

    const regionCells = [];

    for (let columnIndex = 0; columnIndex < ITEMS_TO_TAKE; columnIndex++) {
      for (let rowIndex = 0; rowIndex < ITEMS_TO_TAKE; rowIndex++) {
        regionCells.push(this.grid[row + rowIndex][column + columnIndex]);
      }
    }

    return regionCells;
  }

  #markCellsWithErrors(cells: CellState[]): void {
    const makeCellValidFalse = write((draft: CellState) => {
      draft.valid = false;
    });

    errorAnalyzer(cells).forEach((cellState) => {
      this.grid[cellState.row][cellState.column] =
        makeCellValidFalse(cellState);
    });
  }

  cellValueChanged(newValue: number, cellState: CellState): void {
    this.grid[cellState.row][cellState.column] = produce(cellState, (draft) => {
      draft.value = newValue;
    });

    this.#analyzeErrors();
  }

  cellNavigated(keyCode: GridDirection, cell: CellComponent): void {
    switch (keyCode) {
      case GridDirection.Up:
        if (cell.cellState.row > 0) {
          this.#navigateToCell(cell.cellState.column, cell.cellState.row - 1);
        }
        break;
      case GridDirection.Left:
        if (cell.cellState.column > 0) {
          this.#navigateToCell(cell.cellState.column - 1, cell.cellState.row);
        }
        break;
      case GridDirection.Down:
        if (cell.cellState.row < 8) {
          this.#navigateToCell(cell.cellState.column, cell.cellState.row + 1);
        }
        break;
      case GridDirection.Right:
        if (cell.cellState.column < 8) {
          this.#navigateToCell(cell.cellState.column + 1, cell.cellState.row);
        }
        break;
    }
  }

  #navigateToCell(column: number, row: number) {
    const nextToFocus = this.grid[row][column];

    this.nextToFocus = [
      nextToFocus.row,
      nextToFocus.column,
      nextToFocus.region,
    ];
  }

  rowTrackByFunction(_index: number, row: CellState[]): number {
    return row[0].row;
  }

  columnTrackByFunction(_index: number, cellState: CellState): number {
    return cellState.row * 10 + cellState.column;
  }

  cellBlurred(): void {
    this.selected = [-1, -1, -1];
  }
}

@NgModule({
  imports: [
    CommonModule,
    CellComponentModule,
    GridCellSelectPipeModule,
    PushModule,
  ],
  declarations: [GridComponent],
  exports: [GridComponent],
})
export class GridComponentModule {}

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule,
} from '@angular/core';
import { CellState, createCellState } from '@sud/domain';
import { errorAnalyzer } from '@sud/fast-analayzers';
import produce from 'immer';
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

  #analyzeErrors(): void {
    this.#resetCellErrors();

    for (let i = 0; i < 9; i++) {
      this.#checkRowForErrors(i);
      this.#checkColumnForErrors(i);
      this.#checkRegionForErrors(i);
    }
  }

  #resetCellErrors(): void {
    this.grid.forEach((row) =>
      row.forEach((cellState) => {
        this.grid[cellState.row][cellState.column] = produce(
          cellState,
          (draft) => {
            draft.valid = true;
          }
        );
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
    errorAnalyzer(cells).forEach((cellState) => {
      this.grid[cellState.row][cellState.column] = produce(
        cellState,
        (draft) => {
          draft.valid = false;
        }
      );
    });
  }

  cellValueChanged(cellState: CellState): void {
    this.grid[cellState.row][cellState.column] = cellState;

    this.#analyzeErrors();
  }

  cellNavigated(keyboardEvent: KeyboardEvent): void {
    console.log('grid cellNavigated', keyboardEvent);
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

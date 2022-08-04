import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { PushModule } from '@ngrx/component';
import { CellState, GridDirection } from '@sud/domain';
import { CellComponentModule } from '../cell/cell.component';
import { GridCellSelectPipeModule } from './grid-cell-select.pipe';
import { GridStore } from './store/grid.store';

const ITEMS_TO_TAKE = 3 as const;

@Component({
  selector: 'sud-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GridStore],
})
export class GridComponent {
  readonly grid$ = this._gridStore.grid$;
  readonly selected$ = this._gridStore.selected$;
  readonly nextToFocus$ = this._gridStore.nextToFocus$;

  constructor(private readonly _gridStore: GridStore) {}

  cellFocused(cellState: CellState): void {
    this._gridStore.updateSelected(cellState);
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
    // const makeCellValidTrue = write((draft: CellState) => {
    //   draft.valid = true;
    // });
    //
    // this.grid.forEach((row) =>
    //   row.forEach((cellState) => {
    //     this.grid[cellState.row][cellState.column] =
    //       makeCellValidTrue(cellState);
    //   })
    // );
  }

  #checkRowForErrors(row: number): void {
    this.#markCellsWithErrors(this.#getRowToAnalyze(row));
  }

  #getRowToAnalyze(row: number): CellState[] {
    return [];
    // return this.grid[row];
  }

  #checkColumnForErrors(column: number): void {
    this.#markCellsWithErrors(this.#getColumnToAnalyze(column));
  }

  #getColumnToAnalyze(column: number): CellState[] {
    return [];
    // return this.grid.map((row) => row[column]);
  }

  #checkRegionForErrors(region: number): void {
    this.#markCellsWithErrors(this.#getRegionToAnalyze(region));
  }

  #getRegionToAnalyze(region: number): CellState[] {
    return [];
    // const column = (region % 3) * 3;
    // const row = region - (region % 3);
    //
    // const regionCells = [];
    //
    // for (let columnIndex = 0; columnIndex < ITEMS_TO_TAKE; columnIndex++) {
    //   for (let rowIndex = 0; rowIndex < ITEMS_TO_TAKE; rowIndex++) {
    //     regionCells.push(this.grid[row + rowIndex][column + columnIndex]);
    //   }
    // }
    //
    // return regionCells;
  }

  #markCellsWithErrors(cells: CellState[]): void {
    // const makeCellValidFalse = write((draft: CellState) => {
    //   draft.valid = false;
    // });
    //
    // errorAnalyzer(cells).forEach((cellState) => {
    //   this.grid[cellState.row][cellState.column] =
    //     makeCellValidFalse(cellState);
    // });
  }

  cellValueChanged(newValue: number, cellState: CellState): void {
    this._gridStore.updateCellValue({ value: newValue, cellState });

    // this.#analyzeErrors();
  }

  cellNavigated(direction: GridDirection, cellState: CellState): void {
    this._gridStore.navigateToCell({ direction, cellState });
  }

  rowTrackByFunction(_index: number, row: CellState[]): number {
    return row[0].row;
  }

  columnTrackByFunction(_index: number, cellState: CellState): number {
    return cellState.row * 10 + cellState.column;
  }

  cellBlurred(): void {
    this._gridStore.resetSelected();
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

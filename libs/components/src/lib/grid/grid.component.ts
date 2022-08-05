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

  cellValueChanged(newValue: number | undefined, cellState: CellState): void {
    this._gridStore.cellValueChanged({ value: newValue, cellState });

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

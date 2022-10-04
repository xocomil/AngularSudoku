import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
} from '@angular/core';
import { PushModule } from '@ngrx/component';
import {
  CellState,
  CellValue,
  GridDirection,
  valueIsCellValue,
} from '@sud/domain';
import { logObservable } from '@sud/rxjs-operators';
import { CellComponent } from '../cell/cell.component';
import { GridCellSelectPipe } from '../grid/grid-cell-select.pipe';
import { GridStore } from './store/grid.store';

@Component({
  selector: 'sud-grid',
  standalone: true,
  imports: [CommonModule, CellComponent, GridCellSelectPipe, PushModule],
  template: `
    <ng-container
      *ngFor="
        let row of grid$ | ngrxPush;
        index as rowIndex;
        trackBy: rowTrackByFunction
      "
    >
      <sud-cell
        #cell
        *ngFor="
          let cellState of row;
          index as columnIndex;
          trackBy: columnTrackByFunction
        "
        [class]="['row-' + rowIndex, 'col-' + columnIndex, 'sudoku-cell']"
        [cellState]="cellState"
        [focusState]="selected$ | ngrxPush | gridCellSelect: cellState"
        [nextToFocus]="nextToFocus$ | ngrxPush"
        [creatingPuzzleMode]="creatingPuzzleMode"
        (cellFocusReceived)="cellFocused(cellState)"
        (cellBlurReceived)="cellBlurred()"
        (cellValueChanged)="cellValueChanged($event, cellState)"
        (cellNavigated)="cellNavigated($event, cellState)"
      >
      </sud-cell>
    </ng-container>
  `,
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GridStore],
})
export class GridComponent {
  readonly grid$ = this._gridStore.grid$;
  readonly selected$ = this._gridStore.selected$;
  readonly nextToFocus$ = this._gridStore.nextToFocus$;

  @Input() creatingPuzzleMode = false;

  @Output() gameWon = this._gridStore.gameWon$.pipe(
    logObservable<boolean>('game won:')
  );

  constructor(private readonly _gridStore: GridStore) {}

  setGridValues(values: CellValue[][]) {
    values.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        this._gridStore.cellValueChanged({
          value,
          row: rowIndex,
          column: columnIndex,
        });
      });
    });
  }

  cellFocused(cellState: CellState): void {
    this._gridStore.updateSelected(cellState);
  }

  cellValueChanged(newValue: number | undefined, cellState: CellState): void {
    // TODO: determine if the CellValue belongs in the CellComponent or here
    const valueToUse = valueIsCellValue(newValue) ? newValue : undefined;

    if (this.creatingPuzzleMode) {
      this.#createPuzzleCell(valueToUse, cellState);

      return;
    }

    this.#updateCellValue(valueToUse, cellState);
  }

  #updateCellValue(
    newValue: CellValue | undefined,
    cellState: CellState
  ): void {
    this._gridStore.cellValueChanged({
      value: newValue,
      row: cellState.row,
      column: cellState.column,
    });
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

  #createPuzzleCell(
    newValue: CellValue | undefined,
    cellState: CellState
  ): void {
    console.log('createPuzzleCell called');

    this._gridStore.createPuzzleCell({
      value: newValue,
      row: cellState.row,
      column: cellState.column,
    });
  }

  solveOneCell() {
    this._gridStore.solveOneCell();
  }
}

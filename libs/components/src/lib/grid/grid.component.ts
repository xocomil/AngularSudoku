import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Output } from '@angular/core';
import { PushPipe } from '@ngrx/component';
import { CellState, GridDirection, valueIsCellValue } from '@sud/domain';
import { logObservable } from '@sud/rxjs-operators';
import { CellComponent } from '../cell/cell.component';
import { GridCellSelectPipe } from './grid-cell-select.pipe';
import { GridStore } from './store/grid.store';

@Component({
  selector: 'sud-grid',
  standalone: true,
  imports: [CommonModule, CellComponent, GridCellSelectPipe, PushPipe],
  template: `
    <ng-container *ngFor="let row of grid$ | ngrxPush; index as rowIndex; trackBy: rowTrackByFunction">
      <sud-cell
        *ngFor="let cellState of row; index as columnIndex; trackBy: columnTrackByFunction"
        [class]="['row-' + rowIndex, 'col-' + columnIndex, 'sudoku-cell']"
        [cellState]="cellState"
        [focusState]="selected$ | ngrxPush | gridCellSelect: cellState"
        [nextToFocus]="nextToFocus$ | ngrxPush"
        [creatingPuzzleMode]="creatingPuzzleMode$ | ngrxPush"
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
})
export class GridComponent {
  readonly #gridStore = inject(GridStore);

  readonly grid$ = this.#gridStore.grid$;
  readonly selected$ = this.#gridStore.selected$;
  readonly nextToFocus$ = this.#gridStore.nextToFocus$;
  readonly creatingPuzzleMode$ = this.#gridStore.creatingPuzzleMode$;

  @Output() gameWon = this.#gridStore.gameWon$.pipe(logObservable<boolean>('game won:'));

  cellFocused(cellState: CellState): void {
    this.#gridStore.updateSelected(cellState);
  }

  cellValueChanged(newValue: number | undefined, cellState: CellState): void {
    const valueToUse = valueIsCellValue(newValue) ? newValue : undefined;

    this.#gridStore.cellValueChanged({
      value: valueToUse,
      row: cellState.row,
      column: cellState.column,
    });
  }

  cellNavigated(direction: GridDirection, cellState: CellState): void {
    this.#gridStore.navigateToCell({ direction, cellState });
  }

  rowTrackByFunction(_index: number, row: CellState[]): number {
    return row[0].row;
  }

  columnTrackByFunction(_index: number, cellState: CellState): number {
    return cellState.row * 10 + cellState.column;
  }

  cellBlurred(): void {
    this.#gridStore.resetSelected();
  }
}

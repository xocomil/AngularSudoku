import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PushModule } from '@ngrx/component';
import { CellState, GridDirection } from '@sud/domain';
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

  constructor(private readonly _gridStore: GridStore) {}

  cellFocused(cellState: CellState): void {
    this._gridStore.updateSelected(cellState);
  }

  cellValueChanged(newValue: number | undefined, cellState: CellState): void {
    this._gridStore.cellValueChanged({ value: newValue, cellState });
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

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CellState, GridDirection, valueIsCellValue } from '@sud/domain';
import { CellComponent } from '../cell/cell.component';
import { GridCellSelectPipe } from './grid-cell-select.pipe';
import { GridStore } from './store/grid.store';

@Component({
  selector: 'sud-grid',
  standalone: true,
  imports: [CellComponent, GridCellSelectPipe],
  template: `
    @for (
      row of gridStore.grid();
      track rowTrackByFunction(rowIndex, row);
      let rowIndex = $index
    ) {
      @for (
        cellState of row;
        track columnTrackByFunction(columnIndex, cellState);
        let columnIndex = $index
      ) {
        <!-- TODO: change gridCellSelect from a pipe to a computed signal-->
        @defer {
          <sud-cell
            [class]="['row-' + rowIndex, 'col-' + columnIndex, 'sudoku-cell']"
            [cellState]="cellState"
            [focusState]="gridStore.selected() | gridCellSelect: cellState"
            [nextToFocus]="gridStore.nextToFocus()"
            [creatingPuzzleMode]="gridStore.creatingPuzzleMode()"
            (cellFocusReceived)="cellFocused(cellState)"
            (cellBlurReceived)="cellBlurred()"
            (cellValueChanged)="cellValueChanged($event, cellState)"
            (cellNavigated)="cellNavigated($event, cellState)"
          />
        }
      }
    }
  `,
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
  protected readonly gridStore = inject(GridStore);

  cellFocused(cellState: CellState): void {
    this.gridStore.updateSelected(cellState);
  }

  cellValueChanged(newValue: number | undefined, cellState: CellState): void {
    const valueToUse = valueIsCellValue(newValue) ? newValue : undefined;

    this.gridStore.cellValueChanged({
      value: valueToUse,
      row: cellState.row,
      column: cellState.column,
    });
  }

  cellNavigated(direction: GridDirection, cellState: CellState): void {
    this.gridStore.navigateToCell({ direction, cellState });
  }

  rowTrackByFunction(_index: number, row: CellState[]): number {
    return row[0].row;
  }

  columnTrackByFunction(_index: number, cellState: CellState): number {
    return cellState.row * 10 + cellState.column;
  }

  cellBlurred(): void {
    this.gridStore.resetSelected();
  }
}

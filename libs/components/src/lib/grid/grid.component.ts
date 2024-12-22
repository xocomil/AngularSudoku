import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CellState, GridDirection } from '@sud/domain';
import { CellComponent } from '../cell/cell.component';
import { GridCellSelectPipe } from './grid-cell-select.pipe';
import { GridStore } from './store/grid.store';

@Component({
  selector: 'sud-grid',
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

  protected cellFocused(cellState: CellState): void {
    this.gridStore.updateSelected(cellState);
  }

  protected cellValueChanged(
    newValue: number | undefined,
    cellState: CellState,
  ): void {
    this.gridStore.setCellValue(newValue, cellState);
  }

  protected cellNavigated(
    direction: GridDirection,
    cellState: CellState,
  ): void {
    this.gridStore.navigateToCell({ direction, cellState });
  }

  protected rowTrackByFunction(_index: number, row: CellState[]): number {
    return row[0].row;
  }

  protected columnTrackByFunction(
    _index: number,
    cellState: CellState,
  ): number {
    return cellState.row * 10 + cellState.column;
  }

  protected cellBlurred(): void {
    this.gridStore.resetSelected();
  }
}

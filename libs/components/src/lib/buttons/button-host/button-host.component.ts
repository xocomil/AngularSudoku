import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { CellValue } from '@sud/domain';
import { GridStore } from '../../grid/store/grid.store';

@Component({
    selector: 'sud-button-host',
    imports: [],
    template: `
    <ul>
      <li>
        <button
          (click)="toggleCreatePuzzleMode()"
          type="button"
          data-cy="create-puzzle"
        >
          {{ toggleButtonText() }} Create Puzzle Mode
        </button>
      </li>
      <li><button (click)="resetGrid()" type="button">Reset</button></li>
      <li>
        <button (click)="generateWinningGrid()" type="button">
          Add Winning Grid
        </button>
      </li>
      <li>
        <button (click)="generateProblemGrid()" type="button">
          Add Problem Grid
        </button>
      </li>
      <li>
        <button (click)="solveOneCell()" type="button">Solve 1 Cell</button>
      </li>
      <li><button (click)="undo()" type="button">Undo</button></li>
      <li><button (click)="redo()" type="button">Redo</button></li>
    </ul>
  `,
    styleUrls: ['./button-host.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonHostComponent {
  readonly #gridStore = inject(GridStore);

  readonly toggleButtonText = computed(() =>
    this.#gridStore.creatingPuzzleMode() ? 'End' : 'Start',
  );

  toggleCreatePuzzleMode(): void {
    this.#gridStore.toggleCreatePuzzleMode();
  }

  protected generateWinningGrid(): void {
    this.#setGridValues([
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [3, 1, 2, 6, 4, 5, 9, 7, 8],
      [9, 7, 8, 3, 1, 2, 6, 4, 5],
      [6, 4, 5, 9, 7, 8, 3, 1, 2],
      [2, 3, 1, 5, 6, 4, 8, 9, 7],
      [8, 9, 7, 2, 3, 1, 5, 6, 4],
      [5, 6, 4, 8, 9, 7, 2, 3, 1],
    ]);
  }

  protected generateGridWithErrors(): void {
    this.#setGridValues([
      [2, 2, 3, 4, 5, 6, 7, 8, 9],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [3, 1, 2, 6, 4, 5, 9, 7, 8],
      [9, 7, 8, 3, 1, 2, 6, 4, 5],
      [6, 4, 5, 9, 7, 8, 3, 1, 2],
      [2, 3, 1, 5, 6, 4, 8, 9, 7],
      [8, 9, 7, 2, 3, 1, 5, 6, 4],
      [5, 6, 4, 8, 9, 7, 2, 3, 1],
    ]);
  }

  protected generateProblemGrid(): void {
    // eslint-disable-next-line no-sparse-arrays
    this.#setGridValues([
      [],
      [],
      [],
      [],
      [],
      [],
      [2, 5, 4, 6, 8, 7, 1, 3, 9],
      // eslint-disable-next-line no-sparse-arrays
      [, 9, 1, , , , 5, 7, 6],
      // eslint-disable-next-line no-sparse-arrays
      [, , , , , , 8, 4, 2],
    ]);
  }

  protected solveOneCell(): void {
    this.#gridStore.solveOneCell();
  }

  protected resetGrid(): void {
    this.#gridStore.resetGrid();
  }

  protected undo(): void {
    this.#gridStore.undo();
  }

  protected redo(): void {
    this.#gridStore.redo();
  }

  #setGridValues(values: (CellValue | undefined)[][]) {
    values.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        this.#gridStore.cellValueChanged({
          value,
          row: rowIndex,
          column: columnIndex,
        });
      });
    });
  }
}

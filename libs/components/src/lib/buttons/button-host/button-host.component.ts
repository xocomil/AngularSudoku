
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PushPipe } from '@ngrx/component';
import { CellValue } from '@sud/domain';
import { map } from 'rxjs';
import { GridStore } from '../../grid/store/grid.store';

@Component({
  selector: 'sud-button-host',
  standalone: true,
  imports: [PushPipe],
  template: `
    <ul>
      <li>
        <button type="button" data-cy="create-puzzle" (click)="toggleCreatePuzzleMode()">
          {{ toggleButtonText$ | ngrxPush }} Create Puzzle Mode
        </button>
      </li>
      <li><button type="button" (click)="resetGrid()">Reset</button></li>
      <li><button type="button" (click)="generateWinningGrid()">Add Winning Grid</button></li>
      <li><button type="button" (click)="generateProblemGrid()">Add Problem Grid</button></li>
      <li><button type="button" (click)="solveOneCell()">Solve 1 Cell</button></li>
      <li><button type="button" (click)="undo()">Undo</button></li>
      <li><button type="button" (click)="redo()">Redo</button></li>
    </ul>
  `,
  styleUrls: ['./button-host.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonHostComponent {
  readonly #gridStore = inject(GridStore);

  readonly toggleButtonText$ = this.#gridStore.creatingPuzzleMode$.pipe(
    map((creatingPuzzleMode) => (creatingPuzzleMode ? 'End' : 'Start'))
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
    this.#setGridValues([[], [], [], [], [], [], [2, 5, 4, 6, 8, 7, 1, 3, 9], [, 9, 1, , , , 5, 7, 6], [, , , , , , 8, 4, 2]]);
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

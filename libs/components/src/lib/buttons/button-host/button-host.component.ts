import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PushModule } from '@ngrx/component';
import { CellValue } from '@sud/domain';
import { map } from 'rxjs';
import { GridStore } from '../../grid/store/grid.store';

@Component({
  selector: 'sud-button-host',
  standalone: true,
  imports: [CommonModule, PushModule],
  template: `
    <button type="button" (click)="toggleCreatePuzzleMode()">{{ toggleButtonText$ | ngrxPush }} Create Puzzle Mode</button>
    <button type="button" (click)="resetGrid()">Reset</button>
    <button type="button" (click)="generateWinningGrid()">Add Winning Grid</button>
    <button type="button" (click)="generateProblemGrid()">Add Problem Grid</button>
    <button type="button" (click)="solveOneCell()">Solve 1 Cell</button>
    <button type="button" (click)="undo()">Undo</button>
    <button type="button" (click)="redo()">Redo</button>
  `,
  styleUrls: ['./button-host.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonHostComponent {
  readonly toggleButtonText$ = this._gridStore.creatingPuzzleMode$.pipe(
    map((creatingPuzzleMode) => (creatingPuzzleMode ? 'End' : 'Start'))
  );

  constructor(private _gridStore: GridStore) {}

  toggleCreatePuzzleMode(): void {
    this._gridStore.toggleCreatePuzzleMode();
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
    this._gridStore.solveOneCell();
  }

  protected resetGrid(): void {
    this._gridStore.resetGrid();
  }

  protected undo(): void {
    this._gridStore.undo();
  }

  protected redo(): void {
    this._gridStore.redo();
  }

  #setGridValues(values: (CellValue | undefined)[][]) {
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
}

import { computed } from '@angular/core';
import {
  signalStore,
  withComputed,
  withHooks,
  withMethods,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CellState } from '@sud/domain';
import { pipe, tap } from 'rxjs';
import { withManageSelected } from './grid-manage-selected.feature';
import { withGrid } from './grid.feature';
import { withUndoRedo } from './grid.undo-redo.feature';
import { withPuzzleMode } from './puzzle-mode.feature';

export const GridStore = signalStore(
  withGrid(),
  withManageSelected(),
  withPuzzleMode(),
  withUndoRedo(),
  withComputed((state) => ({
    rotatedGrid: computed(() =>
      state.grid().reduce((rotatedGrid, row) => {
        row.forEach((cell) => {
          rotatedGrid[cell.column][cell.row] = cell;
        });

        return rotatedGrid;
      }, [] as CellState[][]),
    ),
  })),
  withComputed((state) => ({
    rows: computed(() => state.grid().map((row) => row)),
    columns: computed(() => state.rotatedGrid().map((column) => column)),
  })),
  withMethods((state) => ({
    _watchCellValueChanges: rxMethod<[row: number, column: number]>(
      pipe(
        tap(([row, column]) => {
          const updatedRow = state.rows()[row];
          const updatedColumn = state.columns()[column];

          // update pencil marks for row and column
        }),
      ),
    ),
  })),
  withHooks((state) => ({
    onInit() {
      state._watchCellValueChanges(state.lastCellUpdated$());
    },
  })),
);

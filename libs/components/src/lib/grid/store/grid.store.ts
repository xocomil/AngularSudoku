import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CellState, CellValue } from '@sud/domain';
import * as R from 'ramda';
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
    regions: computed(() => {
      const ITEMS_TO_TAKE = 3 as const;
      const grid = state.grid();
      return Array.from({ length: 9 }).map((_, region) => {
        const column = (region % ITEMS_TO_TAKE) * ITEMS_TO_TAKE;
        const row = region - (region % ITEMS_TO_TAKE);

        const regionCells = [];

        for (let rowIndex = 0; rowIndex < ITEMS_TO_TAKE; rowIndex++) {
          for (
            let columnIndex = 0;
            columnIndex < ITEMS_TO_TAKE;
            columnIndex++
          ) {
            regionCells.push(grid[row + rowIndex][column + columnIndex]);
          }
        }

        return regionCells;
      });
    }),
  })),
  withComputed((state) => ({
    rows: computed(() => state.grid().map((row) => row)),
    columns: computed(() => state.rotatedGrid().map((column) => column)),
    regions: computed(() => state.regions().map((region) => region)),
  })),
  withMethods((state) => ({
    _setRowPencilMarks(row: CellState[]) {
      const cellValuesToHide = getCellValuesToHide(row);

      const grid = state.grid();
      mapRowValuesToHide(row, cellValuesToHide);

      grid[row[0].row] = row;

      patchState(state, { grid });
    },
    _setUpdatedColumnPencilMarks(column: CellState[]) {
      const cellValuesToHide = getCellValuesToHide(column);

      const grid = state.grid();
      column.forEach((cell) => {
        cell.columnValuesToHide = cellValuesToHide;

        grid[cell.row][cell.column] = cell;
      });
    },
    _setUpdatedRegionPencilMarks(region: CellState[]) {
      const cellValuesToHide = getCellValuesToHide(region);

      const grid = state.grid();
      region.forEach((cell) => {
        cell.regionValuesToHide = cellValuesToHide;

        grid[cell.row][cell.column] = cell;
      });
    },
  })),
  withMethods((state) => ({
    _watchCellValueChanges: rxMethod<[row: number, column: number]>(
      pipe(
        tap(([row, column]) => {
          const updatedRow = state.rows()[row];
          const updatedColumn = state.columns()[column];
          const updatedRegion =
            state.regions()[state.grid()[row][column].region];

          state._setRowPencilMarks(updatedRow);
          state._setUpdatedColumnPencilMarks(updatedColumn);
          state._setUpdatedRegionPencilMarks(updatedRegion);
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

function getCellValuesToHide(row: CellState[]): CellValue[] {
  // TODO: convert to for loop and remove ramda
  return R.pipe(
    R.filter((x: CellState) => R.isNotNil(x.value)),
    R.map((x: { value: CellValue }) => x.value),
    R.uniq,
  )(row);
}

function mapRowValuesToHide(
  row: CellState[],
  cellValuesToHide: CellValue[],
): void {
  row.map((cell) => ({
    ...cell,
    rowValuesToHide: cellValuesToHide,
  }));
}

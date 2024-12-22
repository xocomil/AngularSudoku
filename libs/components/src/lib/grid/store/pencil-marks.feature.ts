import { Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  type,
  withHooks,
  withMethods,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CellState, CellValue } from '@sud/domain';
import * as R from 'ramda';
import { pipe, tap } from 'rxjs';
import { GridState } from './grid.state';

export function withPencilMarks<_>() {
  return signalStoreFeature(
    type<{
      state: GridState;
      props: {
        rows: Signal<CellState[][]>;
        columns: Signal<CellState[][]>;
        regions: Signal<CellState[][]>;
      };
    }>(),

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
}

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

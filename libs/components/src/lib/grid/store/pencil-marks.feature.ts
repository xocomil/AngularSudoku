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
import { create } from 'mutative';
import * as R from 'ramda';
import { pipe, Subject, tap } from 'rxjs';
import { GridState, LastCellUpdatedValues } from './grid.state';

export function withPencilMarks<_>() {
  return signalStoreFeature(
    type<{
      state: GridState;
      props: {
        rows: Signal<CellState[][]>;
        columns: Signal<CellState[][]>;
        regions: Signal<CellState[][]>;
        lastCellUpdated$: Subject<LastCellUpdatedValues>;
      };
    }>(),

    withMethods((state) => ({
      _setRowPencilMarks(row: CellState[]) {
        const cellValuesToHide = getCellValuesToHide(row);
        console.log('_setRowPencilMarks', cellValuesToHide);

        const grid = state.grid();
        const changedRow = mapRowValuesToHide(row, cellValuesToHide);

        const changedGrid = create(grid, (draft) => {
          draft[row[0].row] = changedRow;
        });

        patchState(state, { grid: changedGrid });
      },
      _setUpdatedColumnPencilMarks(column: CellState[]) {
        const cellValuesToHide = getCellValuesToHide(column);

        const grid = state.grid();

        const changedGrid = create(grid, (draft) => {
          column.forEach((cell) => {
            const changedCell = create(cell, (cellDraft) => {
              cellDraft.columnValuesToHide = cellValuesToHide;
            });

            draft[cell.row][cell.column] = changedCell;
          });
        });

        patchState(state, { grid: changedGrid });
      },
      _setUpdatedRegionPencilMarks(region: CellState[]) {
        const cellValuesToHide = getCellValuesToHide(region);

        const grid = state.grid();

        const changedGrid = create(grid, (draft) => {
          region.forEach((cell) => {
            const changedCell = create(cell, (cellDraft) => {
              cellDraft.regionValuesToHide = cellValuesToHide;
            });

            draft[cell.row][cell.column] = changedCell;
          });
        });

        patchState(state, { grid: changedGrid });
      },
    })),
    withMethods((state) => ({
      _pencilMarksWatchCellValueChanges: rxMethod<LastCellUpdatedValues>(
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
        state._pencilMarksWatchCellValueChanges(state.lastCellUpdated$);
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
): CellState[] {
  return row.map((cell) => ({
    ...cell,
    rowValuesToHide: cellValuesToHide,
  }));
}

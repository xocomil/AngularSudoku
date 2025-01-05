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
      _setRowPencilMarks(row: number) {
        const updatedRow = state.rows()[row];
        const cellValuesToHide = getCellValuesToHide(updatedRow);
        console.log('_setRowPencilMarks', cellValuesToHide);

        const grid = state.grid();
        const changedRow = mapRowValuesToHide(updatedRow, cellValuesToHide);

        const changedGrid = create(grid, (draft) => {
          draft[updatedRow[0].row] = changedRow;
        });

        patchState(state, { grid: changedGrid });
      },
      _setUpdatedColumnPencilMarks(column: number) {
        const updatedColumn = state.columns()[column];
        const cellValuesToHide = getCellValuesToHide(updatedColumn);

        const grid = state.grid();

        const changedGrid = create(grid, (draft) => {
          updatedColumn.forEach((cell) => {
            const changedCell = create(cell, (cellDraft) => {
              cellDraft.columnValuesToHide = cellValuesToHide;
            });

            draft[cell.row][cell.column] = changedCell;
          });
        });

        patchState(state, { grid: changedGrid });
      },
      _setUpdatedRegionPencilMarks(row: number, column: number) {
        const updatedRegion = state.regions()[state.grid()[row][column].region];

        const cellValuesToHide = getCellValuesToHide(updatedRegion);

        const grid = state.grid();

        const changedGrid = create(grid, (draft) => {
          updatedRegion.forEach((cell) => {
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
            state._setRowPencilMarks(row);
            state._setUpdatedColumnPencilMarks(column);
            state._setUpdatedRegionPencilMarks(row, column);
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

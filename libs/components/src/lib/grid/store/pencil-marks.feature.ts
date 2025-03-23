import { Signal } from '@angular/core';
import {
  signalStoreFeature,
  type,
  withHooks,
  withMethods,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CellState, CellValue } from '@sud/domain';
import { create } from 'mutative';
import { pipe, Subject, tap } from 'rxjs';
import { GridResourceState } from './grid-resource.feature.ng';
import { LastCellUpdatedValues } from './grid.state';

export function withPencilMarks<_>() {
  return signalStoreFeature(
    type<{
      state: GridResourceState;
      props: {
        rows: Signal<CellState[][]>;
        columns: Signal<CellState[][]>;
        regions: Signal<CellState[][]>;
        lastCellUpdated$: Subject<LastCellUpdatedValues>;
        grid: Signal<CellState[][]>;
      };
      methods: {
        _updateRow(row: number, values: CellState[]): void;
        _updateColumn(updatedColumn: CellState[]): void;
        _updateRegion(updatedRegion: CellState[]): void;
      };
    }>(),

    withMethods((state) => ({
      _setRowPencilMarks(row: number) {
        const updatedRow = state.rows()[row];
        const cellValuesToHide = getCellValuesToHide(updatedRow);
        console.log('_setRowPencilMarks', cellValuesToHide);

        const changedRow = mapRowValuesToHide(updatedRow, cellValuesToHide);

        state._updateRow(row, changedRow);
      },
      _setUpdatedColumnPencilMarks(column: number) {
        const curColumn = state.columns()[column];
        const cellValuesToHide = getCellValuesToHide(curColumn);

        const changedColumn = create(curColumn, (draft) => {
          draft.forEach((cell) => {
            cell.columnValuesToHide = cellValuesToHide;
          });
        });

        state._updateColumn(changedColumn);
      },
      _setUpdatedRegionPencilMarks(row: number, column: number) {
        const region = state.regions()[state.grid()[row][column].region];

        const cellValuesToHide = getCellValuesToHide(region);

        const updatedRegion = create(region, (draft) => {
          draft.forEach((cell) => {
            cell.regionValuesToHide = cellValuesToHide;
          });
        });

        state._updateRegion(updatedRegion);
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
  return row.reduce((uniqueValues, cell) => {
    if (cell.value != undefined) {
      if (!uniqueValues.includes(cell.value)) {
        uniqueValues.push(cell.value);
      }
    }
    return uniqueValues;
  }, [] as CellValue[]);
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

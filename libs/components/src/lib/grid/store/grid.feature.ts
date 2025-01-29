import {
  patchState,
  signalStoreFeature,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { CellState, CellValue, valueIsCellValue } from '@sud/domain';
import { create } from 'mutative';
import { Subject } from 'rxjs';
import { withGridComputed } from './grid.computed.feature';
import { initialState, LastCellUpdatedValues } from './grid.state';

export function withGrid<_>() {
  return signalStoreFeature(
    withState(initialState()),
    withProps(() => ({
      lastCellUpdated$: new Subject<LastCellUpdatedValues>(),
    })),
    withGridComputed(),
    withMethods(({ lastCellUpdated$ }) => ({
      _cellUpdated(
        row: number,
        column: number,
        previousValue: CellValue | undefined,
      ) {
        lastCellUpdated$.next([row, column, previousValue]);
      },
    })),
    withMethods((state) => ({
      _updateCellValue({
        value,
        row,
        column,
        isReadonly = false,
      }: {
        value?: CellValue;
        row: number;
        column: number;
        isReadonly?: boolean;
      }) {
        const previousValue = state.grid()[row][column].value;

        patchState(state, {
          grid: updateGrid(state.grid(), row, column, value, isReadonly),
        });

        state._cellUpdated(row, column, previousValue);
      },
      _updateGridHasError(hasError: boolean) {
        patchState(state, { hasError });
      },
    })),
    withMethods((state) => ({
      setGridValues(values: Readonly<Readonly<(CellValue | undefined)[]>[]>) {
        values.forEach((row, rowIndex) => {
          row.forEach((value, columnIndex) => {
            state._updateCellValue({
              value,
              row: rowIndex,
              column: columnIndex,
              isReadonly: state.creatingPuzzleMode(),
            });
          });
        });
      },
      setCellValue(newValue: number | undefined, cellState: CellState) {
        const valueToUse = valueIsCellValue(newValue) ? newValue : undefined;

        state._updateCellValue({
          value: valueToUse,
          row: cellState.row,
          column: cellState.column,
          isReadonly: state.creatingPuzzleMode(),
        });
      },
    })),
  );
}

function updateGrid(
  grid: CellState[][],
  row: number,
  column: number,
  value?: CellValue,
  isReadonly = false,
) {
  return create(grid, (draft) => {
    draft[row][column].value = value;
    draft[row][column].isReadonly = isReadonly;
  });
}

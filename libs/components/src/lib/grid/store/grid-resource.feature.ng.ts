import { computed, signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { CellState, CellValue, valueIsCellValue } from '@sud/domain';
import { Subject } from 'rxjs';
import {
  createGridResource,
  GridCommands,
  noGridCommand, setGridValuesCommand,
  updateGridCellCommand
} from '../resources/grid.resource.ng';
import { GridState, LastCellUpdatedValues } from './grid.state';

export const initialState = (): Omit<GridState, 'grid'> => ({
  creatingPuzzleMode: false,
  hasError: false,
  _selected: undefined,
  _nextToFocus: undefined,
});

export function withGridResource<_>() {
  return signalStoreFeature(
    withState(initialState()),
    withProps(() => ({
      _gridCommands: signal<GridCommands>(noGridCommand()),
    })),
    withProps((state) => ({
      lastCellUpdated$: new Subject<LastCellUpdatedValues>(),
      _gridResource: createGridResource({
        gridCommandsMap: state._gridCommands,
      }),
    })),
    withComputed((state) => ({
      grid: computed(() => state._gridResource.value()),
    })),
    // withGridComputed(),
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

        state._gridCommands.set(
          updateGridCellCommand(row, column, value, isReadonly),
        );

        state._cellUpdated(row, column, previousValue);
      },
      _updateGridHasError(hasError: boolean) {
        patchState(state, { hasError });
      },
    })),
    withMethods((state) => ({
      setGridValues(values: Readonly<Readonly<(CellValue | undefined)[]>[]>) {
        state._gridCommands.set(setGridValuesCommand(values));
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

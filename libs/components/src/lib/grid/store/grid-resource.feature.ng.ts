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
  noGridCommand,
  resetGridCommand,
  setGridValuesCommand,
  updateGridCellCommand,
  updateGridColumnCommand,
  updateGridRegionCommand,
  updateGridRowCommand,
} from '../resources/grid.resource.ng';
import { withGridComputed } from './grid.computed.feature';
import { GridState, LastCellUpdatedValues } from './grid.state';

export type GridResourceState = Omit<GridState, 'grid'>;

export const initialState = (): GridResourceState => ({
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
      _resetGrid() {
        state._gridCommands.set(resetGridCommand());
      },
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
      _updateRow(row: number, values: CellState[]) {
        state._gridCommands.set(updateGridRowCommand(row, values));
      },
      _updateColumn(updatedColumn: CellState[]) {
        state._gridCommands.set(updateGridColumnCommand(updatedColumn));
      },
      _updateRegion(updatedRegion: CellState[]) {
        state._gridCommands.set(updateGridRegionCommand(updatedRegion));
      },
      _setCellError(hasError: boolean, cellState: CellState) {
        const { row, column, value, isReadonly } = cellState;

        state._gridCommands.set(
          updateGridCellCommand(row, column, value, isReadonly, hasError),
        );

        state._updateGridHasError(hasError);
      },
    })),
  );
}

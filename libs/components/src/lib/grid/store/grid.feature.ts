import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState,
} from '@ngrx/signals';
import { CellState, CellValue } from '@sud/domain';
import { withGridComputed } from './grid.computed.feature';
import { initialState } from './grid.state';

export function withGrid() {
  return signalStoreFeature(
    withState(initialState()),
    withGridComputed(),
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
        patchState(state, {
          grid: updateGrid(state.grid(), row, column, value, isReadonly),
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
  grid[row][column].value = value;
  grid[row][column].isReadonly = isReadonly;

  return grid;
}

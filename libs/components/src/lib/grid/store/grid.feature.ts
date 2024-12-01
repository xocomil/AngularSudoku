import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState,
} from '@ngrx/signals';
import { CellState, CellValue } from '@sud/domain';
import { withGridComputed } from './grid.computed.feature';
import { initialState } from './grid.state';

export function withGrid<_>() {
  return signalStoreFeature(
    withState(initialState()),
    withGridComputed(),
    withMethods(({ lastCellUpdated$ }) => ({
      _cellUpdated(row: number, column: number) {
        lastCellUpdated$().next([row, column]);
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
        patchState(state, {
          grid: updateGrid(state.grid(), row, column, value, isReadonly),
        });

        state._cellUpdated(row, column);
      },
      _updateGridHasError(hasError: boolean) {
        patchState(state, { hasError });
      },
      _updateGameWon(gameWon: boolean) {
        patchState(state, { gameWon });
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

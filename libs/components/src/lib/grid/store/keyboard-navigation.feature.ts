import {
  patchState,
  signalStoreFeature,
  type,
  withMethods,
} from '@ngrx/signals';
import {
  CellState,
  directionModifierValues,
  GridDirection,
  isNavigationDirection,
} from '@sud/domain';
import { GridState } from './grid.state';

type NavigateToCellEvent = {
  direction: GridDirection;
  cellState: CellState;
};

export function withKeyboardNavigation<_>() {
  return signalStoreFeature(
    type<{
      state: GridState;
      methods: {
        updateSelected(cellState: CellState): void;
      };
    }>(),
    withMethods((state) => ({
      _updateNextToFocus(cellState: CellState) {
        const { row, column } = cellState;

        patchState(state, {
          _nextToFocus: {
            row,
            column,
          },
        });
      },
    })),
    withMethods((state) => ({
      _navigateToCell(column: number, row: number, grid: CellState[][]) {
        const nextToFocus = grid[row][column];

        state.updateSelected(nextToFocus);
        state._updateNextToFocus(nextToFocus);
      },
    })),
    withMethods((state) => ({
      _updateSelectedFromNavigation(
        direction: GridDirection,
        cellState: CellState,
        grid: CellState[][],
        creatingPuzzleMode: boolean,
      ) {
        const nextCell = creatingPuzzleMode
          ? puzzleModeFindNextCellToFocus(direction, cellState, grid)
          : findNextCellToFocus(direction, cellState, grid);

        state._navigateToCell(nextCell.column, nextCell.row, grid);
      },
    })),
    withMethods((state) => ({
      navigateToCell(navigation: NavigateToCellEvent) {
        const { direction, cellState } = navigation;
        const grid = state.grid();
        const creatingPuzzleMode = state.creatingPuzzleMode();

        state._updateSelectedFromNavigation(
          direction,
          cellState,
          grid,
          creatingPuzzleMode,
        );
      },
    })),
  );
}

function findNextCellToFocus(
  direction: GridDirection,
  cellState: CellState,
  grid: CellState[][],
): CellState {
  if (!isNavigationDirection(direction)) {
    return cellState;
  }

  const getNextCell = partialGetNextCellState(
    grid,
    directionModifierValues[direction],
  );

  let nextCell = getNextCell(cellState);

  while (nextCell != null && nextCell.isReadonly) {
    nextCell = getNextCell(nextCell);
  }

  return nextCell ? nextCell : cellState;
}

function puzzleModeFindNextCellToFocus(
  direction: GridDirection,
  cellState: CellState,
  grid: CellState[][],
): CellState {
  if (!isNavigationDirection(direction)) {
    return cellState;
  }

  const getNextCell = partialGetNextCellState(
    grid,
    directionModifierValues[direction],
  );

  const nextCell = getNextCell(cellState);

  return nextCell ? nextCell : cellState;
}

function partialGetNextCellState(
  grid: CellState[][],
  directionModifiers: { row: number; col: number },
) {
  return (cellState: CellState) =>
    getNextCellState(grid, cellState, directionModifiers);
}

function getNextCellState(
  grid: CellState[][],
  cellState: CellState,
  directionModifiers: { row: number; col: number },
): CellState | undefined {
  const { row: rowModifier, col: colModifier } = directionModifiers;

  return grid[cellState.row + rowModifier]?.[cellState.column + colModifier];
}

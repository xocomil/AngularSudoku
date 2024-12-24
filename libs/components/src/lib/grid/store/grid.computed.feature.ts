import { computed } from '@angular/core';
import { signalStoreFeature, type, withComputed } from '@ngrx/signals';
import { CellState } from '@sud/domain';
import { GridState, noCellSelected, noCellToFocus } from './grid.state';

export function withGridComputed<_>() {
  return signalStoreFeature(
    type<{ state: GridState }>(),
    withComputed((state) => ({
      selected: computed(() => {
        const selected = state._selected();

        if (selected) {
          return [selected.row, selected.column, selected.region];
        }

        return noCellSelected;
      }),
      nextToFocus: computed(() => {
        const nextToFocus = state._nextToFocus();

        if (nextToFocus) {
          return [nextToFocus.row, nextToFocus.column];
        }

        return noCellToFocus;
      }),
      rotatedGrid: computed(() =>
        state.grid().reduce((rotatedGrid, row) => {
          row.forEach((cell) => {
            rotatedGrid[cell.column][cell.row] = cell;
          });

          return rotatedGrid;
        }, [] as CellState[][]),
      ),
      _regions: computed(() => {
        const ITEMS_TO_TAKE = 3 as const;
        const grid = state.grid();
        return computeRegions(ITEMS_TO_TAKE, grid);
      }),
    })),
    withComputed((state) => ({
      rows: computed(() => state.grid()),
      columns: computed(() => state.rotatedGrid()),
      regions: computed(() => state._regions()),
    })),
  );
}
function computeRegions(ITEMS_TO_TAKE: 3, grid: CellState[][]): CellState[][] {
  return Array.from({ length: 9 }).map((_, region) => {
    const column = (region % ITEMS_TO_TAKE) * ITEMS_TO_TAKE;
    const row = region - (region % ITEMS_TO_TAKE);

    const regionCells = [];

    for (let rowIndex = 0; rowIndex < ITEMS_TO_TAKE; rowIndex++) {
      for (let columnIndex = 0; columnIndex < ITEMS_TO_TAKE; columnIndex++) {
        regionCells.push(grid[row + rowIndex][column + columnIndex]);
      }
    }

    return regionCells;
  });
}

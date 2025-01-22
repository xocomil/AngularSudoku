import { createServiceFactory } from '@ngneat/spectator';
import {
  patchState,
  signalStore,
  signalStoreFeature,
  type,
  withMethods,
} from '@ngrx/signals';
import { CellState, CellValue } from '@sud/domain';
import { withGrid } from './grid.feature';
import { GridState, noCellSelected, noCellToFocus } from './grid.state';

describe('GridComputedFeature', () => {
  const TestStore = signalStore(withGrid(), withUpdateSelected());

  const createService = createServiceFactory({ service: TestStore });

  describe('selected()', () => {
    it('should return the selected cell', () => {
      const selectedCell = { row: 4, column: 5, region: 5 };

      const spectator = createService();

      spectator.service.setSelected(selectedCell);

      expect(spectator.service.selected()).toEqual([4, 5, 5]);
    });

    it('should return noCellSelected when no cell is selected', () => {
      const spectator = createService();

      expect(spectator.service.selected()).toEqual(noCellSelected);
    });
  });

  describe('nextToFocus()', () => {
    it('should return the next cell to focus', () => {
      const nextToFocus = { row: 2, column: 4, region: 2 };

      const spectator = createService();

      spectator.service.setNextToFocus(nextToFocus);

      expect(spectator.service.nextToFocus()).toEqual([2, 4]);
    });

    it('should return noCellToFocus when no cell is next to focus', () => {
      const spectator = createService();

      expect(spectator.service.nextToFocus()).toEqual(noCellToFocus);
    });
  });

  describe('grid parts', () => {
    const grid: CellValue[][] = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
    ] as const;

    function fillGrid(store: InstanceType<typeof TestStore>) {
      store.setGridValues(grid);
    }

    function getGridValues(grid: CellState[][]): (CellValue | undefined)[][] {
      return grid.map((row) => row.map((cell) => cell.value));
    }

    it('should return the rows', () => {
      const spectator = createService();

      fillGrid(spectator.service);

      expect(getGridValues(spectator.service.rows())).toEqual(grid);
    });

    it('should return the columns', () => {
      const spectator = createService();

      fillGrid(spectator.service);

      const expectedColumns = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
        [7, 7, 7, 7, 7, 7, 7, 7, 7],
        [8, 8, 8, 8, 8, 8, 8, 8, 8],
        [9, 9, 9, 9, 9, 9, 9, 9, 9],
      ];

      expect(getGridValues(spectator.service.columns())).toEqual(
        expectedColumns,
      );
    });

    it('should return the regions', () => {
      const spectator = createService();

      fillGrid(spectator.service);

      const expectedRegions = [
        [1, 2, 3, 1, 2, 3, 1, 2, 3],
        [4, 5, 6, 4, 5, 6, 4, 5, 6],
        [7, 8, 9, 7, 8, 9, 7, 8, 9],
        [1, 2, 3, 1, 2, 3, 1, 2, 3],
        [4, 5, 6, 4, 5, 6, 4, 5, 6],
        [7, 8, 9, 7, 8, 9, 7, 8, 9],
        [1, 2, 3, 1, 2, 3, 1, 2, 3],
        [4, 5, 6, 4, 5, 6, 4, 5, 6],
        [7, 8, 9, 7, 8, 9, 7, 8, 9],
      ];

      expect(getGridValues(spectator.service.regions())).toEqual(
        expectedRegions,
      );
    });
  });
});

type SelectedCell = { row: number; column: number; region: number } | undefined;

function withUpdateSelected<_>() {
  return signalStoreFeature(
    type<{ state: GridState }>(),
    withMethods((state) => ({
      setSelected(selected: SelectedCell) {
        patchState(state, { _selected: selected });
      },
      setNextToFocus(nextToFocus: SelectedCell) {
        patchState(state, { _nextToFocus: nextToFocus });
      },
    })),
  );
}

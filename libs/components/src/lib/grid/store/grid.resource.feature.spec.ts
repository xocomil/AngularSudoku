import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { createServiceFactory } from '@ngneat/spectator';
import { signalStore } from '@ngrx/signals';
import { CellState, CellValue, createCellState } from '@sud/domain';
import { withGrid } from './grid.feature';

describe('withGrid() feature', () => {
  const TestStore = signalStore(withGrid());

  const createService = createServiceFactory({ service: TestStore });

  function getGridValues(grid: CellState[][]): (CellValue | undefined)[][] {
    return grid.map((row) => row.map((cell) => cell.value));
  }

  describe('lastCellUpdated$', () => {
    it('should should emit when cell is updated', () => {
      const spectator = createService();

      const newValue = 1;
      const cellState = createCellState({ region: 1, column: 1, row: 1 });

      const observerSpy = subscribeSpyTo(spectator.service.lastCellUpdated$);

      spectator.service.setCellValue(newValue, cellState);

      expect(observerSpy.getValues()).toEqual([[1, 1, undefined]]);

      observerSpy.unsubscribe();
    });

    it('should emit the last value of the cell', () => {
      const spectator = createService();

      const originalValue = 1;
      const newValue = 2;
      const lastValue = 3;
      const cellState = createCellState({ region: 1, column: 1, row: 1 });

      const observerSpy = subscribeSpyTo(spectator.service.lastCellUpdated$);

      spectator.service.setCellValue(originalValue, cellState);

      spectator.service.setCellValue(newValue, cellState);
      spectator.service.setCellValue(lastValue, cellState);
      spectator.service.setCellValue(lastValue, cellState);

      expect(observerSpy.getValues()).toEqual([
        [1, 1, undefined],
        [1, 1, originalValue],
        [1, 1, newValue],
        [1, 1, lastValue],
      ]);

      observerSpy.unsubscribe();
    });
  });

  it('setGridValues() should update all cells', () => {
    const spectator = createService();

    const values: CellValue[][] = [
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

    spectator.service.setGridValues(values);

    expect(getGridValues(spectator.service.grid())).toEqual(values);
  });

  it('setCellValue() should update the proper cell', () => {
    const spectator = createService();

    const values: CellValue[][] = [
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

    const expectedValues: CellValue[][] = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 3, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
    ] as const;

    spectator.service.setGridValues(values);

    expect(getGridValues(spectator.service.grid())).toEqual(values);

    const lastValue = 3;
    const cellState = createCellState({ region: 1, column: 1, row: 1 });

    spectator.service.setCellValue(lastValue, cellState);

    expect(getGridValues(spectator.service.grid())).toEqual(expectedValues);
  });
});

import { createServiceFactory } from '@ngneat/spectator';
import { createCellState, GridDirection } from '@sud/domain';
import { noCellSelected, noCellToFocus } from './grid.state';

import { GridStore } from './grid.store';
import { createGridState } from './grid.store.helpers';

describe('GridStore', () => {
  const createService = createServiceFactory({ service: GridStore });

  it('should be created', () => {
    const spectator = createService();

    expect(spectator).toBeTruthy();
  });

  describe('grid', () => {
    it('should select the grid', () => {
      const spectator = createService();

      expect(spectator.service.grid()).toEqual(createGridState());
    });
  });

  describe('selected$', () => {
    it('should return empty values when nothing selected', () => {
      const spectator = createService();

      expect(spectator.service.selected()).toEqual(noCellSelected);
    });

    it('should return the selected values', () => {
      const spectator = createService();

      const row = 1,
        column = 2,
        region = 3;

      expect(spectator.service.selected()).toEqual(noCellSelected);

      spectator.service.updateSelected(
        createCellState({ row, column, region }),
      );

      expect(spectator.service.selected()).toEqual([row, column, region]);
    });
  });

  describe('nextToFocus$', () => {
    it('should return noCellToFocus if no cell to focus', () => {
      const spectator = createService();

      expect(spectator.service.nextToFocus()).toEqual(noCellToFocus);
    });

    it('should return the next to focus', () => {
      const spectator = createService();

      const row = 1,
        column = 2,
        region = 3;

      expect(spectator.service.nextToFocus()).toEqual(noCellToFocus);

      spectator.service.navigateToCell({
        direction: GridDirection.Down,
        cellState: createCellState({ row, column, region }),
      });

      expect(spectator.service.nextToFocus()).toEqual([row + 1, column]);
    });
  });

  describe('resetSelected()', () => {
    it('should reset the nextToFocus when called', () => {
      const spectator = createService();

      expect(spectator.service.selected()).toEqual(noCellSelected);

      const row = 1,
        column = 2,
        region = 3;

      spectator.service.updateSelected(
        createCellState({ row, column, region }),
      );

      expect(spectator.service.selected()).toEqual([row, column, region]);

      spectator.service.resetSelected();

      expect(spectator.service.selected()).toEqual(noCellSelected);
    });
  });

  describe('cellValueChanged()', () => {
    // it('should change the value of the cell', () => {
    //   const spectator = createService();
    //
    //   const row = 1,
    //     column = 2;
    //
    //   const testValue = 9;
    //
    //   spectator.service.setCellValue({
    //     value: testValue,
    //     row,
    //     column,
    //   });
    //
    //   const result = spectator.service.grid()[row][column];
    //
    //   expect(result.value).toBe(testValue);
    //   expect(result.valid).toBe(true);
    // });
    //
    // describe('errors in the grid', () => {
    //   it('should detect errors in the same row', () => {
    //     const spectator = createService();
    //
    //     const row = 1,
    //       column = 2,
    //       column2 = 3;
    //
    //     const testValue = 9;
    //
    //     spectator.service.cellValueChanged({
    //       value: testValue,
    //       row,
    //       column,
    //     });
    //
    //     spectator.service.cellValueChanged({
    //       value: testValue,
    //       row,
    //       column: column2,
    //     });
    //
    //     const resultCell1 = spectator.service.grid()[row][column];
    //     const resultCell2 = spectator.service.grid()[row][column2];
    //
    //     expect(resultCell1.value).toBe(testValue);
    //     expect(resultCell1.valid).toBe(false);
    //     expect(resultCell2.value).toBe(testValue);
    //     expect(resultCell2.valid).toBe(false);
    //   });
    // });
  });
});

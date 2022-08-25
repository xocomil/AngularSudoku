/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { createServiceFactory } from '@ngneat/spectator';
import { createCellState, GridDirection } from '@sud/domain';

import { GridStore, noCellSelected, noCellToFocus } from './grid.store';
import { createGridState } from './grid.store.helpers';

describe('GridStore', () => {
  const createService = createServiceFactory({ service: GridStore });

  it('should be created', () => {
    const spectator = createService();

    expect(spectator).toBeTruthy();
  });

  describe('grid$', () => {
    it('should select the grid', () => {
      const spectator = createService();

      const gridSpy = subscribeSpyTo(spectator.service.grid$);

      expect(gridSpy.getValues()).toEqual([createGridState()]);

      gridSpy.unsubscribe();
    });
  });

  describe('selected$', () => {
    it('should return empty values when nothing selected', () => {
      const spectator = createService();

      const selectedSpy = subscribeSpyTo(spectator.service.selected$);

      expect(selectedSpy.getValues()).toEqual([noCellSelected]);

      selectedSpy.unsubscribe();
    });

    it('should return the selected values', () => {
      const spectator = createService();

      const selectedSpy = subscribeSpyTo(spectator.service.selected$);

      const row = 1,
        column = 2,
        region = 3;

      spectator.service.updateSelected(
        createCellState({ row, column, region })
      );

      expect(selectedSpy.getValues()).toEqual([
        noCellSelected,
        [row, column, region],
      ]);

      selectedSpy.unsubscribe();
    });
  });

  describe('nextToFocus$', () => {
    it('should return noCellToFocus if no cell to focus', () => {
      const spectator = createService();

      const nextToFocusSpy = subscribeSpyTo(spectator.service.nextToFocus$);

      expect(nextToFocusSpy.getValues()).toEqual([noCellToFocus]);

      nextToFocusSpy.unsubscribe();
    });

    it('should return the next to focus', () => {
      const spectator = createService();

      const nextToFocusSpy = subscribeSpyTo(spectator.service.nextToFocus$);

      const row = 1,
        column = 2,
        region = 3;

      spectator.service.navigateToCell({
        direction: GridDirection.Down,
        cellState: createCellState({ row, column, region }),
      });

      expect(nextToFocusSpy.getValues()).toEqual([
        noCellToFocus,
        [row + 1, column],
      ]);
    });
  });

  describe('resetSelected()', () => {
    it('should reset the nextToFocus when called', () => {
      const spectator = createService();

      const selectedSpy = subscribeSpyTo(spectator.service.selected$);

      const row = 1,
        column = 2,
        region = 3;

      spectator.service.updateSelected(
        createCellState({ row, column, region })
      );

      spectator.service.resetSelected();

      expect(selectedSpy.getValues()).toEqual([
        noCellSelected,
        [row, column, region],
        noCellSelected,
      ]);

      selectedSpy.unsubscribe();
    });
  });

  describe('cellValueChanged()', () => {
    it('should change the value of the cell', () => {
      const spectator = createService();
      const gridSpy = subscribeSpyTo(spectator.service.grid$);

      const row = 1,
        column = 2;

      const testValue = 9;

      spectator.service.cellValueChanged({
        value: testValue,
        row,
        column,
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = gridSpy.getLastValue()![row][column];

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.value).toBe(testValue);
      expect(result!.valid).toBe(true);
    });

    describe('errors in the grid', () => {
      it('should detect errors in the same row', () => {
        const spectator = createService();
        const gridSpy = subscribeSpyTo(spectator.service.grid$);

        const row = 1,
          column = 2,
          column2 = 3;

        const testValue = 9;

        spectator.service.cellValueChanged({
          value: testValue,
          row,
          column,
        });

        spectator.service.cellValueChanged({
          value: testValue,
          row,
          column: column2,
        });

        const resultCell1 = gridSpy.getLastValue()![row][column];
        const resultCell2 = gridSpy.getLastValue()![row][column2];

        expect(resultCell1!.value).toBe(testValue);
        expect(resultCell1!.valid).toBe(false);
        expect(resultCell2!.value).toBe(testValue);
        expect(resultCell2!.valid).toBe(false);
      });
    });
  });
});

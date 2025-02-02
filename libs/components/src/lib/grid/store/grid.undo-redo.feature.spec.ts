import { createServiceFactory } from '@ngneat/spectator';
import { signalStore } from '@ngrx/signals';
import { createCellState } from '@sud/domain';
import { withGrid } from './grid.feature';
import { withUndoRedo } from './grid.undo-redo.feature';

describe('withUndoRedo() feature', () => {
  const TestStore = signalStore(withGrid(), withUndoRedo());

  const createService = createServiceFactory({ service: TestStore });

  describe('undo()', () => {
    it('should undo the last command', () => {
      const spectator = createService();
      const cellStateToChange = createCellState({
        row: 0,
        column: 0,
        region: 0,
      });

      spectator.service.setCellValue(1, cellStateToChange);
      expect(spectator.service.grid()[0][0].value).toBe(1);

      spectator.service.setCellValue(2, cellStateToChange);
      expect(spectator.service.grid()[0][0].value).toBe(2);

      spectator.service.undo();

      expect(spectator.service.grid()[0][0].value).toBe(1);

      spectator.service.undo();

      expect(spectator.service.grid()[0][0].value).toBe(undefined);
    });

    it('should not break if more undo than commands', () => {
      const spectator = createService();

      const cellStateToChange = createCellState({
        row: 0,
        column: 0,
        region: 0,
      });

      spectator.service.setCellValue(1, cellStateToChange);
      expect(spectator.service.grid()[0][0].value).toBe(1);

      spectator.service.undo();

      expect(spectator.service.grid()[0][0].value).toBe(undefined);

      spectator.service.undo();

      expect(spectator.service.grid()[0][0].value).toBe(undefined);

      spectator.service.undo();

      expect(spectator.service.grid()[0][0].value).toBe(undefined);
    });
  });

  describe('redo()', () => {
    it('should redo the last command', () => {
      const spectator = createService();
      const cellStateToChange = createCellState({
        row: 0,
        column: 0,
        region: 0,
      });

      spectator.service.setCellValue(1, cellStateToChange);
      expect(spectator.service.grid()[0][0].value).toBe(1);

      spectator.service.setCellValue(2, cellStateToChange);
      expect(spectator.service.grid()[0][0].value).toBe(2);

      spectator.service.undo();

      expect(spectator.service.grid()[0][0].value).toBe(1);

      spectator.service.redo();

      expect(spectator.service.grid()[0][0].value).toBe(2);
    });

    it('should not break if more redo than commands', () => {
      const spectator = createService();

      const cellStateToChange = createCellState({
        row: 0,
        column: 0,
        region: 0,
      });

      spectator.service.setCellValue(1, cellStateToChange);
      expect(spectator.service.grid()[0][0].value).toBe(1);

      spectator.service.setCellValue(2, cellStateToChange);
      expect(spectator.service.grid()[0][0].value).toBe(2);

      spectator.service.undo();

      expect(spectator.service.grid()[0][0].value).toBe(1);

      spectator.service.redo();

      expect(spectator.service.grid()[0][0].value).toBe(2);

      spectator.service.redo();

      expect(spectator.service.grid()[0][0].value).toBe(2);
    });

    it('should clear the command stack if user changes values after undo', () => {
      const spectator = createService();
      const cellStateToChange = createCellState({
        row: 0,
        column: 0,
        region: 0,
      });

      spectator.service.setCellValue(1, cellStateToChange);
      expect(spectator.service.grid()[0][0].value).toBe(1);

      spectator.service.setCellValue(2, cellStateToChange);
      expect(spectator.service.grid()[0][0].value).toBe(2);

      spectator.service.undo();

      expect(spectator.service.grid()[0][0].value).toBe(1);

      spectator.service.undo();

      expect(spectator.service.grid()[0][0].value).toBe(undefined);

      spectator.service.setCellValue(3, cellStateToChange);

      spectator.service.redo();

      expect(spectator.service.grid()[0][0].value).toBe(3);

      spectator.service.undo();

      expect(spectator.service.grid()[0][0].value).toBe(undefined);

      spectator.service.redo();

      expect(spectator.service.grid()[0][0].value).toBe(3);
    });
  });
});

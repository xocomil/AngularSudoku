import { createServiceFactory } from '@ngneat/spectator';
import {
  patchState,
  signalStore,
  signalStoreFeature,
  type,
  withMethods,
} from '@ngrx/signals';
import { createCellState } from '@sud/domain';
import { withGameWon } from './game-won.feature';
import { withGrid } from './grid.feature';
import { GridState } from './grid.state';

function withUpdateError<_>() {
  return signalStoreFeature(
    type<{ state: GridState }>(),
    withMethods((state) => ({
      updateError(hasError = false) {
        patchState(state, { hasError });
      },
    })),
  );
}
describe('GameWon Feature', () => {
  const TestState = signalStore(withGrid(), withGameWon(), withUpdateError());

  const createService = createServiceFactory({
    service: TestState,
  });

  describe('grid is empty', () => {
    it('should not be won', () => {
      const spectator = createService();

      expect(spectator.service.gameWon()).toBe(false);
    });
  });

  describe('grid not filled out', () => {
    it('should not be won', () => {
      const spectator = createService();

      spectator.service.setCellValue(
        1,
        createCellState({ row: 0, column: 0, region: 0 }),
      );

      expect(spectator.service.gameWon()).toBe(false);
    });
  });

  describe('grid filled out', () => {
    it('should be won if no error', () => {
      const spectator = createService();

      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          spectator.service.setCellValue(
            5,
            createCellState({ row: i, column: j, region: 0 }),
          );
        }
      }

      expect(spectator.service.gameWon()).toBe(true);
    });

    it('should not be won if error', () => {
      const spectator = createService();

      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          spectator.service.setCellValue(
            5,
            createCellState({ row: i, column: j, region: 0 }),
          );
        }
      }

      spectator.service.updateError(true);

      console.log('spectator.service.gameWon()', spectator.service.gameWon());

      expect(spectator.service.gameWon()).toBe(false);
    });
  });
});

import { createServiceFactory } from '@ngneat/spectator';
import { signalStore } from '@ngrx/signals';
import { createCellState } from '@sud/domain';
import { withGridErrors } from './grid-errors.feature';
import { withGrid } from './grid.feature';

describe('withGridErrors() feature', () => {
  const TestStore = signalStore(withGrid(), withGridErrors());

  const createService = createServiceFactory({ service: TestStore });

  it('should set hasError to true when a cell is invalid in same column', () => {
    const spectator = createService();

    spectator.service.setCellValue(
      1,
      createCellState({ column: 0, row: 0, region: 0 }),
    );
    spectator.service.setCellValue(
      1,
      createCellState({ column: 0, row: 1, region: 0 }),
    );

    expect(spectator.service.hasError()).toBe(true);
  });

  it('should set hasError to true when a cell is invalid in same row', () => {
    const spectator = createService();

    spectator.service.setCellValue(
      1,
      createCellState({ column: 0, row: 0, region: 0 }),
    );
    spectator.service.setCellValue(
      1,
      createCellState({ column: 1, row: 0, region: 0 }),
    );

    expect(spectator.service.hasError()).toBe(true);
  });

  it('should set hasError to true when a cell is invalid in same region', () => {
    const spectator = createService();

    spectator.service.setCellValue(
      1,
      createCellState({ column: 0, row: 0, region: 0 }),
    );
    spectator.service.setCellValue(
      1,
      createCellState({ column: 1, row: 1, region: 0 }),
    );

    expect(spectator.service.hasError()).toBe(true);
  });
});

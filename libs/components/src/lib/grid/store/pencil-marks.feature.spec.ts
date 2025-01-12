import { createServiceFactory } from '@ngneat/spectator';
import { signalStore } from '@ngrx/signals';
import { createCellState } from '@sud/domain';
import { withGrid } from './grid.feature';
import { withPencilMarks } from './pencil-marks.feature';

describe('withPencilMarks Feature', () => {
  const TestState = signalStore(withGrid(), withPencilMarks());

  const createService = createServiceFactory({
    service: TestState,
  });

  it('should set row pencil marks', () => {
    const spectator = createService();

    spectator.service.setCellValue(
      1,
      createCellState({ row: 0, column: 0, region: 0 }),
    );
    spectator.service.setCellValue(
      4,
      createCellState({ row: 0, column: 4, region: 0 }),
    );
    spectator.service.setCellValue(
      9,
      createCellState({ row: 0, column: 8, region: 0 }),
    );

    spectator.service.rows()[0].forEach((cell) => {
      expect(cell.rowValuesToHide).toEqual([1, 4, 9]);
    });
  });

  it('should remove row pencil marks', () => {
    const spectator = createService();

    spectator.service.setCellValue(
      1,
      createCellState({ row: 0, column: 0, region: 0 }),
    );
    spectator.service.setCellValue(
      4,
      createCellState({ row: 0, column: 4, region: 0 }),
    );
    spectator.service.setCellValue(
      9,
      createCellState({ row: 0, column: 8, region: 0 }),
    );

    spectator.service.rows()[0].forEach((cell) => {
      expect(cell.rowValuesToHide).toEqual([1, 4, 9]);
    });

    spectator.service.setCellValue(
      undefined,
      createCellState({ row: 0, column: 0, region: 0 }),
    );

    spectator.service.rows()[0].forEach((cell) => {
      expect(cell.rowValuesToHide).toEqual([4, 9]);
    });

    spectator.service.setCellValue(
      undefined,
      createCellState({ row: 0, column: 8, region: 0 }),
    );

    spectator.service.rows()[0].forEach((cell) => {
      expect(cell.rowValuesToHide).toEqual([4]);
    });
  });

  it('should set updated column pencil marks', () => {
    const spectator = createService();

    spectator.service.setCellValue(
      1,
      createCellState({ row: 0, column: 0, region: 0 }),
    );
    spectator.service.setCellValue(
      4,
      createCellState({ row: 4, column: 0, region: 0 }),
    );
    spectator.service.setCellValue(
      9,
      createCellState({ row: 8, column: 0, region: 0 }),
    );

    // Assert
    spectator.service.columns()[0].forEach((cell) => {
      expect(cell.columnValuesToHide).toEqual([1, 4, 9]);
    });
  });

  it('should remove column pencil marks', () => {
    const spectator = createService();

    spectator.service.setCellValue(
      1,
      createCellState({ row: 0, column: 0, region: 0 }),
    );
    spectator.service.setCellValue(
      4,
      createCellState({ row: 4, column: 0, region: 0 }),
    );
    spectator.service.setCellValue(
      9,
      createCellState({ row: 8, column: 0, region: 0 }),
    );

    // Assert
    spectator.service.columns()[0].forEach((cell) => {
      expect(cell.columnValuesToHide).toEqual([1, 4, 9]);
    });

    spectator.service.setCellValue(
      undefined,
      createCellState({ row: 0, column: 0, region: 0 }),
    );

    spectator.service.columns()[0].forEach((cell) => {
      expect(cell.columnValuesToHide).toEqual([4, 9]);
    });

    spectator.service.setCellValue(
      undefined,
      createCellState({ row: 8, column: 0, region: 0 }),
    );

    spectator.service.columns()[0].forEach((cell) => {
      expect(cell.columnValuesToHide).toEqual([4]);
    });
  });

  it('should set updated region pencil marks', () => {
    const spectator = createService();

    spectator.service.setCellValue(
      2,
      createCellState({ row: 0, column: 0, region: 0 }),
    );
    spectator.service.setCellValue(
      4,
      createCellState({ row: 1, column: 1, region: 0 }),
    );
    spectator.service.setCellValue(
      6,
      createCellState({ row: 2, column: 2, region: 0 }),
    );

    // Assert
    spectator.service.regions()[0].forEach((cell) => {
      expect(cell.regionValuesToHide).toEqual([2, 4, 6]);
    });
  });

  it('should remove region pencil marks', () => {
    const spectator = createService();

    spectator.service.setCellValue(
      2,
      createCellState({ row: 0, column: 0, region: 0 }),
    );
    spectator.service.setCellValue(
      4,
      createCellState({ row: 1, column: 1, region: 0 }),
    );
    spectator.service.setCellValue(
      6,
      createCellState({ row: 2, column: 2, region: 0 }),
    );

    // Assert
    spectator.service.regions()[0].forEach((cell) => {
      expect(cell.regionValuesToHide).toEqual([2, 4, 6]);
    });

    spectator.service.setCellValue(
      undefined,
      createCellState({ row: 0, column: 0, region: 0 }),
    );

    spectator.service.regions()[0].forEach((cell) => {
      expect(cell.regionValuesToHide).toEqual([4, 6]);
    });

    spectator.service.setCellValue(
      undefined,
      createCellState({ row: 2, column: 2, region: 0 }),
    );

    spectator.service.regions()[0].forEach((cell) => {
      expect(cell.regionValuesToHide).toEqual([4]);
    });
  });
});

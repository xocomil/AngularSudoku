import { CellValue, createCellState } from '@sud/domain';
import { errorAnalyzer } from './fast-analyzer';

describe('errorAnalyzer', () => {
  it('should return [] if no matches', () => {
    const row = 2;

    const testArray = Array.from({ length: 9 }, (_, value) =>
      createCellState({
        row,
        column: value,
        region: 0,
        value: (value + 1) as CellValue,
      })
    );

    const result = errorAnalyzer(testArray);

    expect(result).toEqual([]);
  });

  it('should return grid coordinates of errors if no matches', () => {
    const row = 2;

    const testArray = Array.from({ length: 9 }, (_, value) =>
      createCellState({
        row,
        column: value,
        region: 0,
        value: (value + 1) as CellValue,
      })
    );

    testArray[8].value = 1;

    const result = errorAnalyzer(testArray);

    expect(result).toEqual([testArray[0], testArray[8]]);
  });
});

import { createCellState } from '@sud/domain';
import { errorAnalyzer } from './fast-analyzer';

describe('errorAnalyzer', () => {
  it('should return [] if no matches', () => {
    const row = 2;

    const testArray = Array.from({ length: 9 }, (_, value) =>
      createCellState({
        row,
        column: value,
        region: [0, 0],
        value: value + 1,
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
        region: [0, 0],
        value: value + 1,
      })
    );

    testArray[8].value = 1;

    const result = errorAnalyzer(testArray);

    expect(result).toEqual([
      [0, 2],
      [8, 2],
    ]);
  });
});

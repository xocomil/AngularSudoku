import { faker } from '@faker-js/faker';
import { CellState, createCellState } from './cell-state';

describe('CellState', () => {
  const createSudokuCellValue = (): number =>
    faker.datatype.number({ min: 1, max: 9 });

  describe('createCellState', () => {
    test('should create a default CellState', () => {
      const expected: CellState = {
        value: undefined,
        readonly: false,
        valid: true,
      };

      const result = createCellState();

      expect(result).toEqual(expected);
    });

    test('should create a default CellState with the value passed in', () => {
      const value = createSudokuCellValue();
      const expected: CellState = { value, readonly: false, valid: true };

      const result = createCellState({ value });

      expect(result).toEqual(expected);
    });

    test('should create a readonly cell with value', () => {
      const value = createSudokuCellValue();
      const expected: CellState = { value, readonly: true, valid: true };

      const result = createCellState({ value, readonly: true });

      expect(result).toEqual(expected);
    });
  });
});

import { CellState, CellValue, createCellState } from './cell-state';
import { fakeCellValue } from './testing-helpers/random-number.helper';

describe('CellState', () => {
  const createSudokuCellValue = (): CellValue =>
    fakeCellValue() as CellValue;

  describe('createCellState', () => {
    test('should create a default CellState', () => {
      const expected: CellState = {
        row: 0,
        column: 0,
        region: 0,
        value: undefined,
        isReadonly: false,
        valid: true,
        columnValuesToHide: [],
        regionValuesToHide: [],
        rowValuesToHide: [],
      };

      const result = createCellState({ row: 0, column: 0, region: 0 });

      expect(result).toEqual(expected);
    });

    test('should create a default CellState with the value passed in', () => {
      const value = createSudokuCellValue();
      const expected: CellState = createCellState({
        row: 0,
        column: 0,
        region: 0,
        value,
        isReadonly: false,
        valid: true,
      });

      const result = createCellState({ row: 0, column: 0, region: 0, value });

      expect(result).toEqual(expected);
    });

    test('should create a readonly cell with value', () => {
      const value = createSudokuCellValue();
      const expected: CellState = createCellState({
        row: 0,
        column: 0,
        region: 0,
        value,
        isReadonly: true,
        valid: true,
      });

      const result = createCellState({
        row: 0,
        column: 0,
        region: 0,
        value,
        isReadonly: true,
      });

      expect(result).toEqual(expected);
    });
  });
});

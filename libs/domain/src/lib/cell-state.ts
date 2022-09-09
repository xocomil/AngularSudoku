export const allPencilMarks = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type CellValue = typeof allPencilMarks[number];

export interface CellState {
  value?: CellValue;
  valid: boolean;
  isReadonly: boolean;
  row: number;
  column: number;
  region: number;
  rowValuesToHide: CellValue[];
  columnValuesToHide: CellValue[];
  regionValuesToHide: CellValue[];
}

export const createCellState = ({
  row,
  column,
  region,
  value = undefined,
  valid = true,
  isReadonly = false,
}: Partial<CellState> &
  Pick<CellState, 'row' | 'column' | 'region'>): CellState => ({
  row,
  column,
  region,
  value,
  valid,
  isReadonly: isReadonly,
  rowValuesToHide: [],
  columnValuesToHide: [],
  regionValuesToHide: [],
});

export const valueIsCellValue = (
  value: number | undefined
): value is CellValue => value != null && value >= 1 && value <= 9;

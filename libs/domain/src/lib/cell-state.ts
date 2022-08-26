export interface CellState {
  value?: number;
  valid: boolean;
  isReadonly: boolean;
  row: number;
  column: number;
  region: number;
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
});

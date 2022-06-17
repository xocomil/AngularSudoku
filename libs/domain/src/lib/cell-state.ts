export interface CellState {
  value?: number;
  valid: boolean;
  readonly: boolean;
}

export const createCellState = ({
  value = undefined,
  valid = true,
  readonly = false,
}: Partial<CellState> = {}): CellState => ({
  value,
  valid,
  readonly,
});

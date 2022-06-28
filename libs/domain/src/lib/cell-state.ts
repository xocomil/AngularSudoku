import { RegionCoordinate } from './region-coordinate';

export interface CellState {
  value?: number;
  valid: boolean;
  readonly: boolean;
  row: number;
  column: number;
  region: RegionCoordinate;
}

export const createCellState = ({
  row,
  column,
  region,
  value = undefined,
  valid = true,
  readonly = false,
}: Partial<CellState> &
  Pick<CellState, 'row' | 'column' | 'region'>): CellState => ({
  row,
  column,
  region,
  value,
  valid,
  readonly,
});

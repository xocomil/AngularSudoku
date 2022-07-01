import { CellState } from '@sud/domain';

export interface CellsToAnalyze {
  rows: Map<number, CellState[]>;
  columns: Map<number, CellState[]>;
  regions: Map<{ row: number; column: number }, CellState[]>;
}

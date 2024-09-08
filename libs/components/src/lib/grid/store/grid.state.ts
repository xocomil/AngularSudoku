import { CellState, CellValue } from '@sud/domain';
import { createGridState } from './grid.store.helpers';

export type GridCommand = CellValueChangedOptions & {
  previousValue?: CellValue;
  value?: CellValue;
  invalidValues: CellValue[];
};

export interface GridState {
  grid: CellState[][];
  selected?: { row: number; column: number; region: number };
  nextToFocus?: { row: number; column: number };
  gameWon: boolean;
  creatingPuzzleMode: boolean;
  hasError: boolean;
  commandStack: GridCommand[];
  currentCommandIndex: number;
}

export const initialState = (): GridState => ({
  grid: createGridState(),
  gameWon: false,
  creatingPuzzleMode: false,
  hasError: false,
  commandStack: [],
  currentCommandIndex: -1,
});

export interface CellValueChangedOptions {
  value?: CellValue;
  row: number;
  column: number;
}

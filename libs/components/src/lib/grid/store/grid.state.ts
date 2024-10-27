import { CellState, CellValue } from '@sud/domain';
import { Subject } from 'rxjs';
import { createGridState } from './grid.store.helpers';

export type GridCommand = CellValueChangedOptions & {
  previousValue?: CellValue;
  value?: CellValue;
  invalidValues: CellValue[];
};

export interface GridState {
  grid: CellState[][];
  _selected: { row: number; column: number; region: number } | undefined;
  _nextToFocus: { row: number; column: number } | undefined;
  gameWon: boolean;
  creatingPuzzleMode: boolean;
  hasError: boolean;
  lastCellUpdated$: Subject<[row: number, column: number]>;
}

export type GridCommandStack = {
  _commandStack: GridCommand[];
  _lastCommandRunIndex: number;
};

export const initialState = (): GridState => ({
  grid: createGridState(),
  gameWon: false,
  creatingPuzzleMode: false,
  hasError: false,
  _selected: undefined,
  _nextToFocus: undefined,
  lastCellUpdated$: new Subject<[row: number, column: number]>(),
});

export const initialCommandStack = (): GridCommandStack => ({
  _commandStack: [],
  _lastCommandRunIndex: -1,
});

export interface CellValueChangedOptions {
  value?: CellValue;
  row: number;
  column: number;
}

export const noCellSelected = Object.freeze([-1, -1, -1] as const);
export const noCellToFocus = Object.freeze([-1, -1] as const);

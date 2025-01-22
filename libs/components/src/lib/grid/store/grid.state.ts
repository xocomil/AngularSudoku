import { CellState, CellValue } from '@sud/domain';
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
  creatingPuzzleMode: boolean;
  hasError: boolean;
}

type HandleUpdateProp = (
  row: number,
  column: number,
  previousValue: CellValue | undefined,
) => void;

export type GridCommandStack = {
  _commandStack: GridCommand[];
  _lastCommandRunIndex: number;
  _undoRedoHandleUpdate: HandleUpdateProp;
};

export const initialState = (): GridState => ({
  grid: createGridState(),
  creatingPuzzleMode: false,
  hasError: false,
  _selected: undefined,
  _nextToFocus: undefined,
});

export const initialCommandStack = (): GridCommandStack => ({
  _commandStack: [],
  _lastCommandRunIndex: -1,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _undoRedoHandleUpdate: () => {},
});

export type CellValueChangedOptions = {
  value?: CellValue;
  row: number;
  column: number;
};

export type LastCellUpdatedValues = [
  row: number,
  column: number,
  previousValue: CellValue | undefined,
];

export const noCellSelected = Object.freeze([-1, -1, -1] as const);
export const noCellToFocus = Object.freeze([-1, -1] as const);

import { signalStore } from '@ngrx/signals';
import { withManageSelected } from './grid-manage-selected.feature';
import { withGrid } from './grid.feature';
import { withUndoRedo } from './grid.undo-redo.feature';
import { withPencilMarks } from './pencil-marks.feature';
import { withPuzzleMode } from './puzzle-mode.feature';

export const GridStore = signalStore(
  withGrid(),
  withManageSelected(),
  withPuzzleMode(),
  withUndoRedo(),
  withPencilMarks(),
);

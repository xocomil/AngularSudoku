import { signalStore } from '@ngrx/signals';
import { withGameWon } from './game-won.feature';
import { withGridErrors } from './grid-errors.feature';
import { withManageSelected } from './grid-manage-selected.feature';
import { withGrid } from './grid.feature';
import { withUndoRedo } from './grid.undo-redo.feature';
import { withPencilMarks } from './pencil-marks.feature';
import { withPuzzleMode } from './puzzle-mode.feature';
import { withReset } from './reset.feature';

export const GridStore = signalStore(
  withGrid(),
  withGridErrors(),
  withGameWon(),
  withManageSelected(),
  withPuzzleMode(),
  withUndoRedo(),
  withPencilMarks(),
  withReset(),
);

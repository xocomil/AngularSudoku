import { signalStore } from '@ngrx/signals';
import { withGameWon } from './game-won.feature';
import { withGridErrors } from './grid-errors.feature';
import { withManageSelected } from './grid-manage-selected.feature';
import { withGrid } from './grid.feature';
import { withUndoRedo } from './grid.undo-redo.feature';
import { withKeyboardNavigation } from './keyboard-navigation.feature';
import { withPencilMarks } from './pencil-marks.feature';
import { withPuzzleMode } from './puzzle-mode.feature';
import { withReset } from './reset.feature';
import { withSolver } from './solver.feature';

export const GridStore = signalStore(
  withGrid(),
  withGridErrors(),
  withGameWon(),
  withManageSelected(),
  withPuzzleMode(),
  withUndoRedo(),
  withPencilMarks(),
  withReset(),
  withSolver(),
  withKeyboardNavigation(),
);

export type GridStore = InstanceType<typeof GridStore>;

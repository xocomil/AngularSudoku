import { signalStore, withState } from '@ngrx/signals';
import { withManageSelected } from './grid-manage-selected.feature';
import { withGridComputed } from './grid.computed.feature';
import { initialState } from './grid.state';
import { withPuzzleMode } from './puzzle-mode.feature';

export const GridStore = signalStore(
  withState(initialState()),
  withGridComputed(),
  withManageSelected(),
  withPuzzleMode(),
);

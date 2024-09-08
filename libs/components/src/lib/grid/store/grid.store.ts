import { signalStore, withState } from '@ngrx/signals';
import { withGridComputed } from './grid.computed.feature';
import { initialState } from './grid.state';

export const GridStore = signalStore(
  withState(initialState()),
  withGridComputed(),
);

import { signalStore, withState } from '@ngrx/signals';
import { withManageSelected } from './grid-manage-seleccted.feature';
import { withGridComputed } from './grid.computed.feature';
import { initialState } from './grid.state';

export const GridStore = signalStore(
  withState(initialState()),
  withGridComputed(),
  withManageSelected(),
);

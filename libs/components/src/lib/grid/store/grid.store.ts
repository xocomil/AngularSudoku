import { signalStore, withState } from '@ngrx/signals';
import { initialState } from './grid.state';

export const GridStore = signalStore(withState(initialState()));

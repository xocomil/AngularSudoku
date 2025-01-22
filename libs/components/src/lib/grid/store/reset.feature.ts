import {
  patchState,
  signalStoreFeature,
  type,
  withMethods,
} from '@ngrx/signals';
import { GridState } from './grid.state';
import { createGridState } from './grid.store.helpers';

export function withReset<_>() {
  return signalStoreFeature(
    type<{
      state: GridState;
      methods: {
        _resetCommandStack(): void;
      };
    }>(),
    withMethods((state) => ({
      resetGrid() {
        patchState(state, {
          grid: createGridState(),
        });

        state._resetCommandStack();
      },
    })),
  );
}

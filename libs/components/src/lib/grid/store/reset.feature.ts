import { signalStoreFeature, type, withMethods } from '@ngrx/signals';
import { GridResourceState } from './grid-resource.feature.ng';

export function withReset<_>() {
  return signalStoreFeature(
    type<{
      state: GridResourceState;
      methods: {
        _resetCommandStack(): void;
        _resetGrid(): void;
      };
    }>(),
    withMethods((state) => ({
      resetGrid() {
        state._resetGrid();

        state._resetCommandStack();
      },
    })),
  );
}

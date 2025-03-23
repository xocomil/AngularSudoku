import {
  patchState,
  signalStoreFeature,
  type,
  withMethods,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap } from 'rxjs';
import { GridResourceState } from './grid-resource.feature.ng';

export function withPuzzleMode<_>() {
  return signalStoreFeature(
    type<{ state: GridResourceState }>(),
    withMethods((state) => ({
      toggleCreatePuzzleMode: rxMethod<void>(
        pipe(
          tap(() => {
            patchState(state, () => ({
              creatingPuzzleMode: !state.creatingPuzzleMode(),
            }));
          }),
        ),
      ),
    })),
  );
}

import { computed } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  type,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, Subject, tap } from 'rxjs';
import { GridState, LastCellUpdatedValues } from './grid.state';

export function withGameWon<_>() {
  return signalStoreFeature(
    type<{
      state: GridState;
      props: {
        lastCellUpdated$: Subject<LastCellUpdatedValues>;
      };
    }>(),
    withState({ _gridCompleted: false }),
    withMethods((state) => ({
      _checkGridCompleted(): boolean {
        const grid = state.grid();

        for (const row of grid) {
          for (const cellState of row) {
            if (!cellState.value) {
              return false;
            }
          }
        }

        return true;
      },
      _updateGameCompleted(gridCompleted: boolean) {
        patchState(state, { _gridCompleted: gridCompleted });
      },
    })),
    withMethods((state) => ({
      _gameWonWatchCellValueChanges: rxMethod<LastCellUpdatedValues>(
        pipe(
          tap({
            next: () => {
              state._updateGameCompleted(state._checkGridCompleted());
            },
          }),
        ),
      ),
    })),
    withProps((state) => ({
      gameWon: computed(() => !state.hasError() && state._gridCompleted()),
    })),

    withHooks((state) => ({
      onInit() {
        state._gameWonWatchCellValueChanges(state.lastCellUpdated$);
      },
    })),
  );
}

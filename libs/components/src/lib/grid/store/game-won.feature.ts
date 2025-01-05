import {
  signalStoreFeature,
  type,
  withHooks,
  withMethods,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, Subject, tap } from 'rxjs';
import { GridState, LastCellUpdatedValues } from './grid.state';

export function withGameWon<_>() {
  return signalStoreFeature(
    type<{
      state: GridState;
      methods: {
        _updateGameWon(gameWon: boolean): void;
      };
      props: {
        lastCellUpdated$: Subject<LastCellUpdatedValues>;
      };
    }>(),
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
    })),
    withMethods((state) => ({
      _gameWonWatchCellValueChanges: rxMethod<LastCellUpdatedValues>(
        pipe(
          tap({
            next: () => {
              state._updateGameWon(
                !state.hasError() && state._checkGridCompleted(),
              );
            },
          }),
        ),
      ),
    })),

    withHooks((state) => ({
      onInit() {
        state._gameWonWatchCellValueChanges(state.lastCellUpdated$);
      },
    })),
  );
}

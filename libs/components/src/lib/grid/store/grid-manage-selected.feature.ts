import {
  patchState,
  signalStoreFeature,
  type,
  withMethods,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CellState } from '@sud/domain';
import { pipe, tap } from 'rxjs';
import { GridResourceState } from './grid-resource.feature.ng';

export function withManageSelected<_>() {
  return signalStoreFeature(
    type<{ state: GridResourceState }>(),
    withMethods((state) => ({
      updateSelected: rxMethod<CellState>(
        pipe(
          tap((cellState) => {
            patchState(state, updateSelected(cellState));
          }),
        ),
      ),
      resetSelected: rxMethod<void>(
        pipe(
          tap(() => {
            patchState(state, {
              _selected: undefined,
              _nextToFocus: undefined,
            });
          }),
        ),
      ),
    })),
  );
}

function updateSelected(cellState: CellState) {
  return {
    _nextToFocus: undefined,
    _selected: {
      row: cellState.row,
      column: cellState.column,
      region: cellState.region,
    },
  };
}

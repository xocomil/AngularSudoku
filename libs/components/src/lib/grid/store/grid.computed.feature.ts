import { computed } from '@angular/core';
import { signalStoreFeature, type, withComputed } from '@ngrx/signals';
import { GridState, noCellSelected, noCellToFocus } from './grid.state';

export function withGridComputed<_>() {
  return signalStoreFeature(
    type<{ state: GridState }>(),
    withComputed((state) => ({
      selected: computed(() => {
        const selected = state._selected();

        if (selected) {
          return [selected.row, selected.column, selected.region];
        }

        return noCellSelected;
      }),
      nextToFocus: computed(() => {
        const nextToFocus = state._nextToFocus();

        if (nextToFocus) {
          return [nextToFocus.row, nextToFocus.column];
        }

        return noCellToFocus;
      }),
    })),
  );
}

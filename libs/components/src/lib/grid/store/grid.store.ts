import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { CellState, GridDirection } from '@sud/domain';
import produce from 'immer';
import { Observable, of, withLatestFrom } from 'rxjs';
import { createGridState } from './grid.store.helpers';

export interface GridState {
  grid: CellState[][];
  selected?: { row: number; column: number; region: number };
  nextToFocus?: { row: number; column: number };
}

const initialState: GridState = {
  grid: createGridState(),
};

const updateSelected = (cellState: CellState) =>
  write((state: GridState) => {
    state.selected = {
      row: cellState.row,
      column: cellState.column,
      region: cellState.region,
    };
  });

const updateCellValue = (value: number, cellState: CellState) =>
  write((state: GridState) => {
    state.grid[cellState.row][cellState.column].value = value;
  });

const resetSelected = write((state: GridState) => {
  state.selected = undefined;
});

const updateNextToFocus = (cellState: CellState) =>
  write((state: GridState) => {
    state.nextToFocus = { row: cellState.row, column: cellState.column };
  });

const noCellSelected = Object.freeze([-1, -1, -1] as const);
const noCellToFocus = Object.freeze([-1, -1] as const);

@Injectable()
export class GridStore extends ComponentStore<GridState> {
  readonly grid$ = this.select((state) => state.grid);
  readonly selected$: Observable<readonly [number, number, number]> =
    this.select((state) => {
      if (state.selected) {
        return [
          state.selected.row,
          state.selected.column,
          state.selected.region,
        ];
      }

      return noCellSelected;
    });
  readonly nextToFocus$: Observable<readonly [number, number]> = this.select(
    (state) => {
      if (state.nextToFocus) {
        return [state.nextToFocus.row, state.nextToFocus.column];
      }

      return noCellToFocus;
    }
  );

  constructor() {
    super(initialState);
  }

  updateSelected = this.updater((state, cellState: CellState) => {
    const updater = updateSelected(cellState);

    return updater(state);
  });

  resetSelected = this.updater((state) => resetSelected(state));

  updateCellValue = this.updater(
    (
      state: GridState,
      { value, cellState }: { value: number; cellState: CellState }
    ) => {
      const updater = updateCellValue(value, cellState);

      return updater(state);
    }
  );

  navigateToCell = this.effect(
    (
      navigation$: Observable<{
        direction: GridDirection;
        cellState: CellState;
      }>
    ) =>
      navigation$.pipe(
        withLatestFrom(this.grid$),
        tapResponse(
          ([navigation, grid]) => {
            const { direction, cellState } = navigation;

            this.#updateSelectedFromNavigation(direction, cellState, grid);
          },
          (error: unknown) => of({})
        )
      )
  );

  #updateNextToFocus = this.updater((state, cellState: CellState) => {
    const updater = updateNextToFocus(cellState);

    return updater(state);
  });

  #updateSelectedFromNavigation(
    direction: GridDirection,
    cellState: CellState,
    grid: CellState[][]
  ) {
    switch (direction) {
      case GridDirection.Up:
        if (cellState.row > 0) {
          this.#navigateToCell(cellState.column, cellState.row - 1, grid);
        }
        break;
      case GridDirection.Left:
        if (cellState.column > 0) {
          this.#navigateToCell(cellState.column - 1, cellState.row, grid);
        }
        break;
      case GridDirection.Down:
        if (cellState.row < 8) {
          this.#navigateToCell(cellState.column, cellState.row + 1, grid);
        }
        break;
      case GridDirection.Right:
        if (cellState.column < 8) {
          this.#navigateToCell(cellState.column + 1, cellState.row, grid);
        }
        break;
    }
  }

  #navigateToCell(column: number, row: number, grid: CellState[][]) {
    const nextToFocus = grid[row][column];

    this.updateSelected(nextToFocus);
    this.#updateNextToFocus(nextToFocus);
  }
}

export function write<S>(updater: (state: S) => void): (state: S) => S {
  return function (state) {
    return produce(state, (draft) => {
      updater(draft as S);
    });
  };
}

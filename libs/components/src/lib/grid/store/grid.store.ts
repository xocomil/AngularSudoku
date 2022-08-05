import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { CellState, GridDirection } from '@sud/domain';
import { errorAnalyzer } from '@sud/fast-analayzers';
import produce from 'immer';
import { Observable, of, tap, withLatestFrom } from 'rxjs';
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
    state.nextToFocus = undefined;

    state.selected = {
      row: cellState.row,
      column: cellState.column,
      region: cellState.region,
    };
  });

const updateCellValue = (value: number | undefined, cellState: CellState) =>
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

  cellValueChanged = this.effect(
    (cellValue$: Observable<{ value?: number; cellState: CellState }>) =>
      cellValue$.pipe(
        tap((cellValue) => {
          this.#updateCellValue(cellValue);
          this.#checkGridForErrors();
        })
      )
  );

  #checkGridForErrors = this.effect((check$: Observable<void>) =>
    check$.pipe(
      withLatestFrom(this.grid$),
      tap(([_, grid]) => {
        const errors = analyzeErrors(grid);

        this.#updateCellValid(errors);
      })
    )
  );

  #updateCellValid = this.updater((state: GridState, errors: boolean[][]) => {
    return produce(state, (draft) => {
      for (let row = 0; row < draft.grid.length; row++) {
        for (let col = 0; col < draft.grid[row].length; col++) {
          draft.grid[row][col].valid = !errors[row][col];
        }
      }
    });
  });

  #updateCellValue = this.updater(
    (
      state: GridState,
      { value, cellState }: { value?: number; cellState: CellState }
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

const analyzeErrors = (grid: CellState[][]): boolean[][] => {
  const errors = Array<boolean[]>.from({ length: 9 }, () => [] as boolean[]);

  for (let i = 0; i < 9; i++) {
    checkRowForErrors(i, grid, errors);
    // this.#checkColumnForErrors(i);
    // this.#checkRegionForErrors(i);
  }

  return errors;
};

const checkRowForErrors = (
  row: number,
  grid: CellState[][],
  errors: boolean[][]
): void => {
  markCellsWithErrors(grid[row], errors);
};

const markCellsWithErrors = (cells: CellState[], errors: boolean[][]): void => {
  // const makeCellValidFalse = write((draft: CellState) => {
  //   draft.valid = false;
  // });

  errorAnalyzer(cells).forEach((cellState) => {
    errors[cellState.row][cellState.column] = true;
  });
};

/*



#getRowToAnalyze(row: number): CellState[] {
  return [];
  // return this.grid[row];
}

#checkColumnForErrors(column: number): void {
  this.#markCellsWithErrors(this.#getColumnToAnalyze(column));
}

#getColumnToAnalyze(column: number): CellState[] {
  return [];
  // return this.grid.map((row) => row[column]);
}

#checkRegionForErrors(region: number): void {
  this.#markCellsWithErrors(this.#getRegionToAnalyze(region));
}

#getRegionToAnalyze(region: number): CellState[] {
  return [];
  // const column = (region % 3) * 3;
  // const row = region - (region % 3);
  //
  // const regionCells = [];
  //
  // for (let columnIndex = 0; columnIndex < ITEMS_TO_TAKE; columnIndex++) {
  //   for (let rowIndex = 0; rowIndex < ITEMS_TO_TAKE; rowIndex++) {
  //     regionCells.push(this.grid[row + rowIndex][column + columnIndex]);
  //   }
  // }
  //
  // return regionCells;
}

 */

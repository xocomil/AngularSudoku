import {
  patchState,
  signalStoreFeature,
  type,
  withHooks,
  withMethods,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CellState } from '@sud/domain';
import { errorAnalyzer } from '@sud/fast-analayzers';
import { create } from 'mutative';
import { pipe, Subject, tap } from 'rxjs';
import { GridState } from './grid.state';

export function withGridErrors<_>() {
  return signalStoreFeature(
    type<{
      state: GridState;
      methods: {
        _updateGridHasError(hasError: boolean): void;
      };
      props: {
        lastCellUpdated$: Subject<[number, number]>;
      };
    }>(),

    withMethods((state) => ({
      _analyzeErrors(): boolean[][] {
        const errors = Array.from({ length: 9 }, () => [] as boolean[]);
        const grid = state.grid();

        for (let i = 0; i < 9; i++) {
          checkRowForErrors(i, grid, errors);
          checkColumnForErrors(i, grid, errors);
          checkRegionForErrors(i, grid, errors);
        }

        return errors;
      },
      _updateCellValid(errors: boolean[][]) {
        const grid = state.grid();
        let hasError = false;

        const changedGrid = create(grid, (draft) => {
          for (let row = 0; row < draft.length; row++) {
            for (let col = 0; col < draft[row].length; col++) {
              draft[row][col].valid = !errors[row][col];

              hasError = Boolean(errors[row][col]);

              if (!hasError && errors[row][col]) {
                hasError = true;
              }
            }
          }
        });

        patchState(state, { grid: changedGrid, hasError });
      },
    })),
    withMethods((state) => ({
      _gridErrorsWatchCellValueChanges: rxMethod<[row: number, column: number]>(
        pipe(
          tap(() => {
            state._updateGridHasError(false);

            const errors = state._analyzeErrors();

            state._updateCellValid(errors);
          }),
        ),
      ),
    })),
    withHooks((state) => ({
      onInit() {
        state._gridErrorsWatchCellValueChanges(state.lastCellUpdated$);
      },
    })),
  );
}

function checkRowForErrors(
  row: number,
  grid: CellState[][],
  errors: boolean[][],
): void {
  findCellsWithErrors(grid[row], errors);
}

function findCellsWithErrors(cells: CellState[], errors: boolean[][]): void {
  errorAnalyzer(cells).forEach((cellState) => {
    errors[cellState.row][cellState.column] = true;
  });
}

function checkColumnForErrors(
  column: number,
  grid: CellState[][],
  errors: boolean[][],
): void {
  findCellsWithErrors(getColumnToAnalyze(column, grid), errors);
}

function getColumnToAnalyze(column: number, grid: CellState[][]): CellState[] {
  return grid.map((row) => row[column]);
}

function checkRegionForErrors(
  region: number,
  grid: CellState[][],
  errors: boolean[][],
): void {
  findCellsWithErrors(getRegionToAnalyze(region, grid), errors);
}

const ITEMS_TO_TAKE = 3 as const;

function getRegionToAnalyze(region: number, grid: CellState[][]): CellState[] {
  const column = (region % ITEMS_TO_TAKE) * ITEMS_TO_TAKE;
  const row = region - (region % ITEMS_TO_TAKE);

  const regionCells = [];

  for (let columnIndex = 0; columnIndex < ITEMS_TO_TAKE; columnIndex++) {
    for (let rowIndex = 0; rowIndex < ITEMS_TO_TAKE; rowIndex++) {
      regionCells.push(grid[row + rowIndex][column + columnIndex]);
    }
  }

  return regionCells;
}

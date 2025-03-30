import { Signal } from '@angular/core';
import {
  signalStoreFeature,
  type,
  withHooks,
  withMethods,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CellState } from '@sud/domain';
import { errorAnalyzer } from '@sud/fast-analayzers';
import { pipe, Subject, tap } from 'rxjs';
import { GridResourceState } from './grid-resource.feature.ng';
import { LastCellUpdatedValues } from './grid.state';

export function withGridErrors<_>() {
  return signalStoreFeature(
    type<{
      state: GridResourceState;
      methods: {
        _setCellError(hasError: boolean, cellState: CellState): void;
        _updateGridHasError(hasError: boolean): void;
      };
      props: {
        lastCellUpdated$: Subject<LastCellUpdatedValues>;
        grid: Signal<CellState[][]>;
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

        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < grid[row].length; col++) {
            state._setCellError(!!errors[row][col], grid[row][col]);
          }
        }
      },
    })),
    withMethods((state) => ({
      _gridErrorsWatchCellValueChanges: rxMethod<LastCellUpdatedValues>(
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

import { Injectable, Signal } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';

import {
  allPencilMarks,
  CellState,
  CellValue,
  directionModifierValues,
  GridDirection,
  isNavigationDirection,
  valueIsCellValue,
} from '@sud/domain';
import { errorAnalyzer } from '@sud/fast-analayzers';
import { logObservable } from '@xocomil/log-observable';
import { create } from 'mutative';
import { map, Observable, of, tap, withLatestFrom } from 'rxjs';
import { solveOneCell } from '../solvers/wavefunction-collapse.solver';
import {
  CellValueChangedOptions,
  GridCommand,
  GridState,
  initialState,
  noCellSelected,
  noCellToFocus,
} from './grid.state';
import { createGridState } from './grid.store.helpers';

const updateSelected = (cellState: CellState) =>
  write((state: GridState) => {
    state._nextToFocus = undefined;

    state._selected = {
      row: cellState.row,
      column: cellState.column,
      region: cellState.region,
    };
  });

const updateCellValue = (
  value: CellValue | undefined,
  row: number,
  column: number,
  isReadonly: boolean,
) =>
  write((state: GridState) => {
    state.grid[row][column].value = value;
    state.grid[row][column].isReadonly = isReadonly;
  });

const resetSelected = write((state: GridState) => {
  state._selected = undefined;
});

const updateNextToFocus = (cellState: CellState) =>
  write((state: GridState) => {
    state._nextToFocus = { row: cellState.row, column: cellState.column };
  });

function checkGridCompleted(grid: CellState[][]): boolean {
  for (const row of grid) {
    for (const cellState of row) {
      if (!cellState.value) {
        return false;
      }
    }
  }

  return true;
}

const findNextValue = (
  cellState: CellState,
  invalidValues: CellValue[] = [],
): CellValue | undefined => {
  const possibleValues = allPencilMarks.filter(
    (value) =>
      !cellState.columnValuesToHide.includes(value) &&
      !cellState.rowValuesToHide.includes(value) &&
      !cellState.regionValuesToHide.includes(value) &&
      !invalidValues.includes(value),
  );

  const value =
    possibleValues[Math.floor(Math.random() * possibleValues.length)];

  console.log('chosen value for cell', cellState, value);

  return value;
};

@Injectable()
export class GridOldStore extends ComponentStore<GridState> {
  readonly grid = this.selectSignal(({ grid }) => grid);
  readonly #grid$ = this.select((state) => state.grid);
  readonly gameWon = this.selectSignal(({ gameWon }) => gameWon);
  readonly creatingPuzzleMode = this.selectSignal(
    ({ creatingPuzzleMode }) => creatingPuzzleMode,
  );
  readonly #creatingPuzzleMode$ = this.select(
    (state) => state.creatingPuzzleMode,
  );
  readonly hasError$ = this.select((state) => state.hasError);
  readonly selected: Signal<readonly [number, number, number]> =
    this.selectSignal(({ _selected: selected }) => {
      if (selected) {
        return [selected.row, selected.column, selected.region];
      }

      return noCellSelected;
    });
  readonly nextToFocus: Signal<readonly [number, number]> = this.selectSignal(
    ({ _nextToFocus: nextToFocus }) => {
      if (nextToFocus) {
        return [nextToFocus.row, nextToFocus.column];
      }

      return noCellToFocus;
    },
  );
  readonly #commandStack$ = this.select((state) => state.commandStack).pipe(
    logObservable('commandStack'),
  );
  readonly #currentCommandIndex$ = this.select(
    (state) => state.currentCommandIndex,
  );
  readonly #currentCommand$ = this.select(
    (state) => state.commandStack[state.currentCommandIndex],
  );
  readonly #commandStackInvalidValues$: Observable<CellValue[]> =
    this.#currentCommand$.pipe(
      map((currentCommand) => currentCommand?.invalidValues ?? []),
    );

  constructor() {
    super(initialState());
  }

  updateSelected = this.updater((state, cellState: CellState): GridState => {
    const updater = updateSelected(cellState);

    return updater(state);
  });

  resetSelected = this.updater((state): GridState => resetSelected(state));

  cellValueChanged = this.effect(
    (cellValue$: Observable<CellValueChangedOptions>) =>
      cellValue$.pipe(
        withLatestFrom(this.#grid$, this.#creatingPuzzleMode$),
        tap({
          next: ([cellValue, grid, creatingPuzzleMode]) => {
            if (creatingPuzzleMode) {
              this.#createPuzzleCell({
                value: cellValue.value,
                row: cellValue.row,
                column: cellValue.column,
              });

              return;
            }

            this.#changeCellValue(cellValue);
            this.#clearOldCommands();
            this.#updateCommandStack({
              ...cellValue,
              previousValue: grid[cellValue.row][cellValue.column].value,
              invalidValues: [],
            });
          },
        }),
      ),
  );

  #clearOldCommands = this.effect((clearOldCommands$: Observable<void>) =>
    clearOldCommands$.pipe(
      withLatestFrom(this.#currentCommandIndex$, this.#commandStack$),
      tap({
        next: ([, currentCommandIndex, commandStack]) => {
          if (currentCommandIndex < commandStack.length - 1) {
            this.#setCommandStack(
              commandStack.slice(0, currentCommandIndex + 1),
            );
          }
        },
      }),
    ),
  );

  #updateCommandStack = this.updater(
    (state, gridCommand: GridCommand): GridState =>
      create(state, (draft) => {
        draft.commandStack.push(gridCommand);
        draft.currentCommandIndex = draft.commandStack.length - 1;
      }),
  );

  #createPuzzleCell = this.effect(
    (
      changes$: Observable<{
        column: number;
        row: number;
        value: CellValue | undefined;
      }>,
    ) =>
      changes$.pipe(
        tap({
          next: (changes) => {
            this.#updateCellValue({ ...changes, isReadonly: !!changes.value });
            this.#checkGridForErrors();
            this.#updatePencilMarks(changes);
          },
        }),
      ),
  );

  #updatePencilMarks = this.effect(
    (cellValue$: Observable<CellValueChangedOptions>) =>
      cellValue$.pipe(
        withLatestFrom(this.#grid$),
        tap({
          next: ([{ column, row }, grid]) => {
            this.#setRowPencilMarks(grid[row]);
            this.#setColumnPencilMarks(getColumnToAnalyze(column, grid));
            this.#setRegionPencilMarks(
              getRegionToAnalyze(grid[row][column].region, grid),
            );
          },
        }),
      ),
  );

  #setRegionPencilMarks = this.effect((cells$: Observable<CellState[]>) =>
    cells$.pipe(
      withLatestFrom(cells$.pipe(getCellValuesToHide)),
      tap({
        next: ([cells, valuesToHide]) => {
          cells.forEach((cell) => {
            this.#setRegionValuesToHideForCell({
              row: cell.row,
              column: cell.column,
              valuesToHide,
            });
          });
        },
      }),
    ),
  );

  #setColumnPencilMarks = this.effect((cells$: Observable<CellState[]>) =>
    cells$.pipe(
      withLatestFrom(cells$.pipe(getCellValuesToHide)),
      tap({
        next: ([cells, valuesToHide]) => {
          cells.forEach((cell) => {
            this.#setColumnValuesToHideForCell({
              row: cell.row,
              column: cell.column,
              valuesToHide,
            });
          });
        },
      }),
    ),
  );

  #setRowPencilMarks = this.effect((cells$: Observable<CellState[]>) =>
    cells$.pipe(
      withLatestFrom(cells$.pipe(getCellValuesToHide)),
      tap({
        next: ([cells, valuesToHide]) => {
          cells.forEach((cell) => {
            this.#setRowValuesToHideForCell({
              row: cell.row,
              column: cell.column,
              valuesToHide,
            });
          });
        },
      }),
    ),
  );

  toggleCreatePuzzleMode = this.effect((toggleClick$: Observable<void>) =>
    toggleClick$.pipe(
      withLatestFrom(this.#creatingPuzzleMode$),
      tap({
        next: ([, creatingPuzzleMode]) => {
          this.#setCreatePuzzleMode(!creatingPuzzleMode);
        },
      }),
    ),
  );

  #setCreatePuzzleMode = this.updater(
    (state, creatingPuzzleMode: boolean): GridState =>
      create(state, (draft) => {
        draft.creatingPuzzleMode = creatingPuzzleMode;
      }),
  );

  resetGrid = this.effect((resetClick$: Observable<void>) =>
    resetClick$.pipe(
      tap({
        next: () => {
          this.#updateGrid(createGridState());
          this.#checkGridForWin();
          this.#setCommandStack([]);
        },
      }),
    ),
  );

  #setCommandStack = this.updater(
    (state, commandStack: GridCommand[]): GridState =>
      create(state, (draft) => {
        draft.commandStack = commandStack;
        draft.currentCommandIndex = commandStack.length - 1;
      }),
  );

  #updateGrid = this.updater(
    (state, grid: CellState[][]): GridState =>
      create(state, (draft) => {
        draft.grid = grid;
      }),
  );

  solveOneCell = this.effect((solveClick$: Observable<void>) =>
    solveClick$.pipe(
      withLatestFrom(this.#grid$, this.#commandStackInvalidValues$),
      map(([, grid]) => solveOneCell(grid)),
      tap({
        next: (cellState) => {
          if (cellState) {
            const value = findNextValue(cellState);

            if (value == null) {
              this.#unwindBadDecision();

              return;
            }

            this.cellValueChanged({
              row: cellState.row,
              column: cellState.column,
              value,
            });
          }
        },
      }),
    ),
  );

  #unwindBadDecision = this.effect((unwind$: Observable<void>) =>
    unwind$.pipe(
      withLatestFrom(this.#currentCommand$, this.#grid$),
      logObservable('unwinding'),
      tap({
        next: ([, lastCommand, grid]) => {
          const cellState = grid[lastCommand.row][lastCommand.column];

          const invalidValues: CellValue[] = lastCommand.value
            ? [...lastCommand.invalidValues, lastCommand.value]
            : lastCommand.invalidValues;

          console.log('invalidValues', invalidValues, lastCommand);

          const nextValue = findNextValue(cellState, invalidValues);

          this.undo();

          if (nextValue == null) {
            this.#unwindBadDecision();

            return;
          }

          console.log('after recursive call', cellState, lastCommand);

          this.cellValueChanged({
            row: cellState.row,
            column: cellState.column,
            value: nextValue,
          });

          this.#setInvalidValuesForNewCommand(invalidValues);
        },
      }),
    ),
  );

  readonly #setInvalidValuesForNewCommand = this.updater(
    (state, invalidValues: CellValue[]): GridState =>
      create(state, (draft) => {
        console.log('final invalidValues', invalidValues);

        draft.commandStack[draft.currentCommandIndex].invalidValues =
          invalidValues ?? [];
      }),
  );

  #setRegionValuesToHideForCell = this.updater(
    (
      state: GridState,
      update: { row: number; column: number; valuesToHide: CellValue[] },
    ): GridState => {
      return create(state, (draft) => {
        draft.grid[update.row][update.column].regionValuesToHide =
          update.valuesToHide;
      });
    },
  );

  #setColumnValuesToHideForCell = this.updater(
    (
      state: GridState,
      update: { row: number; column: number; valuesToHide: CellValue[] },
    ): GridState => {
      return create(state, (draft) => {
        draft.grid[update.row][update.column].columnValuesToHide =
          update.valuesToHide;
      });
    },
  );

  #setRowValuesToHideForCell = this.updater(
    (
      state: GridState,
      update: { row: number; column: number; valuesToHide: CellValue[] },
    ): GridState => {
      return create(state, (draft) => {
        draft.grid[update.row][update.column].rowValuesToHide =
          update.valuesToHide;
      });
    },
  );

  #checkGridForWin = this.effect((check$: Observable<void>) =>
    check$.pipe(
      withLatestFrom(this.#grid$, this.hasError$),
      tap({
        next: ([, grid, hasError]) => {
          this.#updateGameWon(!hasError && checkGridCompleted(grid));
        },
      }),
    ),
  );

  #updateGameWon = this.updater(
    (state: GridState, gameWon: boolean): GridState => {
      return create(state, (draft) => {
        draft.gameWon = gameWon;
      });
    },
  );

  #checkGridForErrors = this.effect((check$: Observable<void>) =>
    check$.pipe(
      withLatestFrom(this.#grid$),
      tap({
        next: ([, grid]) => {
          this.#updateHasError(false);
          const errors = analyzeErrors(grid);

          this.#updateCellValid(errors);
        },
      }),
    ),
  );

  #updateHasError = this.updater(
    (state: GridState, hasError: boolean): GridState =>
      create(state, (draft) => {
        draft.hasError = hasError;
      }),
  );

  #updateCellValid = this.updater(
    (state: GridState, errors: boolean[][]): GridState => {
      return create(state, (draft) => {
        for (let row = 0; row < draft.grid.length; row++) {
          for (let col = 0; col < draft.grid[row].length; col++) {
            draft.grid[row][col].valid = !errors[row][col];

            if (errors[row][col]) {
              draft.hasError = true;
            }
          }
        }
      });
    },
  );

  #updateCellValue = this.updater(
    (
      state: GridState,
      {
        value,
        row,
        column,
        isReadonly = false,
      }: {
        value?: CellValue;
        row: number;
        column: number;
        isReadonly?: boolean;
      },
    ): GridState => {
      const updater = updateCellValue(value, row, column, isReadonly);

      return updater(state);
    },
  );

  navigateToCell = this.effect(
    (
      navigation$: Observable<{
        direction: GridDirection;
        cellState: CellState;
      }>,
    ) =>
      navigation$.pipe(
        withLatestFrom(this.#grid$, this.#creatingPuzzleMode$),
        tapResponse(
          ([navigation, grid, creatingPuzzleMode]) => {
            const { direction, cellState } = navigation;

            this.#updateSelectedFromNavigation(
              direction,
              cellState,
              grid,
              creatingPuzzleMode,
            );
          },
          (error: unknown) => {
            console.error('navigateToCell error', error);

            return of({});
          },
        ),
      ),
  );

  #updateNextToFocus = this.updater(
    (state, cellState: CellState): GridState => {
      const updater = updateNextToFocus(cellState);

      return updater(state);
    },
  );

  readonly undo = this.effect((undoClick$: Observable<void>) =>
    undoClick$.pipe(
      withLatestFrom(this.#currentCommandIndex$, this.#commandStack$),
      tap({
        next: ([, currentCommandIndex, commandStack]) => {
          if (currentCommandIndex < 0) {
            return;
          }

          const command = commandStack[currentCommandIndex];

          this.#changeCellValue({ ...command, value: command.previousValue });
          this.#changeCurrentCommandIndex(currentCommandIndex - 1);
        },
      }),
    ),
  );

  readonly redo = this.effect((redoClick$: Observable<void>) =>
    redoClick$.pipe(
      withLatestFrom(this.#currentCommandIndex$, this.#commandStack$),
      tap({
        next: ([, currentCommandIndex, commandStack]) => {
          if (currentCommandIndex >= commandStack.length - 1) {
            return;
          }

          const command = commandStack[currentCommandIndex + 1];

          this.#changeCellValue(command);
          this.#changeCurrentCommandIndex(currentCommandIndex + 1);
        },
      }),
    ),
  );

  #changeCurrentCommandIndex = this.updater(
    (state, currentCommandIndex: number): GridState =>
      create(state, (draft) => {
        draft.currentCommandIndex = currentCommandIndex;
      }),
  );

  #changeCellValue(cellValue: CellValueChangedOptions): void {
    this.#updateCellValue(cellValue);
    this.#checkGridForErrors();
    this.#checkGridForWin();
    this.#updatePencilMarks(cellValue);
  }

  #updateSelectedFromNavigation(
    direction: GridDirection,
    cellState: CellState,
    grid: CellState[][],
    creatingPuzzleMode: boolean,
  ) {
    const nextCell = findNextCellToFocus(
      direction,
      cellState,
      grid,
      creatingPuzzleMode,
    );

    this.#navigateToCell(nextCell.column, nextCell.row, grid);
  }

  #navigateToCell(column: number, row: number, grid: CellState[][]) {
    const nextToFocus = grid[row][column];

    this.updateSelected(nextToFocus);
    this.#updateNextToFocus(nextToFocus);
  }
}

export function write<S>(updater: (state: S) => void): (state: S) => S {
  return function (state) {
    return create(state, (draft) => {
      updater(draft as S);
    });
  };
}

const analyzeErrors = (grid: CellState[][]): boolean[][] => {
  const errors = Array.from({ length: 9 }, () => [] as boolean[]);

  for (let i = 0; i < 9; i++) {
    checkRowForErrors(i, grid, errors);
    checkColumnForErrors(i, grid, errors);
    checkRegionForErrors(i, grid, errors);
  }

  return errors;
};

const checkRowForErrors = (
  row: number,
  grid: CellState[][],
  errors: boolean[][],
): void => {
  markCellsWithErrors(grid[row], errors);
};

const markCellsWithErrors = (cells: CellState[], errors: boolean[][]): void => {
  errorAnalyzer(cells).forEach((cellState) => {
    errors[cellState.row][cellState.column] = true;
  });
};

const checkColumnForErrors = (
  column: number,
  grid: CellState[][],
  errors: boolean[][],
): void => {
  markCellsWithErrors(getColumnToAnalyze(column, grid), errors);
};

const getColumnToAnalyze = (
  column: number,
  grid: CellState[][],
): CellState[] => {
  return grid.map((row) => row[column]);
};

const checkRegionForErrors = (
  region: number,
  grid: CellState[][],
  errors: boolean[][],
): void => {
  markCellsWithErrors(getRegionToAnalyze(region, grid), errors);
};

const ITEMS_TO_TAKE = 3 as const;

const getRegionToAnalyze = (
  region: number,
  grid: CellState[][],
): CellState[] => {
  const column = (region % 3) * 3;
  const row = region - (region % 3);

  const regionCells = [];

  for (let columnIndex = 0; columnIndex < ITEMS_TO_TAKE; columnIndex++) {
    for (let rowIndex = 0; rowIndex < ITEMS_TO_TAKE; rowIndex++) {
      regionCells.push(grid[row + rowIndex][column + columnIndex]);
    }
  }

  return regionCells;
};

const getCellValuesToHide = (
  cells$: Observable<CellState[]>,
): Observable<CellValue[]> =>
  cells$.pipe(
    map((cells) => cells.map((cell) => cell.value).filter(valueIsCellValue)),
  );

function findNextCellToFocus(
  direction: GridDirection,
  cellState: CellState,
  grid: CellState[][],
  creatingPuzzleMode: boolean,
): CellState {
  if (!isNavigationDirection(direction)) {
    return cellState;
  }

  const getNextCell = partialGetNextCellState(
    grid,
    directionModifierValues[direction],
  );

  let nextCell = getNextCell(cellState);

  while (nextCell != null && !creatingPuzzleMode && nextCell.isReadonly) {
    nextCell = getNextCell(nextCell);
  }

  return nextCell ? nextCell : cellState;
}

function partialGetNextCellState(
  grid: CellState[][],
  directionModifiers: { row: number; col: number },
) {
  return (cellState: CellState) =>
    getNextCellState(grid, cellState, directionModifiers);
}

function getNextCellState(
  grid: CellState[][],
  cellState: CellState,
  directionModifiers: { row: number; col: number },
): CellState {
  const { row: rowModifier, col: colModifier } = directionModifiers;

  return grid[cellState.row + rowModifier]?.[cellState.column + colModifier];
}

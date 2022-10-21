import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { allPencilMarks, CellState, CellValue, GridDirection, valueIsCellValue } from '@sud/domain';
import { errorAnalyzer } from '@sud/fast-analayzers';
import { logObservable } from '@sud/rxjs-operators';
import produce from 'immer';
import { map, Observable, of, tap, withLatestFrom } from 'rxjs';
import { solveOneCell } from '../solvers/wavefunction-collapse.solver';
import { createGridState } from './grid.store.helpers';

type GridCommand = CellValueChangedOptions & { previousValue?: CellValue; value?: CellValue; invalidValues: CellValue[] };

export interface GridState {
  grid: CellState[][];
  selected?: { row: number; column: number; region: number };
  nextToFocus?: { row: number; column: number };
  gameWon: boolean;
  creatingPuzzleMode: boolean;
  hasError: boolean;
  commandStack: GridCommand[];
  currentCommandIndex: number;
}

const initialState: GridState = {
  grid: createGridState(),
  gameWon: false,
  creatingPuzzleMode: false,
  hasError: false,
  commandStack: [],
  currentCommandIndex: -1,
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

const updateCellValue = (value: CellValue | undefined, row: number, column: number, isReadonly: boolean) =>
  write((state: GridState) => {
    state.grid[row][column].value = value;
    state.grid[row][column].isReadonly = isReadonly;
  });

const resetSelected = write((state: GridState) => {
  state.selected = undefined;
});

const updateNextToFocus = (cellState: CellState) =>
  write((state: GridState) => {
    state.nextToFocus = { row: cellState.row, column: cellState.column };
  });

export const noCellSelected = Object.freeze([-1, -1, -1] as const);
export const noCellToFocus = Object.freeze([-1, -1] as const);

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

interface CellValueChangedOptions {
  value?: CellValue;
  row: number;
  column: number;
}

const findNextValue = (cellState: CellState, invalidValues: CellValue[] = []): CellValue | undefined => {
  const possibleValues = allPencilMarks.filter(
    (value) =>
      !cellState.columnValuesToHide.includes(value) &&
      !cellState.rowValuesToHide.includes(value) &&
      !cellState.regionValuesToHide.includes(value) &&
      !invalidValues.includes(value)
  );

  const value = possibleValues[Math.floor(Math.random() * possibleValues.length)];

  console.log('chosen value for cell', cellState, value);

  return value;
};

@Injectable()
export class GridStore extends ComponentStore<GridState> {
  readonly grid$ = this.select((state) => state.grid);
  readonly gameWon$ = this.select((state: GridState) => state.gameWon);
  readonly creatingPuzzleMode$ = this.select((state) => state.creatingPuzzleMode);
  readonly hasError$ = this.select((state) => state.hasError);
  readonly selected$: Observable<readonly [number, number, number]> = this.select((state) => {
    if (state.selected) {
      return [state.selected.row, state.selected.column, state.selected.region];
    }

    return noCellSelected;
  });
  readonly nextToFocus$: Observable<readonly [number, number]> = this.select((state) => {
    if (state.nextToFocus) {
      return [state.nextToFocus.row, state.nextToFocus.column];
    }

    return noCellToFocus;
  });
  readonly #commandStack$ = this.select((state) => state.commandStack).pipe(logObservable('commandStack'));
  readonly #currentCommandIndex$ = this.select((state) => state.currentCommandIndex);
  readonly #currentCommand$ = this.select((state) => state.commandStack[state.currentCommandIndex]);
  readonly #commandStackInvalidValues$: Observable<CellValue[]> = this.#currentCommand$.pipe(
    map((currentCommand) => currentCommand?.invalidValues ?? [])
  );

  constructor() {
    super(initialState);
  }

  updateSelected = this.updater((state, cellState: CellState): GridState => {
    const updater = updateSelected(cellState);

    return updater(state);
  });

  resetSelected = this.updater((state): GridState => resetSelected(state));

  cellValueChanged = this.effect((cellValue$: Observable<CellValueChangedOptions>) =>
    cellValue$.pipe(
      withLatestFrom(this.grid$, this.creatingPuzzleMode$),
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
          this.#updateCommandStack({ ...cellValue, previousValue: grid[cellValue.row][cellValue.column].value, invalidValues: [] });
        },
      })
    )
  );

  #clearOldCommands = this.effect((clearOldCommands$: Observable<void>) =>
    clearOldCommands$.pipe(
      withLatestFrom(this.#currentCommandIndex$, this.#commandStack$),
      tap({
        next: ([, currentCommandIndex, commandStack]) => {
          if (currentCommandIndex < commandStack.length - 1) {
            this.#setCommandStack(commandStack.slice(0, currentCommandIndex + 1));
          }
        },
      })
    )
  );

  #updateCommandStack = this.updater((state, gridCommand: GridCommand) =>
    produce(state, (draft) => {
      draft.commandStack.push(gridCommand);
      draft.currentCommandIndex = draft.commandStack.length - 1;
    })
  );

  #createPuzzleCell = this.effect(
    (
      changes$: Observable<{
        column: number;
        row: number;
        value: CellValue | undefined;
      }>
    ) =>
      changes$.pipe(
        tap({
          next: (changes) => {
            this.#updateCellValue({ ...changes, isReadonly: !!changes.value });
            this.#checkGridForErrors();
            this.#updatePencilMarks(changes);
          },
        })
      )
  );

  #updatePencilMarks = this.effect((cellValue$: Observable<CellValueChangedOptions>) =>
    cellValue$.pipe(
      withLatestFrom(this.grid$),
      tap({
        next: ([{ column, row }, grid]) => {
          this.#setRowPencilMarks(grid[row]);
          this.#setColumnPencilMarks(getColumnToAnalyze(column, grid));
          this.#setRegionPencilMarks(getRegionToAnalyze(grid[row][column].region, grid));
        },
      })
    )
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
      })
    )
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
      })
    )
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
      })
    )
  );

  toggleCreatePuzzleMode = this.effect((toggleClick$: Observable<void>) =>
    toggleClick$.pipe(
      withLatestFrom(this.creatingPuzzleMode$),
      tap({
        next: ([, creatingPuzzleMode]) => {
          this.#setCreatePuzzleMode(!creatingPuzzleMode);
        },
      })
    )
  );

  #setCreatePuzzleMode = this.updater((state, creatingPuzzleMode: boolean) =>
    produce(state, (draft) => {
      draft.creatingPuzzleMode = creatingPuzzleMode;
    })
  );

  resetGrid = this.effect((resetClick$: Observable<void>) =>
    resetClick$.pipe(
      tap({
        next: () => {
          this.#updateGrid(createGridState());
          this.#checkGridForWin();
          this.#setCommandStack([]);
        },
      })
    )
  );

  #setCommandStack = this.updater((state, commandStack: GridCommand[]) =>
    produce(state, (draft) => {
      draft.commandStack = commandStack;
      draft.currentCommandIndex = commandStack.length - 1;
    })
  );

  #updateGrid = this.updater((state, grid: CellState[][]) =>
    produce(state, (draft) => {
      draft.grid = grid;
    })
  );

  solveOneCell = this.effect((solveClick$: Observable<void>) =>
    solveClick$.pipe(
      withLatestFrom(this.grid$, this.#commandStackInvalidValues$),
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
      })
    )
  );

  #unwindBadDecision = this.effect((unwind$: Observable<void>) =>
    unwind$.pipe(
      withLatestFrom(this.#currentCommand$, this.grid$),
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
      })
    )
  );

  readonly #setInvalidValuesForNewCommand = this.updater((state, invalidValues: CellValue[]) =>
    produce(state, (draft) => {
      console.log('final invalidValues', invalidValues);

      draft.commandStack[draft.currentCommandIndex].invalidValues = invalidValues ?? [];
    })
  );

  #setRegionValuesToHideForCell = this.updater((state: GridState, update: { row: number; column: number; valuesToHide: CellValue[] }) => {
    return produce(state, (draft) => {
      draft.grid[update.row][update.column].regionValuesToHide = update.valuesToHide;
    });
  });

  #setColumnValuesToHideForCell = this.updater((state: GridState, update: { row: number; column: number; valuesToHide: CellValue[] }) => {
    return produce(state, (draft) => {
      draft.grid[update.row][update.column].columnValuesToHide = update.valuesToHide;
    });
  });

  #setRowValuesToHideForCell = this.updater((state: GridState, update: { row: number; column: number; valuesToHide: CellValue[] }) => {
    return produce(state, (draft) => {
      draft.grid[update.row][update.column].rowValuesToHide = update.valuesToHide;
    });
  });

  #checkGridForWin = this.effect((check$: Observable<void>) =>
    check$.pipe(
      withLatestFrom(this.grid$, this.hasError$),
      tap({
        next: ([, grid, hasError]) => {
          this.#updateGameWon(!hasError && checkGridCompleted(grid));
        },
      })
    )
  );

  #updateGameWon = this.updater((state: GridState, gameWon: boolean) => {
    return produce(state, (draft) => {
      draft.gameWon = gameWon;
    });
  });

  #checkGridForErrors = this.effect((check$: Observable<void>) =>
    check$.pipe(
      withLatestFrom(this.grid$),
      tap({
        next: ([_, grid]) => {
          this.#updateHasError(false);
          const errors = analyzeErrors(grid);

          this.#updateCellValid(errors);
        },
      })
    )
  );

  #updateHasError = this.updater((state: GridState, hasError: boolean) =>
    produce(state, (draft) => {
      draft.hasError = hasError;
    })
  );

  #updateCellValid = this.updater((state: GridState, errors: boolean[][]) => {
    return produce(state, (draft) => {
      for (let row = 0; row < draft.grid.length; row++) {
        for (let col = 0; col < draft.grid[row].length; col++) {
          draft.grid[row][col].valid = !errors[row][col];

          if (errors[row][col]) {
            draft.hasError = true;
          }
        }
      }
    });
  });

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
      }
    ) => {
      const updater = updateCellValue(value, row, column, isReadonly);

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
      })
    )
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
      })
    )
  );

  #changeCurrentCommandIndex = this.updater((state, currentCommandIndex: number) =>
    produce(state, (draft) => {
      draft.currentCommandIndex = currentCommandIndex;
    })
  );

  #changeCellValue(cellValue: CellValueChangedOptions): void {
    this.#updateCellValue(cellValue);
    this.#checkGridForErrors();
    this.#checkGridForWin();
    this.#updatePencilMarks(cellValue);
  }

  #updateSelectedFromNavigation(direction: GridDirection, cellState: CellState, grid: CellState[][]) {
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
  const errors = Array.from({ length: 9 }, () => [] as boolean[]);

  for (let i = 0; i < 9; i++) {
    checkRowForErrors(i, grid, errors);
    checkColumnForErrors(i, grid, errors);
    checkRegionForErrors(i, grid, errors);
  }

  return errors;
};

const checkRowForErrors = (row: number, grid: CellState[][], errors: boolean[][]): void => {
  markCellsWithErrors(grid[row], errors);
};

const markCellsWithErrors = (cells: CellState[], errors: boolean[][]): void => {
  errorAnalyzer(cells).forEach((cellState) => {
    errors[cellState.row][cellState.column] = true;
  });
};

const checkColumnForErrors = (column: number, grid: CellState[][], errors: boolean[][]): void => {
  markCellsWithErrors(getColumnToAnalyze(column, grid), errors);
};

const getColumnToAnalyze = (column: number, grid: CellState[][]): CellState[] => {
  return grid.map((row) => row[column]);
};

const checkRegionForErrors = (region: number, grid: CellState[][], errors: boolean[][]): void => {
  markCellsWithErrors(getRegionToAnalyze(region, grid), errors);
};

const ITEMS_TO_TAKE = 3 as const;

const getRegionToAnalyze = (region: number, grid: CellState[][]): CellState[] => {
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

const getCellValuesToHide = (cells$: Observable<CellState[]>): Observable<CellValue[]> =>
  cells$.pipe(map((cells) => cells.map((cell) => cell.value).filter(valueIsCellValue)));

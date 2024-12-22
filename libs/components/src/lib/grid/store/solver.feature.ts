import { Signal } from '@angular/core';
import { signalStoreFeature, type, withMethods } from '@ngrx/signals';
import { allPencilMarks, CellState, CellValue } from '@sud/domain';
import { solveOneCell } from '../solvers/wavefunction-collapse.solver';
import { GridCommand, GridCommandStack, GridState } from './grid.state';

export function withSolver<_>() {
  return signalStoreFeature(
    type<{
      state: GridState & GridCommandStack;
      props: {
        _currentCommand: Signal<GridCommand>;
      };
      methods: {
        _setCommandStack(commandStack: GridCommand[]): void;
        undo(): void;
        _updateCellValue(value: {
          value?: CellValue;
          row: number;
          column: number;
          isReadonly?: boolean;
        }): void;
      };
    }>(),
    withMethods((state) => ({
      _setInvalidValuesForNewCommand(invalidValues: CellValue[]) {
        console.log('final invalidValues', invalidValues);

        const commandStack = state._commandStack();

        commandStack[state._lastCommandRunIndex()].invalidValues =
          invalidValues ?? [];

        state._setCommandStack(commandStack);
      },
    })),
    withMethods((state) => {
      function _unwindBadDecision() {
        const grid = state.grid();
        const lastCommand = state._currentCommand();

        console.log('unwinding', grid, lastCommand);

        const cellState = grid[lastCommand.row][lastCommand.column];
        const invalidValues = lastCommand.value
          ? [...lastCommand.invalidValues, lastCommand.value]
          : lastCommand.invalidValues;

        console.log('invalidValues', invalidValues, lastCommand);

        const nextValue = findNextValue(cellState, invalidValues);

        state.undo();

        if (nextValue == null) {
          _unwindBadDecision();

          return;
        }

        console.log('after recursive call', cellState, lastCommand);

        state._updateCellValue({
          row: cellState.row,
          column: cellState.column,
          value: nextValue,
        });

        state._setInvalidValuesForNewCommand(invalidValues);
      }

      return { _unwindBadDecision };
    }),
    withMethods((state) => ({
      solveOneCell() {
        const grid = state.grid();

        const nextCellToSolve = solveOneCell(grid);

        if (nextCellToSolve) {
          const value = findNextValue(nextCellToSolve);

          if (value == null) {
            state._unwindBadDecision();

            return;
          }

          state._updateCellValue({
            row: nextCellToSolve.row,
            column: nextCellToSolve.column,
            value,
          });
        }
      },
    })),
  );
}

function findNextValue(
  cellState: CellState,
  invalidValues: CellValue[] = [],
): CellValue | undefined {
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
}

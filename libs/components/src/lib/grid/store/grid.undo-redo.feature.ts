import { computed } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  type,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CellValue } from '@sud/domain';
import { pipe, Subject, tap } from 'rxjs';
import {
  GridCommand,
  GridState,
  initialCommandStack,
  LastCellUpdatedValues,
} from './grid.state';

type UndoRedoState = {
  state: GridState;
  methods: {
    _updateCellValue(value: {
      value?: CellValue;
      row: number;
      column: number;
      isReadonly?: boolean;
    }): void;
  };
  props: {
    lastCellUpdated$: Subject<LastCellUpdatedValues>;
  };
};

export function withUndoRedo<_>() {
  return signalStoreFeature(
    type<UndoRedoState>(),
    withState(initialCommandStack()),
    withComputed((state) => ({
      _currentCommand: computed(
        () => state._commandStack()[state._lastCommandRunIndex()],
      ),
      _commandStackLength: computed(() => state._commandStack().length),
    })),
    withMethods((state) => ({
      _setCommandStack(commandStack: GridCommand[]) {
        patchState(state, {
          _commandStack: commandStack,
          _lastCommandRunIndex: commandStack.length - 1,
        });
      },
    })),
    withMethods((state) => ({
      _clearOldCommands() {
        const { _lastCommandRunIndex, _commandStack, _commandStackLength } =
          state;

        const lastCommandRunIndex = _lastCommandRunIndex();
        const commandStack = _commandStack();

        if (lastCommandRunIndex < _commandStackLength() - 1) {
          state._setCommandStack(
            commandStack.slice(0, lastCommandRunIndex + 1),
          );
        }
      },
      _changeCurrentCommandIndex(currentCommandIndex: number) {
        patchState(state, {
          _lastCommandRunIndex: currentCommandIndex,
        });
      },
    })),
    withMethods((state) => {
      const _updateHandler = (
        row: number,
        column: number,
        previousValue: CellValue | undefined,
      ) => {
        const changedCell = state.grid()[row][column];

        const newCommand: GridCommand = {
          row,
          column,
          value: changedCell.value,
          previousValue: previousValue,
          invalidValues: [],
        };

        state._clearOldCommands();

        state._setCommandStack([...state._commandStack(), newCommand]);
      };

      return {
        _noOpHandler() {
          patchState(state, { _undoRedoHandleUpdate: _updateHandler });
        },
        _updateHandler,
      };
    }),
    withMethods((state) => ({
      _noopUpdate(updates: {
        cellUpdate: { value?: CellValue; row: number; column: number };
        nextCommandIndex: number;
      }) {
        patchState(state, { _undoRedoHandleUpdate: state._noOpHandler });

        state._updateCellValue(updates.cellUpdate);
        state._changeCurrentCommandIndex(updates.nextCommandIndex);
      },
    })),
    withMethods((state) => ({
      undo() {
        const { _lastCommandRunIndex, _commandStack } = state;
        const lastCommandRunIndex = _lastCommandRunIndex();

        if (lastCommandRunIndex < 0) {
          return;
        }

        const command = _commandStack()[lastCommandRunIndex];

        state._noopUpdate({
          cellUpdate: { ...command, value: command.previousValue },
          nextCommandIndex: lastCommandRunIndex - 1,
        });
      },
      redo() {
        const { _lastCommandRunIndex, _commandStack, _commandStackLength } =
          state;
        const lastCommandRunIndex = _lastCommandRunIndex();

        if (lastCommandRunIndex >= _commandStackLength() - 1) {
          return;
        }

        const command = _commandStack()[lastCommandRunIndex + 1];

        state._noopUpdate({
          cellUpdate: command,
          nextCommandIndex: lastCommandRunIndex + 1,
        });
      },
      _resetCommandStack() {
        state._setCommandStack([]);
      },
      _undoRedoWatchCellValueChanges: rxMethod<LastCellUpdatedValues>(
        pipe(
          tap(([row, column, previousValue]) => {
            state._undoRedoHandleUpdate()(row, column, previousValue);
          }),
        ),
      ),
    })),
    withHooks((state) => ({
      onInit() {
        patchState(state, { _undoRedoHandleUpdate: state._updateHandler });

        state._undoRedoWatchCellValueChanges(state.lastCellUpdated$);
      },
    })),
  );
}

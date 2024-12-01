import { computed } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  type,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { CellValue } from '@sud/domain';
import { GridCommand, initialCommandStack } from './grid.state';

export function withUndoRedo<_>() {
  return signalStoreFeature(
    type<{
      methods: {
        _updateCellValue(value: {
          value?: CellValue;
          row: number;
          column: number;
          isReadonly?: boolean;
        }): void;
      };
    }>(),
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
    withMethods((state) => ({
      undo() {
        const { _lastCommandRunIndex, _commandStack } = state;
        const lastCommandRunIndex = _lastCommandRunIndex();

        if (lastCommandRunIndex < 0) {
          return;
        }

        const command = _commandStack()[lastCommandRunIndex];

        state._updateCellValue({ ...command, value: command.previousValue });
        state._changeCurrentCommandIndex(lastCommandRunIndex - 1);
      },
      redo() {
        const { _lastCommandRunIndex, _commandStack, _commandStackLength } =
          state;
        const lastCommandRunIndex = _lastCommandRunIndex();

        if (lastCommandRunIndex >= _commandStackLength() - 1) {
          return;
        }

        const command = _commandStack()[lastCommandRunIndex + 1];

        state._updateCellValue(command);
        state._changeCurrentCommandIndex(lastCommandRunIndex + 1);
      },
      _resetCommandStack() {
        state._setCommandStack([]);
      },
    })),
  );
}

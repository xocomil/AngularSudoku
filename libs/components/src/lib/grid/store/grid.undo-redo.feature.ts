import { computed } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { GridCommand, initialCommandStack } from './grid.state';

export function withUndoRedo() {
  return signalStoreFeature(
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

        // TODO: Add back when adding changeCellValue
        // const command = _commandStack()[lastCommandRunIndex];

        // this.#changeCellValue({ ...command, value: command.previousValue });
        state._changeCurrentCommandIndex(lastCommandRunIndex - 1);
      },
      redo() {
        const { _lastCommandRunIndex, _commandStack, _commandStackLength } =
          state;
        const lastCommandRunIndex = _lastCommandRunIndex();

        if (lastCommandRunIndex >= _commandStackLength() - 1) {
          return;
        }

        // TODO: Add back when adding changeCellValue
        // const command = _commandStack()[lastCommandRunIndex + 1];
        //
        // this.#changeCellValue(command);
        state._changeCurrentCommandIndex(lastCommandRunIndex + 1);
      },
    })),
  );
}

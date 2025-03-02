import { resource, Signal } from '@angular/core';
import { CellState, CellValue } from '@sud/domain';
import { create } from 'mutative';
import { createGridState } from '../store/grid.store.helpers';

const GridCommandTypes = {
  updateCell: 'updateCell',
  setGridValues: 'setGridValues',
  none: 'none',
} as const;

export type GridResourceProps = {
  currentGrid?: CellState[][];
  gridCommandsMap: Signal<GridCommands>;
};

type NoCommand = {
  type: (typeof GridCommandTypes)['none'];
};

type UpdateCell = {
  type: (typeof GridCommandTypes)['updateCell'];
  props: {
    row: number;
    column: number;
    isReadonly: boolean;
    value?: CellValue;
  };
};

type SetGridValues = {
  type: (typeof GridCommandTypes)['setGridValues'];
  props: {
    values: Readonly<Readonly<(CellValue | undefined)[]>[]>;
  };
};

export type GridCommands = UpdateCell | SetGridValues | NoCommand;

export function createGridResource({
  currentGrid,
  gridCommandsMap,
}: GridResourceProps) {
  let grid = currentGrid ?? createGridState();

  return resource({
    request: () => ({ command: gridCommandsMap }),
    loader: ({ request: { command } }) => {
      const currentCommand = command();

      switch (currentCommand.type) {
        case GridCommandTypes.setGridValues:
          grid = setGridValues(currentCommand.props.values);
          break;
        case GridCommandTypes.updateCell:
          grid = updateGrid(grid, currentCommand.props);
          break;
        default:
          console.warn('Unknown Grid Resource Command', currentCommand);
      }

      return Promise.resolve(grid);
    },
    defaultValue: grid,
  });
}

function setGridValues(
  values: Readonly<Readonly<(CellValue | undefined)[]>[]>,
): CellState[][] {
  return values.map((row, rowIndex) => {
    return row.map(
      (value, columnIndex) =>
        ({
          row: rowIndex,
          column: columnIndex,
          value,
          isReadonly: false,
        }) as CellState,
    );
  });
}

function updateGrid(
  grid: CellState[][],
  props: {
    row: number;
    column: number;
    value?: CellValue;
    isReadonly?: boolean;
  },
) {
  return create(grid, (draft) => {
    draft[props.row][props.column].value = props.value;
    draft[props.row][props.column].isReadonly = props.isReadonly ?? false;
  });
}

export function noGridCommand(): NoCommand {
  return {
    type: GridCommandTypes.none,
  };
}

export function updateGridCellCommand(
  row: number,
  column: number,
  value?: CellValue,
  isReadonly = false,
): UpdateCell {
  return {
    type: GridCommandTypes.updateCell,
    props: {
      row,
      column,
      isReadonly,
      value,
    },
  };
}

export function setGridValuesCommand(
  values: Readonly<Readonly<(CellValue | undefined)[]>[]>,
): SetGridValues {
  return {
    type: GridCommandTypes.setGridValues,
    props: {
      values,
    },
  };
}

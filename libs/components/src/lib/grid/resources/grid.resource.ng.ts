import { resource, Signal } from '@angular/core';
import { CellState, CellValue } from '@sud/domain';
import { create } from 'mutative';
import { createGridState } from '../store/grid.store.helpers';

const GridCommandTypes = {
  reset: 'reset',
  setGridValues: 'setGridValues',
  updateCell: 'updateCell',
  updateColumn: 'updateColumn',
  updateRegion: 'updateRegion',
  updateRow: 'updateRow',
  none: 'none',
} as const;

export type GridResourceProps = {
  currentGrid?: CellState[][];
  gridCommandsMap: Signal<GridCommands>;
};

type NoCommand = {
  type: (typeof GridCommandTypes)['none'];
};

type ResetCommand = {
  type: (typeof GridCommandTypes)['reset'];
};

type UpdateCell = {
  type: (typeof GridCommandTypes)['updateCell'];
  props: {
    row: number;
    column: number;
    isReadonly: boolean;
    value?: CellValue;
    hasError: boolean;
  };
};

type SetGridValues = {
  type: (typeof GridCommandTypes)['setGridValues'];
  props: {
    values: Readonly<Readonly<(CellValue | undefined)[]>[]>;
  };
};

type UpdateRow = {
  type: (typeof GridCommandTypes)['updateRow'];
  props: {
    row: number;
    values: CellState[];
  };
};

type UpdateColumn = {
  type: (typeof GridCommandTypes)['updateColumn'];
  props: {
    updatedColumnOrRegion: CellState[];
  };
};

type UpdateRegion = {
  type: (typeof GridCommandTypes)['updateRegion'];
  props: UpdateColumn['props'];
};

export type GridCommands =
  | ResetCommand
  | SetGridValues
  | UpdateCell
  | UpdateColumn
  | UpdateRegion
  | UpdateRow
  | NoCommand;

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
        case GridCommandTypes.updateCell:
          grid = updateCell(grid, currentCommand.props);
          break;
        case GridCommandTypes.setGridValues:
          grid = setGridValues(currentCommand.props.values);
          break;
        case GridCommandTypes.updateRow:
          grid = updateRow(grid, currentCommand.props);

          break;
        case GridCommandTypes.updateColumn:
        case GridCommandTypes.updateRegion:
          grid = updateColumnOrRegion(grid, currentCommand.props);

          break;
        case GridCommandTypes.reset:
          grid = createGridState();

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
  values: SetGridValues['props']['values'],
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

function updateCell(grid: CellState[][], props: UpdateCell['props']) {
  return create(grid, (draft) => {
    draft[props.row][props.column].value = props.value;
    draft[props.row][props.column].isReadonly = props.isReadonly ?? false;
  });
}

function updateRow(
  grid: CellState[][],
  props: UpdateRow['props'],
): CellState[][] {
  return create(grid, (draft) => {
    draft[props.row] = props.values;
  });
}

function updateColumnOrRegion(
  grid: CellState[][],
  props: UpdateColumn['props'],
): CellState[][] {
  return create(grid, (draft) => {
    props.updatedColumnOrRegion.forEach((cell) => {
      draft[cell.row][cell.column] = cell;
    });
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
  hasError = false,
): UpdateCell {
  return {
    type: GridCommandTypes.updateCell,
    props: {
      row,
      column,
      isReadonly,
      value,
      hasError,
    },
  };
}

export function updateGridRowCommand(
  row: number,
  values: CellState[],
): UpdateRow {
  return {
    type: GridCommandTypes.updateRow,
    props: {
      row,
      values,
    },
  };
}

export function updateGridColumnCommand(
  updatedColumn: CellState[],
): UpdateColumn {
  return {
    type: GridCommandTypes.updateColumn,
    props: {
      updatedColumnOrRegion: updatedColumn,
    },
  };
}

export function updateGridRegionCommand(
  updateRegion: CellState[],
): UpdateRegion {
  return {
    type: GridCommandTypes.updateRegion,
    props: {
      updatedColumnOrRegion: updateRegion,
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

export function resetGridCommand(): ResetCommand {
  return {
    type: GridCommandTypes.reset,
  };
}

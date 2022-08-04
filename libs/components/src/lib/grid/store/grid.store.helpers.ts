import { CellState, createCellState } from '@sud/domain';

export const calcGridRegion = (col: number, row: number): number => {
  const gridColumn = Math.trunc(col / 3);
  const gridRow = row - (row % 3);
  return gridColumn + gridRow;
};

export const createGridState = (): CellState[][] => {
  return Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, value) =>
      createCellState({
        row,
        column: value,
        region: calcGridRegion(value, row),
      })
    )
  );
};

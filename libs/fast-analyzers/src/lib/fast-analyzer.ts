import { CellState } from '@sud/domain';

export const errorAnalyzer = (cells: CellState[]): [number, number][] => {
  const valueMap = new Map<number, CellState[]>();

  cells.forEach((currentCell) => {
    if (currentCell.value != null) {
      const currentCellsWithValue = valueMap.get(currentCell.value);

      if (currentCellsWithValue) {
        valueMap.set(currentCell.value, [
          ...currentCellsWithValue,
          currentCell,
        ]);
      } else {
        valueMap.set(currentCell.value, [currentCell]);
      }
    }
  });

  return [...valueMap.values()]
    .filter((cellsWithValue) => cellsWithValue.length > 1)
    .flat()
    .map((cell) => [cell.column, cell.row]);
};

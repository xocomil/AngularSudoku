import { CellState } from '@sud/domain';
import { RegionCoordinate } from '../../../domain/src/lib/region-coordinate';

export const errorAnalyzer = (cells: CellState[]): RegionCoordinate[] => {
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
    .map((cell) => ({ column: cell.column, row: cell.row }));
};

import { CellState, CellValue, valuesToHide } from "@sud/domain";

export const solveOneCell = (grid: CellState[][], pivotPoints: Map<string, CellValue[]>): CellState | undefined => {
  const leastEntropy = getCellsWithLeastEntropy(grid, pivotPoints);

  if (!leastEntropy) return undefined;

  return randomArrayItem(leastEntropy);
};

export const randomArrayItem = (cellStates: CellState[]): CellState => cellStates[Math.floor(Math.random() * cellStates.length)];

export const getCellsWithLeastEntropy = (grid: CellState[][], pivotPoints: Map<string, CellValue[]>): CellState[] | undefined => {
  const entropyMap = new Map<number, CellState[]>();
  let lowestEntropy = -1;

  for (const row of grid) {
    for (const cell of row) {
      if (cell.isReadonly || cell.value) continue;

      const invalidValues = valuesToHide(cell, pivotPoints.get(`${cell.row}${cell.column}`) ?? []);
      const usedValueCount = invalidValues.length;

      if (!entropyMap.has(usedValueCount)) {
        entropyMap.set(usedValueCount, []);
      }

      const curValue = entropyMap.get(usedValueCount);
      if (curValue) {
        curValue.push(cell);

        entropyMap.set(usedValueCount, curValue);
      }

      if (usedValueCount > lowestEntropy) {
        lowestEntropy = usedValueCount;
      }
    }
  }

  console.log('lowest entropy', lowestEntropy, entropyMap.get(lowestEntropy));

  return entropyMap.get(lowestEntropy);
};

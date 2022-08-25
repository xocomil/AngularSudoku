import { CommonModule } from '@angular/common';
import { faker } from '@faker-js/faker/locale/en';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { PushModule } from '@ngrx/component';
import { CellState, createCellState, GridDirection } from '@sud/domain';
import { NEVER, Subject } from 'rxjs';
import { CellComponent } from '../cell/cell.component';
import { GridCellSelectPipe } from './grid-cell-select.pipe';
import { GridComponent } from './grid.component';
import { GridStore } from './store/grid.store';

describe('GridComponent', () => {
  const grid$ = new Subject<CellState[][]>();

  const gridStoreStub: Partial<GridStore> = {
    grid$,
    gameWon$: NEVER,
    updateSelected: jest.fn(),
    cellValueChanged: jest.fn(),
    navigateToCell: jest.fn(),
    resetSelected: jest.fn(),
  };

  const createComponent = createComponentFactory({
    component: GridComponent,
    imports: [CellComponent, CommonModule, GridCellSelectPipe, PushModule],
    componentProviders: [mockProvider(GridStore, gridStoreStub)],
  });

  it('should create', () => {
    const spectator = createComponent();

    expect(spectator).toBeTruthy();
  });

  const randomGridNumber = () => faker.datatype.number({ min: 0, max: 8 });
  const createFakeCellState = ({
    row = randomGridNumber(),
  }: Partial<CellState> = {}) =>
    createCellState({
      row,
      column: randomGridNumber(),
      region: randomGridNumber(),
    });

  describe('cellFocused()', () => {
    it('should call updateSelected on the store with the cell state', () => {
      const spectator = createComponent();
      const store = spectator.inject(GridStore, true);

      const testValue = createFakeCellState();

      spectator.component.cellFocused(testValue);

      expect(store.updateSelected).toHaveBeenCalledWith(testValue);
    });
  });

  describe('cellValueChanged()', () => {
    it('should pass the new value with the cell state to the store', () => {
      const testValue = faker.datatype.number({ min: 1, max: 9 });
      const testCellState = createFakeCellState();

      const spectator = createComponent();
      const store = spectator.inject(GridStore, true);

      spectator.component.cellValueChanged(testValue, testCellState);

      expect(store.cellValueChanged).toHaveBeenCalledWith({
        value: testValue,
        row: testCellState.row,
        column: testCellState.column,
      });
    });

    it('should pass undefined with the cell state to the store', () => {
      const testCellState = createFakeCellState();

      const spectator = createComponent();
      const store = spectator.inject(GridStore, true);

      spectator.component.cellValueChanged(undefined, testCellState);

      expect(store.cellValueChanged).toHaveBeenCalledWith({
        value: undefined,
        row: testCellState.row,
        column: testCellState.column,
      });
    });
  });

  describe('cellNavigated()', () => {
    it('should call navigateToCell on the store', () => {
      const testDirection = GridDirection.Up;
      const testCellState = createFakeCellState();

      const spectator = createComponent();
      const store = spectator.inject(GridStore, true);

      spectator.component.cellNavigated(testDirection, testCellState);

      expect(store.navigateToCell).toHaveBeenCalledWith({
        direction: testDirection,
        cellState: testCellState,
      });
    });
  });

  describe('rowTrackByFunction()', () => {
    it('should return a unique number for the row', () => {
      const testRowNumber = randomGridNumber();
      const testRow = Array.from({ length: 9 }, () =>
        createFakeCellState({ row: testRowNumber })
      );

      const spectator = createComponent();

      const result = spectator.component.rowTrackByFunction(0, testRow);

      expect(result).toBe(testRowNumber);
    });
  });

  describe('columnTrackByFunction()', () => {
    it('should return a unique number for the column', () => {
      const expected = 23;

      const spectator = createComponent();

      const result = spectator.component.columnTrackByFunction(
        0,
        createCellState({ row: 2, column: 3, region: 0 })
      );

      expect(result).toBe(expected);
    });
  });

  describe('cellBlurred', () => {
    it('should call resetSelected() on the store', () => {
      const spectator = createComponent();
      const store = spectator.inject(GridStore, true);

      spectator.component.cellBlurred();

      expect(store.resetSelected).toHaveBeenCalledTimes(1);
    });
  });
});

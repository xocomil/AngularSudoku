import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { CellState } from '@sud/domain';

export interface GridState {
  grid: CellState[][];
}

function createGridState(): CellState[][] {
  return [];
}

const initialState: GridState = {
  grid: createGridState(),
};

@Injectable()
export class GridStore extends ComponentStore<GridState> {
  readonly grid$ = this.select((state) => state.grid);

  constructor() {
    super(initialState);
  }
}

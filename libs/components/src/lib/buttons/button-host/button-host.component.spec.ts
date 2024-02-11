import { signal } from '@angular/core';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { GridStore } from '../../grid/store/grid.store';
import { ButtonHostComponent } from './button-host.component';

describe('ButtonHostComponent', () => {
  const gridStoreStub: Partial<GridStore> = {
    creatingPuzzleMode: signal(true),
  };

  const createComponent = createComponentFactory({
    component: ButtonHostComponent,
    providers: [mockProvider(GridStore, gridStoreStub)],
  });

  it('should create', () => {
    const spectator = createComponent();

    expect(spectator).toBeTruthy();
  });
});

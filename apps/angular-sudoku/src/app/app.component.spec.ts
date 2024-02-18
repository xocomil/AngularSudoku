import { signal } from '@angular/core';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { GridComponent, GridStore } from '@sud/components';
import { MockComponent, MockProvider } from 'ng-mocks';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  const gridStoreStub: Partial<GridStore> = {
    gameWon: signal(false),
    creatingPuzzleMode: signal(false),
  };

  const createComponent = createComponentFactory({
    component: AppComponent,
    imports: [MockComponent(GridComponent)],
    componentProviders: [MockProvider(GridStore, gridStoreStub)],
  });

  it('should create the app', () => {
    const spectator = createComponent();

    expect(spectator).toBeTruthy();
  });
});

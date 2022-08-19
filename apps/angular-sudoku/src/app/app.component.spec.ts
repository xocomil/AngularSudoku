import { createComponentFactory } from '@ngneat/spectator/jest';
import { GridComponent } from '@sud/components';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  const createComponent = createComponentFactory({
    component: AppComponent,
    imports: [GridComponent],
  });

  it('should create the app', () => {
    const spectator = createComponent();

    expect(spectator).toBeTruthy();
  });
});

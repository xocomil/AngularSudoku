import { createComponentFactory } from '@ngneat/spectator/jest';
import { GridComponentModule } from '@sud/components';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  const createComponent = createComponentFactory({
    component: AppComponent,
    imports: [GridComponentModule],
  });

  it('should create the app', () => {
    const spectator = createComponent();

    expect(spectator).toBeTruthy();
  });
});

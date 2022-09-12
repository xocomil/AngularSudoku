import { createComponentFactory } from '@ngneat/spectator/jest';
import { PencilMarkComponent } from './pencil-mark.component';

describe('PencilMarkComponent', () => {
  const createComponent = createComponentFactory({
    component: PencilMarkComponent,
  });

  it('should create', () => {
    const spectator = createComponent();

    expect(spectator).toBeTruthy();
  });
});

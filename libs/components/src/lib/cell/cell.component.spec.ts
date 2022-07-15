import { FormsModule } from '@angular/forms';
import { createComponentFactory } from '@ngneat/spectator';
import { CellComponent } from './cell.component';

describe('CellComponent', () => {
  const createComponent = createComponentFactory({
    component: CellComponent,
    imports: [FormsModule],
  });

  it('should create', () => {
    const spectator = createComponent();

    expect(spectator).toBeTruthy();
  });
});

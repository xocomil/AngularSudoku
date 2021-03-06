import { createComponentFactory } from '@ngneat/spectator';
import { MockModule } from 'ng-mocks';
import { CellComponentModule } from '../cell/cell.component';
import { GridCellSelectPipeModule } from './grid-cell-select.pipe';
import { GridComponent } from './grid.component';

describe('GridComponent', () => {
  const createComponent = createComponentFactory({
    component: GridComponent,
    imports: [
      MockModule(CellComponentModule),
      MockModule(GridCellSelectPipeModule),
    ],
  });

  it('should create', () => {
    const spectator = createComponent();

    expect(spectator).toBeTruthy();
  });
});

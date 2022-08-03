import { createComponentFactory } from '@ngneat/spectator';
import { PushModule } from '@ngrx/component';
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
      PushModule,
    ],
  });

  it('should create', () => {
    const spectator = createComponent();

    expect(spectator).toBeTruthy();
  });
});

import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CellComponent } from '../cell/cell.component';
import { GridCellSelectPipe } from './grid-cell-select.pipe';
import { GridComponent } from './grid.component';
import { GridStore } from './store/grid.store';

export default {
  title: 'Grid',
  component: GridComponent,
  decorators: [
    moduleMetadata({
      imports: [CellComponent, GridCellSelectPipe],
      providers: [GridStore],
    }),
  ],
} as Meta;

export const Primary: StoryObj<GridComponent> = {};

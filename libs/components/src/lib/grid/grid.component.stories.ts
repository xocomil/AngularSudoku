import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CellComponent } from '../cell/cell.component';
import { GridCellSelectPipe } from './grid-cell-select.pipe';
import { GridComponent } from './grid.component';

export default {
  title: 'Grid',
  component: GridComponent,
  decorators: [
    moduleMetadata({
      imports: [CellComponent, GridCellSelectPipe],
    }),
  ],
} as Meta;

const Template: Story<GridComponent> = (args: GridComponent) => ({
  props: args,
});

export const Primary = Template.bind({});

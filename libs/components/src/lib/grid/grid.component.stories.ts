import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CellComponentModule } from '../cell/cell.component';
import { GridCellSelectPipeModule } from './grid-cell-select.pipe';
import { GridComponent } from './grid.component';

export default {
  title: 'Grid',
  component: GridComponent,
  decorators: [
    moduleMetadata({
      imports: [CellComponentModule, GridCellSelectPipeModule],
    }),
  ],
} as Meta;

const Template: Story<GridComponent> = (args: GridComponent) => ({
  props: args,
});

export const Primary = Template.bind({});

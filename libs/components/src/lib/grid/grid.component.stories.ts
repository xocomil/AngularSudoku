import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CellComponentModule } from '../cell/cell.component';
import { GridComponent } from './grid.component';

export default {
  title: 'Grid',
  component: GridComponent,
  decorators: [moduleMetadata({ imports: [CellComponentModule] })],
} as Meta;

const Template: Story<GridComponent> = (args: GridComponent) => ({
  props: args,
});

export const Primary = Template.bind({});

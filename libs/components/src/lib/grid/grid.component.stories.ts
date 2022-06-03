import { Meta, Story } from '@storybook/angular';
import { GridComponent } from './grid.component';

export default {
  title: 'Grid',
  component: GridComponent,
} as Meta;

const Template: Story<GridComponent> = (args: GridComponent) => ({
  component: GridComponent,
  props: args,
});

export const Primary = Template.bind({});

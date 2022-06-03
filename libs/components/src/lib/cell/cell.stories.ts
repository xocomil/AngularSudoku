import { Meta, Story } from '@storybook/angular';
import { CellComponent } from './cell.component';

export default {
  title: 'Cell',
  component: CellComponent,
  argTypes: {
    backgroundColor: { control: { type: 'color' } },
  },
} as Meta;

const Template: Story<CellComponent> = (args: CellComponent) => ({
  component: CellComponent,
  props: args,
});

export const Primary = Template.bind({});

export const HasError = Template.bind({});

HasError.args = { hasError: true, backgroundColor: 'red' };

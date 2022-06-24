import { FormsModule } from '@angular/forms';
import {
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  Story,
} from '@storybook/angular';
import { createCellState } from '@sud/domain';
import { CellComponent } from './cell.component';

export default {
  title: 'Cell',
  component: CellComponent,
  argTypes: {
    errorBackgroundColor: { control: { type: 'color' } },
    errorColor: { control: { type: 'color' } },
  },
  decorators: [
    componentWrapperDecorator(
      (story) => `
<div style="height: 2.5rem; width: 2.5rem">
    ${'Odd: ' + story}
    ${'Even: ' + story}
</div>
`
    ),
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
} as Meta;

const Template: Story<CellComponent> = (args: CellComponent) => ({
  props: args,
});

export const Primary = Template.bind({});

const row = -1;
const column = -1;
const region: [number, number] = [-1, -1];

Primary.args = {
  cellState: createCellState({ row, column, region, value: 4 }),
};

export const HasError = Template.bind({});

HasError.args = {
  errorBackgroundColor: 'rgb(255, 0, 0, .5)',
  errorColor: 'red',
  cellState: createCellState({ row, column, region, valid: false, value: 5 }),
};

export const PartOfFocusedRow = Template.bind({});

PartOfFocusedRow.args = {
  cellState: createCellState({ row, column, region, value: 4 }),
  focusState: 'row',
};

export const PartOfFocusedColumn = Template.bind({});

PartOfFocusedColumn.args = {
  cellState: createCellState({ row, column, region, value: 4 }),
  focusState: 'col',
};

export const Focused = Template.bind({});

Focused.args = {
  cellState: createCellState({ row, column, region, value: 4 }),
  focusState: 'self',
};

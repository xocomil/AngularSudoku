import { FormsModule } from '@angular/forms';
import {
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
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
`,
    ),
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
} as Meta;

type Story = StoryObj<CellComponent>;

const row = -1;
const column = -1;
const region = -1;

export const Primary: Story = {
  args: {
    cellState: createCellState({ row, column, region, value: 4 }),
  },
};

export const HasError: Story = {
  args: {
    cellState: createCellState({ row, column, region, valid: false, value: 5 }),
  },
};

export const PartOfFocusedRow: Story = {
  args: {
    cellState: createCellState({ row, column, region, value: 4 }),
    focusState: 'row',
  },
};

export const PartOfFocusedColumn: Story = {
  args: {
    cellState: createCellState({ row, column, region, value: 4 }),
    focusState: 'col',
  },
};

export const Focused: Story = {
  args: {
    cellState: createCellState({ row, column, region, value: 4 }),
    focusState: 'self',
  },
};

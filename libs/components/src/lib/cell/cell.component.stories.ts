import { FormsModule } from '@angular/forms';
import {
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  Story,
} from '@storybook/angular';
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

Primary.args = { cellValue: 4 };

export const HasError = Template.bind({});

HasError.args = {
  hasError: true,
  errorBackgroundColor: 'rgb(255, 0, 0, .5)',
  errorColor: 'red',
  cellValue: 5,
};

export const PartOfFocusedRow = Template.bind({});

PartOfFocusedRow.args = {
  cellValue: 5,
  focusState: 'row',
};

export const PartOfFocusedColumn = Template.bind({});

PartOfFocusedColumn.args = {
  cellValue: 5,
  focusState: 'col',
};

export const Focused = Template.bind({});

Focused.args = {
  cellValue: 5,
  focusState: 'both',
};

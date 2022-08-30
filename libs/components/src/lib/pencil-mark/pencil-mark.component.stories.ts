import { componentWrapperDecorator, Meta, Story } from '@storybook/angular';
import { PencilMarkComponent } from './pencil-mark.component';

export default {
  title: 'Pencil Marks',
  component: PencilMarkComponent,
  decorators: [
    componentWrapperDecorator(
      (story) => `
<div style="width: 60px">
    ${story}
</div>
`
    ),
  ],
} as Meta;

const Template: Story<PencilMarkComponent> = (args: PencilMarkComponent) => ({
  props: args,
});

export const Primary = Template.bind({});

export const NumbersHidden = Template.bind({});

NumbersHidden.args = { numbersToDisplay: [2, 3, 4, 6, 7, 8] };

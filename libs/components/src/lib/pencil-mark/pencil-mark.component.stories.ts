import { componentWrapperDecorator, Meta, StoryObj } from '@storybook/angular';
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
`,
    ),
  ],
} as Meta;

type Story = StoryObj<PencilMarkComponent>;

export const Primary: Story = {};

export const NumbersHidden: Story = {
  args: { numbersToHide: [2, 3, 4, 6, 7, 8] },
};

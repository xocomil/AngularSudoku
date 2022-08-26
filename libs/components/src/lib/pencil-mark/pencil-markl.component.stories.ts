import { componentWrapperDecorator, Meta, Story } from '@storybook/angular';
import { PencilMarkComponent } from './pencil-mark.component';

export default {
  title: 'Pencil Mark',
  component: PencilMarkComponent,
  decorators: [
    componentWrapperDecorator(
      (story) => `
<div style="height: 35px; display: inline-flex">
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

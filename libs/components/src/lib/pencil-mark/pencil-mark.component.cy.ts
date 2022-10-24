import { MountConfig } from 'cypress/angular';
import { PencilMarkComponent } from './pencil-mark.component';

describe(PencilMarkComponent.name, () => {
  const config: MountConfig<PencilMarkComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     cy.mount(PencilMarkComponent, {
           ...config,
           componentProperties: {
               numbersToHide:  [],
          }
       });
  })
})

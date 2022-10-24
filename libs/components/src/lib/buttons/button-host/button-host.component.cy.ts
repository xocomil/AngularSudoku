import { MountConfig } from 'cypress/angular';
import { ButtonHostComponent } from './button-host.component';

describe(ButtonHostComponent.name, () => {
  const config: MountConfig<ButtonHostComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     cy.mount(ButtonHostComponent, config);
  })
})

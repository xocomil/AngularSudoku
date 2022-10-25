import { MountConfig } from 'cypress/angular';
import { GridComponent } from './grid.component';

describe(GridComponent.name, () => {
  const config: MountConfig<GridComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     cy.mount(GridComponent, config);
  })
})

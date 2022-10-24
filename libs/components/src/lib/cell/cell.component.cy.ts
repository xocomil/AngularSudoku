import { MountConfig } from 'cypress/angular';
import { CellComponent } from './cell.component';

describe(CellComponent.name, () => {
  const config: MountConfig<CellComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     cy.mount(CellComponent, {
           ...config,
           componentProperties: {
               creatingPuzzleMode:  false,
               cellState:  createCellState({
    row: -1,
    column: -1,
    region: -1,
  }),
               errorBackgroundColor:  '',
               errorColor:  '',
               focusState:  '',
          }
       });
  })
})

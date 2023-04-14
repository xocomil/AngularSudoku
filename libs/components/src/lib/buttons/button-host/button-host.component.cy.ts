import { TestBed } from '@angular/core/testing';
import { MountConfig } from 'cypress/angular';
import { GridStore } from '../../grid/store/grid.store';
import { ButtonHostComponent } from './button-host.component';

describe(ButtonHostComponent.name, () => {
  const config: MountConfig<ButtonHostComponent> = {
    declarations: [],
    imports: [],
    providers: [GridStore],
  };

  it('renders', () => {
    TestBed.overrideComponent(ButtonHostComponent, { add: { providers: config.providers } });
    cy.mount(ButtonHostComponent, config);
  });

  describe('create puzzle button', () => {
    const createPuzzleButtonSelector = '[data-cy=create-puzzle]';
    it('should toggle create puzzle mode', () => {
      TestBed.overrideComponent(ButtonHostComponent, { add: { providers: config.providers } });
      cy.mount(ButtonHostComponent, config);

      const button = cy.get(createPuzzleButtonSelector);

      const startCreatePuzzleMode = 'Start Create Puzzle Mode';
      button.should('include.text', startCreatePuzzleMode);

      button.click();

      button.should('include.text', 'End Create Puzzle Mode');

      button.click();

      button.should('include.text', startCreatePuzzleMode);
    });

    // it('should call toggleCreatePuzzleMode() on the store', () => {
    //   cy.mount(ButtonHostComponent, config);
    //
    //   const service = getTestBed().inject(GridStore, true);
    //
    //   cy.log('service', service);
    // });
  });
});

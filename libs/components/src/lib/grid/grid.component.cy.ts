import { TestBed } from '@angular/core/testing';
import { MountConfig } from 'cypress/angular';
import { GridComponent } from './grid.component';
import { GridStore } from './store/grid.store';

describe(GridComponent.name, () => {
  const config: MountConfig<GridComponent> = {
    declarations: [],
    imports: [],
    providers: [GridStore],
  };

  it('renders', () => {
    TestBed.overrideComponent(GridComponent, { add: { providers: config.providers } });
    cy.mount(GridComponent, config);
  });

  describe('cell highlighting', () => {
    it('should add the proper classes when an input is clicked', () => {
      TestBed.overrideComponent(GridComponent, { add: { providers: config.providers } });
      cy.mount(GridComponent, config);
      const centerCellSelector = '.col-4.row-4';
      const centerCellInputSelector = `${centerCellSelector} > div > [data-cy="cellInput"]`;

      cy.get(centerCellInputSelector).click();

      cy.get('.col-4.row-4').invoke('attr', 'data-focused-state').should('equal', 'self');

      const regionSelectors = ['.col-3.row-3', '.col-5.row-3', '.col-3.row-5', '.col-5.row-5'];

      regionSelectors.forEach((regionSelector) => {
        cy.get(regionSelector).invoke('attr', 'data-focused-state').should('equal', 'region');
      });

      const regionRowSelectors = ['.col-3.row-4', '.col-5.row-4'];

      regionRowSelectors.forEach((selector) => {
        cy.get(selector).invoke('attr', 'data-focused-state').should('equal', 'region-row');
      });

      const regionColSelectors = ['.col-4.row-3', '.col-4.row-5'];

      regionColSelectors.forEach((selector) => {
        cy.get(selector).invoke('attr', 'data-focused-state').should('equal', 'region-col');
      });

      const rowColIndexes = ['0', '1', '2', '6', '7', '8'] as const;

      rowColIndexes.forEach((rowColIndex) => {
        const columnSelector = `.row-${rowColIndex}.col-4`;
        const rowSelector = `.row-4.col-${rowColIndex}`;

        cy.get(columnSelector).invoke('attr', 'data-focused-state').should('equal', 'col');
        cy.get(rowSelector).invoke('attr', 'data-focused-state').should('equal', 'row');
      });
    });
  });

  describe('keyboard navigation', () => {
    describe('up arrow', () => {
      it('should move focus to the next cell above', () => {
        TestBed.overrideComponent(GridComponent, { add: { providers: config.providers } });
        cy.mount(GridComponent, config);
        const centerCellSelector = '.col-4.row-4';
        const centerCellInputSelector = `${centerCellSelector} > div > [data-cy="cellInput"]`;

        cy.get(centerCellInputSelector).click();

        cy.get(centerCellInputSelector).should('have.focus');

        cy.get(centerCellInputSelector).type('{upArrow}');

        cy.get('.row-3.col-4 > div > [data-cy="cellInput"]').should('have.focus');
      });

      it('should not move focus if at top of grid', () => {
        TestBed.overrideComponent(GridComponent, { add: { providers: config.providers } });
        cy.mount(GridComponent, config);
        const centerCellSelector = '.col-4.row-0';
        const centerCellInputSelector = `${centerCellSelector} > div > [data-cy="cellInput"]`;

        cy.get(centerCellInputSelector).click();

        cy.get(centerCellInputSelector).should('have.focus');

        cy.get(centerCellInputSelector).type('{upArrow}');

        cy.get(centerCellInputSelector).should('have.focus');
      });
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { GridDirection } from '@sud/domain';
import { MountConfig } from 'cypress/angular';
import { CellComponent } from './cell.component';

describe(CellComponent.name, () => {
  const numberInput = '[data-cy=cellInput]';

  const config: MountConfig<CellComponent> = {
    declarations: [],
    imports: [],
    providers: [],
    autoSpyOutputs: true,
  };

  it('renders', () => {
    TestBed.overrideComponent(CellComponent, {
      add: { providers: config.providers },
    });
    cy.mount(CellComponent, config);
  });

  it('should enter a proper CellValue', () => {
    TestBed.overrideComponent(CellComponent, {
      add: { providers: config.providers },
    });
    cy.mount(CellComponent, config);

    const input = cy.get(numberInput);

    input.type('1');

    cy.get('@cellValueChangedSpy').should('have.been.calledWith', 1);
  });

  describe('keyboard navigation', () => {
    it('should navigate up when "w" is entered', () => {
      TestBed.overrideComponent(CellComponent, {
        add: { providers: config.providers },
      });
      cy.mount(CellComponent, config).then((wrapper) => {
        console.log({ wrapper });
        cy.spy(wrapper.component.cellNavigated, 'next').as('cellNavigatedSpy');
        return cy.wrap(wrapper).as('angular');
      });

      cy.log('angular', cy.get('@angular'));

      const input = cy.get(numberInput);

      input.type('w', {});

      cy.get('@cellValueChangedSpy').should('not.have.been.calledWith', 'w');
      cy.get('@cellNavigatedSpy').should(
        'have.been.calledWith',
        GridDirection.Up,
      );
    });
  });
});

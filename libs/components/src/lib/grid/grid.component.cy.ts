import { TestBed } from '@angular/core/testing';
import { CellState, CellValue, createCellState } from '@sud/domain';
import { MountConfig } from 'cypress/angular';
import { GridComponent } from './grid.component';
import { FocusStates } from './models/focus-state';
import { GridStore } from './store/grid.store';

describe(GridComponent.name, () => {
  const config: MountConfig<GridComponent> = {
    declarations: [],
    imports: [],
    providers: [GridStore],
  };

  it('renders', () => {
    cy.mount(GridComponent, config);
  });

  describe('cell highlighting', () => {
    it('should add the proper classes when an input is clicked', () => {
      cy.mount(GridComponent, config);
      const centerCellSelector = '.col-4.row-4';
      const centerCellInputSelector = `${centerCellSelector} > div > [data-cy="cellInput"]`;

      cy.get(centerCellInputSelector).click();

      cy.get('.col-4.row-4')
        .invoke('attr', 'data-focused-state')
        .should('equal', 'self');

      const regionSelectors = [
        '.col-3.row-3',
        '.col-5.row-3',
        '.col-3.row-5',
        '.col-5.row-5',
      ];

      regionSelectors.forEach((regionSelector) => {
        cy.get(regionSelector)
          .invoke('attr', 'data-focused-state')
          .should('equal', 'region');
      });

      const regionRowSelectors = ['.col-3.row-4', '.col-5.row-4'];

      regionRowSelectors.forEach((selector) => {
        cy.get(selector)
          .invoke('attr', 'data-focused-state')
          .should('equal', 'region-row');
      });

      const regionColSelectors = ['.col-4.row-3', '.col-4.row-5'];

      regionColSelectors.forEach((selector) => {
        cy.get(selector)
          .invoke('attr', 'data-focused-state')
          .should('equal', 'region-col');
      });

      const rowColIndexes = ['0', '1', '2', '6', '7', '8'] as const;

      rowColIndexes.forEach((rowColIndex) => {
        const columnSelector = `.row-${rowColIndex}.col-4`;
        const rowSelector = `.row-4.col-${rowColIndex}`;

        cy.get(columnSelector)
          .invoke('attr', 'data-focused-state')
          .should('equal', 'col');
        cy.get(rowSelector)
          .invoke('attr', 'data-focused-state')
          .should('equal', 'row');
      });
    });
  });

  describe('keyboard navigation', () => {
    describe('up arrow', () => {
      it('should move focus to the next cell above', () => {
        cy.mount(GridComponent, config);
        const centerCellSelector = '.col-4.row-4';
        const centerCellInputSelector = `${centerCellSelector} > div > [data-cy="cellInput"]`;

        cy.get(centerCellInputSelector).click();

        cy.get(centerCellInputSelector).should('have.focus');

        cy.get(centerCellInputSelector).type('{upArrow}');

        cy.get(centerCellInputSelector).should('not.have.focus');
        cy.get('.row-3.col-4 > div > [data-cy="cellInput"]').should(
          'have.focus',
        );
      });

      it('should not move focus if at top of grid', () => {
        cy.mount(GridComponent, config);
        const centerCellSelector = '.col-4.row-0';
        const centerCellInputSelector = `${centerCellSelector} > div > [data-cy="cellInput"]`;

        cy.get(centerCellInputSelector).click();

        cy.get(centerCellInputSelector).should('have.focus');

        cy.get(centerCellInputSelector).type('{upArrow}');

        cy.get(centerCellInputSelector).should('have.focus');
      });

      describe('should skip over readonly cells when not in puzzle mode', () => {
        it('should skip over a single readonly cell', () => {
          cy.mount(GridComponent, config).then(() => {
            const gridStore = TestBed.inject(GridStore);

            createColumnPuzzleCells(
              gridStore,
              createCellStatesFromRowsAndValues([[3, 1]]),
            );
          });

          const centerCellSelector = '.col-4.row-4';
          const centerCellInputSelector = `${centerCellSelector} > div > [data-cy="cellInput"]`;

          cy.get(centerCellInputSelector).click();

          cy.get(centerCellInputSelector).should('have.focus');

          cy.get(centerCellInputSelector).type('{upArrow}');

          cy.get(centerCellInputSelector).should('not.have.focus');

          checkSkipCells([['.row-3.col-4', 'col']]);

          cy.get('.row-2.col-4 > div > [data-cy="cellInput"]').should(
            'have.focus',
          );
        });

        it('should skip over multiple readonly cells', () => {
          cy.mount(GridComponent, config).then(() => {
            const gridStore = TestBed.inject(GridStore);

            createColumnPuzzleCells(
              gridStore,
              createCellStatesFromRowsAndValues([
                [3, 1],
                [2, 2],
              ]),
            );
          });

          const centerCellSelector = '.col-4.row-4';
          const centerCellInputSelector = `${centerCellSelector} > div > [data-cy="cellInput"]`;

          cy.get(centerCellInputSelector).click();

          cy.get(centerCellInputSelector).should('have.focus');

          cy.get(centerCellInputSelector).type('{upArrow}');

          checkSkipCells([
            ['.row-3.col-4', 'col'],
            ['.row-2.col-4', 'region-col'],
          ]);

          cy.get('.row-1.col-4 > div > [data-cy="cellInput"]').should(
            'have.focus',
          );
        });

        it('should not navigate if all readonly cells to top', () => {
          cy.mount(GridComponent, config).then(() => {
            const gridStore = TestBed.inject(GridStore);

            createColumnPuzzleCells(
              gridStore,
              createCellStatesFromRowsAndValues([
                [3, 1],
                [2, 2],
                [1, 3],
                [0, 4],
              ]),
            );
          });

          const centerCellSelector = '.col-4.row-4';
          const centerCellInputSelector = `${centerCellSelector} > div > [data-cy="cellInput"]`;

          cy.get(centerCellInputSelector).click();

          cy.get(centerCellInputSelector).should('have.focus');

          cy.get(centerCellInputSelector).type('{upArrow}');

          cy.get(centerCellInputSelector).should('have.focus');

          checkSkipCells([
            [`.row-3.col-4`, 'region-col'],
            [`.row-2.col-4`, 'col'],
            [`.row-1.col-4`, 'col'],
            [`.row-0.col-4`, 'col'],
          ]);
        });
      });
    });
  });
});

function createColumnPuzzleCells(gridStore: GridStore, changes: CellState[]) {
  gridStore.toggleCreatePuzzleMode();

  changes.forEach((change) => {
    gridStore.setCellValue(change.value, change);
  });

  gridStore.toggleCreatePuzzleMode();
}

type RowAndValue = [row: number, value: CellValue];

function createCellStatesFromRowsAndValues(
  rowsAndValues: RowAndValue[],
): CellState[] {
  return createCellStates({ rowsAndValues });
}

type CellStatesParams = {
  rowsAndValues: RowAndValue[];
  column?: number;
  region?: number;
};

const DEFAULT_COLUMN = 4 as const;
const DEFAULT_REGION = 0;

function createCellStates(changes: CellStatesParams): CellState[] {
  const {
    rowsAndValues,
    region = DEFAULT_REGION,
    column = DEFAULT_COLUMN,
  } = changes;

  return rowsAndValues.map(([row, value]) =>
    createCellState({ row, value, column, region }),
  );
}

type SkipCellInfo = [selector: string, focusedState: FocusStates];

function checkSkipCells(skipCellInfo: SkipCellInfo[]) {
  for (const [selector, focusedState] of skipCellInfo) {
    const skipCell = cy.get(selector).invoke('attr', 'data-focused-state');
    skipCell.should('not.equal', 'self');
    skipCell.should('equal', focusedState);
  }
}

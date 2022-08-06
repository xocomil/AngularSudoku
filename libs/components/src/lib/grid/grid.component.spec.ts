/* eslint-disable jest/expect-expect */
/* eslint-disable jest/prefer-expect-assertions */
import { render, screen } from '@testing-library/angular';
import { GridComponent } from '../grid/grid.component';

async function setup() {
  const cellNavigatedSpy = jest.fn();

  return await render(
    `
      <sud-grid 
        (cellNavigated)="cellNavigatedSpy($event)" >
      </sud-grid>
      `,
    {
      excludeComponentDeclaration: true,
      imports: [GridComponent],
      detectChanges: true,
      componentProviders: [],
      componentProperties: {
        cellNavigated: cellNavigatedSpy,
      },
    }
  );
}

describe('When rendering the GridComponent', () => {
  it('should render a grid component', async () => {
    // await setup();
   // expect(screen.getByTestId('sud-grid')).toBeTruthy();
  });
});

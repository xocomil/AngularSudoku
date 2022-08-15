import { FormsModule } from '@angular/forms';
import { faker } from '@faker-js/faker/locale/en';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { createCellState } from '@sud/domain';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CellComponent } from './cell.component';

describe('CellComponent', () => {
  const createComponent = createComponentFactory({
    component: CellComponent,
    imports: [FormsModule],
  });

  const randomCellPosition = (): number =>
    faker.datatype.number({ min: 0, max: 8 });
  const randomNextToFocus = (): readonly [number, number] =>
    [randomCellPosition(), randomCellPosition()] as const;

  it('should create', () => {
    const spectator = createComponent();

    expect(spectator).toBeTruthy();
  });

  describe('nextToFocus', () => {
    describe('undefined', () => {
      it('should set the value to undefined initially', () => {
        const spectator = createComponent({
          props: { nextToFocus: undefined },
        });

        expect(spectator.component.nextToFocus).toBeUndefined();
      });

      it('should change the value to undefined', () => {
        const spectator = createComponent({
          props: { nextToFocus: randomNextToFocus() },
        });

        spectator.component.nextToFocus = undefined;

        expect(spectator.component.nextToFocus).toBeUndefined();
      });
    });

    describe('a valid value', () => {
      it('should set the value initially', () => {
        const testValue = randomNextToFocus();

        const spectator = createComponent({
          props: { nextToFocus: testValue },
        });

        expect(spectator.component.nextToFocus).toEqual(testValue);
      });

      it('should change the value to a valid value', () => {
        const testValue = randomNextToFocus();

        const spectator = createComponent({
          props: { nextToFocus: undefined },
        });

        spectator.component.nextToFocus = testValue;

        expect(spectator.component.nextToFocus).toEqual(testValue);
      });
    });

    it('should focus on the input if row and column match', async () => {
      await render(CellComponent, {
        componentProperties: {
          cellState: createCellState({
            row: 1,
            column: 1,
            region: 1,
          }),
          nextToFocus: [1, 1],
        },
      });

      expect(screen.getByTestId('cellInput')).toBeFocused();
    });

    it('should ont focus on the input if row and column do not match', async () => {
      await render(CellComponent, {
        componentProperties: {
          cellState: createCellState({
            row: 1,
            column: 1,
            region: 1,
          }),
          nextToFocus: [5, 5],
        },
      });

      expect(screen.getByTestId('cellInput')).not.toBeFocused();
    });
  });

  describe('handleKeyEvent', () => {
    it('should only allow the values 1-9 to be entered', async () => {
      // This should emit on cellValueChanged.... it doesn't change the input...
      await render(CellComponent);

      screen.getByTestId('cellInput').focus();

      // fireEvent.keyDown(screen.getByTestId('cellInput'), { key: '0' });

      expect(screen.getByTestId('cellInput')).toHaveValue('');

      for (let i = 1; i <= 9; i++) {
        // fireEvent.keyDown(screen.getByTestId('cellInput'), { key: `${i}` });

        screen.getByTestId('cellInput').focus();
        await userEvent.keyboard(String(i));

        expect(screen.getByTestId('cellInput')).toHaveValue(`${i}`);
      }

      ['a', 'B', 'c', 'D'].forEach((letter) => {
        fireEvent.keyDown(screen.getByTestId('cellInput'), { key: letter });

        expect(screen.getByTestId('cellInput')).toHaveValue('');
      });
    });
  });
});

import { EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { fakeCellPosition } from '@sud/domain/testing-helpers';
import { createCellState, directionMap } from '@sud/domain';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { MockService } from 'ng-mocks';
import { CellComponent } from './cell.component';

describe('CellComponent', () => {
  const createComponent = createComponentFactory({
    component: CellComponent,
    imports: [FormsModule],
  });

  const randomCellPosition = (): number =>
    fakeCellPosition();
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
      const cellValueChanged = jest.fn();

      await render(CellComponent, {
        componentProperties: {
          cellValueChanged: MockService(EventEmitter, {
            emit: cellValueChanged,
          }),
        },
      });

      screen.getByTestId('cellInput').focus();

      for (let i = 1; i <= 9; i++) {
        screen.getByTestId('cellInput').focus();
        await userEvent.keyboard(String(i));

        expect(cellValueChanged).toHaveBeenCalledTimes(1);
        expect(cellValueChanged).toHaveBeenCalledWith(i);
        cellValueChanged.mockReset();
      }

      for (const letter of ['a', 'B', 'c', 'D']) {
        screen.getByTestId('cellInput').focus();
        await userEvent.keyboard(letter);

        expect(cellValueChanged).not.toHaveBeenCalled();
      }
    });
  });

  describe('navigationKey$', () => {
    it('send navigationEvents', async () => {
      const { fixture } = await render(CellComponent);

      const keySpy = subscribeSpyTo(fixture.componentInstance.cellNavigated);

      screen.getByTestId('cellInput').focus();

      for (const input of ['a', 's', 'd', 'w']) {
        screen.getByTestId('cellInput').focus();
        await userEvent.keyboard(input);

        expect(keySpy.getLastValue()).toEqual(directionMap.get(input));
      }

      keySpy.unsubscribe();
    });
  });
});

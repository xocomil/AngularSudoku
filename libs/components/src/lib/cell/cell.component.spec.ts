import { FormsModule } from '@angular/forms';
import { faker } from '@faker-js/faker/locale/en';
import { createComponentFactory } from '@ngneat/spectator/jest';
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
  });

  describe('ngOninit', () => {});
});

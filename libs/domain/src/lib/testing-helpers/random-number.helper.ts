import { faker } from '@faker-js/faker';

export function fakeCellValue(): number {
  return faker.number.int({ min: 1, max: 9 });
}

export function fakeCellPosition(): number {
  return faker.number.int({ min: 0, max: 8 });
}

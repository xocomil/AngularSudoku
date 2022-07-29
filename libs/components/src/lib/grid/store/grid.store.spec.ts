import { TestBed } from '@angular/core/testing';

import { GridStore } from './grid.store';

describe('GridState.StoreService', () => {
  let service: GridStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

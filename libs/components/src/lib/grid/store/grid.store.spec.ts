import { createServiceFactory } from '@ngneat/spectator';

import { GridStore } from './grid.store';

describe('GridStore', () => {
  const createService = createServiceFactory({ service: GridStore });

  it('should be created', () => {
    const spectator = createService();

    expect(spectator).toBeTruthy();
  });
});

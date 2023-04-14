import { TestBed } from '@angular/core/testing';
import { MountConfig } from 'cypress/angular';
import { PencilMarkComponent } from './pencil-mark.component';

describe(PencilMarkComponent.name, () => {
  const config: MountConfig<PencilMarkComponent> = {
    declarations: [],
    imports: [],
    providers: [],
  };

  it('renders', () => {
    TestBed.overrideComponent(PencilMarkComponent, { add: { providers: config.providers } });
    cy.mount(PencilMarkComponent, {
      ...config,
      componentProperties: {
        numbersToHide: [],
      },
    });
  });
});

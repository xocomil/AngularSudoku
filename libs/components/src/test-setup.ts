import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { ngMocks } from 'ng-mocks';

setupZoneTestEnv();

ngMocks.autoSpy('jest');

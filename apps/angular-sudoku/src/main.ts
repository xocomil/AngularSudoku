import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { enableMapSet } from "immer";
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

enableMapSet();

bootstrapApplication(AppComponent).catch((err) => console.error(err));

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GridComponentModule } from '@sud/components';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, GridComponentModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { Component } from '@angular/core';
import { GridComponent } from '@sud/components';

@Component({
  selector: 'angular-sudoku-root',
  standalone: true,
  imports: [GridComponent],
  template: '<sud-grid></sud-grid>',
  styles: [],
})
export class AppComponent {
  title = 'angular-sudoku';
}

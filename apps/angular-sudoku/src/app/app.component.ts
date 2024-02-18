import { Component, inject } from '@angular/core';
import { ButtonHostComponent, GridComponent, GridStore } from '@sud/components';

@Component({
  selector: 'angular-sudoku-root',
  standalone: true,
  imports: [GridComponent, ButtonHostComponent],
  template: ` <div class="game-ui">
      <h1>The awesomeeeest sudoku grid of all times</h1>
      <nav title="grid actions"><sud-button-host /></nav>
      <main>
        <sud-grid />
      </main>
    </div>
    @if (gridStore.gameWon()) {
      <div class="gameWon">Congratulations! You won!</div>
    }`,
  styleUrls: ['./app.component.scss'],
  providers: [GridStore],
})
export class AppComponent {
  protected readonly gridStore = inject(GridStore);
}

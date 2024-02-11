
import { Component } from '@angular/core';
import { ButtonHostComponent, GridComponent, GridStore, PencilMarkComponent } from '@sud/components';

@Component({
  selector: 'angular-sudoku-root',
  standalone: true,
  imports: [GridComponent, PencilMarkComponent, ButtonHostComponent],
  template: ` <div class="game-ui">
        <h1>The awesomeeeest sudoku grid of all times</h1>
        <nav title="grid actions"><sud-button-host></sud-button-host></nav>
        <main>
          <sud-grid (gameWon)="gameWonHandler($event)"></sud-grid>
        </main>
      </div>
      @if (gameWon) {
        <div class="gameWon">Congratulations! You won!</div>
      }`,
  styleUrls: ['./app.component.scss'],
  providers: [GridStore],
})
export class AppComponent {
  title = 'angular-sudoku';
  protected gameWon = false;

  constructor(private _gridStore: GridStore) {}

  protected gameWonHandler(gameWon: boolean) {
    this.gameWon = gameWon;
  }
}

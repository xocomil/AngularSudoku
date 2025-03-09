import { Component, inject } from '@angular/core';
import { ButtonHostComponent } from '@sud/components/buttons';
import { GridComponent } from '@sud/components/grid';
import { GridStore } from '@sud/components/grid/store';

@Component({
  selector: 'angular-sudoku-root',
  imports: [GridComponent, ButtonHostComponent],
  template: ` <div class="game-ui">
      <h1>The awesomeeeest sudoku grid of all times</h1>
      <nav title="grid actions">
        @defer {
          <sud-button-host />
        }
      </nav>
      <main>
        @defer {
          <sud-grid />
        }
      </main>
    </div>
    @if (gridStore.gameWon()) {
      <div class="gameWon">Congratulations! You won!</div>
    }`,
  styleUrls: ['./app.component.scss'],
  providers: [GridStore],
  standalone: true,
})
export class AppComponent {
  protected readonly gridStore = inject(GridStore);
}

import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonHostComponent, GridComponent, GridStore, PencilMarkComponent } from '@sud/components';

@Component({
  selector: 'angular-sudoku-root',
  standalone: true,
  imports: [GridComponent, NgIf, PencilMarkComponent, ButtonHostComponent],
  template: ` <div class="game-ui">
      <sud-grid (gameWon)="gameWonHandler($event)"></sud-grid>
      <sud-button-host></sud-button-host>
    </div>
    <div class="gameWon" *ngIf="gameWon">Congratulations! You won!</div>`,
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

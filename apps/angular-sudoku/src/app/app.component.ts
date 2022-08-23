import { NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { GridComponent } from '@sud/components';

@Component({
  selector: 'angular-sudoku-root',
  standalone: true,
  imports: [GridComponent, NgIf],
  template: `<sud-grid #grid (gameWon)="gameWonHandler($event)"></sud-grid>
    <div>
      <button type="button" (click)="generateWinningGrid()">
        Add Winning Grid
      </button>
      <button type="button" (click)="generateGridWithErrors()">
        Add Grid With Errors
      </button>
    </div>
    <div class="gameWon" *ngIf="gameWon">Congratulations! You won!</div>`,
  styles: [],
})
export class AppComponent {
  title = 'angular-sudoku';
  gameWon = false;

  @ViewChild('grid', { static: true }) grid!: GridComponent;

  gameWonHandler(gameWon: boolean) {
    this.gameWon = gameWon;
  }

  generateWinningGrid(): void {
    this.grid.setGridValues([
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [3, 1, 2, 6, 4, 5, 9, 7, 8],
      [9, 7, 8, 3, 1, 2, 6, 4, 5],
      [6, 4, 5, 9, 7, 8, 3, 1, 2],
      [2, 3, 1, 5, 6, 4, 8, 9, 7],
      [8, 9, 7, 2, 3, 1, 5, 6, 4],
      [5, 6, 4, 8, 9, 7, 2, 3, 1],
    ]);
  }

  generateGridWithErrors(): void {
    this.grid.setGridValues([
      [2, 2, 3, 4, 5, 6, 7, 8, 9],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [3, 1, 2, 6, 4, 5, 9, 7, 8],
      [9, 7, 8, 3, 1, 2, 6, 4, 5],
      [6, 4, 5, 9, 7, 8, 3, 1, 2],
      [2, 3, 1, 5, 6, 4, 8, 9, 7],
      [8, 9, 7, 2, 3, 1, 5, 6, 4],
      [5, 6, 4, 8, 9, 7, 2, 3, 1],
    ]);
  }
}

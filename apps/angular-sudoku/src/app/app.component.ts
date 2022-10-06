import { NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { GridComponent, PencilMarkComponent } from '@sud/components';

@Component({
  selector: 'angular-sudoku-root',
  standalone: true,
  imports: [GridComponent, NgIf, PencilMarkComponent],
  template: ` <div class="game-ui">
      <sud-grid #grid [creatingPuzzleMode]="creatingPuzzleMode" (gameWon)="gameWonHandler($event)"></sud-grid>
      <div class="game-ui-buttons">
        <button type="button" (click)="toggleCreatePuzzleMode()">{{ creatingPuzzleMode ? 'End' : 'Start' }} Create Puzzle Mode</button>
        <button type="button" (click)="generateWinningGrid()">Add Winning Grid</button>
        <button type="button" (click)="generateGridWithErrors()">Add Grid With Errors</button>
        <button type="button" (click)="solveOneCell()">Solve 1 Cell</button>
        <button type="button" (click)="resetGrid()">Reset</button>
      </div>
    </div>
    <div class="gameWon" *ngIf="gameWon">Congratulations! You won!</div>`,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-sudoku';
  protected gameWon = false;
  protected creatingPuzzleMode = false;

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

  toggleCreatePuzzleMode(): void {
    this.creatingPuzzleMode = !this.creatingPuzzleMode;
  }

  solveOneCell(): void {
    this.grid.solveOneCell();
  }

  resetGrid(): void {
    this.grid.resetGrid();
  }
}

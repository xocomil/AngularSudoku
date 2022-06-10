import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgModule,
} from '@angular/core';
import { CellComponentModule } from '../cell/cell.component';

@Component({
  selector: 'sud-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
  @Input() grid: number[][] = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
  ];

  selectedY?: number = undefined;
  selectedX?: number = undefined;

  constructor(private readonly _hostElement: ElementRef<GridComponent>) {}

  calcGridClass(x: number, y: number): string {
    const gridX = Math.trunc(x / 3);
    const gridY = Math.trunc(y / 3);

    return `grid-${gridY}-${gridX}`;
  }

  gridCellFocused(x: number, y: number): void {
    this.selectedX = x;
    this.selectedY = y;
  }

  selectedXY(x: number, y: number): string {
    return `${x}|${y}`;
  }
}

@NgModule({
  imports: [CommonModule, CellComponentModule],
  declarations: [GridComponent],
  exports: [GridComponent],
})
export class GridComponentModule {}

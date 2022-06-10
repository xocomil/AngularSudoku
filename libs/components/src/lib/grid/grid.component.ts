import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input, NgModule,} from '@angular/core';
import {CellComponentModule} from '../cell/cell.component';
import {GridCellSelectPipeModule} from "./grid-cell-select.pipe";

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

  selected: [number, number] = [-1, -1];

  calcGridClass(x: number, y: number): string {
    const gridX = Math.trunc(x / 3);
    const gridY = Math.trunc(y / 3);
    return `grid-${gridY}-${gridX}`;
  }
}

@NgModule({
  imports: [CommonModule, CellComponentModule, GridCellSelectPipeModule],
  declarations: [GridComponent],
  exports: [GridComponent],
})
export class GridComponentModule {}

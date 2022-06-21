import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule,
} from '@angular/core';
import { CellState, createCellState } from '@sud/domain';
import { CellComponentModule } from '../cell/cell.component';
import { GridCellSelectPipeModule } from './grid-cell-select.pipe';

@Component({
  selector: 'sud-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
  @Input() grid: CellState[][] = createGridState();

  selected: [number, number, [number, number]] = [-1, -1, [-1, -1]];

  calcRegion(x: number, y: number): [number, number] {
    const gridX = Math.trunc(x / 3);
    const gridY = Math.trunc(y / 3);
    return [gridX, gridY];
  }
}

@NgModule({
  imports: [CommonModule, CellComponentModule, GridCellSelectPipeModule],
  declarations: [GridComponent],
  exports: [GridComponent],
})
export class GridComponentModule {}

const createGridState = (): CellState[][] => {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, (_, value) =>
      createCellState({ value: value + 1 })
    )
  );
};

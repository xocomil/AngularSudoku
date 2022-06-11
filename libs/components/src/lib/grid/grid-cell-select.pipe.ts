import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gridCellSelect',
})
export class GridCellSelectPipe implements PipeTransform {
  transform(
    [row, col]: [number, number],
    cellCol: number,
    cellRow: number
  ): string {
    if (cellCol === col && cellRow === row) return 'both';
    if (cellCol === col) return 'col';
    if (cellRow === row) return 'row';
    return '';
  }
}

@NgModule({
  declarations: [GridCellSelectPipe],
  exports: [GridCellSelectPipe],
})
export class GridCellSelectPipeModule {}

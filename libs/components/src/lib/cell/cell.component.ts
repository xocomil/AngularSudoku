import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  NgModule,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GridComponent } from '../grid/grid.component';

@Component({
  selector: 'sud-cell[col][row]',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent {
  @Input() hasError = false;
  @Input() cellValue: number | undefined;
  @Input() col!: number;
  @Input() row!: number;

  @Input() set selected([col, row]: [number, number]) {
    this.selectedString =
      this.row === row && this.col === col
        ? 'both'
        : this.row === row
        ? 'row'
        : this.col === col
        ? 'col'
        : '';
  }

  selectedString = '';

  @HostBinding('class') get hostClass() {
    const gridX = Math.trunc(this.col / 3);
    const gridY = Math.trunc(this.row / 3);

    return `sudoku-cell row-${this.row} col-${this.col} grid-${gridY}-${gridX}`;
  }

  #errorBackgroundColor: string | undefined;
  @Input() get errorBackgroundColor(): string {
    return this.#errorBackgroundColor ?? '';
  }
  set errorBackgroundColor(value: string | undefined) {
    this.#errorBackgroundColor = value;

    this._hostContainer.nativeElement.style.setProperty(
      '--error-background',
      value as string
    );
  }

  #errorColor: string | undefined;
  @Input() get errorColor(): string {
    return this.#errorColor ?? '';
  }
  set errorColor(value: string | undefined) {
    this.#errorColor = value;

    this?._hostContainer.nativeElement.style.setProperty(
      '--error-color',
      value as string
    );
  }

  @Output() cellFocusReceived = new EventEmitter<void>();

  constructor(private readonly _hostContainer: ElementRef<HTMLElement>) {}

  cellFocused(): void {
    this.cellFocusReceived.emit();
  }
}

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [CellComponent],
  exports: [CellComponent],
})
export class CellComponentModule {}

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  NgModule,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CellState, createCellState } from '@sud/domain';

@Component({
  selector: 'sud-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent {
  @Input() cellState: CellState = createCellState({
    row: -1,
    column: -1,
    region: { column: -1, row: -1 },
  });

  @HostBinding('style.--error-background')
  @Input()
  errorBackgroundColor = '';

  @HostBinding('style.--error-color')
  @Input()
  errorColor = '';

  @HostBinding('attr.data-focused-state')
  @Input()
  focusState = '';

  @Output() cellFocusReceived = new EventEmitter<void>();
  @Output() cellBlurReceived = new EventEmitter<void>();
  @Output() cellValueChanged = new EventEmitter<void>();
}

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [CellComponent],
  exports: [CellComponent],
})
export class CellComponentModule {}

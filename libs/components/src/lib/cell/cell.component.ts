import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter, HostBinding,
  Input,
  NgModule,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'sud-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent {
  @Input() hasError = false;
  @Input() cellValue: number | undefined;

  @HostBinding('style.--error-background')
  @Input() errorBackgroundColor = '';

  @HostBinding('style.--error-color')
  @Input() errorColor = '';

  @HostBinding('attr.data-focused-state')
  @Input() focusState = '';

  @Output() cellFocusReceived = new EventEmitter<void>();
  @Output() cellBlurReceived = new EventEmitter<void>();
}

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [CellComponent],
  exports: [CellComponent],
})
export class CellComponentModule {}

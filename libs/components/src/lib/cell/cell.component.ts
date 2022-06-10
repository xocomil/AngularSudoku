import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
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

  #errorBackgroundColor: string | undefined;
  @Input() get errorBackgroundColor(): string {
    return this.#errorBackgroundColor ?? '';
  }
  set errorBackgroundColor(value: string | undefined) {
    this.#errorBackgroundColor = value;

    this?._hostContainer.nativeElement.style.setProperty(
      '--error-background',
      value
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
      value
    );
  }

  @Output() cellFocusReceived = new EventEmitter<void>();
  @Output() cellBlurReceived = new EventEmitter<void>();

  constructor(private readonly _hostContainer: ElementRef) {}
}

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [CellComponent],
  exports: [CellComponent],
})
export class CellComponentModule {}

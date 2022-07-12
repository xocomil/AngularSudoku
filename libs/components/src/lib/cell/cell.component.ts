import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  NgModule,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CellState, createCellState } from '@sud/domain';
import produce from 'immer';

@Component({
  selector: 'sud-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent {
  readonly #allowedValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  @Input() cellState: CellState = createCellState({
    row: -1,
    column: -1,
    region: -1,
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
  @Output() cellValueChanged = new EventEmitter<CellState>();

  #getNumericValue(newValue: string): number | undefined {
    const numericValue = parseInt(newValue, 10);

    if (isNaN(numericValue)) {
      return undefined;
    }

    return numericValue;
  }

  @HostListener('keypress', ['$event'])
  protected handleKeyEvent(event: KeyboardEvent) {
    console.log('event', event);
    event.preventDefault();

    if (this.#allowedValues.includes(event.key)) {
      this.#inputValueChanged(event.key);
    }
  }

  #inputValueChanged(newValue: string): void {
    this.cellState = produce(this.cellState, (draft) => {
      draft.value = this.#getNumericValue(newValue);
    });

    this.cellValueChanged.emit(this.cellState);
  }
}

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [CellComponent],
  exports: [CellComponent],
})
export class CellComponentModule {}

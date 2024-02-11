import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CellState, createCellState, GridDirection, gridDirectionFromKeyboard } from '@sud/domain';
import { logObservable } from '@sud/rxjs-operators';
import { filter, fromEvent, map, of, Subject, Subscription, tap } from 'rxjs';
import { PencilMarkComponent } from '../pencil-mark/pencil-mark.component';
import { NumbersToHidePipe } from './numbers-to-hide.pipe';

@Component({
  selector: 'sud-cell',
  standalone: true,
  imports: [CommonModule, FormsModule, PencilMarkComponent, NumbersToHidePipe],
  template: `
    <div [class.error]="!cellState.valid">
      @if (!cellState.value) {
        <sud-pencil-mark class="pencil-marks" [numbersToHide]="cellState | numbersToHide"></sud-pencil-mark>
      }
      @if (debug$ | async) {
        <div class="debug">
          <!--        focusState: {{ focusState }} <br />-->
          <!--        coords: ({{ cellState.column }}, row: {{ cellState.row }}<br />-->
          <!--        col: {{ cellState.column }}<br />-->
          <!--        reg: {{ cellState.region }}<br />-->
          <!--        valid: {{ cellState.valid }}<br />-->
          value: {{ cellState.value + '' }}<br />
          truthy: {{ !!cellState.value | json }}
          <!--        isReadonly: {{ cellState.isReadonly }}-->
        </div>
      }
      <input
        data-cy="cellInput"
        data-testId="cellInput"
        #cellInput
        [ngModel]="cellState.value"
        (focus)="cellFocusReceived.emit()"
        (blur)="cellBlurReceived.emit()"
        autocomplete="none"
        [class.is-readonly]="cellState.isReadonly"
        [disabled]="!creatingPuzzleMode && cellState.isReadonly"
        />
      </div>
    `,
  styleUrls: ['./cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent implements OnInit, OnDestroy {
  @Input() creatingPuzzleMode? = false;

  debug$ = of(false);

  readonly #allowedValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  readonly #navigationValues = ['w', 'a', 's', 'd', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown'];
  readonly #deleteKeys = ['delete', 'backspace'];
  readonly #skipHandler = ['tab', 'escape'];
  readonly #subs = new Subscription();
  readonly #navigationKey$ = new Subject<GridDirection>();

  @ViewChild('cellInput', { static: true })
  cellInput?: ElementRef<HTMLInputElement>;

  @Input()
  cellState: CellState = createCellState({
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

  #nextToFocus?: readonly [number, number];

  @Input()
  get nextToFocus(): readonly [number, number] | undefined {
    return this.#nextToFocus;
  }

  set nextToFocus(value: readonly [number, number] | undefined) {
    this.#nextToFocus = value;

    if (this.#nextToFocus) {
      const [row, column] = this.#nextToFocus;

      if (row === this.cellState.row && column === this.cellState.column) {
        this.cellInput?.nativeElement.focus();
      }
    }
  }

  @Output() cellFocusReceived = new EventEmitter<void>();
  @Output() cellBlurReceived = new EventEmitter<void>();
  @Output() cellValueChanged = new EventEmitter<number | undefined>();
  @Output() cellNavigated = this.#navigationKey$;

  ngOnInit(): void {
    if (this.cellInput) {
      const keydown$ = fromEvent<KeyboardEvent>(this.cellInput.nativeElement, 'keydown').pipe(
        tap((event) => this.handleKeyEvent(event)),
        filter((event) => this.#navigationValues.includes(event.key.toLowerCase()))
      );

      this.#subs.add(
        keydown$
          .pipe(
            map((event) => gridDirectionFromKeyboard(event.key)),
            logObservable('gridDirection')
          )
          .subscribe(this.#navigationKey$)
      );
    }
  }

  ngOnDestroy(): void {
    this.#subs.unsubscribe();
  }

  protected handleKeyEvent(event: KeyboardEvent) {
    console.log('handleKeyEvent', event.key, event);

    if (this.#skipHandler.includes(event.key.toLowerCase())) {
      return;
    }

    event.preventDefault();

    if (this.#allowedValues.includes(event.key)) {
      this.#inputValueChanged(event.key);
    }
    if (this.#deleteKeys.includes(event.key.toLowerCase())) {
      this.#inputValueChanged('');
    }
  }

  #inputValueChanged(newValue: string): void {
    this.cellValueChanged.emit(getNumericValue(newValue));
  }
}

const getNumericValue = (newValue: string): number | undefined => {
  const numericValue = parseInt(newValue, 10);

  if (isNaN(numericValue)) {
    return undefined;
  }

  return numericValue;
};

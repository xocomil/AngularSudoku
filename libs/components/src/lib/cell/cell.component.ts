import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  createCellState,
  GridDirection,
  gridDirectionFromKeyboard,
} from '@sud/domain';
import { logObservable } from '@xocomil/log-observable';
import { filter, fromEvent, map, Subject, Subscription, tap } from 'rxjs';
import { PencilMarkComponent } from '../pencil-mark/pencil-mark.component';

@Component({
  selector: 'sud-cell',
  imports: [CommonModule, FormsModule, PencilMarkComponent],
  template: `
    <div [class.error]="!cellState().valid">
      @if (!cellState().value) {
        @defer {
          <sud-pencil-mark
            class="pencil-marks"
            [numbersToHide]="numbersToHide()"
          ></sud-pencil-mark>
        }
      }
      @if (debug()) {
        <div class="debug">
          <!--        focusState: {{ focusState }} <br />-->
          <!--        coords: ({{ cellState.column }}, row: {{ cellState.row }}<br />-->
          <!--        col: {{ cellState.column }}<br />-->
          <!--        reg: {{ cellState.region }}<br />-->
          <!--        valid: {{ cellState.valid }}<br />-->
          value: {{ cellState().value + '' }}<br />
          truthy: {{ !!cellState().value | json }}
          <!--        isReadonly: {{ cellState.isReadonly }}-->
        </div>
      }
      <input
        #cellInput
        [ngModel]="cellState().value"
        [class.is-readonly]="cellState().isReadonly"
        [disabled]="disableInput()"
        (focus)="cellFocusReceived.emit()"
        (blur)="cellBlurReceived.emit()"
        data-cy="cellInput"
        data-testId="cellInput"
        autocomplete="none"
      />
    </div>
  `,
  styleUrls: ['./cell.component.scss'],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '[attr.data-focused-state]': 'focusState()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent implements OnInit, OnDestroy {
  creatingPuzzleMode = input(false);

  cellState = input(
    createCellState({
      row: -1,
      column: -1,
      region: -1,
    }),
  );

  nextToFocus = input<readonly [number, number] | undefined>(undefined);

  protected readonly numbersToHide = computed(() => {
    const cellState = this.cellState();

    return cellState.rowValuesToHide.concat(
      cellState.regionValuesToHide,
      cellState.columnValuesToHide,
    );
  });

  protected readonly disableInput = computed(
    () => !this.creatingPuzzleMode() && this.cellState().isReadonly,
  );

  protected readonly debug = signal(false);

  readonly #allowedValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  readonly #navigationValues = [
    'w',
    'a',
    's',
    'd',
    'arrowleft',
    'arrowright',
    'arrowup',
    'arrowdown',
  ];
  readonly #deleteKeys = ['delete', 'backspace'];
  readonly #skipHandler = ['tab', 'escape'];
  readonly #subs = new Subscription();
  readonly #navigationKey$ = new Subject<GridDirection>();

  cellInput = viewChild.required<ElementRef<HTMLInputElement>>('cellInput');

  focusState = input('');

  @Output() cellFocusReceived = new EventEmitter<void>();
  @Output() cellBlurReceived = new EventEmitter<void>();
  @Output() cellValueChanged = new EventEmitter<number | undefined>();
  @Output() cellNavigated = this.#navigationKey$;

  constructor() {
    effect(() => {
      const nextToFocus = this.nextToFocus();

      if (nextToFocus) {
        const [row, column] = nextToFocus;

        if (
          row === this.cellState().row &&
          column === this.cellState().column
        ) {
          this.cellInput().nativeElement.focus();
        }
      }
    });
  }

  ngOnInit(): void {
    const keydown$ = fromEvent<KeyboardEvent>(
      this.cellInput().nativeElement,
      'keydown',
    ).pipe(
      tap((event) => this.handleKeyEvent(event)),
      filter((event) =>
        this.#navigationValues.includes(event.key.toLowerCase()),
      ),
    );

    this.#subs.add(
      keydown$
        .pipe(
          map((event) => gridDirectionFromKeyboard(event.key)),
          logObservable('gridDirection'),
        )
        .subscribe(this.#navigationKey$),
    );
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

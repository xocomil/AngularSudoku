import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  NgModule,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CellState,
  createCellState,
  GridDirection,
  gridDirectionFromKeyboard,
} from '@sud/domain';
import { filter, fromEvent, map, Subject, Subscription, tap } from 'rxjs';

@Component({
  selector: 'sud-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent implements OnInit, OnDestroy {
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
  @Output() cellValueChanged = new EventEmitter<number>();
  @Output() cellNavigated = this.#navigationKey$;

  ngOnInit(): void {
    if (this.cellInput) {
      const keydown$ = fromEvent<KeyboardEvent>(
        this.cellInput.nativeElement,
        'keydown'
      ).pipe(
        tap((event) => this.handleKeyEvent(event)),
        filter((event) =>
          this.#navigationValues.includes(event.key.toLowerCase())
        )
      );

      this.#subs.add(
        keydown$
          .pipe(map((event) => gridDirectionFromKeyboard(event.key)))
          .subscribe(this.#navigationKey$)
      );
    }
  }

  ngOnDestroy(): void {
    this.#subs.unsubscribe();
  }

  #getNumericValue(newValue: string): number | undefined {
    const numericValue = parseInt(newValue, 10);

    if (isNaN(numericValue)) {
      return undefined;
    }

    return numericValue;
  }

  protected handleKeyEvent(event: KeyboardEvent) {
    event.preventDefault();

    if (this.#allowedValues.includes(event.key)) {
      this.#inputValueChanged(event.key);
    }
  }

  #inputValueChanged(newValue: string): void {
    this.cellValueChanged.emit(this.#getNumericValue(newValue));
  }
}

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [CellComponent],
  exports: [CellComponent],
})
export class CellComponentModule {}

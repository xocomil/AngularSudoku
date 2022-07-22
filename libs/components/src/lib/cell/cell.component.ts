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
  gridDirectionFromKeyboard,
} from '@sud/domain';
import { logObservable } from '@sud/rxjs-operators';
import produce from 'immer';
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
  readonly #navigationKey$ = new Subject<string>();

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

  @Output() cellFocusReceived = new EventEmitter<void>();
  @Output() cellBlurReceived = new EventEmitter<void>();
  @Output() cellValueChanged = new EventEmitter<CellState>();
  @Output() cellNavigated = this.#navigationKey$;

  ngOnInit(): void {
    if (this.cellInput) {
      const keydown$ = fromEvent<KeyboardEvent>(
        this.cellInput.nativeElement,
        'keydown'
      ).pipe(
        logObservable('keydown$'),
        tap((event) => this.handleKeyEvent(event)),
        filter((event) =>
          this.#navigationValues.includes(event.key.toLowerCase())
        )
      );

      this.#subs.add(
        keydown$
          .pipe(
            logObservable('merged'),
            map((event) => gridDirectionFromKeyboard(event.key))
          )
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

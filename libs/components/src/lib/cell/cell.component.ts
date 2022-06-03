import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgModule,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'sud-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent implements OnInit {
  @Input() hasError = false;

  #backgroundColor: string | undefined;
  @Input() get backgroundColor(): string {
    return this.#backgroundColor ?? '';
  }
  set backgroundColor(value: string | undefined) {
    this.#backgroundColor = value;

    this?._hostContainer.nativeElement.style.setProperty(
      '--error-background',
      value
    );
  }

  constructor(private readonly _hostContainer: ElementRef) {}

  ngOnInit(): void {}
}

@NgModule({
  imports: [CommonModule],
  declarations: [CellComponent],
  exports: [CellComponent],
})
export class CellComponentModule {}

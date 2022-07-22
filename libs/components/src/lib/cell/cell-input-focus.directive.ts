import { CommonModule } from '@angular/common';
import { Directive, ElementRef, Input, NgModule } from '@angular/core';

@Directive({
  selector: '[sudCellInputFocus]',
})
export class CellInputFocusDirective {
  private _focused?: boolean;

  @Input() get sudCellInputFocus(): boolean | undefined {
    return this._focused;
  }

  set sudCellInputFocus(value: boolean | undefined) {
    this._focused = value;

    console.log('cellInputFocusDirective', value);

    if (value) {
      this._el.nativeElement.focus();
    }
  }

  constructor(private readonly _el: ElementRef) {}
}

@NgModule({
  imports: [CommonModule],
  declarations: [CellInputFocusDirective],
  exports: [CellInputFocusDirective],
})
export class CellInputFocusDirectiveModule {}

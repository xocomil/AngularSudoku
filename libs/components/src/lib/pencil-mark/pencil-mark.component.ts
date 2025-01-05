
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { CellValue } from '@sud/domain';
import { SvgPencilMarkPipe } from '@sud/pipes';

@Component({
    selector: 'sud-pencil-mark',
    imports: [SvgPencilMarkPipe],
    template: ` <svg viewBox="0 0 60 60" preserveAspectRatio="xMidYMid meet">
      <style>
        text {
        font-size: 16px;
        font-weight: 600;
      }
    </style>
    @if (numbersToHide | svgPencilMark: 1) {
      <text x="6" y="16">1</text>
    }
    @if (numbersToHide | svgPencilMark: 2) {
      <text x="26" y="16">2</text>
    }
    @if (numbersToHide | svgPencilMark: 3) {
      <text x="46" y="16">3</text>
    }
    @if (numbersToHide | svgPencilMark: 4) {
      <text x="6" y="36">4</text>
    }
    @if (numbersToHide | svgPencilMark: 5) {
      <text x="26" y="36">5</text>
    }
    @if (numbersToHide | svgPencilMark: 6) {
      <text x="46" y="36">6</text>
    }
    @if (numbersToHide | svgPencilMark: 7) {
      <text x="6" y="56">7</text>
    }
    @if (numbersToHide | svgPencilMark: 8) {
      <text x="26" y="56">8</text>
    }
    @if (numbersToHide | svgPencilMark: 9) {
      <text x="46" y="56">9</text>
    }
    </svg>`,
    styleUrls: ['./pencil-mark.component.scss'],
    encapsulation: ViewEncapsulation.Emulated,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PencilMarkComponent {
  @Input() numbersToHide: CellValue[] = [];
}

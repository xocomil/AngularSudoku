import { CommonModule } from '@angular/common';
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
  standalone: true,
  imports: [CommonModule, SvgPencilMarkPipe],
  template: ` <svg viewBox="0 0 60 60" preserveAspectRatio="xMidYMid meet">
    <style>
      text {
        font-size: 16px;
        font-weight: 600;
      }
    </style>
    <text x="6" y="16" *ngIf="numbersToHide | svgPencilMark: 1">1</text>
    <text x="26" y="16" *ngIf="numbersToHide | svgPencilMark: 2">2</text>
    <text x="46" y="16" *ngIf="numbersToHide | svgPencilMark: 3">3</text>
    <text x="6" y="36" *ngIf="numbersToHide | svgPencilMark: 4">4</text>
    <text x="26" y="36" *ngIf="numbersToHide | svgPencilMark: 5">5</text>
    <text x="46" y="36" *ngIf="numbersToHide | svgPencilMark: 6">6</text>
    <text x="6" y="56" *ngIf="numbersToHide | svgPencilMark: 7">7</text>
    <text x="26" y="56" *ngIf="numbersToHide | svgPencilMark: 8">8</text>
    <text x="46" y="56" *ngIf="numbersToHide | svgPencilMark: 9">9</text>
  </svg>`,
  styleUrls: ['./pencil-mark.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PencilMarkComponent {
  @Input() numbersToHide: CellValue[] = [];
}

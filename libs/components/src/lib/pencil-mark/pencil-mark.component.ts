import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
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
    <text x="6" y="16" *ngIf="numbersToDisplay | svgPencilMark: 1">1</text>
    <text x="26" y="16" *ngIf="numbersToDisplay | svgPencilMark: 2">2</text>
    <text x="46" y="16" *ngIf="numbersToDisplay | svgPencilMark: 3">3</text>
    <text x="6" y="36" *ngIf="numbersToDisplay | svgPencilMark: 4">4</text>
    <text x="26" y="36" *ngIf="numbersToDisplay | svgPencilMark: 5">5</text>
    <text x="46" y="36" *ngIf="numbersToDisplay | svgPencilMark: 6">6</text>
    <text x="6" y="56" *ngIf="numbersToDisplay | svgPencilMark: 7">7</text>
    <text x="26" y="56" *ngIf="numbersToDisplay | svgPencilMark: 8">8</text>
    <text x="46" y="56" *ngIf="numbersToDisplay | svgPencilMark: 9">9</text>
  </svg>`,
  styleUrls: ['./pencil-mark.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PencilMarkComponent {
  @Input() numbersToDisplay = [1, 2, 3, 4, 5, 6, 7, 8, 9];
}

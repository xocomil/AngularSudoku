import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'sud-pencil-mark',
  standalone: true,
  imports: [CommonModule],
  template: ` <svg viewBox="0 0 60 60">
    <style>
      text {
        font-size: 16px;
        font-weight: 600;
        fill: hsl(0deg 0% 40%);
      }
    </style>
    <text x="6" y="16">1</text>
    <text x="26" y="16">2</text>
    <text x="46" y="16">3</text>
    <text x="6" y="36">4</text>
    <text x="26" y="36">5</text>
    <text x="46" y="36">6</text>
    <text x="6" y="56">7</text>
    <text x="26" y="56">8</text>
    <text x="46" y="56">9</text>
  </svg>`,
  styleUrls: ['./pencil-mark.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PencilMarkComponent {}

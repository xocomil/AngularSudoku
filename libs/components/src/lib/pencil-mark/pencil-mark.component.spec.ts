import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PencilMarkComponent } from './pencil-mark.component';

describe('PencilMarkComponent', () => {
  let component: PencilMarkComponent;
  let fixture: ComponentFixture<PencilMarkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PencilMarkComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PencilMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

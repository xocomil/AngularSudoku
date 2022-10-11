import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonHostComponent } from './button-host.component';

describe('ButtonHostComponent', () => {
  let component: ButtonHostComponent;
  let fixture: ComponentFixture<ButtonHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

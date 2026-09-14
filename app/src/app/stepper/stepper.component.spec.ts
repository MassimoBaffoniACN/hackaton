import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { StepperComponent } from './stepper.component';

@Component({
  template: `<app-stepper [activeStep]="step" />`,
  imports: [StepperComponent],
})
class HostComponent {
  step = 1;
}

describe('StepperComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('dovrebbe creare il componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('dovrebbe applicare aria-current="step" allo step attivo', () => {
    const items = fixture.nativeElement.querySelectorAll('[aria-current="step"]');
    expect(items.length).toBe(1);
  });

  it('dovrebbe marcare lo step precedente come completato', () => {
    host.step = 2;
    fixture.detectChanges();
    const completed = fixture.nativeElement.querySelectorAll('.stepper__item--completed');
    expect(completed.length).toBe(1);
  });
});

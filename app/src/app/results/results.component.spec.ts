import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsComponent } from './results.component';

describe('ResultsComponent', () => {
  let fixture: ComponentFixture<ResultsComponent>;
  let component: ResultsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('dovrebbe creare il componente', () => {
    expect(component).toBeTruthy();
  });

  it('dovrebbe emettere nuovoBollettino al click del bottone', () => {
    let emesso = false;
    component.nuovoBollettino.subscribe(() => (emesso = true));
    component.onNuovaBolletta();
    expect(emesso).toBe(true);
  });
});

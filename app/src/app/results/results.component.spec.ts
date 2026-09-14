import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsComponent } from './results.component';

describe('ResultsComponent', () => {
  let fixture: ComponentFixture<ResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsComponent);
    fixture.detectChanges();
  });

  it('dovrebbe creare il componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('dovrebbe mostrare il placeholder dei risultati', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.results-layout__placeholder')).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AnalisiComponent } from './analisi.component';
import { AnalisiService } from './analisi.service';
import { RispostaAnalisi } from '../domain/analisi';

const fakeFile = new File(['contenuto'], 'bolletta.pdf', { type: 'application/pdf' });
const fakeRisposta: RispostaAnalisi = { id: 'test-123' };

@Component({
  template: `<app-analisi [file]="file" (analisiCompletata)="onCompletata($event)" (analisiErrore)="onErrore()" />`,
  imports: [AnalisiComponent],
})
class HostComponent {
  file = fakeFile;
  risultato: RispostaAnalisi | null = null;
  errore = false;

  onCompletata(r: RispostaAnalisi): void { this.risultato = r; }
  onErrore(): void { this.errore = true; }
}

describe('AnalisiComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let analisiService: { carica: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    analisiService = { carica: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: AnalisiService, useValue: analisiService }],
    }).compileComponents();
  });

  it('dovrebbe mostrare lo spinner durante il caricamento', () => {
    analisiService.carica.mockReturnValue(of(fakeRisposta));
    fixture = TestBed.createComponent(HostComponent);
    // spinner presente prima che la risposta venga emessa in modo sincrono
    expect(fixture.nativeElement.querySelector('p-progressSpinner, .p-progressspinner')).toBeTruthy();
  });

  it('dovrebbe emettere analisiCompletata con la risposta del BE', async () => {
    analisiService.carica.mockReturnValue(of(fakeRisposta));
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.risultato).toEqual(fakeRisposta);
  });

  it('dovrebbe mostrare lo stato di errore e emettere analisiErrore al click', async () => {
    analisiService.carica.mockReturnValue(throwError(() => new Error('network')));
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.analisi__error');
    expect(errorEl).toBeTruthy();

    const btn = fixture.nativeElement.querySelector('p-button');
    btn?.click();
    expect(fixture.componentInstance.errore).toBe(true);
  });
});

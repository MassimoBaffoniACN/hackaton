import { Component, signal } from '@angular/core';
import { UploaderComponent } from './uploader/uploader.component';
import { AnalisiComponent } from './analisi/analisi.component';
import { ResultsComponent } from './results/results.component';
import { HeaderComponent } from './header/header.component';
import { SkipLinkComponent } from './skip-link/skip-link.component';
import { StepperComponent } from './stepper/stepper.component';
import { RispostaAnalisi } from './domain/analisi';

@Component({
  selector: 'app-root',
  imports: [SkipLinkComponent, HeaderComponent, StepperComponent, UploaderComponent, AnalisiComponent, ResultsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly currentStep = signal(1);
  protected readonly fileCorrente = signal<File | null>(null);
  protected readonly rispostaAnalisi = signal<RispostaAnalisi | null>(null);

  protected onFileSelezionato(file: File): void {
    this.fileCorrente.set(file);
    this.currentStep.set(2);
  }

  protected onAnalisiCompletata(risposta: RispostaAnalisi): void {
    this.rispostaAnalisi.set(risposta);
    this.currentStep.set(3);
  }

  protected onNuovaBolletta(): void {
    this.fileCorrente.set(null);
    this.rispostaAnalisi.set(null);
    this.currentStep.set(1);
  }
}

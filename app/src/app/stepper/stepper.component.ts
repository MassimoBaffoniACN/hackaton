import { Component, computed, input } from '@angular/core';
import { StepperStep } from './stepper.interfaces';

const STEPS: StepperStep[] = [
  {
    id: 1,
    titolo: 'Carica la bolletta',
    descrizione: 'Seleziona o trascina il file della bolletta da analizzare.',
    icona: 'pi pi-upload',
  },
  {
    id: 2,
    titolo: 'Analisi automatica',
    descrizione: 'Il sistema estrae ed elabora automaticamente i dati della bolletta.',
    icona: 'pi pi-search',
  },
  {
    id: 3,
    titolo: 'Leggi i dati semplificati',
    descrizione: 'Visualizza un riepilogo chiaro dei consumi e dei costi.',
    icona: 'pi pi-chart-bar',
  },
];

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
})
export class StepperComponent {
  readonly activeStep = input.required<number>();

  readonly steps = computed(() =>
    STEPS.map((s) => ({
      ...s,
      isActive: s.id === this.activeStep(),
      isCompleted: s.id < this.activeStep(),
    })),
  );
}

import { Component, input } from '@angular/core';
import { RispostaAnalisi } from '../domain/analisi';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  host: {
    '[attr.role]': '"main"',
    '[attr.aria-label]': '"Risultati analisi bolletta"',
  },
})
export class ResultsComponent {
  readonly risposta = input<RispostaAnalisi | null>(null);
}

import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-results',
  imports: [ButtonModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  host: {
    '[attr.role]': '"main"',
    '[attr.aria-label]': '"Risultati analisi bolletta"',
  },
})
export class ResultsComponent {
  /** Emette quando l'utente vuole ricominciare dal caricamento. */
  readonly nuovoBollettino = output<void>();

  onNuovaBolletta(): void {
    this.nuovoBollettino.emit();
  }
}

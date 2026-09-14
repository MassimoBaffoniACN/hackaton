import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { AnalisiService } from './analisi.service';
import { StatoAnalisi } from './analisi.interfaces';
import { RispostaAnalisi } from '../domain/analisi';

@Component({
  selector: 'app-analisi',
  imports: [ProgressBarModule, ProgressSpinnerModule, ButtonModule],
  templateUrl: './analisi.component.html',
  styleUrl: './analisi.component.scss',
  host: {
    '[attr.role]': '"status"',
    '[attr.aria-label]': '"Analisi bolletta in corso"',
  },
})
export class AnalisiComponent implements OnInit {
  private readonly analisiService = inject(AnalisiService);
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  readonly file = input.required<File>();
  readonly analisiCompletata = output<RispostaAnalisi>();
  readonly analisiErrore = output<void>();

  private readonly _stato = signal<StatoAnalisi>('caricamento');
  private readonly _messaggioErrore = signal<string | null>(null);

  readonly stato = this._stato.asReadonly();
  readonly messaggioErrore = this._messaggioErrore.asReadonly();

  ngOnInit(): void {
    this.liveAnnouncer.announce('Analisi della bolletta in corso. Attendere.', 'polite');

    this.analisiService.carica(this.file()).subscribe({
      next: (risposta) => {
        this.liveAnnouncer.announce('Analisi completata.', 'polite');
        this.analisiCompletata.emit(risposta);
      },
      error: () => {
        const msg = "Errore durante l'analisi. Controlla la connessione e riprova.";
        this._stato.set('errore');
        this._messaggioErrore.set(msg);
        this.liveAnnouncer.announce(msg, 'assertive');
      },
    });
  }

  onRiprova(): void {
    this.analisiErrore.emit();
  }
}

import { Component, computed, input } from '@angular/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { RispostaAnalisi } from '../domain/analisi';
import { InfoBox, SezioneSpiegazione } from './results.interfaces';

@Component({
  selector: 'app-results',
  imports: [Accordion, AccordionPanel, AccordionHeader, AccordionContent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  host: {
    '[attr.role]': '"main"',
    '[attr.aria-label]': '"Risultati analisi bolletta"',
  },
})
export class ResultsComponent {
  readonly risposta = input<RispostaAnalisi | null>(null);

  readonly boxLarge = computed<InfoBox[]>(() => {
    const info = this.risposta()?.informazioniPrincipali;
    if (!info) return [];
    const result: InfoBox[] = [];

    if (info.totale.valore !== null) {
      result.push({
        label: 'Totale da pagare',
        valore: this.formatCurrency(info.totale.valore),
        icona: 'pi-euro',
        confidenza: info.totale.confidenza,
        variante: 'default',
      });
    }

    if (info.scadenza.valore) {
      result.push({
        label: 'Scadenza pagamento',
        valore: this.formatDate(info.scadenza.valore),
        icona: 'pi-calendar',
        confidenza: info.scadenza.confidenza,
        variante: 'default',
      });
    }

    if (info.comePagare.valore) {
      result.push({
        label: 'Come pagare',
        valore: info.comePagare.valore,
        icona: 'pi-credit-card',
        confidenza: info.comePagare.confidenza,
        variante: 'default',
      });
    }

    return result;
  });

  readonly boxNormal = computed<InfoBox[]>(() => {
    const info = this.risposta()?.informazioniPrincipali;
    if (!info) return [];
    const result: InfoBox[] = [];

    if (info.periodoRiferimento.valore) {
      result.push({
        label: 'Periodo di riferimento',
        valore: info.periodoRiferimento.valore,
        icona: 'pi-calendar-range',
        confidenza: info.periodoRiferimento.confidenza,
        variante: 'info',
      });
    }

    if (info.consumo.valore) {
      result.push({
        label: 'Consumo',
        valore: info.consumo.valore,
        icona: 'pi-bolt',
        confidenza: info.consumo.confidenza,
        variante: 'info',
      });
    }

    if (info.daPagare.valore !== null) {
      result.push({
        label: 'Stato pagamento',
        valore: info.daPagare.valore ? 'Importo da saldare' : 'Nessun importo da saldare',
        icona: info.daPagare.valore ? 'pi-exclamation-circle' : 'pi-check-circle',
        confidenza: info.daPagare.confidenza,
        variante: info.daPagare.valore ? 'warning' : 'success',
      });
    }

    if (info.statoPagamentiPrecedenti.valore) {
      result.push({
        label: 'Pagamenti precedenti',
        valore: info.statoPagamentiPrecedenti.valore,
        icona: 'pi-history',
        confidenza: info.statoPagamentiPrecedenti.confidenza,
        variante: 'default',
      });
    }

    if (info.contattiAssistenza.valore) {
      result.push({
        label: 'Assistenza clienti',
        valore: info.contattiAssistenza.valore,
        icona: 'pi-phone',
        confidenza: info.contattiAssistenza.confidenza,
        variante: 'default',
      });
    }

    if (info.noteImportanti.valore) {
      result.push({
        label: 'Note importanti',
        valore: info.noteImportanti.valore,
        icona: 'pi-exclamation-triangle',
        confidenza: info.noteImportanti.confidenza,
        variante: 'warning',
      });
    }

    return result;
  });

  readonly sezioniSpiegazione = computed<SezioneSpiegazione[]>(() => {
    const spiegazione = this.risposta()?.spiegazione;
    if (!spiegazione) return [];
    return this.parseSpiegazione(spiegazione);
  });

  private formatCurrency(valore: number): string {
    return valore.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
  }

  private formatDate(valore: string): string {
    const data = new Date(`${valore}T00:00:00`);
    return data.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  private parseSpiegazione(spiegazione: string): SezioneSpiegazione[] {
    const righe = spiegazione.split('\n');
    const sezioni: SezioneSpiegazione[] = [];
    let titoloCorrente = '';
    let contenuto: string[] = [];

    for (const riga of righe) {
      if (riga.startsWith('## ')) {
        if (titoloCorrente) {
          sezioni.push({ titolo: titoloCorrente, testoHtml: this.markdownToHtml(contenuto.join('\n')) });
        }
        titoloCorrente = riga.slice(3).trim();
        contenuto = [];
      } else if (!riga.startsWith('# ')) {
        contenuto.push(riga);
      }
    }

    if (titoloCorrente) {
      sezioni.push({ titolo: titoloCorrente, testoHtml: this.markdownToHtml(contenuto.join('\n')) });
    }

    return sezioni;
  }

  private markdownToHtml(testo: string): string {
    return testo
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }
}

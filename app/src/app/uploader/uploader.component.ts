import { Component, ElementRef, HostListener, computed, inject, output, signal, viewChild } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { UploaderService } from './uploader.service';
import { UploaderState, UploaderStep } from './uploader.interfaces';

/**
 * Punto di ingresso del flusso di caricamento bolletta.
 * Supporta drag & drop sull'intero documento e selezione tramite input nascosto.
 */
@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrl: './uploader.component.scss',
  host: { 'aria-label': 'Carica bolletta' },
})
export class UploaderComponent {
  private readonly uploaderService = inject(UploaderService);
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  /** Riferimento all'input file nascosto: richiede `#inputFile` nel template. */
  private readonly inputFileRef = viewChild<ElementRef<HTMLInputElement>>('inputFile');

  private readonly _isDragOver = signal(false);
  private readonly _file = signal<File | null>(null);
  private readonly _erroreValidazione = signal<string | null>(null);
  private readonly _isLoading = signal(false);

  readonly isDragOver = this._isDragOver.asReadonly();
  readonly file = this._file.asReadonly();
  readonly erroreValidazione = this._erroreValidazione.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  /** Stato aggregato, utile per binding unico nel template. */
  readonly state = computed<UploaderState>(() => ({
    isDragOver: this._isDragOver(),
    fileSelezionato: this._file(),
    erroreValidazione: this._erroreValidazione(),
    isLoading: this._isLoading(),
  }));

  /** ID/i da associare al bottone via aria-describedby: include l'errore solo quando presente (WCAG 3.3.1 / 4.1.2). */
  readonly descrizioneAriaIds = computed(() =>
    this._erroreValidazione() ? 'uploader__description uploader__error' : 'uploader__description',
  );

  readonly steps = computed<UploaderStep[]>(() => [
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
  ]);

  /** Emette il file una volta superata la validazione. */
  readonly fileSelezionato = output<File>();

  @HostListener('document:dragenter', ['$event'])
  onDragEnter(event: DragEvent): void {
    event.preventDefault();
  }

  @HostListener('document:dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this._isDragOver.set(true);
  }

  @HostListener('document:dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    // relatedTarget è null quando il cursore lascia la finestra del documento:
    // evita di azzerare isDragOver quando si passa semplicemente tra elementi figli.
    if (event.relatedTarget === null) {
      this._isDragOver.set(false);
    }
  }

  @HostListener('document:drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this._isDragOver.set(false);

    const file = event.dataTransfer?.files?.[0] ?? null;
    if (file) {
      this.gestisciFile(file);
    }
  }

  /** Gestisce la selezione tramite l'input file nascosto (attivato da bottone). */
  onFileSelezionato(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file) {
      this.gestisciFile(file);
    }
    // Consente di ricaricare lo stesso file una seconda volta.
    input.value = '';
  }

  /** Apre il selettore file nativo cliccando sull'input nascosto. */
  apriSelettoreFile(): void {
    this.inputFileRef()?.nativeElement.click();
  }

  private gestisciFile(file: File): void {
    this._isLoading.set(true);
    const esito = this.uploaderService.valida(file);

    if (esito.valido) {
      this._file.set(file);
      this._erroreValidazione.set(null);
      this._isLoading.set(false);
      this.liveAnnouncer.announce(`File ${file.name} caricato correttamente.`, 'polite');
      this.fileSelezionato.emit(file);
      return;
    }

    const messaggioErrore = esito.errore ?? 'File non valido.';
    this._file.set(null);
    this._erroreValidazione.set(messaggioErrore);
    this._isLoading.set(false);
    this.liveAnnouncer.announce(messaggioErrore, 'assertive');
  }
}

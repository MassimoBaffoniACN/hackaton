import { Component, ElementRef, HostListener, computed, inject, output, signal, viewChild } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { UploaderService } from './uploader.service';
import { UploaderState, UploaderStep } from './uploader.interfaces';

/**
 * Version del UploaderComponent con template inline per i test.
 * Usa lo stesso codice LogicaTypeScript del componente reale.
 */
@Component({
  selector: 'app-uploader',
  template: `
    <div class="page-layout">
      <h1 class="uploader__title">Carica la tua bolletta</h1>

      <ol class="uploader__steps">
        @for (step of steps(); track step.id) {
          <li class="app-card">
            <div class="uploader__step-content">
              <i [class]="'uploader__step-icon ' + step.icona" aria-hidden="true"></i>
              <h2 class="uploader__step-title">{{ step.titolo }}</h2>
              <p class="uploader__step-description">{{ step.descrizione }}</p>
            </div>
          </li>
        }
      </ol>

      <div class="uploader__main">
        <button
          type="button"
          class="uploader__button"
          (click)="apriSelettoreFile()"
          [disabled]="isLoading()"
          [attr.aria-describedby]="descrizioneAriaIds()"
        >
          <i class="pi pi-upload" aria-hidden="true"></i>
          <span>Allega la tua bolletta</span>
        </button>

        <p id="uploader__description" class="uploader__description">
          Trascina il file in qualsiasi punto della pagina oppure clicca il bottone.
          Formati accettati: PDF, JPG, PNG. Dimensione massima: 10 MB.
        </p>

        @if (erroreValidazione()) {
          <div id="uploader__error" class="uploader__error" role="alert">
            <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
            <span>{{ erroreValidazione() }}</span>
          </div>
        }
      </div>

      <input
        #inputFile
        type="file"
        [hidden]="true"
        accept="application/pdf,image/jpeg,image/png"
        (change)="onFileSelezionato($event)"
        aria-hidden="true"
        tabindex="-1"
      />
    </div>

    @if (isDragOver()) {
      <div class="uploader__drag-overlay" aria-hidden="true">
        <div class="uploader__drag-content">
          <i class="pi pi-download" aria-hidden="true"></i>
          <p>Rilascia il file qui</p>
        </div>
      </div>
    }
  `,
  styles: [],
  host: {
    '[attr.role]': '"main"',
    '[attr.aria-label]': '"Carica bolletta"',
  },
})
export class UploaderComponentTestVersion {
  private readonly uploaderService = inject(UploaderService);
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  private readonly inputFileRef = viewChild<ElementRef<HTMLInputElement>>('inputFile');

  private readonly _isDragOver = signal(false);
  private readonly _file = signal<File | null>(null);
  private readonly _erroreValidazione = signal<string | null>(null);
  private readonly _isLoading = signal(false);

  readonly isDragOver = this._isDragOver.asReadonly();
  readonly file = this._file.asReadonly();
  readonly erroreValidazione = this._erroreValidazione.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly state = computed<UploaderState>(() => ({
    isDragOver: this._isDragOver(),
    fileSelezionato: this._file(),
    erroreValidazione: this._erroreValidazione(),
    isLoading: this._isLoading(),
  }));

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

  onFileSelezionato(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file) {
      this.gestisciFile(file);
    }
    input.value = '';
  }

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

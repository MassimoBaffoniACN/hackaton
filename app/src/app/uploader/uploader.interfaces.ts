/** Tipi di file accettati per il caricamento della bolletta. */
export type TipoFileAccettato = 'application/pdf' | 'image/jpeg' | 'image/png';

export const TIPI_FILE_ACCETTATI: TipoFileAccettato[] = ['application/pdf', 'image/jpeg', 'image/png'];

export const DIMENSIONE_MAX_BYTE = 10 * 1024 * 1024; // 10 MB

export interface EsitoValidazione {
  valido: boolean;
  errore?: string; // messaggio in italiano, specifico, azionabile
}

export interface UploaderStep {
  id: number;
  titolo: string;
  descrizione: string;
  icona: string; // classe PrimeIcon, es. 'pi pi-upload'
}

export interface UploaderState {
  isDragOver: boolean;
  fileSelezionato: File | null;
  erroreValidazione: string | null;
  isLoading: boolean;
}

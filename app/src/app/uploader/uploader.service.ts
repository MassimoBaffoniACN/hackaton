import { Injectable } from '@angular/core';
import { DIMENSIONE_MAX_BYTE, EsitoValidazione, TIPI_FILE_ACCETTATI, TipoFileAccettato } from './uploader.interfaces';

/**
 * Valida i file caricati dall'utente (tipo MIME e dimensione).
 * Nessuna logica di upload/invio: fuori scope per questo servizio.
 */
@Injectable({ providedIn: 'root' })
export class UploaderService {
  /**
   * Controlla tipo MIME e dimensione del file.
   *
   * ⚠️ Perimetro di sicurezza: questo è un controllo UX lato client, non un gate di sicurezza.
   * `file.type` è determinato dal browser (estensione/sniffing) e può essere manipolato
   * rinominando un file arbitrario. La validazione di sicurezza reale (magic bytes, antivirus,
   * sandbox) deve avvenire server-side nel modulo di analisi bolletta.
   */
  valida(file: File): EsitoValidazione {
    if (!TIPI_FILE_ACCETTATI.includes(file.type as TipoFileAccettato)) {
      return {
        valido: false,
        errore: 'Formato non supportato. Carica un file PDF, JPEG o PNG.',
      };
    }

    if (file.size > DIMENSIONE_MAX_BYTE) {
      const dimensioneMaxMb = DIMENSIONE_MAX_BYTE / (1024 * 1024);
      return {
        valido: false,
        errore: `Il file supera la dimensione massima di ${dimensioneMaxMb} MB. Scegli un file più piccolo.`,
      };
    }

    return { valido: true };
  }
}

export type StatoAnalisi = 'caricamento' | 'errore';

export interface AnalisiState {
  stato: StatoAnalisi;
  messaggioErrore: string | null;
}

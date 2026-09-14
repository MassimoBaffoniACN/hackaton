export interface InfoBox {
  label: string;
  valore: string;
  icona: string;
  confidenza: number | null;
  variante: 'default' | 'success' | 'warning' | 'info';
}

export interface SezioneSpiegazione {
  titolo: string;
  testoHtml: string;
}

export interface CampoConConfidenza<T = string> {
  valore: T | null;
  confidenza: number | null;
}

export interface InformazioniPrincipali {
  totale: CampoConConfidenza<number>;
  scadenza: CampoConConfidenza<string>;
  periodoRiferimento: CampoConConfidenza<string>;
  consumo: CampoConConfidenza<string>;
  statoPagamentiPrecedenti: CampoConConfidenza<string>;
  daPagare: CampoConConfidenza<boolean>;
  comePagare: CampoConConfidenza<string>;
  contattiAssistenza: CampoConConfidenza<string>;
  noteImportanti: CampoConConfidenza<string>;
}

export interface RispostaAnalisi {
  analisi?: unknown;
  analisiRaw?: string;
  spiegazione?: string;
  informazioniPrincipali?: InformazioniPrincipali;
}

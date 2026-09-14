import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private readonly _pronto = signal(false);
  readonly pronto = this._pronto.asReadonly();
}

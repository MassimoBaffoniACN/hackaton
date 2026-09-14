import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RispostaAnalisi } from '../domain/analisi';

@Injectable({ providedIn: 'root' })
export class AnalisiService {
  private readonly http = inject(HttpClient);

  carica(file: File): Observable<RispostaAnalisi> {
    const body = new FormData();
    body.append('file', file, file.name);
    return this.http.post<RispostaAnalisi>('http://localhost:8080/api/analizza', body);
  }
}

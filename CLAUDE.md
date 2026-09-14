# Bolletta Facile — CLAUDE.md

SPA Angular 21 per la gestione delle bollette domestiche italiane (luce, gas, acqua). Progetto hackathon. Tutte le decisioni tecniche favoriscono correttezza e accessibilità rispetto alla velocità di sviluppo.

---

## Comandi essenziali

```bash
cd app
npm start          # dev server → http://localhost:4200  (HMR attivo)
npm test           # Vitest in watch mode
npx vitest run --coverage   # coverage report una tantum
npx tsc --noEmit   # type check senza build
npm run build      # build produzione
```

Il dev server è configurato in `.claude/launch.json` — usa `preview_start "Angular Dev Server"` nel browser.

---

## Struttura del progetto

```
hackathon/
├── .claude/
│   ├── agents/            ← sub-agent definitions (7 file .md)
│   ├── skills/
│   ├── design-system.md   ← FONTE DI VERITÀ per UI: font, token, palette, pattern HTML/SCSS
│   └── launch.json
├── app/                   ← Angular workspace (unico progetto)
│   ├── angular.json
│   ├── package.json
│   └── src/
│       ├── index.html
│       ├── styles.scss    ← entry point SCSS, solo @use
│       ├── styles/        ← _tokens.scss · _reset.scss · _primeng.scss · _utilities.scss
│       └── app/
│           ├── app.config.ts    ← providers globali (router, animations, PrimeNG)
│           ├── app.routes.ts    ← routing root, tutte le route lazy
│           ├── domain/          ← interfacce e enum TypeScript del dominio (nessuna logica)
│           ├── services/        ← singleton services (@Injectable providedIn:'root')
│           └── {feature}/       ← un folder per feature (5 file obbligatori, vedi §Struttura file per feature)
└── presentation/          ← slide statiche del progetto (non parte dell'app)
```

---

## Stack

| Layer | Tecnologia | Versione |
|---|---|---|
| Framework | Angular | 21.2 |
| UI library | PrimeNG | 21.1 |
| Language | TypeScript | 5.9 |
| Styling | SCSS + CSS custom properties | — |
| Icone | PrimeIcons | bundlato con PrimeNG |
| Font | Atkinson Hyperlegible | via `<link>` in index.html |
| Test | Vitest + jsdom | 4.x |
| Build | @angular/build (esbuild) | 21.2 |

---

## Sistema di agenti

Questo progetto usa una pipeline di sub-agent specializzati. **Non sviluppare fuori dalla pipeline** — ogni modifica non gestita da un agent rompe le garanzie di qualità.

### Agente di riferimento per richieste di sviluppo

Invocare sempre **`orchestrator`** come primo interlocutore. Lui sequenzia il resto.

```
orchestrator → domain-analyst → angular-developer → ui-developer → accessibility-auditor → qa-engineer
```

### Tabella agenti

| Agent | Modello | Dominio primario | Quando invocare |
|---|---|---|---|
| `orchestrator` | Sonnet 5 | Coordinamento, verifica qualità | Qualsiasi richiesta di sviluppo |
| `domain-analyst` | Sonnet 5 | `app/src/app/domain/*.ts` | Modelli TypeScript assenti o incompleti |
| `angular-developer` | Sonnet 5 | `.ts` di produzione (componenti, servizi, routing) | Dopo che i domain model esistono |
| `ui-developer` | Haiku 4.5 | `.html` + `.scss` | Dopo che i component stub TypeScript esistono |
| `accessibility-auditor` | Sonnet 5 | Audit WCAG 2.1 AAA — gate obbligatorio | Dopo ogni sessione ui-developer |
| `qa-engineer` | Haiku 4.5 | `.spec.ts` + code review | Solo dopo clearance accessibility-auditor |
| `architect-auditor` | Sonnet 5 | Audit read-only dell'intera applicazione | `"audit"` o `"run architect-auditor"` |

### Protocollo cross-agent

Quando un agent rileva un'ottimizzazione fuori dal proprio dominio, emette un blocco `CROSS-AGENT REQUEST` per autorizzazione del developer — non modifica file altrui unilateralmente. L'orchestrator raccoglie le richieste e le presenta una alla volta. Dettagli nel file di ogni agent.

### Scope boundary

L'analisi/parsing del documento bolletta (PDF, OCR, estrazione dati) è gestita da un **agent separato creato da un collega** — non è in scope qui. Se un task riguarda quel dominio, reindirizza.

---

## Struttura file per feature — obbligatoria

Ogni feature deve vivere in una propria cartella con esattamente questi file:

```
app/src/app/{feature}/
├── {feature}.component.ts        ← class del componente: segnali, DI, logica
├── {feature}.component.html      ← template (dominio ui-developer)
├── {feature}.component.scss      ← foglio di stile (dominio ui-developer)
├── {feature}.interfaces.ts       ← interfacce e tipi specifici della feature
├── {feature}.service.ts          ← service della feature (se ha logica dati propria)
└── {feature}.component.spec.ts   ← test Vitest (dominio qa-engineer)
```

**Regole:**
- `angular-developer` crea tutti e 6 i file (html e scss come stub vuoti)
- Le interfacce condivise tra feature restano in `app/src/app/domain/`
- Le interfacce interne alla feature (es. stato UI, DTO locale) stanno in `{feature}.interfaces.ts`
- I servizi singleton globali restano in `app/src/app/services/`
- Il service di feature (`{feature}.service.ts`) è per logica dati specifica del componente

---

## Convenzioni Angular 21 — non negoziabili

```typescript
// DI: inject(), mai constructor injection
private readonly http = inject(HttpClient);

// State: signal() + asReadonly() nei servizi
private readonly _bollette = signal<Bolletta[]>([]);
readonly bollette = this._bollette.asReadonly();

// Derivazioni: computed(), mai metodi chiamati nel template
readonly totaleDovuto = computed(() => this.bollette().reduce(...));

// Template: @for con track, @if/@else — mai *ngFor/*ngIf
@for (b of bollette(); track b.id) { ... }
@if (isLoading()) { ... } @else { ... }

// Routing: lazy sempre
{ path: 'bollette', loadComponent: () => import('./bollette/bollette-list').then(m => m.BolletteListComponent) }

// Componenti: standalone di default (non scrivere standalone:true)
// No NgModule, no declarations, no entryComponents — mai
```

**Regole TypeScript:**
- Zero `any` senza JSDoc che spieghi il tipo esterno
- Zero `!` (non-null assertion) senza commento che provi la sicurezza
- Zero `// @ts-ignore`
- Tipi del dominio: solo da `app/src/app/domain/index.ts` — mai inline

---

## Design system

**Leggi `.claude/design-system.md` integralmente prima di scrivere qualsiasi template, SCSS o componente.**

Riepilogo critico:

- Font: Atkinson Hyperlegible 400/700 — solo questi due pesi
- Colori: solo token `var(--color-*)` — tutti verificati WCAG AAA (≥ 7:1)
- Spaziatura: griglia 8px — solo token `var(--space-*)`
- Ogni stato visivo: icona + testo + colore (mai il solo colore)
- Target touch: minimo 48×48 px (`var(--btn-min-height)`)
- SCSS componente: solo `var(--nome-token)`, scopo `:host { }`, no `!important`
- Logo: `public/logo.png` — prima dell'`<h1>` nell'header, `alt="Bolletta Facile"`, `width`/`height` espliciti

---

## Accessibilità — WCAG 2.1 Level AAA

Requisito non negoziabile. L'`accessibility-auditor` è un gate obbligatorio nella pipeline.

Requisiti strutturali in TypeScript (angular-developer):
- `host` ARIA bindings dove semanticamente necessario
- `LiveAnnouncer` (Angular CDK) per feedback dinamici
- `FocusTrap` (Angular CDK) su tutti i dialog
- Focus management su cambio route

Requisiti nel template (ui-developer):
- Contrasto ≥ 7:1 testo normale, ≥ 4.5:1 testo grande
- `aria-live="polite"` su zone di aggiornamento dinamico
- `aria-describedby` su ogni campo con messaggio d'errore
- `<abbr title="...">` per POD, PDR, kWh, ARERA alla prima occorrenza
- Flussi di pagamento: review → conferma → feedback (criterio 3.3.6)

---

## Definizione di "done"

Una feature è completata quando:

- [ ] `npx tsc --noEmit` → zero errori
- [ ] `accessibility-auditor` → zero Critical, zero Major
- [ ] `npx vitest run --coverage` → ≥ 80% branch coverage sui file nuovi
- [ ] Nessun `console.log`, nessun `fit()`/`fdescribe()`, nessun TODO non intenzionale

---

## Principi generali

- **Zero over-engineering.** Il minimo codice che risolve il problema. Nessuna astrazione per uso futuro ipotetico.
- **DRY prima di scrivere.** Cerca con `Grep` se la logica esiste già.
- **Commenti solo sul perché.** Mai sul cosa — i nomi lo dicono già.
- **Fallisci esplicitamente.** Se un prerequisito manca, riporta il blocco. Non interpretare, non improvvisare.
- **Stop immediato** se `tsc` fallisce o i test non passano — non si dichiara done su codice rotto.

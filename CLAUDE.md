# Bolletta Facile — CLAUDE.md

App per **analizzare e spiegare** le bollette di luce e gas in linguaggio semplice, pensata per persone anziane o poco esperte. L'utente carica una bolletta (PDF/immagine); l'app mostra una spiegazione discorsiva, un riepilogo dei dati chiave e i campi estratti, ciascuno con il proprio grado di confidenza. Progetto hackathon. Tutte le decisioni tecniche favoriscono correttezza e accessibilità rispetto alla velocità di sviluppo.

Due parti:
- **Frontend** — SPA Angular 21 (questa è la parte che la pipeline di agenti costruisce).
- **Backend** — servizio Spring Boot (Maven) in `backend/` che esegue a runtime la catena `bolletta-reader → bolletta-explainer` via l'SDK Anthropic per Java. Vedi `backend/README.md`.

> Nota: la parte Angular che invoca l'API del backend **non esiste ancora** — è il prossimo passo.

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

Backend (dalla cartella `backend/`):

```bash
# MOCK — nessuna API key, dati di esempio, costo zero (per sviluppare il frontend)
mvn spring-boot:run -Dspring-boot.run.profiles=mock

# REALE — chiama Claude, richiede ANTHROPIC_API_KEY valida
export ANTHROPIC_API_KEY="sk-ant-..."   # $env:ANTHROPIC_API_KEY="..." in PowerShell
mvn spring-boot:run

mvn -q -DskipTests compile   # solo compilazione
```

La differenza **mock vs reale** è centrale: in mock il backend non contatta Claude e non serve alcuna key; il contratto dell'API è identico, quindi il frontend si sviluppa a costo zero. Dettagli in `README.md` (sezione "Due modalità").

---

## Struttura del progetto

```
hackathon/
├── .claude/
│   ├── agents/            ← sub-agent definitions (vedi "Sistema di agenti": build + runtime)
│   ├── skills/
│   ├── design-system.md   ← FONTE DI VERITÀ per UI: font, token, palette, pattern HTML/SCSS
│   └── launch.json
├── app/                   ← Angular workspace (frontend)
│   ├── angular.json
│   ├── package.json
│   └── src/
│       ├── index.html
│       ├── styles.scss    ← entry point SCSS, solo @use
│       ├── styles/        ← _tokens.scss · _reset.scss · _primeng.scss · _utilities.scss
│       └── app/
│           ├── app.config.ts    ← providers globali (router, HttpClient, animations, PrimeNG)
│           ├── app.routes.ts    ← routing root, tutte le route lazy
│           ├── domain/          ← interfacce e enum TypeScript del dominio (nessuna logica)
│           ├── services/        ← singleton services (@Injectable providedIn:'root')
│           └── {feature}/       ← un folder per feature: .ts · .html · .scss · .spec.ts
├── backend/               ← servizio Spring Boot (Maven) — catena di agenti a runtime
│   └── src/main/
│       ├── java/it/inps/bollettafacile/   ← config · prompt · support · service · web
│       └── resources/     ← application.yml · prompts/ (system prompt runtime) · mock/samples.json
├── materiale_test/        ← bollette fac-simile di prova e output di esempio
└── presentation/          ← slide statiche del progetto (non parte dell'app)
```

**Contratto API backend ↔ frontend:** `POST /api/analizza` (multipart, campo `file`) →
`{ analisi, spiegazione, informazioniPrincipali }`. È questo il contratto che la parte Angular
(ancora da creare) dovrà consumare.

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

Nel repo convivono **due famiglie di agenti**, da non confondere:

- **Agenti di sviluppo (build)** — costruiscono il codice dell'app Angular. Sono quelli della pipeline qui sotto.
- **Agenti di runtime** — `bolletta-reader` e `bolletta-explainer`: elaborano una bolletta a runtime. NON costruiscono codice; girano nel backend Spring Boot come system prompt sulla Messages API (i loro `.md` sono la fonte, i file in `backend/src/main/resources/prompts/` la versione runtime). L'explainer produce, oltre alla spiegazione, l'oggetto `informazioniPrincipali` con i dati chiave e la confidenza ereditata dal reader.

La sezione seguente riguarda gli **agenti di sviluppo**. Questo progetto usa una pipeline di sub-agent specializzati. **Non sviluppare fuori dalla pipeline** — ogni modifica non gestita da un agent rompe le garanzie di qualità.

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

L'analisi/parsing del documento bolletta (PDF, OCR, estrazione dati) **non è compito della pipeline di sviluppo**: avviene a runtime nel backend Spring Boot tramite l'agente `bolletta-reader`. Se un task di sviluppo riguarda l'estrazione dei dati dalla bolletta, riguarda il backend / il prompt del reader, non i componenti Angular.

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

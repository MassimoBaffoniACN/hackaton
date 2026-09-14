# Bolletta Facile

App per **analizzare e spiegare** le bollette di luce e gas in linguaggio semplice, pensata per persone
anziane o poco esperte di termini tecnici. L'utente carica una bolletta (PDF o immagine) e l'app mostra una
spiegazione discorsiva più i campi estratti, ciascuno con il proprio **grado di confidenza**.

## Come funziona (a grandi linee)

```
App Angular (browser)  ──POST /api/analizza──▶  Backend Spring Boot
        ▲                                          │
        └────── JSON + spiegazione ────────────────┘
                                                   │  esegue la catena di agenti (Anthropic Java SDK)
                                                   ▼
                       bolletta-reader ──JSON {valore, confidenza}──▶ bolletta-explainer ──spiegazione──▶
```

- **bolletta-reader** legge la bolletta ed estrae i campi in JSON (ogni campo con `{ valore, confidenza }`).
- **bolletta-explainer** trasforma quel JSON in due cose: una **spiegazione** in linguaggio semplice e un
  oggetto **`informazioniPrincipali`** con i dati chiave (totale, scadenza, periodo, consumo, stato pagamenti
  precedenti, se/come pagare, contatti, note), ciascuno con la confidenza ereditata dal reader.
- Il **backend Spring Boot** orchestra la catena via l'SDK Anthropic per Java (Messages API) e tiene
  protetta la API key (mai nel frontend). La catena a 2 step non richiede l'Agent SDK.

---

## ⚠️ IMPORTANTE — Due modalità: MOCK vs REALE

Il backend può girare in **due modalità**, ed è la cosa più importante da capire prima di avviarlo.
Il **contratto dell'API è identico** nelle due modalità, quindi **il frontend non cambia**: cambia solo
cosa succede "dietro".

| | 🟢 **MOCK** | 🔵 **REALE** |
|---|---|---|
| A cosa serve | Sviluppare/dimostrare l'app | Analisi vera delle bollette (test/demo) |
| Chiama Claude? | **No** | **Sì** |
| API key | **Non richiesta** (fittizia o assente OK) | **Richiesta e valida** (`ANTHROPIC_API_KEY`) |
| Costo | **Zero** | A consumo (2 chiamate per bolletta) |
| Cosa restituisce | Dati di esempio da `backend/src/main/resources/mock/samples.json` | Estrazione + spiegazione reali del modello |
| Funziona offline | Sì | No (serve Internet) |

**Perché conta:** il "cervello" (il modello Claude) sta sui server di Anthropic. Senza credenziale valida
la **modalità reale non può funzionare** — né l'estrazione (reader) né la spiegazione (explainer), perché
entrambe sono chiamate al modello. La **modalità mock** aggira tutto questo restituendo dati finti già
pronti, così puoi costruire e mostrare l'app a costo zero. Quando avrai la key, passi alla modalità reale
**senza modificare una riga di codice**: cambia solo il profilo di avvio.

In mock la scelta del dato di esempio dipende dal **nome del file caricato**: ogni bolletta di test in
`materiale_test/` ha un campione dedicato e accurato (riconosciuto da parole chiave nel nome, es.
`enel-luce`, `servizio_elettrico`, `fotovoltaic`, `facsimile-bolletta-gas`, `guida_gas`); un file **non
riconosciuto** riceve un **errore HTTP 422** (in demo si analizzano solo le bollette di esempio).

---

## Avvio

### Backend

Dalla cartella `backend/`:

**Modalità MOCK** (nessuna key, costo zero):
```powershell
# PowerShell
$env:SPRING_PROFILES_ACTIVE="mock"
mvn spring-boot:run
```
```bash
# Bash / Git Bash
mvn spring-boot:run -Dspring-boot.run.profiles=mock
```

**Modalità REALE** (serve la API key):
```powershell
# PowerShell
$env:ANTHROPIC_API_KEY="sk-ant-..."
mvn spring-boot:run
```
```bash
# Bash / Git Bash
export ANTHROPIC_API_KEY="sk-ant-..."
mvn spring-boot:run
```

Il backend parte su **http://localhost:8080**. La API key si passa **solo** via variabile d'ambiente
`ANTHROPIC_API_KEY` (mai nel codice o in `application.yml`). Dettagli in `backend/README.md`.

Test rapido:
```bash
curl -X POST http://localhost:8080/api/analizza -F "file=@materiale_test/enel-luce-11.jpg"
```

### Frontend (in sviluppo)

```bash
cd app
npm install
npm start        # dev server su http://localhost:4200
```

---

## Struttura del repository

```
Hackaton/
├── app/                         # Frontend Angular 21 (standalone, signals) + PrimeNG 21
│   └── src/
│       ├── app/                 # componenti, routing, config
│       └── styles/              # design token SCSS (_tokens, _reset, _primeng, _utilities)
│
├── backend/                     # Backend Spring Boot (Maven) — catena di agenti a runtime
│   ├── pom.xml                  # Spring Boot 3.4, Java 17, anthropic-java 2.34.0
│   ├── README.md                # requisiti, modalità mock/reale, endpoint
│   └── src/main/
│       ├── java/it/inps/bollettafacile/
│       │   ├── config/          # AnthropicConfig (client), AnthropicProperties, WebConfig (CORS)
│       │   ├── prompt/          # PromptLoader (carica i system prompt)
│       │   ├── support/         # BillContentFactory (file→content block), JsonExtractor
│       │   ├── service/         # BollettaAnalyzer (interfaccia) + impl reale e MOCK, reader, explainer
│       │   └── web/             # AnalisiController, GlobalExceptionHandler, dto/AnalisiResponse
│       └── resources/
│           ├── application.yml
│           ├── prompts/         # bolletta-reader.txt, bolletta-explainer.txt (versione runtime degli agenti)
│           └── mock/            # samples.json (dati di esempio per la modalità mock)
│
├── .claude/
│   ├── agents/                  # Agenti AI — due famiglie (vedi sotto)
│   ├── design-system.md         # Design system normativo (WCAG 2.1 AAA)
│   └── skills/                  # Skill di supporto
│
├── materiale_test/              # Bollette fac-simile di prova e output di esempio
├── presentation/                # Presentazione HTML
└── README.md
```

## Le due famiglie di agenti

- **Agenti di runtime** — elaborano una bolletta: `bolletta-reader`, `bolletta-explainer`.
  Girano nel backend Spring Boot come system prompt sulla Messages API (vedi `backend/README.md`).
  I file in `backend/src/main/resources/prompts/` sono la loro versione runtime (adattata: niente tool,
  niente scrittura file, una bolletta per chiamata).
- **Agenti di sviluppo** — costruiscono il codice dell'app: `orchestrator` (entry point),
  `domain-analyst`, `angular-developer`, `ui-developer`, `accessibility-auditor`, `qa-engineer`.

## Stack

- **Frontend:** Angular 21 · PrimeNG 21 · TypeScript 5.9 · SCSS (design token) · Vitest 4 ·
  font Atkinson Hyperlegible · WCAG 2.1 Level AAA
- **Backend:** Spring Boot 3.4 · Java 17 · Maven · SDK Anthropic per Java (Messages API)

## Stato

- [x] Scaffold Angular 21 + design system + agenti
- [x] Agenti di estrazione/spiegazione bolletta (`bolletta-reader`, `bolletta-explainer`)
- [x] Backend Spring Boot con catena reader → explainer (SDK Anthropic per Java)
- [x] Modalità **mock** vs **reale** configurabile per profilo Spring
- [ ] Modello di dominio allineato all'output del reader (`app/src/app/domain/`)
- [ ] UI: upload bolletta + vista spiegazione + tabella campi con confidenza

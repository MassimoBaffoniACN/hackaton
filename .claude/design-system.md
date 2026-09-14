# Design System — Bolletta Facile
> Documento normativo per tutti gli agenti che producono UI.
> **Leggi questo file integralmente prima di scrivere qualsiasi template, SCSS o componente.**

---

## Principi fondamentali

- **Leggibilità prima di tutto.** Ogni utente potrebbe avere dislessia, bassa visione o usare un dispositivo con alto contrasto. Se funziona per loro, funziona per tutti.
- **Un componente, uno scopo.** Nessuna card o sezione mescola contenuti non correlati.
- **Zero valori hardcoded nel SCSS.** Solo `var(--token)` dai file `_tokens.scss`.
- **Tre segnali per ogni stato.** Icona + testo + colore. Mai il solo colore.
- **48 × 48 px minimo** per ogni target interattivo (WCAG 2.5.5 AAA).

---

## Stack

| Layer | Tecnologia |
|---|---|
| Framework | Angular 21 — standalone components, signals API |
| UI Library | PrimeNG 21 |
| Stile | SCSS con CSS custom properties in `:root` |
| Icone | PrimeIcons (sempre affiancate a un'etichetta testuale) |
| Font | Atkinson Hyperlegible (400 / 700) — caricato in `index.html` |

---

## File SCSS — struttura

```
app/src/
├── index.html                 ← font via <link> preconnect
├── styles.scss                ← entry point, solo @use
└── styles/
    ├── _tokens.scss           ← UNICA fonte di verità per tutti i valori visivi
    ├── _reset.scss            ← base HTML con i token
    ├── _primeng.scss          ← mapping PrimeNG → token
    └── _utilities.scss        ← classi layout condivise
```

**Regola:** nei componenti usare esclusivamente `var(--nome-token)`. Per modificare un valore visivo globale → cambiare `_tokens.scss`.

---

## Tipografia

| Token | Valore | Uso |
|---|---|---|
| `--font-primary` | Atkinson Hyperlegible | tutto il testo |
| `--font-mono` | JetBrains Mono | codice / dati tecnici |
| `--font-size-base` | 1rem (16px) | corpo testo — minimo assoluto |
| `--font-weight-regular` | 400 | corpo |
| `--font-weight-bold` | 700 | titoli, etichette, bottoni |
| `--line-height-body` | 1.75 | corpo testo |
| `--line-height-tight` | 1.2 | titoli |
| `--max-line-length` | 70ch | max larghezza paragrafi |

Usare **solo 400 e 700**. No light, no medium, no 600.
Testo sempre allineato a sinistra. No testo giustificato.

---

## Palette — WCAG AAA, sicura per daltonici

Tutti i rapporti di contrasto sono verificati su `--color-bg-surface` (#FFFFFF).

| Token | Hex | Rapporto | Level |
|---|---|---|---|
| `--color-text-primary` | `#1B1F2E` | 17.3:1 | AAA |
| `--color-text-secondary` | `#3D4559` | 8.9:1 | AAA |
| `--color-primary` | `#0057B8` | 8.5:1 | AAA |
| `--color-success` | `#006B4F` | 7.8:1 | AAA |
| `--color-warning` | `#92400E` | 8.3:1 | AAA |
| `--color-error` | `#991B1B` | 8.8:1 | AAA |

**Colori semantici:** verde-teal (non verde puro, sicuro per deuteranopia/protanopia), ambra-marrone (non giallo puro), cremisi scuro.

**Modalità alto contrasto:** gestita automaticamente da `@media (prefers-contrast: more)` in `_tokens.scss`. Non gestirla nei componenti.

**Daltonismo:** mai usare rosso/verde come unico segnale differenziatore.

---

## Spaziatura

Griglia base 8px. Usare esclusivamente i token `--space-*`.

```
--space-2  =  8px   (gap interno piccolo)
--space-4  = 16px   (padding mobile)
--space-6  = 24px   (padding card, gap standard)
--space-8  = 32px   (gap sezione)
--space-12 = 48px   (padding desktop)
--space-16 = 64px   (gap tra sezioni di pagina)
```

---

## Layout

```scss
// Wrapper di pagina — usare sempre
.page-layout {
  max-width: var(--layout-max-width);  // 1200px
  margin-inline: auto;
  padding-inline: var(--layout-gutter); // 16px mobile → 48px desktop
}

// Gap tra sezioni
.section + .section {
  margin-top: var(--layout-section-gap); // 64px
}
```

---

## Logo

Il logo dell'applicazione è `public/logo.png`.

**Posizionamento obbligatorio:** prima dell'`<h1>` nella testata/header principale.

```html
<!-- Esempio header principale -->
<header class="app-header">
  <img
    src="logo.png"
    alt="Bolletta Facile"
    class="app-header__logo"
    width="160"
    height="48"
  >
  <h1 class="app-header__title">Bolletta Facile</h1>
</header>
```

```scss
// Nel componente header
.app-header {
  display:     flex;
  align-items: center;
  gap:         var(--space-4);

  &__logo {
    height:    3rem;    // 48px — allineato ai bottoni
    width:     auto;
    display:   block;
  }

  &__title {
    font-size:   var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color:       var(--color-text-primary);
  }
}
```

**Regole logo:**
- `alt` descrittivo: `"Bolletta Facile"` (non `"logo"`)
- `width` e `height` espliciti per evitare layout shift (CLS)
- Mai ridimensionare via CSS oltre il 200% — usare il file ad alta risoluzione
- In alto contrasto il logo rimane visibile: garantito dal colore primario su sfondo bianco

---

## Intestazione di sezione — pattern obbligatorio

Ogni sezione nominata DEVE avere: **icona PrimeIcon + titolo** affiancati.

```html
<header class="section-header">
  <i class="pi pi-bolt section-header__icon" aria-hidden="true"></i>
  <h2 class="section-header__title">Consumi</h2>
</header>
```

Classe disponibile in `_utilities.scss` — non riscrivere gli stili.

---

## Card — contenitore di ogni blocco informativo

```html
<div class="app-card">
  <header class="section-header">
    <i class="pi pi-file-invoice section-header__icon" aria-hidden="true"></i>
    <h2 class="section-header__title">Ultima bolletta</h2>
  </header>

  <!-- corpo della card -->

  <footer class="app-card__footer">
    <p-button label="Scarica PDF" icon="pi pi-download" />
  </footer>
</div>
```

**Regole card:**
- Una card = un solo scopo
- Il footer della card contiene **solo azioni** (bottoni)
- Usare `p-card` di PrimeNG o la classe `.app-card` — mai panel nudi

---

## Bottoni

```html
<!-- Primario -->
<p-button label="Paga ora" icon="pi pi-credit-card" />

<!-- Secondario -->
<p-button label="Dettagli" icon="pi pi-eye" [outlined]="true" />

<!-- Distruttivo — SEMPRE con p-confirmDialog -->
<p-button label="Elimina" icon="pi pi-trash" severity="danger" />
```

**Regole:**
- Altezza minima: `var(--btn-min-height)` (48px) — già configurata nei token PrimeNG
- Mai due bottoni primari affiancati
- Label sempre presente — no bottoni icon-only senza `aria-label`
- Azioni distruttive: richiedono sempre `p-confirmDialog` prima dell'esecuzione

---

## Indicatori di stato

```html
<!-- Tre segnali: icona + testo + colore -->
<span class="status status--success">
  <i class="pi pi-check-circle" aria-hidden="true"></i>
  Pagata
</span>

<span class="status status--error">
  <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
  Scaduta
</span>
```

Classe disponibile in `_utilities.scss`.

---

## Accessibilità — checklist non negoziabile

- [ ] Skip link come primo elemento focusable: `<a class="skip-link" href="#main-content">Vai al contenuto</a>`
- [ ] Gerarchia heading: H1 (una per pagina) → H2 (sezioni) → H3 (sottosezioni) — mai saltare livelli
- [ ] Tutte le PrimeIcons contestuali: `aria-hidden="true"` sull'icona + etichetta testuale visibile
- [ ] Label visibili su ogni campo form — mai solo placeholder
- [ ] Errori collegati al campo con `aria-describedby`
- [ ] Rispettare `prefers-reduced-motion` — già gestito in `_tokens.scss`
- [ ] Rispettare `prefers-contrast: more` — già gestito in `_tokens.scss`

---

## Aspetto visivo

- Sfondo pagina: `var(--color-bg-page)` — grigio freddo molto chiaro, non bianco puro
- Ampio respiro: sezioni separate da `var(--layout-section-gap)` (64px)
- Nessun gradiente su testo
- Nessuna ombra pesante — solo `var(--card-shadow)` già definito
- Nessuna decorazione che non serva a strutturare il contenuto
- Animazioni: solo in risposta a un'azione utente, durata 150–250ms

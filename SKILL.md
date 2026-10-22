---
name: create-website
description: Use when the user sends a Google Maps link (maps.app.goo.gl / google.com/maps/place) of a shop, restaurant or local business and wants a website, a demo site, or a proposal to sell them one. Trigger - /create-website <link>, "fammi il sito per questo locale", "crea un sito da questo link".
user-invocable: true
argument-hint: "<link Google Maps> [--admin]"
---

# create-website — dal link Maps al sito pronto da vendere

Da un solo link di Google Maps: raccogli tutto il materiale vero che esiste online, decidi lo stile
guardando davvero il posto, costruisci un sito single-file e prepara le note per la trattativa.

**Uscita:** `C:\Users\ricca\OneDrive\Desktop\CODE\SITI WEB\<Nome> - <Comune>\`
- `index.html` — un solo file, CSS e JS inline, si apre con doppio clic
- `img/` — foto reali scaricate e verificate
- `privacy.html`, `termini.html`, `404.html` — le pagine che il §6 pretende
- `robots.txt`, `sitemap.xml`, `og-cover.jpg`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`
- `netlify.toml` e `_headers` — HTTPS forzato, header di sicurezza, cache
- `NOTE-CLIENTE.md` — cosa chiedere al titolare prima di pubblicare

Un sito **non e' pronto** finche' non ha tutto questo: la checklist del §6 non e' una rifinitura
di fine lavoro, e' parte della consegna.

Con `--admin`, o se l'utente lo chiede, produci **anche** `<Nome>-admin.html` (vedi ultima sezione).

Skill sorelle: `sitedrop-genera` parte da un brief della dashboard, questa parte da un link.
`sitedrop-verifica` serve se il lead viene da una lista e non hai ancora controllato che sia scoperto.
`awesome-design-md` è la libreria di DESIGN.md di siti veri (riferimento di vocabolario, §4).
`img2threejs` è **opzionale e separata**: trasforma una foto di un oggetto in un modello 3D Three.js.
Si usa solo se l'utente lo chiede (vedi §3 e §4b).

---

## La regola d'oro

**Guarda le foto del locale PRIMA di decidere la palette.**

Recensioni, fascia di prezzo e tipo di cucina portano a una direzione estetica plausibile e sbagliata.
Un ristorante di pesce 4,9★ da 30–60€ "suona" scuro ed elegante; poi apri le foto e il pavimento è in
resina turchese, le pareti sono bianche e c'è una monstera in mezzo alla sala.

Ordine obbligatorio: **dati → foto → palette → codice.** Mai invertire.

E per la parte di design vale la seconda regola non negoziabile: la **pipeline a 5 skill** del
§4 (impeccable → frontend-design → taste-skill → ui-ux-pro-max → emil-design-eng) si percorre
tutta, in ordine, prima di scrivere HTML.

---

## 1. Dati dal link Maps

Il link corto reindirizza: `WebFetch` restituisce l'URL lungo, richiamalo su quello. **`WebFetch` serve
solo a sbrogliare il redirect** — Maps è un'app JS, `WebFetch` sull'URL lungo non rende nulla di utile
(rimbalza sul consenso cookie di Google). I dati veri si raccolgono solo aprendo la scheda nel Browser
pane e leggendo il DOM.

Il muro dei cookie di Google blocca tutto. Rifiuta (opzione più rispettosa della privacy, ed è
l'unica che il boundary consente senza chiedere):

```js
[...document.querySelectorAll('button,div[role=button]')]
  .find(e => /rifiuta tutto/i.test(e.innerText||''))?.click()
```

Poi `get_page_text` dà nome, indirizzo, telefono, rating, numero recensioni, fascia di prezzo,
servizi e — informazione commerciale chiave — se compare **"Aggiungi sito web"**, cioè il lead è
scoperto. Se invece un sito c'è già, fermati e dillo: non si propone un sito a chi ce l'ha.

**Controlla anche che il locale sia aperto.** "Chiuso temporaneamente" o "Chiuso permanentemente"
sopra il nome sono altrettanto motivo per fermarsi: non si costruisce un sito per un'attività che non
lavora più. È un secondo gate, distinto da "ha già un sito".

**Orari** (non sono nel testo, stanno negli aria-label):

```js
[...document.querySelectorAll('[aria-label]')]
  .map(e => e.getAttribute('aria-label'))
  .filter(l => /^(lun|mar|mer|gio|ven|sab|dom)/i.test(l))
```

**Attributi** (asporto, terrazza, cani ammessi, parcheggio, accessibilità): tab "Informazioni".
**Piatti** con nome esatto: tab Menu. Molti locali hanno solo 3 piatti "In evidenza nel menu" (estratti
dalle recensioni, non espandibili) e nessuna vera lista — è il caso normale, non un errore tuo. Solo
se esiste una lista completa compare un "Mostra di più": cliccalo e poi rileggi gli aria-label.

**Incrocia sempre con altre fonti**, perché Maps da solo non basta e a volte si contraddice:
- `reteimprese.it`, `paginegialle.it` → indirizzo, P.IVA
- pagina Facebook → tab "Informazioni" (email!), e soprattutto i **post**: lì c'è il copy autentico
  del titolare, che vale dieci volte quello che scriveresti tu per la sezione "Chi siamo"
- Instagram → bio (payoff, spesso già un link `wa.me`), griglia foto

Se due fonti danno indirizzi diversi, usa il più recente (Maps se aggiornato dal proprietario) e
**mettilo fra le cose da confermare** nelle note.

---

## 2. Foto — scaricale e guardale una per una

Le foto del proprietario su Maps sono la fonte migliore: niente watermark, alta risoluzione gratis.

Raccogli gli URL dal DOM della scheda e alzali a piena risoluzione sostituendo il suffisso con
`=w1600-h1600-k-no`:

```js
[...new Set([...document.querySelectorAll('img')]
  .map(i => (i.src.match(/^https:\/\/lh3\.googleusercontent\.com\/(gps-cs-s|p)\/[\w-]+/)||[])[0])
  .filter(Boolean))]
```

Scaricale con `Invoke-WebRequest` in `img/`, poi **apri ogni singola foto con Read**.

Non è una formalità. In una sessione reale 3 foto su 12 erano di **altri ristoranti**: arrivavano
dalle schede "Ricerche correlate" in fondo alla pagina Maps. Sarebbero finite in galleria.

Vaglio: scarta foto di altri locali, locandine ed eventi, foto con testo o logo sovrapposto,
scatti sfocati. Rinomina quelle buone con nomi parlanti (`sala-interna.jpg`, `terrazza-sera.jpg`).

**Cerca la foto del menù.** Spesso qualcuno fotografa la carta e la carica su Maps: sono nomi dei
piatti, ingredienti e **prezzi veri**, il contenuto più prezioso di tutta la raccolta. Tienila in
`img/_menu-reference.jpg` (prefisso `_` = non va nel sito, serve solo a te).

Se le foto mancano o sono poche, dillo subito: senza foto vere il sito non regge e vanno chieste al
titolare.

---

## 3. Chiedi prima di committare

Usa `AskUserQuestion`, con la raccomandazione come prima opzione. `AskUserQuestion` e `SendUserFile`
esistono solo nella conversazione principale, non nei subagent dispatchati — questa skill va eseguita
lì, o comunque un dispatch che arriva a questo punto deve tornare al chiamante invece di bloccarsi
cercando un tool che non ha. Le domande che contano:

- **Menù** — solo i piatti trovati (marcati "da confermare"), ricostruiti da IG/FB, o carta reale da
  chiedere al titolare? Se hai trovato la foto del menù, chiedi se usare i prezzi veri.
- **Foto piatti** — dentro il menù (rischio abbinamento sbagliato) o galleria separata (zero rischio)?
- **Stile** — proponi la direzione che *le foto* suggeriscono, non quella che suggerisce la categoria.
- **Oggetti 3D (opzionale)** — "Vuoi trasformare in 3D qualche foto di un oggetto del locale (un piatto
  iconico, un prodotto, un'insegna, un oggetto d'arredo)? Se sì, dimmi quali." Se non risponde o dice no,
  non si fa nulla. Non proporre mai 3D di tua iniziativa.

**Se le foto smentiscono una direzione già approvata, fermati e richiedi.** Manda le foto con
`SendUserFile` come prova e spiega in una riga perché cambi idea. Costa un turno, evita di
consegnare un sito che racconta un locale diverso da quello che il cliente troverà.

---

## 4. Costruzione

### Pipeline design obbligatoria — 5 skill, in quest'ordine

Non è una lista di suggerimenti: **ogni sito passa da tutte e cinque**, nell'ordine scritto.
Invocale con il tool `Skill`, una alla volta, e annuncia ciascuna prima di usarla. Nessuna
riga di HTML prima che le prime quattro siano state lette — la quinta si applica sul markup già
esistente.

| # | Skill | Nome esatto per `Skill` | Cosa porta |
|---|-------|-------------------------|------------|
| 1 | impeccable | `impeccable` | processo e craft: gerarchia, densità, stati, anti-AI-slop. Detta **come** si lavora |
| 2 | frontend-design | `frontend-design` | direzione visiva forte: tipografia, scelte non templated |
| 3 | taste-skill | `taste-skill` | visual taste layer: pre-flight, scarta ciò che sa di template |
| 4 | ui-ux-pro-max | `ui-ux-pro-max:ui-ux-pro-max` | base di conoscenza: palette, font pairing, pattern per tipo di prodotto, linee guida UX |
| 5 | emil-design-eng | `emil-design-eng` | motion e interaction layer: animazioni, micro-interazioni, timing |

**Perché quest'ordine.** 1 fissa il processo, 2–3 la direzione estetica, 4 la valida contro una base
di conoscenza (palette e font pairing si scelgono **qui**, con i colori reali del locale come vincolo,
non a intuito), 5 anima un layout già giusto. Invertire — animare prima di aver deciso la gerarchia,
o scegliere i font da ui-ux-pro-max prima di aver visto le foto — produce esattamente lo slop che
queste skill esistono per evitare.

`awd-*` e `hallmark` restano opzionali, in aggiunta, se serve una corsia stilistica precisa.

**Riferimento opzionale, non è un sesto passo:** la libreria `C:\Users\ricca\.claude\skills\awesome-design-md\design-md\<brand>\DESIGN.md`
(84 brand, da VoltAgent/awesome-design-md; la skill sorella `awesome-design-md` spiega come usarla) è il
riferimento principale. Una copia più vecchia (74 brand) è in `create-website\references\awesome-design-md\`.
Si apre quando l'atmosfera del locale ha un analogo noto e serve il *vocabolario* — scala tipografica,
spaziature, pattern di componenti — mai la palette. Sono marchi tech, auto e fintech, nessun ristorante o
negozio: la palette resta quella del locale (regola d'oro) e l'aspetto di un brand non si copia.

### 4b. Oggetti 3D — solo su richiesta (opzionale)

Attiva **solo** se al §3 l'utente ha scelto immagini da trasformare. Skill: `img2threejs`
(`C:\Users\ricca\.claude\skills\img2threejs`, tag v2.0.0, Apache-2.0). Produce un modulo Three.js
procedurale costruito in codice, non una mesh scaricata. Regole:

- Il modello è un **asset separato** dentro `img/` (o `3d/`), con un file `.js` autonomo. Non si
  incolla nell'`index.html` e non entra nel critical path di caricamento: va in un `<canvas>` caricato
  su richiesta o in lazy, come la mappa del §6.
- Ogni foto scelta passa dalla pipeline del repo; il gate visivo (screenshot leggibili) è obbligatorio
  per il modello, non solo per il sito.
- Il modello non deve mai risultare parte della "Struttura standard" del sito: è un'aggiunta
  esplicita concordata con l'utente.
- Richiede Python 3.10+ (verificato: 3.12 disponibile). Se Python non parte, dillo e non ripiegare su
  un modello inventato.

**Riferimento Apple (vendorizzato, `references\apple-design\`):** le linee guida Human Interface di
Apple, 124 pagine da developer.apple.com (`hig\<pagina>.md`), più `hig-lookup.md` (indice per tema),
`cross-platform.md` e `GUIDE.md` (la skill originale dickwu/apple-design-skill; il repo non ha un file LICENSE). Si usa per le scelte di **motion** (`motion.md`, `gestures.md`), **materiali
e vetro** (`materials.md`, `liquid-glass.md`), **tipografia** (`typography.md`), **colore e dark mode**
(`color.md`, `dark-mode.md`), **accessibilità** (`accessibility.md`) e **layout** (`layout.md`). Si
leggono le pagine che servono, non tutta la cartella. Stessa regola della palette: si prendono i
principi e il vocabolario di Apple, mai la sua grafica o i suoi asset copiati.

**Regola del punto 5:** le animazioni non devono mai essere l'unica cosa che rende il contenuto
visibile — vale il gotcha sui reveal più sotto. Rispetta `prefers-reduced-motion`. Motion su
trasformazioni e opacità, non su proprietà che ricalcolano il layout.

Checklist: prima di dire che il sito è pronto, devi poter dire **quale decisione concreta** è venuta
da ognuna delle cinque. Se per una skill non sai rispondere, non l'hai usata.

### Palette
Parte dai **colori reali**: logo del locale, pareti, pavimento, insegna. Se il marchio ha già un
colore (il logo, la vernice della facciata), quello vince su qualsiasi seed generato.
OKLCH. Contrasti verificati, non "grigio chiaro per eleganza".

Da evitare perché sono i riflessi automatici: fondo crema/sand/beige, palette indovinabile dalla
categoria (pesce → blu e oro), display serif di lusso su fondo scuro per ogni ristorante sopra i 30€.

### Struttura standard
nav sticky · hero (foto vera + payoff loro) · striscia claim · chi siamo (copy autentico dai loro
post) · **menù** · galleria a muratura con lightbox · prenotazione · footer con orari, contatti e mappa.

### Cose che funzionano e vale la pena rifare
- **Prenotazione via WhatsApp**: form → `wa.me/<num>?text=<messaggio precompilato>`. Nessun backend.
- **Il select degli orari conosce gli orari del locale**: se scegli lunedì e sono chiusi lo dice;
  se scegli oggi spariscono le fasce già passate; ultimo tavolo un'ora prima della chiusura.
- **Dock fisso in basso su mobile** con "Prenota" e "Chiama" (+ `padding-bottom` sul body).
- **Mappa senza API key**: `https://maps.google.com/maps?q=<lat>,<lng>&z=16&output=embed` in un
  `<iframe>` con `pointer-events:none`, avvolto in un `<a>` verso il link Maps. **L'indirizzo va
  in `data-src`, non in `src`**, e si carica solo su richiesta o dopo il consenso: vedi §6, e' il
  primo dei due errori che quella checklist esiste per intercettare.
- **JSON-LD `Restaurant`** con orari, indirizzo, telefono.

### Gotcha che costano tempo
- **`minmax(0,1fr)`, mai `1fr`** nelle griglie: il minimo automatico è `min-content` e la traccia si
  gonfia oltre il viewport (hero a 426px su schermo da 375).
- **Reveal animati**: il contenuto deve essere visibile di default. Aggiungi una classe tipo
  `js-anim` sul root da JS e solo lì nascondi. Più una rete di sicurezza a timeout che rimette
  tutto visibile. Altrimenti con JS lento o pagina in background il sito arriva bianco.
- **`hidden` non vince** su una regola di classe con `display:` — serve `[hidden]{display:none!important}`.
- **HTML in UTF-8 senza BOM.**
- Galleria: colonne CSS (`columns: 3`) rispettano il formato naturale delle foto e riempiono sempre;
  una griglia con celle `span 2` lascia buchi nell'ultima riga.

---

## 5. Verifica — screenshot veri + misure

Il Browser pane spesso è nascosto e `computer{action:"screenshot"}` fallisce con "the Browser pane is
not displayed". Per questo la via principale è **`playwright-cli`**: apre un Chrome suo, headless, e
fa screenshot veri anche col pane chiuso (e lì rAF e transizioni girano davvero). Il sito si **guarda**
(Read sui PNG) **e** si **misura** (DOM, Lighthouse): le due cose non si sostituiscono.

### Guardare — playwright-cli

Skill `playwright-cli`, installata in `~/.claude/skills/`. Tre regole che costano tempo se le scopri dopo:

- **cwd nello scratchpad, mai nella cartella del sito.** La CLI scrive `.playwright-cli/` (gli
  snapshot) nella cwd: dentro `SITI WEB\<Nome>\` finirebbe su Netlify. Anche i PNG vanno nello scratchpad.
- **`file://` è bloccato di default** ("Access to file: protocol is blocked"). Servono
  `PLAYWRIGHT_MCP_ALLOW_UNRESTRICTED_FILE_ACCESS=1` e `PLAYWRIGHT_MCP_BROWSER=chrome` (usa il Chrome
  già installato, nessun browser da scaricare). `file://` è proprio quello che serve per l'admin (§8):
  su localhost `crypto.subtle` esiste e nasconderebbe il bug del doppio clic.
- **Scorri la pagina prima dello screenshot, e con `behavior:'instant'`.** I reveal (§4) partono allo
  scroll: in una full-page senza scroll le sezioni restano invisibili e sembra un bug del sito. Ma
  i nostri siti hanno `scroll-behavior:smooth`, quindi ogni `scrollTo(0,y)` parte animato e il
  successivo lo annulla: `scrollY` resta 0 e lo screenshot esce identico al precedente (successo
  il 2026-10-02 su L'Hostaria). Sempre `scrollTo({top:y, behavior:'instant'})`.

```bash
export PLAYWRIGHT_MCP_ALLOW_UNRESTRICTED_FILE_ACCESS=1 PLAYWRIGHT_MCP_BROWSER=chrome
cd <scratchpad>
playwright-cli open "file:///C:/Users/ricca/OneDrive/Desktop/CODE/SITI%20WEB/<Nome>%20-%20<Comune>/index.html"
for w in 375 768 1280 1440; do
  playwright-cli resize $w 900
  playwright-cli eval "async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=400){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,100))}scrollTo({top:0,behavior:'instant'});await new Promise(r=>setTimeout(r,400));return {vw:innerWidth,scrollW:document.documentElement.scrollWidth}}"
  playwright-cli screenshot --filename=<scratchpad>/s$w.png                  # viewport: l'hero
  playwright-cli screenshot --full-page --filename=<scratchpad>/f$w.png      # tutta la pagina
done
playwright-cli set-reduced-motion reduce && playwright-cli reload   # deve restare completo e leggibile
playwright-cli console error                                        # zero errori
playwright-cli close-all
```

Poi **Read di ogni PNG**. Cosa cercare:
- il sito racconta il posto vero? Confrontalo con le foto in `img/`: la regola d'oro vale anche a fine lavoro
- a 375px hero e dock mobile non coprono il testo; nessuna sezione vuota (reveal rotti)
- un solo punto focale per sezione, testo sopra foto leggibile

La full-page serve per il ritmo e i buchi, ma viene ridotta e non si legge: per i dettagli scorri a una
sezione (`eval "scrollTo({top: document.querySelector('#menu').offsetTop - 70, behavior:'instant'})"`)
e fai lo screenshot del viewport.

### Misurare — il DOM

Incolla nel browser (`playwright-cli eval` — vuole una funzione, quindi avvolgi in `() => { … }` —
oppure `preview_start` su `file:///.../<Nome>.html` + `javascript_tool` se la CLI manca) e controlla:

```js
// overflow orizzontale (il bug più frequente)
({vw: innerWidth, scrollW: document.documentElement.scrollWidth})

// immagini davvero caricate
[...document.images].filter(i => !(i.complete && i.naturalWidth > 0)).map(i => i.src)

// contrasto reale di una coppia di colori
const cv = document.createElement('canvas').getContext('2d');
const L = c => { cv.fillStyle = c; cv.fillRect(0,0,1,1);
  const [r,g,b] = cv.getImageData(0,0,1,1).data;
  return [r,g,b].map(v => (v/=255) <= .03928 ? v/12.92 : ((v+.055)/1.055)**2.4)
    .reduce((s,v,i) => s + v*[.2126,.7152,.0722][i], 0) };
const CR = (a,b) => { const x=L(a), y=L(b), hi=Math.max(x,y), lo=Math.min(x,y);
  return +((hi+.05)/(lo+.05)).toFixed(2) };
```

### Lighthouse — i punteggi che il cliente può rifare da solo

Lighthouse non accetta `file://`: si serve la cartella su `127.0.0.1` (lo script comprime in gzip
come Netlify, così la Performance non esce peggiore del reale) e si misura lì.

```bash
node ~/.claude/skills/create-website/scripts/serve.mjs "<cartella del sito>" 8123 & SERVER=$!
npx --yes lighthouse http://127.0.0.1:8123/ --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new" --output=json --output-path=<scratchpad>/lh.json --quiet
node -e 'const j=require(process.argv[1]);console.log(Object.values(j.categories).map(c=>c.title+": "+Math.round(c.score*100)).join(" | "))' <scratchpad>/lh.json
kill $SERVER   # ferma il server (tutto nella stessa chiamata Bash: $SERVER non sopravvive a un'altra)
```

Il default è mobile, rete 4G lenta e CPU rallentata 4×: è severo di proposito. Riporta il numero, non
rincorrere il 100 a ogni costo. Cosa fare di ciò che trovi:
- **Accessibilità, Best Practices, SEO sotto 100**: ogni audit fallito ha un `id` in `audits`. Correggilo o scrivi perché no
- **Performance sotto 90**: guarda `audits["largest-contentful-paint"]` e cos'è quell'elemento, di solito la foto dell'hero. Poi vedi la memoria sulle immagini inline prima di decidere
- Taratura, L'Hostaria (2026-10-02): Performance 63, Accessibilità 100, Best Practices 96, SEO 100, con FCP = LCP = SI = 6 s
  (tutto aspetta lo stesso collo di bottiglia; TBT 0 e CLS ~0, quindi il JS non c'entra). Due cause, misurate
  togliendole una alla volta: **Google Fonts** (CSS bloccante di terza parte: da solo 5,8 → 3,4 s) e **10 foto in
  base64 dentro l'HTML**, 692 KB (`loading="lazy"` non risparmia byte su un data URI: 5,8 → 4,2 s). Tolte
  entrambe: 100. Quindi font ospitati in locale e, sotto la piega, niente data URI. **Mai AVIF "nudo" dentro l'HTML**:
  ~5% dei browser (iOS 15 o precedente, macOS 12 o precedente, Chrome < 85, Firefox < 93) vede riquadri vuoti. Se le foto
  restano dentro, AVIF in `<picture><source type="image/avif" srcset="data:…"><img src="media/x.jpg">` con il JPEG di
  riserva fuori (Performance 94, il JPEG lo scarica solo chi non legge l'AVIF); a pari qualità il WebP dentro dà 89 e
  copre solo l'1,4% in più, il JPEG dentro 82, le foto fuori in `<picture>` 98
  Attenzione: quei 99-100 erano **senza font**, con i font di sistema. Con i tre font veri (149 KB, sottoinsieme latino)
  il sito tutto-in-un-file sta a 93-94 e con i font in cartella a 95: i font valgono circa 5 punti, non rincorrerli
- Lo stesso sito a 4G tipica (9 Mbps) era già a 99: il 63 è il profilo lento che usa anche PageSpeed Insights,
  ed è quello che vede il cliente. Per misurare con quella rete: `--throttling.throughputKbps=9000 --throttling.rttMs=100 --throttling.cpuSlowdownMultiplier=2`

I numeri in locale sono indicativi: dopo la pubblicazione si rimisurano sull'URL vero (`npx lighthouse https://…`), con CDN e compressione reali.

### Checklist prima di dire che è finito

- zero errori in console (`playwright-cli console error`, o `read_console_messages`)
- larghezze 375 / 768 / 1280 / 1440 (`resize`, o `resize_window`) → mai `scrollW > vw`
- tutte le immagini caricate
- corpo del testo ≥ 4,5:1, placeholder dei form compresi
- form: compila e **decodifica l'URL `wa.me` generato**, controlla che ci siano tutti i campi
- lightbox e nav da tastiera: apri, frecce, ESC, il focus torna dov'era (`playwright-cli press ArrowRight`, `press Escape`)
- link uno per uno: `tel:`, `wa.me`, Maps, social
- i quattro punteggi Lighthouse annotati, per le note al cliente (§7)
- ogni PNG letto con Read e confrontato con le foto vere del locale

**Cosa dichiarare all'utente.** Con `playwright-cli`: dì cosa hai visto (quali larghezze, quali PNG) e
cosa no: un telefono vero, le animazioni a occhio, la stampa. Senza (solo misure DOM): **dì che non hai
potuto guardare il sito**, hai misurato il DOM, non visto la pagina, e chiedigli di aprirla e dirti
cosa non torna visivamente.

Questa è la verifica che il sito **funziona**. Quella che il sito è **pubblicabile** è il §6, e
le due non si sostituiscono: un sito può passare tutta questa lista e non avere né privacy, né
404, né consenso che blocchi qualcosa.

---

## 6. Checklist pre-lancio — 20 punti

**Nessun sito si consegna senza questi venti.** Non sono un extra di fine lavoro: quasi tutti
vanno decisi mentre costruisci, e rimetterli dopo costa il triplo. Ogni riga dice *come*, non
solo *cosa*, perché è nel come che si sbaglia.

| # | Cosa | Come, in concreto |
|---|------|-------------------|
| 1 | Privacy policy | `privacy.html`. Deve elencare **i terzi che il sito carica davvero** (font, mappa, statistiche, WhatsApp) con fornitore, scopo e durata. Se aggiungi un embed dopo, torna qui. |
| 2 | Termini | `termini.html`. Per un locale bastano: uso del sito, che le richieste non sono prenotazioni confermate, proprietà delle foto, link esterni. |
| 3 | Segreti fuori dal frontend | Nessuna API key nel sorgente (la mappa `output=embed` non ne vuole). La password dell'admin **mai in chiaro e mai un hash singolo**: vedi §8. |
| 4 | HTTPS forzato | `netlify.toml` con `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`, più `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">`. Aggiungi anche `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`. |
| 5 | Banner cookie | **Il banner deve davvero bloccare qualcosa**, se no è teatro: vedi il gotcha della mappa qui sotto. Tre stati in `localStorage`: non risposto, `yes`, `no`. |
| 6 | Title + description | Su **ogni** pagina, comprese quelle legali e la 404. Più `canonical` su tutte e `robots: noindex,follow` sulla sola 404. |
| 7 | Anteprima social | `og-cover.jpg` 1200×630, più `og:title/description/url/image`, **`og:image:alt`** e `twitter:card=summary_large_image`. |
| 8 | Favicon | SVG come data URI nel `<head>` (zero richieste) **più i file veri `/favicon.svg` e `/favicon.ico`**: crawler, lettori di feed e anteprime dei link chiedono `/favicon.ico` a prescindere, e senza il file prendono un 404. Un marchio a filo sottile sparisce sotto i 32px: ispessiscilo con `stroke-width` e provalo a 16/32/64/180. |
| 9 | Sitemap + robots | `sitemap.xml` con le sole pagine indicizzabili (la 404 no), `robots.txt` che la dichiara. `lastmod` si sposta **a mano** quando cambia il contenuto, non a ogni build. |
| 10 | Alt sulle immagini | Tre casi, non uno: decorativa → `alt=""`; **dentro un `<button aria-label>` → `alt=""`** (se no lo screen reader la annuncia due volte); tutto il resto → descrizione vera. Se il pannello admin può cambiare la foto, **l'alt deve seguirla nel render**, o quello scritto nel markup mente. |
| 11 | Immagini compresse | AVIF + WebP dentro un `<picture>`. Le misure si prendono dal riquadro reale in cui la foto si vede (la lightbox, la colonna), non a occhio. |
| 12 | Velocità | Misurala: `performance.getEntriesByType('navigation')` e `('resource')`. Zero risorse di terzi che bloccano il render. Le foto sotto la piega `loading="lazy" decoding="async"`, quella sopra `fetchpriority="high"` e **mai** lazy. |
| 13 | Contrasto | Passata automatica su tutta la pagina, non a campione (script sotto). Il testo sopra una foto si misura componendo i livelli in Node, non nel browser. |
| 14 | Mobile | A 375px `scrollWidth === clientWidth`. Bersagli **isolati** ≥44px sotto `@media (pointer:coarse)`; un link dentro una frase è esente (WCAG 2.5.8), non gonfiarlo. |
| 15 | 404 personalizzata | `404.html` + redirect `/*` → `/404.html` status 404 + `noindex`. |
| 16 | Link rotti | `fetch` di ogni href interno e di ogni `src`/`srcset`, assert 200. Gli `img[loading=lazy]` vanno forzati a `eager` prima, o risultano "rotti" senza esserlo. |
| 17 | Validazione form | Per campo: `data-invalid`, `aria-invalid`, messaggio visibile, focus sul primo sbagliato, più una riga di stato che dice quanti campi mancano. `novalidate` sul form e regole tue, così i messaggi sono in italiano e nel tuo stile. |
| 18 | Anti-spam | Honeypot (`<input name="website">` fuori schermo) **più** trappola temporale (invio sotto i ~2,5s dal caricamento). Entrambi devono dare lo **stesso** messaggio generico: dire quale dei due è scattato è un regalo allo spammer. |
| 19 | Statistiche | Caricate **solo** dopo un sì esplicito. Finché il cliente non dà l'ID vero, lascia il segnaposto `G-XXXXXXXXXX` e un `if` che non carica niente: meglio zero che un ID finto che "quasi funziona". Mettilo fra le cose da chiedere. |
| 20 | Una CTA sola | La stessa azione con le **stesse parole** ovunque (hero, dock mobile, sezione, footer). Se il sito dice "Prenota", "Scrivici" e "Contattaci", sono tre CTA, non una. |

**Misure oggettive.** I punti 12, 13 e 14 si confermano anche con Lighthouse (§5): gli script qui
sotto trovano il nodo colpevole, Lighthouse dà il punteggio che il cliente può verificare da solo.

### I due errori che questa checklist esiste per intercettare

**La mappa di Google parte da sola e il banner dei cookie non serve a niente.**
Un `<iframe src="https://maps.google.com/maps?q=…">` contatta Google al caricamento della pagina,
cioè manda l'IP del visitatore a un terzo **prima** che qualcuno abbia detto sì. Il banner accanto
diventa decorativo. L'indirizzo va in `data-src` e si carica su richiesta:

```html
<button class="mappa-carica" type="button" id="mappaCarica">
  <span>Mostra la mappa</span><small>Si collega a Google Maps</small>
</button>
<iframe data-src="https://maps.google.com/maps?q=<lat>,<lng>&z=16&output=embed"
        title="Mappa: <nome>, <indirizzo>" loading="lazy"></iframe>
```
```js
function caricaMappa() {
  var f = document.querySelector(".mappa-tela iframe");
  if (!f || f.getAttribute("src")) return;
  f.setAttribute("src", f.getAttribute("data-src"));
  var b = document.getElementById("mappaCarica"); if (b) { b.hidden = true; }
}
```

Chiamala dal tasto **e** da chi accetta i cookie. **Ordine di boot: `initMappa()` prima di
`initCookie()`**, se no chi ha già accettato fa partire l'iframe prima che l'ascoltatore del
`load` sia attaccato, e la mappa resta a `opacity:0` per sempre.
Poi aggiorna la riga della privacy: «non si carica da sola, finché non premete Mostra la mappa».

**Lo stesso vale per i Google Fonts**, che però servono a disegnare il testo e non si possono
mettere dietro un consenso: l'unica soluzione pulita è **ospitarli dentro al sito**. Se li lasci
su Google, scrivilo nella privacy e dillo al cliente come scelta, non lasciarlo implicito.

### La passata di controllo, da incollare nel Browser pane

```js
// contrasto di OGNI nodo di testo contro il suo fondo composito
(() => {
  const par = c => { const m=c.match(/[\d.]+/g).map(Number); return {r:m[0],g:m[1],b:m[2],a:m.length>3?m[3]:1}; };
  const lum = ({r,g,b}) => { const f=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4;};
    return .2126*f(r)+.7152*f(g)+.0722*f(b); };
  const cr = (a,b) => { const x=lum(a),y=lum(b),[h,l]=x>y?[x,y]:[y,x]; return (h+.05)/(l+.05); };
  const su = (fg,bg) => ({r:Math.round(bg.r+fg.a*(fg.r-bg.r)),g:Math.round(bg.g+fg.a*(fg.g-bg.g)),
    b:Math.round(bg.b+fg.a*(fg.b-bg.b)),a:1});
  const fondo = el => { let n=el, acc=null;
    while (n && n!==document.documentElement) { const cs=getComputedStyle(n);
      if (cs.backgroundImage !== 'none') return null;        // foto o gradiente: si misura in Node
      const c=par(cs.backgroundColor);
      if (c.a>0) { acc = acc ? su(acc,c) : c; if (c.a===1) return acc; }
      n=n.parentElement; }
    return acc || {r:255,g:255,b:255,a:1}; };
  const out=[];
  document.querySelectorAll('body *').forEach(el => {
    if (!el.offsetParent && getComputedStyle(el).position!=='fixed') return;
    if (![...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim().length>1)) return;
    const f=fondo(el); if (!f) return;
    const cs=getComputedStyle(el), fg=par(cs.color);
    const rap=cr(fg.a<1?su(fg,f):fg, f);
    const px=parseFloat(cs.fontSize);
    const grande = px>=24 || (px>=18.66 && parseInt(cs.fontWeight,10)>=700);
    if (rap < (grande?3:4.5)) out.push({el:el.tagName+'.'+el.className, t:el.textContent.trim().slice(0,40), rap:+rap.toFixed(2)});
  });
  return out;   // deve tornare []
})()
```

```js
// link, immagini, alt e terzi caricati senza consenso
(async () => {
  document.querySelectorAll('img[loading=lazy]').forEach(i=>{i.loading='eager';const s=i.src;i.src='';i.src=s;});
  const url = [...new Set([
    ...[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),
    ...[...document.querySelectorAll('img[src],source[srcset]')].map(e=>e.getAttribute('src')||e.getAttribute('srcset'))
  ])].filter(u => u && !/^(#|tel:|mailto:|https?:|data:)/.test(u));
  const rotti=[]; for (const u of url) { const r=await fetch(u); if(!r.ok) rotti.push(u+' -> '+r.status); }
  return {
    rotti,
    ancore: [...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href'))
      .filter(h=>h!=='#' && !document.querySelector(h)),
    senzaAlt: [...document.images]
      .filter(i=>!i.alt.trim() && !i.closest('button[aria-label]') && !i.src.startsWith('data:'))
      .map(i=>i.src),
    esterniSenzaRel: [...document.querySelectorAll('a[target=_blank]')]
      .filter(a=>!(a.rel||'').includes('noopener')).map(a=>a.href),
    terziPrimaDelConsenso: performance.getEntriesByType('resource').map(r=>r.name)
      .filter(n => !n.startsWith(location.origin))
  };
})()
```

L'ultima riga è la più importante: **`terziPrimaDelConsenso` deve contenere solo quello che hai
deciso consapevolmente di lasciare** (di solito i font). Qualunque altra cosa è un consenso saltato.

---

## 7. Consegna

`NOTE-CLIENTE.md` con: dati verificati del locale, **cosa chiedere al titolare** in ordine di
importanza (menù reale, conferme sui dati contraddittori, foto in alta risoluzione, testo "Chi siamo",
P.IVA per il footer), due righe di argomenti di vendita, e la checklist di cosa manca per pubblicare.
Fra gli argomenti di vendita metti i **quattro punteggi Lighthouse mobile** (§5) con la data e con la
dicitura «misurati in locale, da rimisurare sull'indirizzo vero dopo la pubblicazione»: sono numeri
che il cliente può rifare da solo, ma non vanno venduti come garanzia prima della misura online.

Nel riassunto finale separa sempre **cosa è reale** da **cosa è da confermare**, e dichiara i limiti
(foto verticali che si tagliano, immagini da convertire in WebP, dati non verificati).

**Dichiara anche l'esito dei venti punti del §6**, uno per uno, e quali restano aperti perché
dipendono dal cliente e non da te — di norma l'ID delle statistiche e il dominio. Un punto
aperto per colpa del cliente va scritto come tale nelle note, non lasciato scoprire dopo.

### Non inventare mai
Prezzi, recensioni, anni di attività, premi, P.IVA, nomi dei titolari, storie personali.
Quello che non trovi resta un buco marcato (`<!-- DA CONFERMARE: ... -->`) o una riga onesta nel
sito: «Il dolce del giorno cambia ogni settimana, ve lo raccontiamo al tavolo» batte un dolce inventato.

---

## 8. Variante admin (opzionale)

Copia del sito in cui il titolare aggiorna menù, orari, contatti e testi da solo. Schema collaudato
su Blue Box, Al Sile ed Elementi:

- lucchetto opacizzato nel footer, accanto al copyright → dialog con password (blocco a 5 tentativi)
- **la password si conserva con sale e giri, non con un hash singolo.** Un SHA-256 di
  `nomelocale26` si rompe a casa in un istante. Sale casuale di 16 byte + ~50.000 giri:
  `h = sha256(SALT + pw)`, poi `h = sha256(h + SALT)` in ciclo. Costa mezzo secondo all'accesso,
  una volta sola, e moltiplica per 50.000 il costo di ogni tentativo offline. **Usa lo SHA-256
  scritto a mano in pagina, non `crypto.subtle`**: quello esiste solo in contesto sicuro, e
  aprendo il file col doppio clic (`file://`) ogni password risulterebbe sbagliata. PBKDF2 vero
  richiede `crypto.subtle`, quindi qui non si puo' usare
- i contenuti modificabili vivono in un oggetto JS fra marcatori `/*__MENU_START__*/ … /*__MENU_END__*/`
- le modifiche stanno in `localStorage` con una chiave di versione; **"Pubblica"** rifà `fetch` del
  proprio sorgente, riscrive i blocchi fra i marcatori, e scarica un `index.html` da trascinare su
  Netlify. Nuova versione a ogni pubblicazione, così chi ha già visitato il sito vede i contenuti nuovi
- costruisci i marcatori a pezzi nel codice (`'/*__MENU_' + 'START__*/'`): se scritto per intero, il
  marcatore compare due volte nel sorgente scaricato (una nel `<script>` che lo cerca, una nel blocco
  dati vero) e `indexOf` può agganciarsi alla riga sbagliata, corrompendo la pubblicazione
- l'HTML statico resta come fallback senza JS; il render lo sostituisce
- dopo un re-render da admin, rimetti la classe dei reveal, altrimenti le sezioni restano invisibili

**Verifica il giro completo:** modifica → salva → pubblica → riapri il file generato (anche in un
iframe da blob) → devono comparire le modifiche **e** i marcatori devono essere ancora unici, così è
ripubblicabile all'infinito.

⚠️ **Da dire sempre al cliente, con queste parole:** su un sito statico il controllo della password
sta per forza nel browser, quindi chi legge il sorgente ha l'impronta e puo' provare a indovinarla
a casa propria. Sale e giri lo rallentano di 50.000 volte, non lo impediscono: **e' un rallentatore,
non una serratura.** La protezione vera e' che pubblicare richiede l'accesso a Netlify. Va bene per
menu' e orari, mai per dati sensibili. Se il cliente vuole alzare l'asticella, una frase di quattro
parole al posto di `nome26` conta piu' di qualunque numero di giri.

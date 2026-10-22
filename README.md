# create-website

Skill per [Claude Code](https://claude.com/claude-code): da un link Google Maps a un sito single-file pronto da vendere per negozi, ristoranti e attività locali.

## Cosa fa

- Raccoglie dati e foto reali del locale a partire dal link Maps
- Sceglie lo stile guardando davvero le foto, non a intuito
- Costruisce un sito in un solo file (`index.html`, CSS e JS inline), più privacy, termini, 404, sitemap, favicon, OG cover, `netlify.toml` e `_headers`
- Verifica con screenshot, misure sul DOM e Lighthouse
- Applica una checklist pre-lancio di 20 punti (SEO, privacy, sicurezza, cache)
- Prepara `NOTE-CLIENTE.md` con cosa chiedere al titolare
- Opzionale (`--admin`): pannello di modifica per il titolare

## Installazione

```bash
git clone https://github.com/riccardo106-droid/create-website ~/.claude/skills/create-website
```

Poi in Claude Code:

```
/create-website <link Google Maps> [--admin]
```

## Da adattare

`SKILL.md` contiene percorsi dell'autore (`C:\Users\ricca\...`) per la cartella di uscita e per le skill sorelle. Sostituiscili con i tuoi.

La skill usa anche `playwright-cli`, Lighthouse e, opzionalmente, le skill `awesome-design-md` e `img2threejs`. `references/apple-design/` non è inclusa nel repo (guide Apple, copyright Apple).

## Licenza

MIT, vedi [LICENSE](LICENSE). `references/awesome-design-md/` ha la sua licenza.

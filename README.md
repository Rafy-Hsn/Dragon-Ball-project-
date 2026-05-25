#  Dragon Ball Universe

> Interactieve Single Page Application — Web Advanced (TI1)

Dragon Ball Universe is een interactieve webapplicatie waarmee je het Dragon Ball universum kan verkennen. De app haalt live data op via de Dragon Ball API en laat je personages en planeten browsen, filteren, sorteren en bewaren als favoriet. Beschrijvingen worden automatisch vertaald vanuit het Spaans via de MyMemory API.

--

## 📋 Inhoudsopgave

- [Projectbeschrijving & Functionaliteiten](#projectbeschrijving--functionaliteiten)
- [Gebruikte API's](#gebruikte-apis)
- [Screenshots](#screenshots)
- [Installatiehandleiding](#installatiehandleiding)
- [Folderstructuur](#folderstructuur)
- [Technische Vereisten — Implementatie](#technische-vereisten--implementatie)
- [Gebruikte bronnen](#gebruikte-bronnen)

---

## Projectbeschrijving & Functionaliteiten

### Wat doet de app?

De applicatie biedt een compleet overzicht van het Dragon Ball universum door live data op te halen van de Dragon Ball API. Gebruikers kunnen personages en planeten bekijken in een kaartweergave of een tabelweergave, filteren op ras of planeetstatus, zoeken op naam en sorteren op naam of Ki-kracht. Elk personage heeft een detailmodal met extra info en alle transformaties.

### Functies

**Dataverzameling & weergave**
- Haalt minstens 100 personages en 100 planeten op via de Dragon Ball API
- Kaartweergave met afbeelding, naam, ras, gender, affiliation, Base Ki (met visuele Ki-balk) en Max Ki — dat zijn 6 zichtbare datavelden per kaart
- Tabelweergave met 8 kolommen: naam, ras, gender, affiliation, Base Ki, Max Ki, status en afbeelding
- Detail modal per personage: beschrijving (automatisch vertaald), statistieken, herkomstplaneet en een volledig overzicht van alle transformaties

**Interactiviteit**
- **Zoekfunctie** — debounced zoekveld (300 ms) filtert live op naam
- **Filterknopen** — filter personages op ras (Saiyan, Human, Namekian, …) of planeten op status (intact / vernietigd); filters werken gecombineerd met zoeken en sorteren
- **Sorteerdropdown** — sorteer op naam A→Z, naam Z→A, Ki hoog→laag of Ki laag→hoog; werkt op de gefilterde dataset
- **Kaart / Tabel toggle** — schakel tussen visuele kaartweergave en een gedetailleerde tabelweergave

**Personalisatie & gebruiksvoorkeuren**
- Personages toevoegen aan en verwijderen uit favorieten (hart-icoon op elke kaart)
- Aparte Favorieten-sectie met badge-teller op de navigatieknop
- Thema-switcher (donker / licht), voorkeur bewaard tussen sessies
- Taalkeuze NL / EN / FR, bewaard tussen sessies
- Actieve sectie bewaard — de app opent waar je vorige keer was
- API-data gecached in LocalStorage voor 1 uur (minder netwerkverzoeken)
- Persoonlijke notities schrijven en bewaren via een gevalideerd formulier

**Gebruikerservaring**
- Responsive design (mobiel, tablet en desktop)
- Ki-energie achtergrondanimatie (Canvas API) met deeltjes, gloed en bliksemlijnen
- Toast meldingen bij elke favorietactie
- Compact scrollende header dankzij IntersectionObserver
- Laadspinner en foutmelding met "opnieuw proberen"-knop
- Paginering (20 items per pagina)
- Toetsenbordondersteuning: Escape sluit modals

---

## Gebruikte API's
| Dragon Ball API | https://www.dragonball-api.com/ | Personages, planeten, transformaties |
| MyMemory Translate | https://api.mymemory.translated.net/ | Vertaling van Spaanse beschrijvingen naar NL / EN / FR |

Gebruikte endpoints:
- `GET /api/characters?limit=100` — alle personages
- `GET /api/characters/:id` — detailinfo van één personage
- `GET /api/planets?limit=100` — alle planeten

> De Dragon Ball API levert beschrijvingen standaard in het Spaans. De app vertaalt deze automatisch via MyMemory naar de taal die de gebruiker heeft gekozen.

---
## Screenshots
zie Map `src/assets

| Weergave | Screenshot |
|----------|-----------|
| Hoofdpagina — kaartweergave | `src/assets/screenshots/cards.png` |
| Planeten weergeven | `src/assets/screenshots/Planeten.png` |
| Detail modal met transformaties | `src/assets/screenshots/modal.png` |
| Favorieten sectie | `src/assets/screenshots/favorites.png` |
| Notitieformulier | `src/assets/screenshots/notes.png` |
| Donker & licht thema | `src/assets/screenshots/theme.png` |


---

## Installatiehandleiding

### Vereisten

- [Node.js](https://nodejs.org/) versie 18 of hoger
- Git

### Stappen

```bash
# 1. Repository klonen
git clone https://github.com/JOUW-USERNAME/dragonball-universe.git
cd dragonball-universe

# 2. Afhankelijkheden installeren
npm install

# 3. Ontwikkelserver starten (opent op http://localhost:5173)
npm run dev

# 4. Productie build aanmaken (output in /dist)
npm run build

# 5. Preview van de productie build
npm run preview
```

> Er is geen API-key nodig — beide API's zijn volledig gratis en publiek toegankelijk.

---

## Folderstructuur

```
dragonball-universe/
├── index.html              # Hoofd HTML bestand (entry point voor Vite)
├── package.json            # Project configuratie & scripts
├── vite.config.js          # Vite build configuratie
├── .gitignore
├── README.md
├── src/
│   ├── js/
│   │   ├── main.js         # App-logica, state, event listeners, Observer API
│   │   ├── api.js          # Fetch, caching, JSON verwerking
│   │   ├── storage.js      # LocalStorage: favorieten & voorkeuren
│   │   ├── ui.js           # DOM manipulatie: kaarten, tabel, modal, filters
│   │   ├── form.js         # Formuliervalidatie & notities
│   │   ├── lang.js         # Meertaligheid (NL/EN/FR) & vertaal-API
│   │   └── ki-effect.js    # Canvas animatie (achtergrondeffect)
│   ├── css/
│   │   └── style.css       # Volledige styling (CSS custom properties, flexbox, grid)
│   └── assets/
│       ├── dragonball.svg  # Favicon
│       └── screenshots/    # Screenshots voor de README
└── dist/                   # Gegenereerd door npm run build
```

---


## Technische Vereisten — Implementatie

Hieronder staat per vereiste categorie **exact** waar en hoe elk concept is toegepast, inclusief bestandsnaam en regelnummer.

---

### 1. DOM Manipulatie

| Vereiste | Bestand | Regels | Uitleg |
|----------|---------|--------|--------|
| Elementen selecteren | `main.js` | 37–42 | `getElementById` en `querySelectorAll` voor zoekbalk, sorteer-dropdown, navigatieknoppen en themaknop |
| Elementen selecteren | `ui.js` | 14–25 | Alle vaste UI-elementen geselecteerd bij module-initialisatie |
| Elementen manipuleren | `ui.js` | 40–41 | `classList.toggle('hidden', ...)` wisselt kaart- en tabelweergave |
| Elementen manipuleren | `ui.js` | 53–54 | `toast.textContent` en `toast.className` aanpassen voor meldingen |
| Elementen manipuleren | `ui.js` | 87–92 | `favCount.textContent` en `.style.display` updaten de badge teller |
| Elementen manipuleren | `lang.js` | 221–273 | Alle UI-labels worden herschreven bij taalwisseling via `textContent` |
| Events koppelen | `main.js` | 54–58 | `click` event op themaknop |
| Events koppelen | `main.js` | 253–281 | `input`, `change`, `click` en `keydown` events voor zoek, sorteer en navigatie |
| Events koppelen | `ui.js` | 32–43 | `click` events op kaart/tabel-toggle knoppen |
| Events koppelen | `form.js` | 143–172 | `blur`, `input` en `submit` events op formuliervelden |

---

### 2. Modern JavaScript

#### Basis

| Vereiste | Bestand | Regels | Uitleg |
|----------|---------|--------|--------|
| `const` | `api.js` | 16–23 | `BASE_URL`, `CACHE_CHARS`, `CACHE_PLANETS`, `CACHE_MS` als module-constanten |
| `const` | `main.js` | 34 | `PER_PAGE = 20` als vaste paginagrootte |
| Template literals | `ui.js` | 122–153 | Volledige kaart-HTML gebouwd met backtick strings en `${}` |
| Template literals | `ui.js` | 460–483 | Modal-inhoud via template literal met geneste expressies |
| Template literals | `form.js` | 73–91 | Notitieslijst HTML via `notes.map(note => \`...\`).join('')` |
| Template literals | `lang.js` | 199 | URL voor de vertaal-API samengesteld met `${}` |
| Iteratie over arrays | `ui.js` | 321–330 | `forEach` over items-array om kaarten te renderen |
| Iteratie over arrays | `ki-effect.js` | 106–136 | `forEach` over deeltjesarray voor animatieberekeningen |
| Iteratie over arrays | `lang.js` | 318–329 | `forEach` over `LANGS` array om taalknoppen aan te maken |

#### Uitgebreide basis

| Vereiste | Bestand | Regels | Uitleg |
|----------|---------|--------|--------|
| Array methodes | `main.js` | 79–88 | `sort()` met comparator voor naam en Ki-sortering |
| Array methodes | `main.js` | 100–114 | `filter()` voor zoek-, ras- en statusfilter (gecombineerd) |
| Array methodes | `main.js` | 129 | `slice()` voor paginering |
| Array methodes | `main.js` | 167 | `map()` + `filter()` + `Set` voor unieke rassenlijst |
| Array methodes | `storage.js` | 19 | `.some()` om te controleren of een id al favoriet is |
| Array methodes | `storage.js` | 30 | `.filter()` om een favoriet te verwijderen |
| Arrow functions | `api.js` | 26, 54 | `readCache` en `writeCache` als `const fn = () => {}` |
| Arrow functions | `main.js` | 46, 78, 93 | `applyTheme`, `sortItems`, `applyFilters` als arrow functions |
| Arrow functions | `ui.js` | 49, 97, 101 | `showToast`, `formatKi`, `kiPercent` |
| Arrow functions | `ki-effect.js` | 35, 48 | `randomBetween` en `createParticle` |
| Ternary operator | `main.js` | 50 | `theme === 'light' ? '🌙' : '☀️'` voor de themaknop |
| Ternary operator | `main.js` | 95 | `state.section === 'characters' ? allCharacters : allPlanets` |
| Ternary operator | `ui.js` | 53 | `type === 'error' ? 'toast toast-error' : 'toast'` |
| Ternary operator | `ui.js` | 91 | `n > 0 ? 'inline-block' : 'none'` voor badgeweergave |
| Ternary operator | `ui.js` | 118 | `fav ? ' is-favorite' : ''` bij kaart aanmaken |
| Ternary operator | `ui.js` | 194–199 | Planeetstatus bepalen: vernietigd / intact / onbekend |

#### Geavanceerd

| Vereiste | Bestand | Regels | Uitleg |
|----------|---------|--------|--------|
| Observer API | `main.js` | 65–75 | `IntersectionObserver` detecteert wanneer de hero-sectie verdwijnt en maakt de header compact |
| Callback functions | `main.js` | 136–140 | `renderPagination` ontvangt een callback `(p) => { state.page = p; ... }` |
| Callback functions | `main.js` | 215–219 | `onRaceFilter` als named callback doorgegeven aan `renderFilters` |
| Callback functions | `main.js` | 299 | `initLang(() => switchSection(state.section))` — callback bij taalwisseling |
| Callback functions | `ki-effect.js` | 179 | `requestAnimationFrame(draw)` roept `draw` als callback aan (animatielus) |
| Callback functions | `lang.js` | 326 | `option.addEventListener('click', () => setLang(...))` |

---

### 3. Data & API

| Vereiste | Bestand | Regels | Uitleg |
|----------|---------|--------|--------|
| Fetch | `api.js` | 69 | `fetch(\`${BASE_URL}/characters?limit=100\`)` — haalt 100+ personages op |
| Fetch | `api.js` | 89 | `fetch(\`${BASE_URL}/characters/${id}\`)` — haalt detailinfo op van 1 personage |
| Fetch | `api.js` | 103 | `fetch(\`${BASE_URL}/planets?limit=100\`)` — haalt 100+ planeten op |
| Fetch | `lang.js` | 200 | `fetch(url)` — roept de MyMemory vertaal-API aan |
| JSON manipuleren | `api.js` | 75–78 | `res.json()` + normalisatie: array of `json.items ?? []` |
| JSON manipuleren | `api.js` | 36 | `JSON.parse(raw)` bij het lezen van de LocalStorage cache |
| JSON manipuleren | `api.js` | 57 | `JSON.stringify({ data, ts: Date.now() })` bij het schrijven van de cache |
| JSON manipuleren | `storage.js` | 12, 24 | `JSON.parse` en `JSON.stringify` voor favorieten en voorkeuren |
| JSON manipuleren | `lang.js` | 205–206 | `res.json()` + uitlezen van `data.responseData.translatedText` |
| Data transformeren | `api.js` | 114–121 | `parseKi()` zet een Ki-string ("1,000,000") om naar een getal voor vergelijking |
| Data transformeren | `storage.js` | 23 | Nieuw favoriet-object aangemaakt met spread `{ ...item, savedAt: ... }` |
| Data transformeren | `ui.js` | 97 | `formatKi()` maakt Ki-waarden leesbaar voor weergave (`'Unknown'` → `'???'`) |

---

### 4. Opslag & Validatie

| Vereiste | Bestand | Regels | Uitleg |
|----------|---------|--------|--------|
| LocalStorage — favorieten | `storage.js` | 10–41 | `getFavorites`, `addFavorite`, `removeFavorite`, `toggleFavorite` lezen en schrijven de favorietenlijst |
| LocalStorage — voorkeuren | `storage.js` | 43–54 | `getPreferences` / `savePreference` bewaren thema, taal en actieve sectie |
| LocalStorage — API cache | `api.js` | 26–61 | `readCache` / `writeCache` slaan API-data op met timestamp voor 1 uur geldigheid |
| LocalStorage — notities | `form.js` | 10–35 | `getNotes` / `saveNote` / `deleteNote` bewaren persoonlijke notities |
| Formuliervalidatie | `form.js` | 39–58 | `validateField()` controleert verplichte velden, e-mailopmaak en minimale lengte, en toont inline foutmeldingen |
| Formuliervalidatie | `form.js` | 172–187 | Bij submit worden alle velden gevalideerd; bij fouten wordt de focus op het eerste probleemlveld gezet |
| Validatiefeedback | `form.js` | 54–55 | CSS klassen `input-error` en `input-ok` voor visuele feedback per veld |
| Validatiefeedback | `form.js` | 163–165 | Karakterteller wordt rood boven 270 tekens (max 300) |

---

### 5. Styling & Layout

| Vereiste | Bestand | Uitleg |
|----------|---------|--------|
| Flexbox | `style.css` | Header, navigatiebalk, kaartgrid, filterrij en modal-layout gebouwd met flexbox |
| CSS Grid | `style.css` | Kaartgrid gebruikt `display: grid` met `auto-fill` voor responsief gedrag |
| CSS custom properties | `style.css` | Alle kleuren, afstanden en schaduwen via `--db-*` variabelen; thema's wisselen door 1 `data-theme` attribuut |
| Animaties | `style.css` | `@keyframes fadeInUp` voor kaartinstap, hartje-pulse animatie, hover-effect op kaarten |
| Canvas animatie | `ki-effect.js` | Volledige achtergrondanimatie: zwevende Ki-deeltjes, aura-gloed en bliksemlijnen (Canvas 2D API) |
| Gebruiksvriendelijke elementen | `ui.js` | Toast meldingen, verwijderknoppen met 🗑️ icoon, badge-teller op navigatieknop, laadspinner |
| Responsive design | `style.css` | Media queries voor mobiel en tablet; kaartgrid past aantal kolommen automatisch aan |

---

### 6. Asynchrone JavaScript (Async / Await & Promises)

| Vereiste | Bestand | Regels | Uitleg |
|----------|---------|--------|--------|
| `async` / `await` | `api.js` | 64, 69, 75 | `fetchAllCharacters` is een `async` functie; `await fetch(...)` en `await res.json()` wachten op de Promise |
| `async` / `await` | `api.js` | 87–95 | `fetchCharacterById` — zelfde patroon voor detaildata |
| `async` / `await` | `api.js` | 98–111 | `fetchAllPlanets` met cache-check voor de fetch |
| `async` / `await` | `lang.js` | 186–215 | `translateText` is `async`; wacht op `fetch` en `res.json()` van de vertaal-API |
| `async` / `await` | `main.js` | 145–163 | `handleCardClick` is `async`; toont loader terwijl de detaildata wordt opgehaald |
| `async` / `await` | `main.js` | 172–246 | `switchSection` is `async`; laadt data enkel als die nog niet in de state zit |
| `async` / `await` | `main.js` | 285–309 | `init` is `async`; zorgt dat de eerste sectie volledig geladen is voor de app zichtbaar wordt |
| `async` / `await` | `ui.js` | 437–503 | `openCharModal` is `async`; wacht op de vertaling van de beschrijving |
| Promises | `api.js` | 69 | `fetch()` geeft een Promise terug; `await` maakt het lineair leesbaar |
| Error handling | `api.js` | 72 | `if (!res.ok) throw new Error(...)` — HTTP-fouten worden als exception gegooid |
| Error handling | `main.js` | 158–162 | `try/catch` in `handleCardClick` — foutmelding via toast bij mislukte detailfetch |
| Error handling | `lang.js` | 211–213 | `catch` blok: bij vertaalfout wordt de originele Spaanse tekst getoond |

---

### 7. Tooling & Structuur

| Vereiste | Detail |
|----------|--------|
| Vite | Project opgestart met `npm create vite@latest`; dev-server via `npm run dev`; productie build via `npm run build` naar `/dist` |
| ES Modules | Elk bestand is een afzonderlijke module; `import` / `export` doorheen het project |
| Folderstructuur | HTML in root, JS in `src/js/`, CSS in `src/css/`, assets in `src/assets/`, build-output in `dist/` |
| Code kwaliteit | Elk bestand bevat uitgebreide inline comments die het wat, waarom en de gebruikte techniek toelichten |

---

## Gebruikte bronnen

### Documentatie & referenties

- [Dragon Ball API documentatie](https://web.dragonball-api.com/documentation)
- [MyMemory Translate API](https://mymemory.translated.net/doc/spec.php)
- [MDN — Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN — IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [MDN — Canvas 2D API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
- [MDN — LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN — async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises)
- [Vite documentatie](https://vitejs.dev/guide/)
- [CSS Tricks — A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS Tricks — A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)

### AI-chatlog
https://claude.ai/share/634e5ee7-3793-4d89-b6ff-2c4ce3905a3e

Ik gebruikte AI om bepaalde concepten beter te begrijpen (zoals hoe IntersectionObserver en canvas-animaties werken) en om mijn code te controleren op fouten. Bijna alle code heb ik zelf geschreven, begrepen en aangepast aan het project.

*Dragon Ball Universe — Web Advanced TI1 — 2025–2026*
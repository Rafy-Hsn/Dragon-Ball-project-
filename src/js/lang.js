// Lang.js - Taalkeuze & automatische vertaling
//Dit bestand beheert de 3 talen van de applicatie (NL, EN, FR).

import { savePreference, getPreferences } from './storage.js';

// De beschikbare talen als constante array
const LANGS = ['nl', 'en', 'fr'];

// Label dat op de knop verschijnt per taal
const LANG_LABELS = {
  nl: '🇧🇪 NL',
  en: '🇬🇧 EN',
  fr: '🇫🇷 FR',
};

// Volledige naam per taal (voor de dropdown)
const LANG_NAMES = {
  nl: 'Nederlands',
  en: 'English',
  fr: 'Français',
};

// De momenteel actieve taal (standaard Nederlands)
let currentLang = 'nl';

// Cache voor vertalingen zodat we niet telkens de API aanroepen
// Sleutel = "taal:eerste50tekens", Waarde = vertaalde tekst
const translationCache = {};

// -----------------------------------------------------------
// UI TEKSTEN PER TAAL
// Alle teksten die in de interface verschijnen, vertaald in 3 talen
// Functies (bv. results) zijn callback functions die een argument ontvangen
// -----------------------------------------------------------
const UI_TEXT = {
  nl: {
    characters:    '⚔️ Personages',
    planets:       '🌍 Planeten',
    favorites:     '❤️ Favorieten',
    search:        'Zoek een personage of planeet...',
    sort:          'Sorteren:',
    sortNameAZ:    'Naam A→Z',
    sortNameZA:    'Naam Z→A',
    sortKiHigh:    'Ki Hoogst',
    sortKiLow:     'Ki Laagst',
    cards:         '⊞ Kaarten',
    table:         '☰ Tabel',
    loading:       'Data laden...',
    retry:         'Opnieuw proberen',
    noResults:     'Geen resultaten gevonden',
    noResultsSub:  'Probeer een andere zoekterm of filter',
    noFavs:        'Geen favorieten opgeslagen',
    noFavsSub:     'Klik op het 🤍 icoontje op een personage!',
    all:           'Alle',
    results:       (n) => `${n} resultaat${n !== 1 ? 'en' : ''}`,
    favs:          (n) => `${n} favoriet${n !== 1 ? 'en' : ''}`,
    addFav:        '❤️ Voeg toe aan favorieten',
    removeFav:     '💔 Verwijder uit favorieten',
    addedFav:      (name) => `❤️ ${name} toegevoegd!`,
    removedFav:    (name) => `💔 ${name} verwijderd`,
    heroTitle:     'Dragon Ball Universe',
    heroSub:       'Verken personages, planeten en meer!',
    race:          'Race',
    gender:        'Gender',
    affiliation:   'Affiliation',
    baseKi:        'Base Ki',
    maxKi:         'Max Ki',
    status:        'Status',
    planet:        'Planeet',
    destroyed:     'Vernietigd',
    intact:        'Intact',
    unknown:       'Onbekend',
    transformations: 'Transformaties',
    translating:   'Beschrijving vertalen...',
    noDesc:        'Geen beschrijving beschikbaar.',
    chooseLanguage: 'Kies je taal',
  },
  en: {
    characters:    '⚔️ Characters',
    planets:       '🌍 Planets',
    favorites:     '❤️ Favorites',
    search:        'Search a character or planet...',
    sort:          'Sort:',
    sortNameAZ:    'Name A→Z',
    sortNameZA:    'Name Z→A',
    sortKiHigh:    'Ki Highest',
    sortKiLow:     'Ki Lowest',
    cards:         '⊞ Cards',
    table:         '☰ Table',
    loading:       'Loading data...',
    retry:         'Try again',
    noResults:     'No results found',
    noResultsSub:  'Try a different search term or filter',
    noFavs:        'No favorites saved',
    noFavsSub:     'Click the 🤍 icon on a character!',
    all:           'All',
    results:       (n) => `${n} result${n !== 1 ? 's' : ''}`,
    favs:          (n) => `${n} favorite${n !== 1 ? 's' : ''}`,
    addFav:        '❤️ Add to favorites',
    removeFav:     '💔 Remove from favorites',
    addedFav:      (name) => `❤️ ${name} added!`,
    removedFav:    (name) => `💔 ${name} removed`,
    heroTitle:     'Dragon Ball Universe',
    heroSub:       'Explore characters, planets and more!',
    race:          'Race',
    gender:        'Gender',
    affiliation:   'Affiliation',
    baseKi:        'Base Ki',
    maxKi:         'Max Ki',
    status:        'Status',
    planet:        'Planet',
    destroyed:     'Destroyed',
    intact:        'Intact',
    unknown:       'Unknown',
    transformations: 'Transformations',
    translating:   'Translating description...',
    noDesc:        'No description available.',
    chooseLanguage: 'Choose your language',
  },
  fr: {
    characters:    '⚔️ Personnages',
    planets:       '🌍 Planètes',
    favorites:     '❤️ Favoris',
    search:        'Rechercher un personnage ou une planète...',
    sort:          'Trier:',
    sortNameAZ:    'Nom A→Z',
    sortNameZA:    'Nom Z→A',
    sortKiHigh:    'Ki Plus Haut',
    sortKiLow:     'Ki Plus Bas',
    cards:         '⊞ Cartes',
    table:         '☰ Tableau',
    loading:       'Chargement...',
    retry:         'Réessayer',
    noResults:     'Aucun résultat trouvé',
    noResultsSub:  'Essayez un autre terme ou filtre',
    noFavs:        'Aucun favori enregistré',
    noFavsSub:     'Cliquez sur 🤍 sur un personnage!',
    all:           'Tous',
    results:       (n) => `${n} résultat${n !== 1 ? 's' : ''}`,
    favs:          (n) => `${n} favori${n !== 1 ? 's' : ''}`,
    addFav:        '❤️ Ajouter aux favoris',
    removeFav:     '💔 Retirer des favoris',
    addedFav:      (name) => `❤️ ${name} ajouté!`,
    removedFav:    (name) => `💔 ${name} supprimé`,
    heroTitle:     'Dragon Ball Universe',
    heroSub:       'Explorez personnages, planètes et plus!',
    race:          'Race',
    gender:        'Genre',
    affiliation:   'Affiliation',
    baseKi:        'Ki de Base',
    maxKi:         'Ki Maximum',
    status:        'Statut',
    planet:        'Planète',
    destroyed:     'Détruit',
    intact:        'Intact',
    unknown:       'Inconnu',
    transformations: 'Transformations',
    translating:   'Traduction en cours...',
    noDesc:        'Aucune description disponible.',
    chooseLanguage: 'Choisissez votre langue',
  },
};

// -----------------------------------------------------------
// Huidige taal opvragen (gebruikt door andere bestanden)
// -----------------------------------------------------------
export const getLang = () => currentLang;

// -----------------------------------------------------------
// UI tekst opvragen voor een bepaalde sleutel
// Techniek: arrow function, ternary operator
// Bv: t('race') geeft 'Race', 'Race', of 'Race' afhankelijk van taal
// Bv: t('results', 5) roept de callback function aan
// -----------------------------------------------------------
export const t = (key, arg) => {
  const entry = UI_TEXT[currentLang]?.[key] ?? UI_TEXT['nl'][key] ?? key;
  // Als de waarde een functie is (bv. voor meervoud), roep ze aan
  return typeof entry === 'function' ? entry(arg) : entry;
};

// -----------------------------------------------------------
// Spaanse tekst vertalen via MyMemory API
// Techniek: fetch, async/await, Promises, JSON, cache
// De Dragon Ball API geeft beschrijvingen altijd in het Spaans (es)
// -----------------------------------------------------------
export const translateText = async (text, targetLang) => {
  // Lege tekst niet vertalen
  if (!text || !text.trim()) return '';

  // Cache sleutel: taal + begin van de tekst
  const cacheKey = `${targetLang}:${text.slice(0, 60)}`;

  // Als we deze tekst al vertaald hebben, gebruik de cache
  if (translationCache[cacheKey]) return translationCache[cacheKey];

  try {
    // Stuur een verzoek naar de gratis MyMemory vertaal API
    // langpair=es|nl vertaalt van Spaans naar Nederlands
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|${targetLang}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error('Vertaal API fout');

    // Haal de vertaalde tekst op uit het JSON antwoord
    const data = await res.json();
    const result = data?.responseData?.translatedText ?? text;

    // Bewaar in cache zodat we niet opnieuw hoeven te vertalen
    translationCache[cacheKey] = result;
    return result;
  } catch {
    // Bij fout: originele Spaanse tekst tonen
    return text;
  }
};

// -----------------------------------------------------------
// Alle UI labels bijwerken naar de gekozen taal
// DOM manipulatie: tekstinhoud van elementen aanpassen
// -----------------------------------------------------------
const updateUI = () => {
  // De taalknop zelf bijwerken
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) langBtn.textContent = LANG_LABELS[currentLang];

  // Navigatieknoppen bijwerken (bewaar de badge span voor favorieten)
  document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
    const s = btn.dataset.section;
    if (s === 'favorites') {
      const badge = btn.querySelector('#fav-count'); // bewaar de teller
      btn.textContent = t('favorites') + ' ';
      if (badge) btn.appendChild(badge); // zet de teller terug
    } else if (s === 'characters') {
      btn.textContent = t('characters');
    } else if (s === 'planets') {
      btn.textContent = t('planets');
    }
  });

  // Zoekbalk placeholder tekst
  const si = document.getElementById('search-input');
  if (si) si.placeholder = t('search');

  // Sorteer label
  const sl = document.querySelector('.sort-wrap label');
  if (sl) sl.textContent = t('sort');

  // Sorteer opties in de dropdown
  const ss = document.getElementById('sort-select');
  if (ss && ss.options.length >= 4) {
    ss.options[0].textContent = t('sortNameAZ');
    ss.options[1].textContent = t('sortNameZA');
    ss.options[2].textContent = t('sortKiHigh');
    ss.options[3].textContent = t('sortKiLow');
  }

  // Kaart/tabel weergave knoppen
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.textContent = btn.dataset.view === 'cards' ? t('cards') : t('table');
  });

  // Laad tekst en retry knop
  const lp = document.querySelector('.loader p');
  if (lp) lp.textContent = t('loading');
  const rb = document.getElementById('retry-btn');
  if (rb) rb.textContent = t('retry');

  // Hero sectie tekst
  const h1 = document.querySelector('.hero-text h1');
  const hp = document.querySelector('.hero-text p');
  if (h1) h1.textContent = t('heroTitle');
  if (hp) hp.textContent  = t('heroSub');
};

// -----------------------------------------------------------
// Taal instellen en UI bijwerken
// Verbergt de dropdown na de keuze
// -----------------------------------------------------------
const setLang = (lang, dropdown, onReload) => {
  currentLang = lang;
  savePreference('lang', lang); // Bewaar keuze in LocalStorage

  // Dropdown verbergen na keuze
  dropdown.classList.add('hidden');

  updateUI(); // Alle teksten bijwerken

  if (onReload) onReload(); // Herlaad de kaarten met nieuwe taal
};

// -----------------------------------------------------------
// Dropdown tonen met de 3 taalkeuzes
// Techniek: DOM manipulatie, array methode (forEach), events
// -----------------------------------------------------------
const showLangDropdown = (btn, onReload) => {
  // Controleer of de dropdown al bestaat
  let dropdown = document.getElementById('lang-dropdown');

  if (dropdown) {
    // Dropdown bestaat al: toggle zichtbaarheid
    dropdown.classList.toggle('hidden');
    return;
  }

  // Maak de dropdown aan als nieuw DOM element
  dropdown = document.createElement('div');
  dropdown.id = 'lang-dropdown';
  dropdown.className = 'lang-dropdown';

  // Titel bovenaan de dropdown
  const title = document.createElement('p');
  title.className = 'lang-dropdown-title';
  title.textContent = t('chooseLanguage');
  dropdown.appendChild(title);

  // Een knop maken voor elke beschikbare taal
  // Techniek: forEach iteratie over array
  LANGS.forEach(lang => {
    const option = document.createElement('button');
    option.className = `lang-option${lang === currentLang ? ' active' : ''}`;

    // Inhoud van de knop: vlag + naam
    option.innerHTML = `${LANG_LABELS[lang]} <span>${LANG_NAMES[lang]}</span>`;

    // Event: klik op taal → taal instellen
    option.addEventListener('click', () => setLang(lang, dropdown, onReload));

    dropdown.appendChild(option);
  });

  // Dropdown toevoegen aan de pagina na de taalknop
  btn.parentElement.appendChild(dropdown);

  // Event: klik buiten de dropdown → sluit hem
  // Techniek: event listener op het hele document
  setTimeout(() => {
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== btn) {
        dropdown.classList.add('hidden');
      }
    }, { once: true }); // { once: true } = listener verwijdert zichzelf na 1 keer
  }, 0);
};

// -----------------------------------------------------------
// Initialiseer de taalmodule bij het opstarten van de app
// Laadt de opgeslagen taalvoorkeur en koppelt de knopevents
// -----------------------------------------------------------
export const initLang = (onReload) => {
  // Opgeslagen taalvoorkeur ophalen
  const prefs = getPreferences();
  currentLang = prefs.lang ?? 'nl'; // Standaard Nederlands

  // De taalknop ophalen uit de DOM
  const langBtn = document.getElementById('lang-toggle');

  if (langBtn) {
    // Event: klik op de knop → toon de dropdown
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Voorkom dat de klik de dropdown meteen sluit
      showLangDropdown(langBtn, onReload);
    });
  }

  // UI bijwerken naar de geladen taalvoorkeur
  updateUI();
};

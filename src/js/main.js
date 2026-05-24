//main.js  - Hoofd applicatie logica
// Dit is het startpunt van de applicatie.
// Het beheert de toestand (state) van de app en verbindt
// alle andere modules met elkaar.

import '../css/style.css'; // CSS importeren via Vite

import { fetchAllCharacters, fetchAllPlanets, fetchCharacterById, parseKi } from './api.js';
import { getPreferences, savePreference } from './storage.js';
import {
  showLoader, hideLoader, showError,
  renderCards, renderFavorites, renderFilters, renderPagination,
  openCharModal, closeModal,
  showToast, updateFavBadge,
} from './ui.js';
import { initNotesForm } from './form.js';
import { initLang, getLang, t } from './lang.js';


// APPLICATIE STAAT (state)
// Eén object dat de huidige toestand van de app bijhoudt
const state = {
  allCharacters: [],
  allPlanets:    [],
  filtered:      [],
  section:       'characters',
  query:         '',
  activeRace:    null,
  planetFilter:  null,
  sortMode:      'name-asc',
  page:          1,
};

const PER_PAGE = 20;

// DOM ELEMENTEN SELECTEREN
const searchInput = document.getElementById('search-input'); // Zoekbalk
const sortSelect  = document.getElementById('sort-select');  // Sorteer dropdown
const retryBtn    = document.getElementById('retry-btn');    // Opnieuw proberen knop
const themeToggle = document.getElementById('theme-toggle'); // Donker/licht thema knop
const navBtns     = document.querySelectorAll('.nav-btn');   // Alle navigatie knoppen
const heroSection = document.getElementById('hero-banner');  // Hero banner bovenaan

// THEMA WISSELEN (donker / licht)
// De keuze wordt bewaard in LocalStorage
const applyTheme = (theme) => {
  // Voeg het thema toe als data attribuut op het html element
  document.documentElement.setAttribute('data-theme', theme);
  // Ternary operator: juiste emoji tonen
  themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
};

// Event: klik op de thema knop
themeToggle.addEventListener('click', () => {
  // Huidige thema ophalen en omwisselen
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  savePreference('theme', next); // Bewaar keuze in LocalStorage
});

//OBSERVER API — IntersectionObserver
// Detecteert wanneer de hero sectie buiten beeld scrollt
// en maakt de header compacter

const heroObserver = new IntersectionObserver(
  (entries) => {
    // Callback function: wordt uitgevoerd wanneer de zichtbaarheid verandert
    entries.forEach(entry => {
      document.getElementById('main-header')
        .classList.toggle('compact', !entry.isIntersecting);
    });
  },
  { threshold: 0.1 } // Trigger als 10% van de hero zichtbaar/onzichtbaar is
);
heroObserver.observe(heroSection); // Start het observeren

// Sorteren
const sortItems = (items) => {
  const copy = [...items]; // Kopieer de array zodat het origineel niet verandert

  // Sorteer op basis van de huidige sorteermode
  switch (state.sortMode) {
    case 'name-asc':  return copy.sort((a, b) => a.name.localeCompare(b.name)); // A→Z
    case 'name-desc': return copy.sort((a, b) => b.name.localeCompare(a.name)); // Z→A
    case 'ki-desc':   return copy.sort((a, b) => parseKi(b.ki) - parseKi(a.ki)); // Ki hoog→laag
    case 'ki-asc':    return copy.sort((a, b) => parseKi(a.ki) - parseKi(b.ki)); // Ki laag→hoog
    default:          return copy;
  }
};

// FILTEREN EN ZOEKEN
// Past de actieve filters toe op de volledige dataset
const applyFilters = () => {
  // Begin met alle items van de actieve sectie
  let items = state.section === 'characters' ? state.allCharacters : state.allPlanets;

  // Zoekfilter: houd alleen items waar de naam de zoekterm bevat
  if (state.query) {
    const q = state.query.toLowerCase();
    items = items.filter(item => item.name.toLowerCase().includes(q));
  }

  // Ras filter (alleen voor personages)
  if (state.section === 'characters' && state.activeRace) {
    items = items.filter(item => item.race === state.activeRace);
  }

  // Status filter (alleen voor planeten)
  if (state.section === 'planets' && state.planetFilter !== null) {
    items = items.filter(item =>
      // Ternary operator: destroyed of alive vergelijken
      state.planetFilter === 'destroyed' ? item.isDestroyed === true : item.isDestroyed === false
    );
  }

  // Sorteer de gefilterde resultaten
  state.filtered = sortItems(items);

  // Reset naar pagina 1 na een filter wijziging
  state.page = 1;
  renderPage();
};

// PAGINA RENDEREN
// Toont alleen de items van de huidige pagina
const renderPage = () => {
  // Bereken start en eind index voor de huidige pagina
  const start = (state.page - 1) * PER_PAGE;
  const pageItems  = state.filtered.slice(start, start + PER_PAGE);
  const totalPages = Math.ceil(state.filtered.length / PER_PAGE);

  // Kaarten renderen
  renderCards(pageItems, state.section, handleCardClick);

  // Paginering renderen met een callback functie
  renderPagination(state.page, totalPages, (p) => {
    state.page = p; // Pagina bijwerken in de state
    renderPage();
    window.scrollTo({ top: 200, behavior: 'smooth' }); // Scroll omhoog
  });
};

// KAART KLIK AFHANDELEN
// Haalt de details van één personage op en toont de modal
const handleCardClick = async (id) => {
  // Planeten hebben geen detail modal (nog niet uitgewerkt)
  if (state.section === 'planets') return;

  try {
    showLoader(); // Laad-spinner tonen

    // await: wacht op de API respons (Promise)
    const detail = await fetchCharacterById(id);

    hideLoader(); // Laad-spinner verbergen
    openCharModal(detail, getLang()); // Modal openen met de details
    renderPage(); // Kaarten herstellen achter de modal
  } catch (err) {
    hideLoader();
    showToast(`⚠️ ${err.message}`, 'error'); // Foutmelding tonen
    renderPage();
  }
};

// Unieke rassen ophalen uit de data
const getRaces = (chars) =>
  [...new Set(chars.map(c => c.race).filter(Boolean))].sort();

// Sectie Wisselen
// Wisselt tussen Personages, Planeten en Favorieten

const switchSection = async (section) => {
  // State bijwerken
  state.section     = section;
  state.query       = '';
  state.activeRace  = null;
  state.planetFilter = null;
  searchInput.value = ''; // Zoekbalk leegmaken

  // Nav knoppen bijwerken: actieve knop krijgt 'active' klasse
  navBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.section === section));

  // Voorkeur opslaan in LocalStorage
  savePreference('section', section);

  // Ki sorteeropties verbergen voor planeten (planeten hebben geen Ki)
  const kiOptions = sortSelect.querySelectorAll('[data-ki]');
  kiOptions.forEach(o => o.style.display = section === 'characters' ? '' : 'none');

  // Favorieten sectie heeft eigen logica
  if (section === 'favorites') {
    renderFavorites(handleCardClick, getLang());
    document.getElementById('filter-wrap').innerHTML = '';
    updateFavBadge();
    return;
  }

  if (section === 'characters') {
    // Data laden als we die nog niet hebben
    if (state.allCharacters.length === 0) {
      showLoader();
      try {
        state.allCharacters = await fetchAllCharacters();
      } catch (err) {
        showError(`${err.message}`);
        return;
      }
    }

    // Race filter knoppen aanmaken
    const races = getRaces(state.allCharacters);

    // Benoemde callback zodat we hem kunnen doorgeven aan renderFilters
    // (geen arguments.callee nodig — dat werkt niet in ES modules)
    const onRaceFilter = (race) => {
      state.activeRace = race;
      renderFilters(races, state.activeRace, onRaceFilter, t('all'));
      applyFilters();
    };
    renderFilters(races, null, onRaceFilter, t('all'));

  } else {
    // Planeten laden
    if (state.allPlanets.length === 0) {
      showLoader();
      try {
        state.allPlanets = await fetchAllPlanets();
      } catch (err) {
        showError(`${err.message}`);
        return;
      }
    }

    // Status filter knoppen voor planeten
    const onPlanetFilter = (filter) => {
      state.planetFilter = filter === t('destroyed') ? 'destroyed'
                         : filter === t('intact')    ? 'alive'
                         : null;
      renderFilters([t('intact'), t('destroyed')], filter, onPlanetFilter, t('all'));
      applyFilters();
    };
    renderFilters([t('intact'), t('destroyed')], null, onPlanetFilter, t('all'));
  }

  applyFilters(); // Toon de gefilterde en gesorteerde data
};

//Event Listeners Instellen
// Koppelt alle gebruikersacties aan de juiste functies
// Zoekbalk — debounce: wacht 300ms voor we filteren
// Dit voorkomt dat we bij elke toetsaanslag direct filteren
let searchTimer = null;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimer); // Reset vorige timer
  // Callback function: wordt uitgevoerd na 300ms pauze
  searchTimer = setTimeout(() => {
    state.query = e.target.value.trim();
    applyFilters();
  }, 300);
});

// Sorteer dropdown
sortSelect.addEventListener('change', (e) => {
  state.sortMode = e.target.value;
  applyFilters();
});

// Navigatie knoppen (Personages, Planeten, Favorieten)
navBtns.forEach(btn => {
  btn.addEventListener('click', () => switchSection(btn.dataset.section));
});

// Modal sluiten via overlay klik, sluitknop of Escape toets
document.getElementById('modal-overlay').addEventListener('click', closeModal);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Opnieuw proberen knop (bij API fout)
retryBtn.addEventListener('click', () => switchSection(state.section));

// APP OPSTARTEN
// Laadt voorkeuren en start de applicatie
const init = async () => {
  const prefs = getPreferences(); // Opgeslagen voorkeuren ophalen

  // Thema instellen (bewaard of standaard donker)
  applyTheme(prefs.theme ?? 'dark');

  // Favoriet badge bijwerken
  updateFavBadge();

  // Ki achtergrond animatie starten
  initKiEffect();

  // Taalkeuze initialiseren — geef een callback mee die de
  // huidige sectie herlaadt wanneer de taal verandert
  initLang(() => switchSection(state.section));

  // Notitieformulier initialiseren
  initNotesForm();

  // Start met de opgeslagen sectie (of standaard 'characters')
  await switchSection(prefs.section ?? 'characters');
};

// Start de volledige applicatie
init();


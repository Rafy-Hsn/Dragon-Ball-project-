// ui.js - DOM manipulatie & rendering
// Dit bestand is verantwoordelijk voor alles wat de gebruiker ziet:
//   - Personage en planeet kaarten aanmaken
//   - Tabelweergave met 8 kolommen
//   - Filters, paginering en de detail modal
//   - Toast meldingen (korte berichten)

import { isFavorite, toggleFavorite, getFavorites } from './storage.js';
import { parseKi } from './api.js';
import { t, translateText, getLang } from './lang.js';

// -----------------------------------------------------------
// DOM ELEMENTEN SELECTEREN
// Alle vaste elementen die we in dit bestand gebruiken
// -----------------------------------------------------------
const cardsGrid    = document.getElementById('cards-grid');    // Het grid waar kaarten in komen
const loader       = document.getElementById('loader');         // De laad-spinner
const errorMsg     = document.getElementById('error-msg');      // Foutmelding blok
const errorText    = document.getElementById('error-text');     // Tekst in de foutmelding
const resultsCount = document.getElementById('results-count'); // "X resultaten" tekst
const pagination   = document.getElementById('pagination');     // Paginering knoppen
const favCount     = document.getElementById('fav-count');      // Badge teller op favorieten knop
const toast        = document.getElementById('toast');          // Korte melding onderaan
const filterWrap   = document.getElementById('filter-wrap');    // Filter knoppen container
const tableWrap    = document.getElementById('table-wrap');     // Tabel container
const tableHead    = document.getElementById('table-head');     // Tabel hoofd rij
const tableBody    = document.getElementById('table-body');     // Tabel data rijen

// Huidige weergavemodus: 'cards' (kaarten) of 'table' (tabel)
let currentView = 'cards';

// -----------------------------------------------------------
// EVENTS: Kaart/Tabel toggle knoppen
// Wisselt tussen kaartweergave en tabelweergave
// -----------------------------------------------------------
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentView = btn.dataset.view; // Sla de keuze op

    // Alle knoppen updaten: actieve knop krijgt 'active' klasse
    document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b === btn));

    // Toon of verberg de juiste weergave
    cardsGrid.classList.toggle('hidden', currentView === 'table');
    tableWrap.classList.toggle('hidden', currentView === 'cards');
  });
});

// -----------------------------------------------------------
// TOAST MELDING TONEN
// Toont een korte melding onderaan het scherm (bv. "❤️ Goku toegevoegd!")
// Techniek: DOM manipulatie, setTimeout (callback function)
// -----------------------------------------------------------
let toastTimer = null; // Bewaar de timer zodat we hem kunnen resetten

export const showToast = (msg, type = 'ok') => {
  toast.textContent = msg;

  // Ternary operator: rode achtergrond bij fout, normaal bij succes
  toast.className = type === 'error' ? 'toast toast-error' : 'toast';
  toast.classList.remove('hidden');

  // Reset de vorige timer als er al een toast bezig was
  clearTimeout(toastTimer);

  // Callback function: verberg de toast na 3 seconden
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
};

// -----------------------------------------------------------
// LOADER TONEN
// Laat de draaiende cirkel zien en verbergt de kaarten
// -----------------------------------------------------------
export const showLoader = () => {
  cardsGrid.innerHTML = ''; // Kaarten verwijderen
  if (tableBody) { tableBody.innerHTML = ''; tableHead.innerHTML = ''; }
  pagination.innerHTML = '';
  errorMsg.classList.add('hidden');
  loader.classList.remove('hidden'); // Loader tonen
};

// Loader verbergen
export const hideLoader = () => loader.classList.add('hidden');

// -----------------------------------------------------------
// FOUTMELDING TONEN
// -----------------------------------------------------------
export const showError = (msg) => {
  hideLoader();
  errorText.textContent = msg;
  errorMsg.classList.remove('hidden');
};

// -----------------------------------------------------------
// FAVORIET BADGE UPDATEN
// Toont het aantal favorieten als een rode cirkel op de nav knop
// -----------------------------------------------------------
export const updateFavBadge = () => {
  const n = getFavorites().length;
  favCount.textContent = n;
  // Ternary operator: verberg badge als er 0 favorieten zijn
  favCount.style.display = n > 0 ? 'inline-block' : 'none';
};

// -----------------------------------------------------------
// HULPFUNCTIES voor Ki waarden
// -----------------------------------------------------------

// Ki waarde leesbaar maken (bv. 'Unknown' → '???', 'Infinity' → '∞')
const formatKi = (ki) => (!ki || ki === 'Unknown') ? '???' : ki === 'Infinity' ? '∞' : ki;

// Ki waarde omzetten naar een percentage voor de Ki balk (0-100%)
// Schaal: maximale Ki is 1 quadriljoen (hoogste in de anime)
const kiPercent = (ki) => {
  const v = parseKi(ki);
  if (!isFinite(v)) return 100; // Infinity = volle balk
  return Math.min(100, (v / 1_000_000_000_000_000) * 100);
};

// -----------------------------------------------------------
// PERSONAGE KAART AANMAKEN
// Maakt één kaart aan voor een personage en geeft die terug
// Techniek: DOM element aanmaken, template literal, events koppelen
// -----------------------------------------------------------
const createCharCard = (char, onCardClick) => {
  // Controleer of dit personage al een favoriet is
  const fav = isFavorite(char.id);

  // Nieuw HTML element aanmaken (article tag)
  const card = document.createElement('article');

  // CSS klassen instellen — ternary operator voor is-favorite klasse
  card.className = `char-card${fav ? ' is-favorite' : ''}`;
  card.dataset.id = char.id; // ID opslaan voor later gebruik

  // HTML inhoud via template literal (backtick string met ${})
  card.innerHTML = `
    <div class="card-img-wrap">
      ${char.image
        ? `<img src="${char.image}" alt="${char.name}" loading="lazy">`
        : `<div class="card-img-placeholder">🐉</div>`}
      <!-- Favoriet knop rechtsboven op de kaart -->
      <button class="fav-btn${fav ? ' active' : ''}" aria-label="Favoriet">
        ${fav ? '❤️' : '🤍'}
      </button>
      <!-- Race badge linksboven op de afbeelding -->
      ${char.race ? `<span class="race-badge">${char.race}</span>` : ''}
    </div>
    <div class="card-body">
      <h3 class="card-name">${char.name}</h3>
      <!-- Card meta: 5 datavelden + Ki balk = 6 kolommen totaal -->
      <div class="card-meta">
        <div><div class="label">${t('race')}</div><div>${char.race ?? '—'}</div></div>
        <div><div class="label">${t('gender')}</div><div>${char.gender ?? '—'}</div></div>
        <div><div class="label">${t('affiliation')}</div><div>${char.affiliation ?? '—'}</div></div>
        <div><div class="label">${t('maxKi')}</div><div>${formatKi(char.maxKi)}</div></div>
        <div class="ki-bar-wrap">
          <div class="ki-label">
            <span class="label">${t('baseKi')}</span>
            <span>${formatKi(char.ki)}</span>
          </div>
          <!-- Ki balk: breedte bepaald door kiPercent() -->
          <div class="ki-bar">
            <div class="ki-fill" style="width:${kiPercent(char.ki)}%"></div>
          </div>
        </div>
      </div>
    </div>`;

  // Event: klik op de kaart → open detail modal
  // (maar niet als de gebruiker op de fav knop klikte)
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.fav-btn')) onCardClick(char.id);
  });

  // Event: klik op favoriet knop → toggle favoriet
  card.querySelector('.fav-btn').addEventListener('click', (e) => {
    e.stopPropagation(); // Voorkom dat de kaart klik ook afgevuurd wordt

    // Toggle: toevoegen of verwijderen
    const added = toggleFavorite({
      id: char.id, name: char.name, image: char.image,
      race: char.race, ki: char.ki, maxKi: char.maxKi,
      affiliation: char.affiliation, gender: char.gender,
    });

    // DOM onmiddellijk bijwerken zonder pagina te herladen
    const btn = e.currentTarget;
    btn.textContent = added ? '❤️' : '🤍';
    btn.classList.toggle('active', added);
    card.classList.toggle('is-favorite', added);

    // Toast melding tonen (gebruikt vertaalde tekst via t())
    showToast(added ? t('addedFav', char.name) : t('removedFav', char.name));
    updateFavBadge(); // Badge teller bijwerken
  });

  return card; // De voltooide kaart teruggeven
};
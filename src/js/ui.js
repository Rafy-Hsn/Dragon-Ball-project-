// ui.js - DOM manipulatie & rendering
// Dit bestand is verantwoordelijk voor alles wat de gebruiker ziet:
//   - Personage en planeet kaarten aanmaken
//   - Tabelweergave met 8 kolommen
//   - Filters, paginering en de detail modal
//   - Toast meldingen (korte berichten)

import { isFavorite, toggleFavorite, getFavorites } from './storage.js';
import { parseKi } from './api.js';
import { t, translateText, getLang } from './lang.js';

// DOM ELEMENTEN SELECTEREN
// Alle vaste elementen die we in dit bestand gebruiken
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

// EVENTS: Kaart/Tabel toggle knoppen
// Wisselt tussen kaartweergave en tabelweergave
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

// TOAST MELDING TONEN
// Toont een korte melding onderaan het scherm (bv. "❤️ Goku toegevoegd!")
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

// LOADER TONEN
// Laat de draaiende cirkel zien en verbergt de kaarten
export const showLoader = () => {
  cardsGrid.innerHTML = ''; // Kaarten verwijderen
  if (tableBody) { tableBody.innerHTML = ''; tableHead.innerHTML = ''; }
  pagination.innerHTML = '';
  errorMsg.classList.add('hidden');
  loader.classList.remove('hidden'); // Loader tonen
};

// Loader verbergen
export const hideLoader = () => loader.classList.add('hidden');

// FOUTMELDING TONEN

export const showError = (msg) => {
  hideLoader();
  errorText.textContent = msg;
  errorMsg.classList.remove('hidden');
};

// FAVORIET BADGE UPDATEN
// Toont het aantal favorieten als een rode cirkel op de nav knop

export const updateFavBadge = () => {
  const n = getFavorites().length;
  favCount.textContent = n;
  // Ternary operator: verberg badge als er 0 favorieten zijn
  favCount.style.display = n > 0 ? 'inline-block' : 'none';
};

// HULPFUNCTIES voor Ki waarden

// Ki waarde leesbaar maken (bv. 'Unknown' → '???', 'Infinity' → '∞')
const formatKi = (ki) => (!ki || ki === 'Unknown') ? '???' : ki === 'Infinity' ? '∞' : ki;

// Ki waarde omzetten naar een percentage voor de Ki balk (0-100%)
// Schaal: maximale Ki is 1 quadriljoen (hoogste in de anime)
const kiPercent = (ki) => {
  const v = parseKi(ki);
  if (!isFinite(v)) return 100; // Infinity = volle balk
  return Math.min(100, (v / 1_000_000_000_000_000) * 100);
};

// PERSONAGE KAART AANMAKEN
// Maakt één kaart aan voor een personage en geeft die terug

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

// PLANEET KAART AANMAKEN
const createPlanetCard = (planet) => {
  const card = document.createElement('article');
  card.className = 'planet-card';

  // Status bepalen: vernietigd, intact of onbekend
  const destroyed = planet.isDestroyed;
  // Ternary operator voor CSS klasse en label
  const statusClass = destroyed === true  ? 'status-destroyed'
                    : destroyed === false ? 'status-alive'
                    : 'status-unknown';
  const statusLabel = destroyed === true  ? t('destroyed')
                    : destroyed === false ? t('intact')
                    : t('unknown');

  card.innerHTML = `
    <div class="planet-img-wrap">
      ${planet.image
        ? `<img src="${planet.image}" alt="${planet.name}" loading="lazy">`
        : '<div style="font-size:3rem;opacity:.3">🌍</div>'}
      <span class="planet-status-badge ${statusClass}">${statusLabel}</span>
    </div>
    <div class="card-body">
      <h3 class="planet-name">${planet.name}</h3>
      <div class="card-meta">
        <div><div class="label">${t('status')}</div><div>${statusLabel}</div></div>
        <div><div class="label">ID</div><div>#${planet.id}</div></div>
      </div>
      ${planet.description
        ? `<p style="font-size:.78rem;color:var(--db-muted);margin-top:.5rem;line-height:1.4;
            overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">
            ${planet.description}
          </p>`
        : ''}
    </div>`;

  return card;
};

// TABELWEERGAVE RENDEREN
// Bouwt een tabel met 8 kolommen voor de personages
const renderTable = (items, onCardClick) => {
  // Hoofd rij met kolomtitels (8 kolommen)
  tableHead.innerHTML = `<tr>
    <th>Foto</th>
    <th>${t('characters').replace('⚔️ ', '')}</th>
    <th>${t('race')}</th>
    <th>${t('gender')}</th>
    <th>${t('affiliation')}</th>
    <th>${t('baseKi')}</th>
    <th>${t('maxKi')}</th>
    <th>❤️</th>
  </tr>`;

  // Elke rij aanmaken via map + template literal
  // map() zet elk personage om naar een HTML string
  // join plakt alle strings samen tot één grote HTML string
  tableBody.innerHTML = items.map(c => {
    const fav = isFavorite(c.id);
    return `<tr data-id="${c.id}" style="cursor:pointer">
      <td>${c.image
        ? `<img class="table-char-img" src="${c.image}" alt="${c.name}" loading="lazy">`
        : '🐉'}</td>
      <td><span class="table-name">${c.name}</span></td>
      <td>${c.race ? `<span class="table-race-badge">${c.race}</span>` : '—'}</td>
      <td>${c.gender ?? '—'}</td>
      <td>${c.affiliation ?? '—'}</td>
      <td>
        <div class="table-ki-bar">
          <div class="ki-bar">
            <div class="ki-fill" style="width:${kiPercent(c.ki)}%"></div>
          </div>
          <span class="table-ki-val">${formatKi(c.ki)}</span>
        </div>
      </td>
      <td><span class="table-ki-val">${formatKi(c.maxKi)}</span></td>
      <td><button class="table-fav-btn" data-id="${c.id}">${fav ? '❤️' : '🤍'}</button></td>
    </tr>`;
  }).join('');

  // Events koppelen aan tabelrijen: klik → open modal
  tableBody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', (e) => {
      if (!e.target.closest('.table-fav-btn')) {
        onCardClick(Number(row.dataset.id));
      }
    });
  });

  // Events koppelen aan fav knoppen in de tabel
  tableBody.querySelectorAll('.table-fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id   = Number(btn.dataset.id);
      const char = items.find(c => c.id === id); // Zoek het personage in de array
      if (!char) return;

      const added = toggleFavorite({
        id: char.id, name: char.name, image: char.image,
        race: char.race, ki: char.ki, maxKi: char.maxKi,
        affiliation: char.affiliation, gender: char.gender,
      });

      btn.textContent = added ? '❤️' : '🤍';
      showToast(added ? t('addedFav', char.name) : t('removedFav', char.name));
      updateFavBadge();
    });
  });
};

// KAARTEN RENDEREN
// Hoofd functie die alle kaarten op het scherm zet
export const renderCards = (items, type, onCardClick) => {
  hideLoader();
  cardsGrid.innerHTML = '';
  if (tableBody) { tableBody.innerHTML = ''; tableHead.innerHTML = ''; }
  errorMsg.classList.add('hidden');

  // Lege staat tonen als er geen resultaten zijn
  if (!items || items.length === 0) {
    cardsGrid.innerHTML = `
      <div class="empty-message">
        <span class="empty-icon">🔍</span>
        <h3>${t('noResults')}</h3>
        <p>${t('noResultsSub')}</p>
      </div>`;
    resultsCount.textContent = '';
    tableWrap.classList.add('hidden');
    return;
  }

  // Aantal resultaten tonen (gebruikt vertaalde tekst)
  resultsCount.textContent = t('results', items.length);

  // Elke kaart aanmaken en toevoegen aan het grid
  // forEach iteratie over de items array
  items.forEach((item, i) => {
    const card = type === 'characters'
      ? createCharCard(item, onCardClick)  // Personage kaart
      : createPlanetCard(item);            // Planeet kaart

    // Kleine vertraging per kaart voor een staggered animatie effect
    card.style.animationDelay = `${i * 0.04}s`;
    cardsGrid.appendChild(card);
  });

  // Tabelweergave ook vullen (alleen voor personages)
  if (type === 'characters') {
    renderTable(items, onCardClick);
    tableWrap.classList.toggle('hidden', currentView === 'cards');
  } else {
    tableWrap.classList.add('hidden');
  }

  // Kaartgrid tonen/verbergen afhankelijk van de huidige weergave
  cardsGrid.classList.toggle('hidden', currentView === 'table');
};

// FAVORIETEN SECTIE RENDEREN
// Toont de opgeslagen favorieten van de gebruiker
export const renderFavorites = (onCardClick) => {
  hideLoader();
  cardsGrid.innerHTML = '';
  if (tableBody) { tableBody.innerHTML = ''; tableHead.innerHTML = ''; }
  filterWrap.innerHTML = '';
  pagination.innerHTML = '';
  tableWrap.classList.add('hidden');

  const favs = getFavorites(); // Haal favorieten op uit LocalStorage

  // Lege staat als er geen favorieten zijn
  if (favs.length === 0) {
    cardsGrid.innerHTML = `
      <div class="empty-message">
        <span class="empty-icon">❤️</span>
        <h3>${t('noFavs')}</h3>
        <p>${t('noFavsSub')}</p>
      </div>`;
    resultsCount.textContent = '';
    return;
  }

  resultsCount.textContent = t('favs', favs.length);

  // Elke favoriet als kaart tonen
  favs.forEach((item, i) => {
    const card = createCharCard(item, onCardClick);
    card.style.animationDelay = `${i * 0.04}s`;
    cardsGrid.appendChild(card);
  });
};

// FILTER KNOPPEN RENDEREN
// Maakt knoppen aan voor elk filteroptie (bv. race types)
export const renderFilters = (options, active, onChange, allLabel) => {
  filterWrap.innerHTML = ''; // Bestaande filters verwijderen

  // "Alle" knop die alle filters reset
  const allBtn = document.createElement('button');
  allBtn.className = `filter-btn${!active ? ' active' : ''}`;
  allBtn.textContent = allLabel ?? t('all');
  allBtn.addEventListener('click', () => onChange(null));
  filterWrap.appendChild(allBtn);

  // Eén knop per filteroptie aanmaken
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = `filter-btn${active === opt ? ' active' : ''}`;
    btn.textContent = opt;
    btn.addEventListener('click', () => onChange(opt));
    filterWrap.appendChild(btn);
  });
};

// PAGINERING RENDEREN
// Vorige/Volgende knoppen en paginanummers

export const renderPagination = (page, total, onChange) => {
  pagination.innerHTML = '';
  if (total <= 1) return; // Geen paginering nodig bij 1 pagina

  // Vorige pagina knop
  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.textContent = '◀';
  prev.disabled = page === 1; // Uitschakelen op de eerste pagina
  prev.addEventListener('click', () => onChange(page - 1));
  pagination.appendChild(prev);

  // Paginanummer knoppen
  for (let i = 1; i <= total; i++) {
    const btn = document.createElement('button');
    // Ternary operator: actieve pagina krijgt 'active' klasse
    btn.className = `page-btn${i === page ? ' active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => onChange(i));
    pagination.appendChild(btn);
  }

  // Volgende pagina knop
  const next = document.createElement('button');
  next.className = 'page-btn';
  next.textContent = '▶';
  next.disabled = page === total; // Uitschakelen op de laatste pagina
  next.addEventListener('click', () => onChange(page + 1));
  pagination.appendChild(next);
};

// DETAIL MODAL OPENEN
// Toont alle informatie van één personage in een popup

export const openCharModal = async (char, lang) => {
  const modal = document.getElementById('detail-modal');
  const body  = document.getElementById('modal-body');
  const fav   = isFavorite(char.id);

   // Transformaties sectie bouwen
   const transformsHTML = (char.transformations ?? []).length > 0
    ? `<div class="transformations-section">
        <h3>⚡ ${t('transformations')} (${char.transformations.length})</h3>
        <div class="transformations-grid">
          ${char.transformations.map(tr => `
            <div class="transform-card">
              ${tr.image
                ? `<img src="${tr.image}" alt="${tr.name}" style="width:60px;height:70px;object-fit:contain">`
                : ''}
              <span class="t-name">${tr.name}</span>
              ${tr.ki ? `<span class="t-ki">${tr.ki}</span>` : ''}
            </div>`).join('')}
        </div>
      </div>`
    : '';

  // Modal inhoud instellen via template literal
  body.innerHTML = `
    <div class="modal-char-header">
      ${char.image ? `<img class="modal-char-img" src="${char.image}" alt="${char.name}">` : ''}
      <div class="modal-char-info">
        <h2>${char.name}</h2>
        ${char.race ? `<span class="race-badge" style="position:static;display:inline-block;margin-bottom:.5rem">${char.race}</span>` : ''}
        <div class="modal-stats">
          <div class="modal-stat"><span class="lbl">${t('baseKi')}</span><span>${formatKi(char.ki)}</span></div>
          <div class="modal-stat"><span class="lbl">${t('maxKi')}</span><span>${formatKi(char.maxKi)}</span></div>
          <div class="modal-stat"><span class="lbl">${t('gender')}</span><span>${char.gender ?? '—'}</span></div>
          <div class="modal-stat"><span class="lbl">${t('affiliation')}</span><span>${char.affiliation ?? '—'}</span></div>
          ${char.originPlanet
            ? `<div class="modal-stat"><span class="lbl">${t('planet')}</span><span>${char.originPlanet.name}</span></div>`
            : ''}
        </div>
      </div>
    </div>
    <p id="modal-desc" style="color:var(--db-muted);line-height:1.6;font-size:.9rem;margin-bottom:1rem;font-style:italic">
      ${t('translating')}
    </p>
    ${transformsHTML}
    <button class="modal-fav-btn${fav ? ' remove' : ''}" id="modal-fav-btn">
      ${fav ? t('removeFav') : t('addFav')}
    </button>`;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Beschrijving vertalen (async — wacht op de vertaal API)
  const descEl = document.getElementById('modal-desc');
  if (char.description) {
    try {
      // Await: wacht op de Promise van translateText
      const translated = await translateText(char.description, lang ?? getLang());
      if (descEl) {
        descEl.style.fontStyle = 'normal';
        descEl.textContent = translated;
      }
    } catch {
      if (descEl) descEl.textContent = char.description;
    }
  } else {
    if (descEl) { descEl.style.fontStyle = 'normal'; descEl.textContent = t('noDesc'); }
  }

  // Event: favoriet knop in de modal
  document.getElementById('modal-fav-btn')?.addEventListener('click', () => {
    const added = toggleFavorite({
      id: char.id, name: char.name, image: char.image,
      race: char.race, ki: char.ki, maxKi: char.maxKi,
      affiliation: char.affiliation, gender: char.gender,
    });
    showToast(added ? t('addedFav', char.name) : t('removedFav', char.name));
    updateFavBadge();
    closeModal();
  });
};

// MODAL SLUITEN
export const closeModal = () => {
  document.getElementById('detail-modal').classList.add('hidden');
  document.body.style.overflow = '';
};
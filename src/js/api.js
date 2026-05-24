// api.js — Dragon Ball API Service
// Dit bestand haalt alle data op van de externe API.
// Het beheert ook een cache in LocalStorage zodat we
// de API niet telkens opnieuw moeten aanroepen.

// Gebruikte technieken:
//   - Fetch API (data ophalen van het internet)
//   - async/await (wachten op API antwoord)
//   - Promises (fetch geeft een Promise terug)
//   - JSON (data omzetten naar JavaScript object)
//   - LocalStorage (data bewaren in de browser)
//   - Arrow functions (korte functie notatie)
//   - const (constante variabelen)

// De basis URL van de Dragon Ball API
const BASE_URL = 'https://dragonball-api.com/api';

// sleutels voor de cache in Localstorage
const CACHE_CHARS   = 'db_cache_chars';
const CACHE_PLANETS = 'db_cache_planets';

// Hulpfunctie voor cache uit de localstorage te lezen
const readCache = (key) => {
  try {
     const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts > CACHE_MS) {
      // Cache is verlopen: verwijder hem en geef null terug
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    // Als er iets misloopt (bv. corrupte data), geef null terug
    return null;
  }
};

const writeCache = (key, data) => {
  try {
    // Sla de data op samen met het huidige tijdstip (timestamp)
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // Als LocalStorage vol is, geen crash — gewoon overslaan
  }
};

// alle  personages ophalen van de API
export const fetchAllCharacters = async () => {
   const cached = readCache(CACHE_CHARS);
   if (cached) return cached; 
   const res = await fetch(`${BASE_URL}/planets?limit=100`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  const data = Array.isArray(json) ? json : (json.items ?? []);

  writeCache(CACHE_PLANETS, data);
  return data;
};

// ki waarde omzetten naar een getal 
export const parseKi = (kiStr) => {
  if (!kiStr || kiStr === 'Unknown') return 0;
  if (kiStr === 'Infinity') return Infinity;

  // komma's verwijderen en omzetten naar getal
   const n = parseFloat(String(kiStr).replace(/,/g, '').replace(/[^0-9.]/g, ''));
return isNaN(n) ? 0 : n;
};

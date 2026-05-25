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

// Cache duur: 1 uur in milliseconden
const CACHE_MS = 60 * 60 * 1000;

// Hulpfunctie voor cache uit de localstorage te lezen
const readCache = (key) => {
  try {

    // Probeer de waarde op te halen uit LocalStorage
     const raw = localStorage.getItem(key);

// Als er niets opgeslagen is, geef null terug
      if (!raw) return null;

 // Zet de JSON string om naar een JavaScript object
      const parsed = JSON.parse(raw);

// Controleer of de cache nog niet verlopen is
      if (Date.now() - parsed.ts > CACHE_MS) {
      // Cache is verlopen: verwijder hem en geef null terug
      localStorage.removeItem(key);
      return null;
    }

// Cache is nog geldig: geef de data terug
    return parsed.data;
  } catch {
    // Als er iets misloopt (bv. corrupte data), geef null terug
    return null;
  }
};

// HULPFUNCTIE: Data opslaan in de cache (LocalStorage)
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

  // Haal data op van de API met fetch (geeft een Promise terug)
  const res = await fetch(`${BASE_URL}/characters?limit=100`);

  // Controleer of het verzoek gelukt is (status 200-299)
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  // Zet het antwoord om van JSON naar een JavaScript object
  const json = await res.json();

  // De API geeft soms { items: [...] } en soms direct een array
  const data = Array.isArray(json) ? json : (json.items ?? []);

  // Sla de data op in de cache voor later gebruik
  writeCache(CACHE_PLANETS, data);

  return data;
};

// Één personage ophalen met alle details (inclusief transformaties)
export const fetchCharacterById = async (id) => {
  // Haal het specifieke personage op via zijn ID
  const res = await fetch(`${BASE_URL}/characters/${id}`);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  // Zet JSON om naar JavaScript object en geef terug
  return await res.json();
};

// Alle planeten ophalen van de API
export const fetchAllPlanets = async () => {
  // Controleer cache eerst
  const cached = readCache(CACHE_PLANETS);
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

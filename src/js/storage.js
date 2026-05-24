// storage.js  - LocalStorage beheer
// Dit bestand beheert alles wat opgeslagen wordt in de browser:
//   - Favoriete personages van de gebruiker
//   - Gebruikersvoorkeuren (thema, taal, sectie)

// De sleutels waarmee we data opslaan in LocalStorage
const FAV_KEY   = 'db_favorites';
const PREFS_KEY = 'db_preferences';

export const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) ?? [];
  } catch {
     return [];
  }
};

// Controleer of een item al een favoriet is
export const isFavorite = (id) => getFavorites().some(f => f.id === id);
// Favoriet toevoegen aan de lijst
export const addFavorite = (item) => {
    if (isFavorite(item.id)) return false;
    const favs = [...getFavorites(), { ...item, savedAt: new Date().toISOString() }];
localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  return true;
};

// Favoriet verwijderen uit de lijst
export const removeFavorite = (id) => {
  const updated = getFavorites().filter(f => f.id !== id);
  localStorage.setItem(FAV_KEY, JSON.stringify(updated));
};

export const toggleFavorite = (item) => {
  if (isFavorite(item.id)) {
    removeFavorite(item.id);
    return false;
    }
    addFavorite(item);
    return true;
    };

    export const getPreferences = () => {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) ?? {};
  } catch {
    return {};
  }
};

export const savePreference = (key, value) => {
    const prefs = { ...getPreferences(), [key]: value };
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
};
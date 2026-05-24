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

// Formulier validatie & persoonlijke notities

// Dit bestand beheert het notitieformulier in de app.
// Gebruikers kunnen een notitie schrijven en die wordt
// opgeslagen in LocalStorage zodat hij bewaard blijft.

// De sleutel waarmee notities opgeslagen worden in LocalStorage
const NOTES_KEY = 'db_notes';

const getNotes = () => {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
    }
};

// Nieuwe notitie opslaan
const saveNote = (note) => {
  const notes = getNotes();

  notes.unshift({
    ...note,
    id:   Date.now(),
    date: new Date().toLocaleDateString('nl-BE'), 
    });
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

// Notitie verwijderen op basis van ID
const deleteNote = (id) => {
    const updated = getNotes().filter(n => n.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
};

// Één formulierveld valideren
// Controleert of het veld correct ingevuld is en toont feedback
const validateField = (input, errorEl) => {
  const value = input.value.trim();
  let errorMsg = '';

  if (input.required && value === '') {
    errorMsg = 'Dit veld is verplicht.';
    } else if (input.type === 'email' && value !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      errorMsg = 'Vul een geldig e-mailadres in.';
       }
       } else if (input.minLength && value.length < input.minLength) {
        errorMsg = `Minimaal ${input.minLength} tekens vereist (nu: ${value.length}).`;
  }
  errorEl.textContent = errorMsg;
  input.classList.toggle('input-error', errorMsg !== '');
  input.classList.toggle('input-ok',    errorMsg === '' && value !== '');

  return errorMsg === '';
};

// Opgeslagen notities weergeven in de modal
const renderSavedNotes = (container) => {
  const notes = getNotes();

  if (notes.length === 0) {
    container.innerHTML = `
      <p style="color:var(--db-muted);font-size:.85rem;text-align:center">
        Nog geen notities opgeslagen.
      </p>`;
    return;
  }

  // Elke notitie omzetten naar HTML via map + template literal
  container.innerHTML = `
    <h3 style="font-family:'Bangers',cursive;font-size:1.2rem;letter-spacing:1px;color:var(--db-orange);margin-bottom:.8rem">
      Opgeslagen notities (${notes.length})
    </h3>
    <div class="notes-list">
      ${notes.map(note => `
        <div class="note-item" data-id="${note.id}">
          <div class="note-header">
            <span class="note-name">${note.name}</span>
            <span class="note-date">${note.date}</span>
          </div>
          <p class="note-text">${note.text}</p>
          <!-- Verwijderknop met de notitie ID -->
          <button class="note-delete-btn" data-id="${note.id}" title="Verwijder notitie">
            🗑️ Verwijderen
          </button>
        </div>
      `).join('')}
    </div>`;

    container.querySelectorAll('.note-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteNote(parseInt(btn.dataset.id)); // Verwijder op ID
      renderSavedNotes(container);           // Herrender de lijst
    });
  });
};

// Notities modal initialiseren

export const initNotesForm = () => {
  const modal          = document.getElementById('notes-modal');
  const overlay        = document.getElementById('notes-overlay');
  const closeBtn       = document.getElementById('notes-close');
  const cancelBtn      = document.getElementById('notes-cancel');
  const openBtn        = document.getElementById('notes-toggle');
  const form           = document.getElementById('notes-form');
  const savedContainer = document.getElementById('saved-notes');

  const nameInput  = document.getElementById('note-name');
  const emailInput = document.getElementById('note-email');
  const textInput  = document.getElementById('note-text');
  const charCounter = document.getElementById('char-counter');

  const errorName  = document.getElementById('error-name');
  const errorEmail = document.getElementById('error-email');
  const errorNote  = document.getElementById('error-note');

  const openModal = () => {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Voorkom scrollen op achtergrond
    renderSavedNotes(savedContainer);        // Toon bestaande notities
  };

  // Modal sluiten en formulier resetten
  // -----------------------------------------------------------
  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    form.reset(); // Alle velden leegmaken

    // Validatie feedback verwijderen
    [nameInput, emailInput, textInput].forEach(el => {
      el.classList.remove('input-error', 'input-ok');
    });
    [errorName, errorEmail, errorNote].forEach(el => el.textContent = '');
    charCounter.textContent = '0 / 300';
  };

  // Events koppelen aan open/sluit knoppen
  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  // -----------------------------------------------------------
  // Live validatie: controleer elk veld wanneer de gebruiker
  // het veld verlaat (blur event)
  // -----------------------------------------------------------
  nameInput.addEventListener('blur',  () => validateField(nameInput,  errorName));
  emailInput.addEventListener('blur', () => validateField(emailInput, errorEmail));
  textInput.addEventListener('blur',  () => validateField(textInput,  errorNote));

  // -----------------------------------------------------------
  // Karakter teller voor het tekstveld
  // Wordt rood als de gebruiker bijna het maximum bereikt
  // -----------------------------------------------------------
  textInput.addEventListener('input', () => {
    const len = textInput.value.length;
    // Template literal voor de teller tekst
    charCounter.textContent = `${len} / 300`;
    // Ternary operator: kleur aanpassen naargelang het aantal tekens
    charCounter.style.color = len > 270 ? 'var(--db-red)' : 'var(--db-muted)';
  });

  // -----------------------------------------------------------
  // Formulier verzenden met volledige validatie
  // Event: submit (wanneer de gebruiker op "Opslaan" klikt)
  // -----------------------------------------------------------
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Voorkom dat de pagina herlaadt

    // Alle velden valideren en resultaat opslaan
    const nameOk  = validateField(nameInput,  errorName);
    const emailOk = validateField(emailInput, errorEmail);
    const noteOk  = validateField(textInput,  errorNote);

    // Alleen opslaan als ALLE velden geldig zijn
    if (!nameOk || !emailOk || !noteOk) {
      // Focus op het eerste ongeldige veld
      if (!nameOk)       nameInput.focus();
      else if (!emailOk) emailInput.focus();
      else               textInput.focus();
      return; // Stop hier als er fouten zijn
    }

    // Notitie opslaan in LocalStorage
    saveNote({
      name:  nameInput.value.trim(),
      email: emailInput.value.trim(),
      text:  textInput.value.trim(),
    });

    // Formulier resetten na succesvol opslaan
    form.reset();
    [nameInput, emailInput, textInput].forEach(el => {
      el.classList.remove('input-error', 'input-ok');
    });
    charCounter.textContent = '0 / 300';

    // Notitieslijst opnieuw renderen
    renderSavedNotes(savedContainer);
  });
};


// Speichert, welcher Notizmodus gerade aktiv ist
let isQuickMode = false;   
// RANGSYSTEM: XP-Grenzen und Rangzuordnung 
const ranks = [
    { name: "Unranked", min: 0, max: 0 },
    { name: "Noob", min: 1, max: 20 },
    { name: "Beginner", min: 21, max: 40 },
    { name: "Learner", min: 41, max: 70 },
    { name: "Skilled", min: 71, max: 110 },
    { name: "Advanced", min: 111, max: 160 },
    { name: "Experienced", min: 161, max: 220 }
];
function getRank(xp) {
    return ranks.find(rank => xp >= rank.min && xp <= rank.max);
}

 // FORTSCHRITT: Prozent innerhalb des aktuellen Rangs
function getProgress(xp, rank) {

    // Ohne gültigen Rang oder bei 0 XP kein Fortschritt
    if (!rank || xp === 0) {
        return 0;
    }

    // Bereits erreichte XP-Stufen in diesem Rang
    const earnedXp = xp - rank.min + 1;

    // Anzahl aller XP-Stufen dieses Rangs
    const totalXp = rank.max - rank.min + 1;

    // Ergebnis in Prozent zurückgeben
    return Math.round((earnedXp / totalXp) * 100);
}
 // NÄCHSTER RANG: Passenden Rang anhand der XP finden
function getNextRank(xp) {
    return ranks.find(rank => rank.min > xp) ?? null;
}

// FEHLENDE XP: Abstand zum nächsten Rang berechnen
function getMissingXp(xp) {

    const nextRank = getNextRank(xp);

    // Beim höchsten Rang fehlen keine XP mehr
    if (!nextRank) {
        return 0;
    }

    return nextRank.min - xp;
}

// XP-SPEICHER: Fortschritt für das Lernthema Linux
const xpStorageKey = 'momo-xp-linux-v1';
let currentXp = 0;

try {
    const savedXp = localStorage.getItem(xpStorageKey);

    if (savedXp !== null) {
        const parsedXp = Number(savedXp);

        if (Number.isInteger(parsedXp) && parsedXp >= 0 && parsedXp <= 220) {
            currentXp = parsedXp;
        }
    }
} catch (error) {
    console.warn('XP konnten nicht geladen werden:', error);
}
// Linux einmalig in die Themenverwaltung übernehmen
const linuxMigrationKey = 'momo-linux-import-v1';

if (localStorage.getItem(linuxMigrationKey) !== 'done') {

    const topics = JSON.parse(
        localStorage.getItem('momo-topics-v1') || '[]'
    );

    const linux = topics.find(
        topic => topic.name.trim().toLowerCase() === 'linux'
    );

    if (linux) {
        // Bereits vorhandenes Linux nicht doppelt erstellen
        linux.xp = Math.max(Number(linux.xp) || 0, currentXp);
    } else {
        topics.unshift({
            id: Date.now(),
            name: 'Linux',
            tags: [],
            pinned: topics.filter(topic => topic.pinned).length < 4,
            xp: currentXp
        });
    }

    localStorage.setItem('momo-topics-v1', JSON.stringify(topics));
    localStorage.setItem(linuxMigrationKey, 'done');
}
// HTML-Elemente für unsere Notizen
const day = document.querySelector('#day');
const note = document.querySelector('#note');
const status = document.querySelector('#status');


// Überschrift und Button für den Moduswechsel
const noteLabel = document.querySelector('#note-label');
const quickButton = document.querySelector('#quick-mode');

// Speicherschlüssel
const prefix = 'meine-tagesnotiz-v1:';
const quickNoteKey = 'momo-quick-draft-v1';

// Aktuelles Datum ermitteln
const now = new Date();
day.value = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Berlin', 
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit' 
}).format(now);
// Wählt den passenden Speicherplatz
function getStorageKey() {
    if (isQuickMode) {
        return quickNoteKey;
    }

    return prefix + day.value;
}
// NOTIZ LADEN: Gespeicherte Inhalte aus dem Browser abrufen
function load() { 
    try { 
        note.value = localStorage.getItem(getStorageKey()) || ''; 

        status.textContent = note.value 
            ? 'Lokale Notiz geladen.'
            : 'Bereit für deine Notizen.'; 
    } catch (e) { 
        note.value = '';
        status.textContent = 'Speicherung nicht verfügbar — bitte exportieren.'; 
    } 
} 
load();
// NOTIZ SPEICHERN: Änderungen automatisch im Browser sichern 
note.addEventListener('input', () => { 
    try { 
        localStorage.setItem(getStorageKey(), note.value); 
        status.textContent = 'Lokal im Browser gespeichert.'; 
    } catch (e) { 
        status.textContent = 'Nicht gespeichert — bitte als Text exportieren.'; 
    } 
}); 
// MODUSWECHSEL: Zwischen Tagesnotiz und Quick Notes umschalten
quickButton.addEventListener('click', () => {
    isQuickMode = !isQuickMode;

    if (isQuickMode) {
        noteLabel.textContent = 'Meine Quick Notes';
    } else {
        noteLabel.textContent = 'Meine Tagesnotiz';
    }

    load();
});
// DATUMSWECHSEL: Notiz zum ausgewählten Datum laden
day.addEventListener('change', () => { 
    if (!day.value) { 
        status.textContent = 'Bitte ein Datum auswählen.'; 
        return; 
    } 
    
    load(); 
});
// Button zum Erstellen neuer Lernthemen
const addTopicButton = document.querySelector('#add-topic');

addTopicButton.addEventListener('click', () => {

    // Richtige Ansicht auswählen
    document.querySelector('#topic-view').hidden = false;
    document.querySelector('#learning-view').hidden = true;
    document.querySelector('#manage-view').hidden = true;
    document.querySelector('#review-view').hidden = true;

    // Überschrift anpassen
    document.querySelector('#overlay-title').textContent =
        'Neues Lernthema';

    // Overlay öffnen
    document.querySelector('#momo-overlay').showModal();
});
// TXT-EXPORT: Aktuelle Notiz als Textdatei herunterladen 
document.querySelector('#export').addEventListener('click', () => { 
    const exportTitle = isQuickMode
        ? 'Meine Quick Notes'
        : 'Meine Tagesnotiz — ' + day.value;

    const blob = new Blob(
        [exportTitle + '\n\n' + note.value + '\n'],
        { type: 'text/plain;charset=utf-8' }
    );

    const url = URL.createObjectURL(blob), a = document.createElement('a');
    
    a.href = url;
    a.download = (isQuickMode ? 'Quick-Notes' : 'Tagesnotiz-' + day.value) + '.txt'; 
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Textexport angefordert.';
});

// OVERLAY: Dialogfenster steuern
const momoOverlay = document.querySelector('#momo-overlay');
const overlayClose = document.querySelector('#overlay-close');

// Learning Questions öffnet das Overlay
const learningButton = document.querySelector('#learning-open');

    learningButton.addEventListener('click', () => {

    // Themenansicht verstecken
    document.querySelector('#topic-view').hidden = true;

    // Lernkartenansicht anzeigen
    document.querySelector('#learning-view').hidden = false;
    document.querySelector('#manage-view').hidden = true;
    document.querySelector('#review-view').hidden = true;

    // Überschrift des Overlays anpassen
    document.querySelector('#overlay-title').textContent = 'Learning Questions';

    momoOverlay.showModal();
});
// Overlay über den Schließen-Button schließen
overlayClose.addEventListener('click', () => {
    momoOverlay.close();
});
// THEMENVERWALTUNG: Formulareingaben auslesen
const topicForm = document.querySelector('#topic-form');

topicForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.querySelector('#topic-name').value.trim();
    const tags = document.querySelector('#topic-tags').value.trim();
    const pinned = document.querySelector('#topic-pinned').checked;

    // Ein neues Lernthema als Objekt erstellen
const newTopic = {
    id: Date.now(),
    name: name,
    tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    pinned: pinned,
    xp: 0
};

// Bereits gespeicherte Themen laden
const topics = JSON.parse(localStorage.getItem('momo-topics-v1') || '[]');

// Maximal vier angeheftete Themen erlauben
const pinnedCount = topics.filter(topic => topic.pinned).length;

// Maximal vier angeheftete Themen erlaubt
if (newTopic.pinned && pinnedCount >= 4) {
    alert('Du kannst maximal vier Lernthemen anheften.');
    return;
}

// Neues Thema zur Sammlung hinzufügen
topics.push(newTopic);

// Gesamte Sammlung speichern
localStorage.setItem('momo-topics-v1', JSON.stringify(topics));
    renderTopics();

console.log('Gespeicherte Themen:', topics);
});
// THEMENVERWALTUNG: Gespeicherte Themen anzeigen
function renderTopics() {

    const container = document.querySelector('#topics-list');

    // Alte Anzeige leeren
    container.replaceChildren();

    // Gespeicherte Themen laden
    const topics = JSON.parse(
        localStorage.getItem('momo-topics-v1') || '[]'
    );

    // Nur angeheftete Themen anzeigen
    const pinnedTopics = topics.filter(topic => topic.pinned);

    pinnedTopics.forEach(topic => {

        // Neue Themenkarte erstellen
        const card = document.createElement('div');
        card.className = 'topic-card';

        // Themenname
        const name = document.createElement('div');
        name.className = 'topic-name';
        name.textContent = topic.name;
    
        // XP und Rang berechnen
        const rank = getRank(topic.xp);
        const progress = getProgress(topic.xp, rank);
        const nextRank = getNextRank(topic.xp);

        const xp = document.createElement('div');
        xp.className = 'topic-xp';
        xp.textContent = `${topic.xp} XP · ${rank?.name ?? 'Unranked'}`;

        // Fortschrittsbalken erstellen
        const progressBar = document.createElement('div');
        progressBar.className = 'topic-progress';

        const progressFill = document.createElement('div');
        progressFill.className = 'topic-progress-fill';
        progressFill.style.width = `${progress}%`;
        progressBar.append(progressFill);

        // Hinweis auf nächsten Rang
        const nextRankText = document.createElement('div');
        nextRankText.className = 'topic-next-rank';
        nextRankText.textContent = nextRank
            ? `Noch ${getMissingXp(topic.xp)} XP bis ${nextRank.name}`
            : 'Höchster Rang erreicht';

        // Elemente zusammensetzen
        card.append(name, xp, progressBar, nextRankText);
        container.append(card);

    });
}

// Themen beim Laden der Webseite anzeigen
renderTopics();
// THEMENVERWALTUNG: Button und Übersicht
const manageButton = document.querySelector('#manage-topics');

manageButton.addEventListener('click', () => {

    document.querySelector('#topic-view').hidden = true;
    document.querySelector('#learning-view').hidden = true;
    document.querySelector('#manage-view').hidden = false;
    document.querySelector('#review-view').hidden = true;

    document.querySelector('#overlay-title').textContent =
        'Alle Lernthemen';

    const container = document.querySelector('#manage-topics-list');
    container.replaceChildren();

    const topics = JSON.parse(
        localStorage.getItem('momo-topics-v1') || '[]'
    );


topics.forEach(topic => {

    // Container für das einzelne Lernthema
    const entry = document.createElement('div');
    entry.className = 'manage-topic-entry';

    const name = document.createElement('span');

    // Button zum Anheften oder Entpinnen
    const pinButton = document.createElement('button');
    pinButton.type = 'button';

    // Anzeige aktualisieren
    function updateEntry() {
        name.textContent =
            `${topic.name} · ${topic.pinned ? 'Angeheftet' : 'Nicht angeheftet'}`;

        pinButton.textContent =
            topic.pinned ? 'Entpinnen' : 'Anheften';
    }

    pinButton.addEventListener('click', () => {

        // Maximal vier Themen gleichzeitig anheften
        const pinnedCount = topics.filter(item => item.pinned).length;

        if (!topic.pinned && pinnedCount >= 4) {
            alert('Du kannst maximal vier Lernthemen anheften.');
            return;
        }

        // Zustand umkehren
        topic.pinned = !topic.pinned;

        try {
            // Änderung dauerhaft speichern
            localStorage.setItem('momo-topics-v1', JSON.stringify(topics));

            // Dashboard und Verwaltung aktualisieren
            renderTopics();
            updateEntry();

        } catch (error) {
            topic.pinned = !topic.pinned;
            alert('Die Änderung konnte nicht gespeichert werden.');
        }
    });
    // Thema bearbeiten
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Bearbeiten';

    editButton.addEventListener('click', () => {

        const newName = prompt('Neuer Themenname:', topic.name);

        if (newName === null) return;

        const cleanName = newName.trim();

        if (!cleanName || cleanName.length > 60) {
            alert('Der Name muss zwischen 1 und 60 Zeichen haben.');
            return;
        }

        const newTags = prompt(
            'Tags (durch Komma getrennt):',
            (topic.tags || []).join(', ')
        );

        if (newTags === null) return;

        // Vorherige Werte für den Fehlerfall merken
        const oldName = topic.name;
        const oldTags = topic.tags;

        topic.name = cleanName;
        topic.tags = newTags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean);

        try {
            localStorage.setItem('momo-topics-v1', JSON.stringify(topics));

            updateEntry();
            renderTopics();

        } catch (error) {
            topic.name = oldName;
            topic.tags = oldTags;
            alert('Das Thema konnte nicht gespeichert werden.');
        }
    });

    // Thema dauerhaft löschen
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Löschen';

    deleteButton.addEventListener('click', () => {

        const confirmed = confirm(
            `Möchtest du "${topic.name}" wirklich löschen?`
        );

        if (!confirmed) return;

        const index = topics.indexOf(topic);

        if (index === -1) return;

        topics.splice(index, 1);

        try {
            localStorage.setItem('momo-topics-v1', JSON.stringify(topics));

            entry.remove();
            renderTopics();

        } catch (error) {
            topics.splice(index, 0, topic);
            alert('Das Thema konnte nicht gelöscht werden.');
        }
    });
    updateEntry();
    entry.append(name, pinButton, editButton, deleteButton);
    container.append(entry);
}); // Ende der topics.forEach-Schleife

momoOverlay.showModal();

}); // Ende des manageButton-EventListeners


// REVIEW: Eigenes Overlay öffnen
const reviewButton = document.querySelector('#review-open');

reviewButton.addEventListener('click', () => {

    // Andere Ansichten ausblenden
    document.querySelector('#topic-view').hidden = true;
    document.querySelector('#learning-view').hidden = true;
    document.querySelector('#manage-view').hidden = true;

    // Review anzeigen
    document.querySelector('#review-view').hidden = false;

    // Fenstertitel anpassen
    document.querySelector('#overlay-title').textContent =
        'Review';

    momoOverlay.showModal();
});

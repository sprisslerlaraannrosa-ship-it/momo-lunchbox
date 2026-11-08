// Speichert, welcher Notizmodus gerade aktiv ist
let isQuickMode = false;
let isNewNoteMode = false;   
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
    const lastRank = ranks[ranks.length - 1];

    if (xp > lastRank.max) {
        return lastRank;
    }

    return ranks.find(rank =>
        xp >= rank.min && xp <= rank.max
    );
}
// FORTSCHRITT: Prozent innerhalb des aktuellen Rangs
function getProgress(xp, rank) {
    if (!rank || xp === 0) {
        return 0;
    }

    const nextRank = getNextRank(xp);

    // Bis zur nächsten Ranggrenze rechnen
    const upperBound = nextRank
        ? nextRank.min
        : rank.max;

    const earnedXp =
        Math.min(xp, upperBound) - rank.min + 1;

    const totalXp = upperBound - rank.min + 1;

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

// ENTWURFSSTATUS: Speichervorgang sichtbar machen
const draftStatus = document.querySelector('#draft-save-status');

function updateDraftStatus(saved = true) {

    // Nur bei eigenständigen Lernnotizen anzeigen
    draftStatus.hidden = !isNewNoteMode;

    if (!isNewNoteMode) return;

    if (!saved) {
        draftStatus.textContent =
            '⚠️ Der Entwurf konnte nicht gesichert werden.';
    } else if (note.value.trim()) {
        draftStatus.textContent =
            '💾 Entwurf automatisch gesichert – noch nicht im Lernarchiv gespeichert.';
    } else {
        draftStatus.textContent =
            '📝 Neue Lernnotiz – noch nicht im Lernarchiv gespeichert.';
    }
}
// Überschrift und Button für den Moduswechsel
const noteLabel = document.querySelector('#note-label');
const quickButton = document.querySelector('#quick-mode');

// Speicherschlüssel
const prefix = 'meine-tagesnotiz-v1:';
const quickNoteKey = 'momo-quick-draft-v1';
const newNoteDraftKey = 'momo-new-note-draft-v1';

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

    // Eigenständige neue Lernnotiz
    if (isNewNoteMode) {
        return newNoteDraftKey;
    }

    // Quick Notes
    if (isQuickMode) {
        return quickNoteKey;
    }

    // Normale Tagesnotiz
    return prefix + day.value;
}

// NOTIZ LADEN: Gespeicherte Inhalte aus dem Browser abrufen
function load() {
    try {
        note.value = localStorage.getItem(getStorageKey()) || '';

        status.textContent = note.value
            ? 'Lokale Notiz geladen.'
            : 'Bereit für deine Notizen.';

        updateDraftStatus(true);

    } catch (error) {
        note.value = '';
        status.textContent =
            'Speicherung nicht verfügbar — bitte exportieren.';

        updateDraftStatus(false);
    }
}
load();
// NOTIZ SPEICHERN: Änderungen automatisch im Browser sichern 
note.addEventListener('input', () => { 
    try { 
        localStorage.setItem(getStorageKey(), note.value); 
        status.textContent = 'Lokal im Browser gespeichert.';
        updateDraftStatus(true); 
    } catch (e) { 
        status.textContent = 'Nicht gespeichert — bitte als Text exportieren.';
        updateDraftStatus(false); 
    } 
}); 
// MODUSWECHSEL: Zwischen Tagesnotiz und Quick Notes umschalten
quickButton.addEventListener('click', () => {
    isNewNoteMode = false;
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
    
    if (isNewNoteMode) {
        isNewNoteMode = false;
        isQuickMode = false;
        noteLabel.textContent = 'Meine Tagesnotiz';
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
 // TXT-EXPORT: Dateiname an den Notizmodus anpassen
document.querySelector('#export').addEventListener('click', () => {

    let exportTitle;
    let fileName;

    if (isNewNoteMode) {
        exportTitle = 'Neue Lernnotiz';
        fileName = 'Neue-Lernnotiz.txt';

    } else if (isQuickMode) {
        exportTitle = 'Meine Quick Notes';
        fileName = 'Quick-Notes.txt';

    } else {
        exportTitle = 'Meine Tagesnotiz — ' + day.value;
        fileName = 'Tagesnotiz-' + day.value + '.txt';
    }

    const blob = new Blob(
        [exportTitle + '\n\n' + note.value + '\n'],
        { type: 'text/plain;charset=utf-8' }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
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
// OVERLAY: Schließen nur nach Prüfung
overlayClose.addEventListener('click', () => {

    if (!canLeaveArchiveEdit()) return;

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

 // REVIEW: Archiv öffnen
const reviewButton = document.querySelector('#review-open');

function openReview() {
    // Andere Ansichten ausblenden
    ['topic-view', 'learning-view', 'manage-view', 'save-note-view']
        .forEach(id => document.getElementById(id).hidden = true);

    // Review anzeigen
    document.querySelector('#review-view').hidden = false;

    document.querySelector('#overlay-title').textContent =
        'Review – Mein Lernarchiv';

    // Immer zunächst die Notizensammlung öffnen
    reviewTopicFilter.value = 'all';
    showReviewTab('notes');

    momoOverlay.showModal();
}
reviewButton.addEventListener('click', openReview);

 // NOTIZWERKZEUGE: Manuelles Speichern
const saveNoteButton = document.querySelector('#save-note-open');
const saveNoteView = document.querySelector('#save-note-view');
const saveNoteForm = document.querySelector('#save-note-form');
const saveNoteTopic = document.querySelector('#save-note-topic');

// Speicherfenster öffnen
saveNoteButton.addEventListener('click', () => {

    if (!note.value.trim()) {
        alert('Bitte schreibe zuerst eine Notiz.');
        return;
    }

    // Gespeicherte Lernthemen laden
    let topics;

    try {
        topics = JSON.parse(
            localStorage.getItem('momo-topics-v1') || '[]'
        );
    } catch (error) {
        alert('Die Lernthemen konnten nicht geladen werden.');
        return;
    }

    if (!Array.isArray(topics) || topics.length === 0) {
        alert('Bitte erstelle zuerst ein Lernthema.');
        return;
    }

    // Formular und Themenauswahl vorbereiten
    saveNoteForm.reset();
    saveNoteTopic.replaceChildren();

    topics.forEach(topic => {
        const option = new Option(topic.name, String(topic.id));
        saveNoteTopic.add(option);
    });

    // Andere Overlay-Ansichten ausblenden
    ['topic-view', 'learning-view', 'manage-view', 'review-view']
        .forEach(id => {
            document.getElementById(id).hidden = true;
        });

    saveNoteView.hidden = false;

    document.querySelector('#overlay-title').textContent =
        'Notiz speichern';

    momoOverlay.showModal();
});
// Beim Schließen Bearbeitungsansichten zurücksetzen
momoOverlay.addEventListener('close', () => {
    saveNoteView.hidden = true;
    finishArchiveEdit();
});

 // XP-SYSTEM: Punkte für archivierte Lernnotizen
const xpPerSavedNote = 10;

function awardNoteXp(topicId) {

    // Alle gespeicherten Lernthemen laden
    const topics = JSON.parse(
        localStorage.getItem('momo-topics-v1') || '[]'
    );

    if (!Array.isArray(topics)) {
        throw new Error('Ungültige Lernthemen');
    }

    // Das passende Lernthema suchen
    const topic = topics.find(item =>
        String(item.id) === String(topicId)
    );

    if (!topic) {
        throw new Error('Lernthema nicht gefunden');
    }
    
    // XP dürfen über die höchste Rangstufe hinaus gesammelt werden
    const oldXp = Math.max(0, Number(topic.xp) || 0);

    // Neue XP berechnen
    const newXp = oldXp + xpPerSavedNote;

    // Fortschritt speichern
    topic.xp = newXp;

    localStorage.setItem(
        'momo-topics-v1',
        JSON.stringify(topics)
    );

    // Fortschrittsbalken aktualisieren
    renderTopics();

    // Tatsächlich verdiente XP zurückgeben
    return newXp - oldXp;
}
// Formular absenden und Lernnotiz speichern
saveNoteForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = document.querySelector('#save-note-title').value.trim();
    const text = note.value.trim();
    const topicId = Number(saveNoteTopic.value);

    if (!title || !text || !Number.isSafeInteger(topicId)) {
        alert('Bitte fülle alle Pflichtfelder aus.');
        return;
    }

    try {
        const savedNotes = JSON.parse(
            localStorage.getItem('momo-saved-notes-v1') || '[]'
        );

        if (!Array.isArray(savedNotes)) {
            throw new Error('Ungültige Notizensammlung');
        }

        const newNote = {
            id: Date.now(),
            title: title,
            text: text,
            topicId: topicId,
            date: day.value,
            createdAt: new Date().toISOString(),
            mode: isNewNoteMode ? 'new' : (isQuickMode ? 'quick' : 'daily'),
            xpReward: xpPerSavedNote

        };

        savedNotes.push(newNote);

        localStorage.setItem(
            'momo-saved-notes-v1',
            JSON.stringify(savedNotes)
        );
        // XP erst nach erfolgreicher Archivspeicherung vergeben
        let earnedXp = null;

        try {
            earnedXp = awardNoteXp(topicId);
        
        } catch (error) {

            // Falls die XP-Vergabe fehlschlägt,
            // darf die Notiz keine verdienten XP behaupten.
            newNote.xpReward = 0;

            try {
                localStorage.setItem(
                    'momo-saved-notes-v1',
                    JSON.stringify(savedNotes)
                );
            } catch (rollbackError) {
                console.error(
                    'XP-Metadaten konnten nicht korrigiert werden:',
                    rollbackError
                );
            }

            console.warn(
                'Notiz gespeichert, aber XP-Vergabe fehlgeschlagen:',
                error
            );
        }
        // Nach erfolgreicher Speicherung neuen Entwurf leeren
        if (isNewNoteMode) {
            try {
                localStorage.removeItem(newNoteDraftKey);
                note.value = '';

                // Erfolgreich im Lernarchiv abgelegt
                draftStatus.textContent =
                    '✅ Lernnotiz im Archiv gespeichert – bereit für die nächste Notiz.';

            } catch (error) {
                console.warn('Entwurf konnte nicht geleert werden:', error);
            }
        }        
        status.textContent = earnedXp === null
            ? 'Notiz gespeichert, aber XP konnten nicht vergeben werden.'
            : `Lernnotiz gespeichert! +${earnedXp} XP`;


        momoOverlay.close();

        } catch (error) {
            console.error('Speicherfehler:', error);
            alert('Die Lernnotiz konnte nicht gespeichert werden.');
    }
});

 // REVIEW: Notizen anzeigen und Reiter wechseln
const reviewTabNotes = document.querySelector('#review-tab-notes');
const reviewTabRepeat = document.querySelector('#review-tab-repeat');
const reviewNotesPanel = document.querySelector('#review-notes-panel');
const reviewRepeatPanel = document.querySelector('#review-repeat-panel');
const reviewTopicFilter = document.querySelector('#review-topic-filter');
const reviewNotesList = document.querySelector('#review-notes-list');
const reviewNoteDetail = document.querySelector('#review-note-detail');

// Zwischen den Reitern umschalten
function showReviewTab(tab) {
    const showNotes = tab === 'notes';

    reviewNotesPanel.hidden = !showNotes;
    reviewRepeatPanel.hidden = showNotes;

    reviewTabNotes.setAttribute('aria-pressed', String(showNotes));
    reviewTabRepeat.setAttribute('aria-pressed', String(!showNotes));

    if (showNotes) renderSavedNotes();
}

// Gespeicherte Notizen im Lernarchiv anzeigen
function renderSavedNotes() {
    const oldFilter = reviewTopicFilter.value;

    reviewNotesList.replaceChildren();
    reviewNoteDetail.hidden = true;

    let topics, notes;

    try {
        topics = JSON.parse(
            localStorage.getItem('momo-topics-v1') || '[]'
        );

        notes = JSON.parse(
            localStorage.getItem('momo-saved-notes-v1') || '[]'
        );

        if (!Array.isArray(topics) || !Array.isArray(notes)) {
            throw new Error('Ungültige gespeicherte Daten');
        }
    } catch (error) {
        console.error('Review konnte nicht geladen werden:', error);
        reviewNotesList.textContent =
            'Notizen konnten nicht geladen werden.';
        return;
    }

    // Themenauswahl aufbauen
    reviewTopicFilter.replaceChildren(
        new Option('Alle Themen', 'all')
    );

    topics.forEach(topic => {
        reviewTopicFilter.add(
            new Option(topic.name, String(topic.id))
        );
    });

    // Bisherige Filterauswahl beibehalten
    if ([...reviewTopicFilter.options].some(
        option => option.value === oldFilter
    )) {
        reviewTopicFilter.value = oldFilter;
    }

    // Notizen nach Thema filtern
    const filteredNotes = notes.filter(saved =>
        reviewTopicFilter.value === 'all' ||
        String(saved.topicId) === reviewTopicFilter.value
    ).slice().reverse();

    if (filteredNotes.length === 0) {
        reviewNotesList.textContent =
            'Hier sind noch keine Notizen gespeichert.';
        return;
    }

    // Für jede Notiz einen anklickbaren Eintrag erstellen
    filteredNotes.forEach(saved => {
        const linkedTopic = topics.find(topic =>
            String(topic.id) === String(saved.topicId)
        );

        const entry = document.createElement('button');
        entry.type = 'button';
        entry.className = 'review-note-entry';

        const title = document.createElement('strong');
        title.textContent = saved.title || 'Ohne Titel';

        const info = document.createElement('span');
        info.textContent =
            `${linkedTopic?.name ?? 'Gelöschtes Thema'} · ${saved.date || 'Ohne Datum'}`;

        entry.append(title, info);
        
        // Notiz öffnen oder wieder einklappen
        entry.addEventListener('click', () => {

            const isAlreadyOpen =
                !reviewNoteDetail.hidden &&
                reviewNoteDetail.dataset.noteId === String(saved.id);

            // Dieselbe Notiz erneut angeklickt: schließen
            if (isAlreadyOpen) {
                reviewNoteDetail.hidden = true;
                delete reviewNoteDetail.dataset.noteId;
                return;
            }

            // Ausgewählte Notiz öffnen
            reviewNoteDetail.dataset.noteId = String(saved.id);
            reviewNoteDetail.hidden = false;

            document.querySelector('#review-note-title').textContent =
                saved.title || 'Ohne Titel';

            document.querySelector('#review-note-text').textContent =
                saved.text || '';
        });


        reviewNotesList.append(entry);
    });
}

// Bedienelemente verbinden
reviewTabNotes.addEventListener('click', () =>
    showReviewTab('notes')
);

reviewTabRepeat.addEventListener('click', () =>
    showReviewTab('repeat')
);

reviewTopicFilter.addEventListener('change', renderSavedNotes);

document.querySelector('#my-notes-open')
    .addEventListener('click', openReview);

 // NEUE NOTIZ: Eigenständigen Entwurf öffnen
const newNoteButton = document.querySelector('#new-note');

newNoteButton.addEventListener('click', () => {

    // Eigenständigen Notizmodus aktivieren
    isNewNoteMode = true;
    isQuickMode = false;

    // Überschrift ändern
    noteLabel.textContent = 'Neue Lernnotiz';

    // Eigenen Entwurf laden
    load();

    // Schreibfeld aktivieren
    note.focus();
});

// TAGESNOTIZ: Zum normalen Notizmodus zurückkehren
const dailyModeButton = document.querySelector('#daily-mode');

dailyModeButton.addEventListener('click', () => {

    // Andere Notizmodi verlassen
    isNewNoteMode = false;
    isQuickMode = false;

    // Überschrift aktualisieren
    noteLabel.textContent = 'Meine Tagesnotiz';

    // Tagesnotiz des ausgewählten Datums laden
    load();

    // Cursor in das Textfeld setzen
    note.focus();
});

// ARCHIV: Bestehende Notizen bearbeiten und exportieren
const archiveReadView = document.querySelector('#review-note-read');
const archiveEditForm = document.querySelector('#review-edit-form');
const archiveEditTitle = document.querySelector('#review-edit-title');
const archiveEditTopic = document.querySelector('#review-edit-topic');
const archiveEditText = document.querySelector('#review-edit-text');

// Gespeicherte Archivnotizen einlesen
function readArchiveNotes() {
    const notes = JSON.parse(
        localStorage.getItem('momo-saved-notes-v1') || '[]'
    );

    if (!Array.isArray(notes)) {
        throw new Error('Ungültiges Lernarchiv');
    }

    return notes;
}
 // ARCHIV: Ungespeicherte Änderungen erkennen
function canLeaveArchiveEdit() {

    // Keine Bearbeitung aktiv: Schließen erlauben
    if (archiveEditForm.hidden) return true;

    try {
        // Ursprüngliche Notiz aus dem Archiv lesen
        const original = readArchiveNotes().find(saved =>
            String(saved.id) === reviewNoteDetail.dataset.noteId
        );

        if (!original) {
            return confirm(
                'Die ursprüngliche Notiz wurde nicht gefunden. Bearbeitung verwerfen?'
            );
        }

        // Prüfen, ob Titel, Text oder Thema geändert wurden
        const hasChanges =
            archiveEditTitle.value !== (original.title || '') ||
            archiveEditText.value !== (original.text || '') ||
            archiveEditTopic.value !== String(original.topicId);

        // Nur bei Änderungen eine Warnung anzeigen
        return !hasChanges || confirm(
            'Du hast ungespeicherte Änderungen. Wirklich verwerfen?'
        );

    } catch (error) {
        console.error('Archivprüfung fehlgeschlagen:', error);

        return confirm(
            'Die Änderungen konnten nicht geprüft werden. Wirklich verwerfen?'
        );
    }
}
// Nach Bearbeiten oder Abbrechen Leseansicht herstellen
function finishArchiveEdit() {
    archiveEditForm.hidden = true;
    archiveReadView.hidden = false;
    reviewNotesList.hidden = false;
    reviewTopicFilter.disabled = false;
    reviewTabNotes.disabled = false;
    reviewTabRepeat.disabled = false;
}

// Vorhandene Notiz zum Bearbeiten öffnen
document.querySelector('#review-edit-open')
    .addEventListener('click', () => {

    try {
        const saved = readArchiveNotes().find(item =>
            String(item.id) === reviewNoteDetail.dataset.noteId
        );

        if (!saved) throw new Error('Notiz nicht gefunden');

        const topics = JSON.parse(
            localStorage.getItem('momo-topics-v1') || '[]'
        );

        if (!Array.isArray(topics)) {
            throw new Error('Ungültige Lernthemen');
        }

        // Vorhandene Inhalte eintragen
        archiveEditTitle.value = saved.title || '';
        archiveEditText.value = saved.text || '';

        // Lernthemen vorbereiten
        archiveEditTopic.replaceChildren();

        topics.forEach(topic => {
            archiveEditTopic.add(
                new Option(topic.name, String(topic.id))
            );
        });

        // Auch ehemals gelöschte Themen berücksichtigen
        if (!topics.some(topic =>
            String(topic.id) === String(saved.topicId))) {
            archiveEditTopic.add(
                new Option('Gelöschtes Thema', String(saved.topicId))
            );
        }

        archiveEditTopic.value = String(saved.topicId);

        // In den Bearbeitungsmodus wechseln
        archiveReadView.hidden = true;
        archiveEditForm.hidden = false;

        // Währenddessen andere Navigation sperren
        reviewNotesList.hidden = true;
        reviewTopicFilter.disabled = true;
        reviewTabNotes.disabled = true;
        reviewTabRepeat.disabled = true;

        archiveEditTitle.focus();

    } catch (error) {
        console.error('Archivbearbeitung fehlgeschlagen:', error);
        alert('Die Notiz konnte nicht geöffnet werden.');
    }
});
// ARCHIV: Bearbeitung sicher abbrechen
document.querySelector('#review-edit-cancel')
    .addEventListener('click', () => {

        if (!canLeaveArchiveEdit()) return;

        finishArchiveEdit();
    });
    // Änderungen an der vorhandenen Archivnotiz speichern
    archiveEditForm.addEventListener('submit', event => {
    event.preventDefault();

    const title = archiveEditTitle.value.trim();
    const text = archiveEditText.value.trim();
    const topicId = Number(archiveEditTopic.value);

    if (!title || !text || !Number.isSafeInteger(topicId)) {
        alert('Bitte Titel, Thema und Notiztext ausfüllen.');
        return;
    }

    try {
        const notes = readArchiveNotes();
        const id = reviewNoteDetail.dataset.noteId;

        const index = notes.findIndex(item =>
            String(item.id) === id
        );

        if (index === -1) {
            throw new Error('Notiz nicht gefunden');
        }
        
            // XP-UMBUCHUNG: Punkte beim Themenwechsel übertragen
            const original = notes[index];
            const reward = Number(original.xpReward ?? 0);

            let changedTopics = null;

            // Prüfen, ob der gespeicherte XP-Wert gültig ist
            if (!Number.isSafeInteger(reward) || reward < 0) {
                throw new Error('Ungültiger XP-Wert der Notiz');
            }

            // Nur umbuchen, wenn Thema geändert UND XP vorhanden
            if (
                String(original.topicId) !== String(topicId) &&
                reward > 0
            ) {
                const topics = JSON.parse(
                    localStorage.getItem('momo-topics-v1') || '[]'
                );

                if (!Array.isArray(topics)) {
                    throw new Error('Ungültige Lernthemen');
                }

                // Ursprüngliches und neues Thema suchen
                const oldTopic = topics.find(topic =>
                    String(topic.id) === String(original.topicId)
                );

                const newTopic = topics.find(topic =>
                    String(topic.id) === String(topicId)
                );

                if (!oldTopic || !newTopic) {
                    throw new Error('Lernthema nicht gefunden');
                }

                const oldXp = Number(oldTopic.xp);
                const newXp = Number(newTopic.xp);

                // Keine negativen oder ungültigen XP zulassen
                if (
                    !Number.isSafeInteger(oldXp) ||
                    !Number.isSafeInteger(newXp) ||
                    oldXp < reward ||
                    newXp < 0
                ) {
                    throw new Error('XP können nicht sicher übertragen werden');
                }

                // XP umbuchen
                oldTopic.xp = oldXp - reward;
                newTopic.xp = newXp + reward;

                changedTopics = topics;
            }

        // Bestehenden Eintrag aktualisieren
        notes[index] = {
            ...notes[index],
            title,
            text,
            topicId,
            updatedAt: new Date().toISOString()
        };

        
 // Vorherige Daten für den Fehlerfall sichern
const notesBackup = localStorage.getItem(
    'momo-saved-notes-v1'
);

const topicsBackup = localStorage.getItem(
    'momo-topics-v1'
);

    try {
        // Bearbeitete Notiz speichern
        localStorage.setItem(
            'momo-saved-notes-v1',
            JSON.stringify(notes)
        );

        // Bei Themenwechsel auch die neuen XP speichern
        if (changedTopics) {
            localStorage.setItem(
                'momo-topics-v1',
                JSON.stringify(changedTopics)
            );
        }

    } catch (saveError) {

        // Falls Speichern fehlschlägt: alte Daten wiederherstellen
        try {
            if (notesBackup === null) {
                localStorage.removeItem('momo-saved-notes-v1');
            } else {
                localStorage.setItem(
                    'momo-saved-notes-v1',
                    notesBackup
                );
            }

            if (changedTopics) {
                if (topicsBackup === null) {
                    localStorage.removeItem('momo-topics-v1');
                } else {
                    localStorage.setItem(
                        'momo-topics-v1',
                        topicsBackup
                    );
                }
            }

        } catch (restoreError) {
            console.error(
                'Wiederherstellung fehlgeschlagen:',
                restoreError
            );
        }

        throw saveError;
    }

    // Fortschrittsbalken nach der Umbuchung aktualisieren
    if (changedTopics) {
        renderTopics();
    }
        finishArchiveEdit();

        // Bei Themenwechsel gegebenenfalls Filter zurücksetzen
        if (reviewTopicFilter.value !== 'all' &&
            reviewTopicFilter.value !== String(topicId)) {
            reviewTopicFilter.value = 'all';
        }

        // Archivansicht aktualisieren
        renderSavedNotes();

        reviewNoteDetail.dataset.noteId = id;
        reviewNoteDetail.hidden = false;

        document.querySelector('#review-note-title')
            .textContent = title;

        document.querySelector('#review-note-text')
            .textContent = text;

    } catch (error) {
        console.error('Änderungen konnten nicht gespeichert werden:', error);
        alert('Die Notiz konnte nicht aktualisiert werden.');
    }
});

// Einzelne Archivnotiz als TXT exportieren
document.querySelector('#review-export-note')
    .addEventListener('click', () => {

    try {
        const saved = readArchiveNotes().find(item =>
            String(item.id) === reviewNoteDetail.dataset.noteId
        );

        if (!saved) throw new Error('Notiz nicht gefunden');

        // Ungültige Zeichen aus dem Dateinamen entfernen
        const safeTitle = (saved.title || 'Lernnotiz')
            .replace(/[\\/:*?"<>|]/g, '-')
            .slice(0, 70) || 'Lernnotiz';

        const content =
            `${saved.title}\n${saved.date || ''}\n\n${saved.text}\n`;

        const blob = new Blob(
            [content],
            { type: 'text/plain;charset=utf-8' }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = safeTitle + '.txt';
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (error) {
        console.error('TXT-Export fehlgeschlagen:', error);
        alert('Diese Notiz konnte nicht exportiert werden.');
    }
});
// ESCAPE: Ungespeicherte Änderungen schützen
momoOverlay.addEventListener('cancel', event => {

    if (!canLeaveArchiveEdit()) {
        event.preventDefault();
    }
});

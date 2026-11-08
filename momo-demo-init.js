/* Momo Lunchbox – Demo-Daten beim ersten Start laden.
 * Einbindung in index.html, vor script.js:
 *   <script src="momo-demo-data.js"></script>
 *   <script src="momo-demo-init.js"></script>
 *   <script src="script.js"></script>
 *
 * momo-demo-data.js wird aus den fertig erfassten Beispieldaten erzeugt.
 * Bereits vorhandene Nutzerdaten werden NICHT ueberschrieben.
 */
(() => {
    'use strict';

    const demo = window.MOMO_DEMO_DATA;
    if (!demo || typeof demo !== 'object' || Array.isArray(demo)) {
        return;
    }

    const topicKey = 'momo-topics-v1';
    const noteKey = 'momo-saved-notes-v1';
    const quickKey = 'momo-quick-draft-v1';
    const journalPrefix = 'meine-tagesnotiz-v1:';
    const migrationKey = 'momo-linux-import-v1';

    try {
        // Wenn in diesem Browser bereits Inhalte vorhanden sind, keine Demo importieren.
        const hasExistingContent = [topicKey, noteKey, quickKey].some(
            key => localStorage.getItem(key) !== null
        ) || Object.keys(localStorage).some(key => key.startsWith(journalPrefix));

        if (hasExistingContent) {
            return;
        }

        // Nur bekannte Datentypen verwenden (keine fremden Storage-Werte laden).
        const demoKeys = Object.keys(demo).filter(key =>
            key === topicKey ||
            key === noteKey ||
            key === quickKey ||
            key.startsWith(journalPrefix)
        );

        // Ohne Themen oder Notizen kein sinnvoller Demo-Import.
        if (!demoKeys.includes(topicKey) || !demoKeys.includes(noteKey)) {
            console.warn('Momo: Demo-Datei enthaelt keine vollstaendigen Lerndaten.');
            return;
        }

        // Vor der Uebernahme kontrollieren, dass die JSON-Daten lesbar sind.
        const topics = JSON.parse(demo[topicKey]);
        const notes = JSON.parse(demo[noteKey]);
        if (!Array.isArray(topics) || !Array.isArray(notes)) {
            console.warn('Momo: Ungueltiges Demo-Datenformat.');
            return;
        }

        const changedKeys = [];
        try {
            for (const key of demoKeys) {
                if (typeof demo[key] === 'string') {
                    localStorage.setItem(key, demo[key]);
                    changedKeys.push(key);
                }
            }
            // Verhindert, dass die Alt-Linux-Migration erneut Punkte/Themen anlegt.
            localStorage.setItem(migrationKey, 'done');
            changedKeys.push(migrationKey);
            console.info('Momo: Beispieldaten fuer die Demo geladen.');
        } catch (error) {
            // Wenn der Import nicht vollstaendig gelingt, die Teilimporte entfernen.
            for (const key of changedKeys) {
                try { localStorage.removeItem(key); } catch (_) { /* ohne Zugriff */ }
            }
            console.warn('Momo: Demo-Daten konnten nicht vollstaendig geladen werden.', error);
        }
    } catch (error) {
        console.warn('Momo: Demo-Initialisierung nicht verfuegbar.', error);
    }
})();

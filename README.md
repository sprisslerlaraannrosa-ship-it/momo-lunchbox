<div align="center">
  <img src="momo-mini.png" alt="Momo – das Katzenmaskottchen" width="115">
  <h1>🐾 Momo Lunchbox</h1>
  <p><strong>Mein kleiner Learning Companion für Notizen, Lernthemen und Motivation.</strong></p>
  <p><code>HTML</code> · <code>CSS</code> · <code>JavaScript</code> · <code>localStorage</code></p>
  <p><strong>Projektstatus: Demo 0.1 · Stand: November 2026</strong></p>
</div>

---

## 💜 Die Idee hinter Momo

Momo Lunchbox ist mein persönliches Lernprojekt, das ich während meiner Umschulung zur **Fachinformatikerin für Anwendungsentwicklung** entwickle.

Ich wollte einen Ort schaffen, an dem ich Gedanken schnell festhalten, Lernnotizen übersichtlich sortieren und meinen Fortschritt sichtbar machen kann – ohne mich erst durch komplizierte Menüs arbeiten zu müssen. Daraus ist ein kleines Dashboard im Lunchbox-Design entstanden, begleitet von Momo, meinem Katzenmaskottchen.

Mein Grundgedanke: **Festhalten → Verstehen → Wiederholen.**

Die Anwendung ist bewusst noch ein Prototyp. Ich entwickle sie Schritt für Schritt weiter und nutze das Projekt, um HTML, CSS und vor allem JavaScript praktisch zu lernen.

## ✨ Was die aktuelle Demo bereits kann

| Bereich | Funktion |
| --- | --- |
| 📅 **Tagesnotizen** | Notizen einem Datum zuordnen und während der Eingabe lokal speichern. |
| 📝 **Neue Lernnotizen** | Notizen mit Titel erstellen und einem Lernthema zuweisen. |
| 📚 **Lernarchiv** | Gespeicherte Notizen öffnen, nach Thema filtern, bearbeiten und einzeln als TXT exportieren. |
| 🗂️ **Lernthemen** | Eigene Themen mit Tags anlegen, bearbeiten und verwalten. Bis zu vier Themen können im Dashboard angeheftet werden. |
| ⭐ **XP & Ränge** | Für archivierte Lernnotizen XP sammeln. Pro Thema werden Rang, Fortschrittsbalken und fehlende XP bis zum nächsten Rang berechnet. |
| 🔄 **XP-Umbuchung** | Wird eine archivierte Notiz einem anderen Thema zugeordnet, werden ihre bereits vergebenen XP vom alten zum neuen Thema übertragen. |
| 🐱 **Dashboard** | Responsives Layout mit eigenen Grafiken und einer farblich abgestimmten hellen bzw. dunklen Darstellung gemäß Systemeinstellung. |
| ⬇️ **Export** | Aktuellen Notiztext und einzelne Archivnotizen als Textdatei herunterladen. |

**Wichtig:** Die Karten **Learning Questions** und **Wiederholen** sind bislang Entwürfe bzw. Platzhalter. Ein vollständiges Karteikarten- und Wiederholungssystem ist noch nicht implementiert.

## 🚀 Demo ausprobieren

Für die aktuelle Version ist **kein Konto, keine Datenbank und kein API-Schlüssel** notwendig.

1. Das Repository herunterladen (**Code → Download ZIP**) oder klonen.
2. Den Projektordner öffnen.
3. `index.html` im Browser öffnen. Für einen möglichst zuverlässigen lokalen Test empfehle ich einen kleinen Webserver, beispielsweise die Erweiterung **Live Server** in VS Code.
4. In einem neuen Browserprofil bzw. privaten Fenster werden beim ersten Start die mitgelieferten Beispieldaten geladen.
5. Lernthemen öffnen, Notizen lesen, eigene Einträge erstellen und das XP-System ausprobieren.

### Was ist in der Demo enthalten?

Die Beispieldaten zeigen vier Lernthemen – **Java Script, Linux, Netzwerke und Momo-Lunchbox** – mit insgesamt **acht archivierten Lernnotizen** und einigen fiktiven Tagebucheinträgen. So lässt sich die Anwendung direkt erkunden, ohne zuerst alles selbst ausfüllen zu müssen.

Die Daten liegen in `momo-demo-data.js`. Das Skript `momo-demo-init.js` übernimmt sie beim ersten Start **nur dann**, wenn noch keine relevanten Momo-Daten im aktuellen Browserspeicher vorhanden sind. **Bestehende Notizen werden nicht überschrieben.**

> **Hinweis zur Datenspeicherung:** Momo verwendet derzeit `localStorage`. Daten bleiben nach dem Neuladen der Seite erhalten, sind aber an den jeweiligen Browser und dessen Herkunft (Origin) gebunden. Es gibt noch keine Synchronisierung mit anderen Geräten oder eine automatische Cloud-Sicherung. Wer Browserdaten löscht, kann dadurch eigene Notizen verlieren.

## 🛠️ Technik und Projektaufbau

Ich verwende bewusst zunächst **Vanilla JavaScript**, also keine Frameworks. Dadurch kann ich die Grundlagen und das Zusammenspiel der einzelnen Bestandteile besser nachvollziehen.

- **HTML5:** Aufbau von Dashboard, Formularen und Dialogfenstern.
- **CSS3:** Layout mit Grid und Flexbox, responsive Gestaltung und Farbvariablen.
- **JavaScript:** Ereignisbehandlung, DOM-Manipulation, Validierung, XP-Berechnung und Themenverwaltung.
- **localStorage / JSON:** Lokale Speicherung von Notizen, Themen und XP-Werten.
- **Git & GitHub:** Versionsverwaltung und Dokumentation des Entwicklungsfortschritts.

```text
momo-lunchbox/
├── index.html             # Oberfläche und Dialoge
├── style.css              # Design und responsives Layout
├── script.js              # Anwendungslogik
├── momo-demo-data.js      # Öffentliche Beispieldaten für die Demo
├── momo-demo-init.js      # Einmaliger Import in leeren Browserspeicher
├── momo.png               # Momo-Maskottchen
├── momo-mini.png          # Kleines Momo-Logo
├── momo-pfote.png         # Pfoten-Logo
├── momo-quick.png         # Illustration: Quick Notes
├── momo-questions.png     # Illustration: Learning Questions
├── momo-review.png        # Illustration: Review
└── README.md              # Diese Projektbeschreibung
```

Die drei JavaScript-Dateien werden in der `index.html` in dieser Reihenfolge eingebunden:

```html
<script src="momo-demo-data.js"></script>
<script src="momo-demo-init.js"></script>
<script src="script.js"></script>
```

**Warum?** Erst müssen die Beispieldaten bereitstehen, dann kann Momo sie bei Bedarf in den Browserspeicher laden. Anschließend startet die eigentliche Anwendungslogik und liest die Daten aus.

## 🧠 Eine Herausforderung: XP richtig umbuchen

Ein Problem ist beim nachträglichen Bearbeiten von Lernnotizen aufgetaucht: Wenn ich eine Notiz einem anderen Lernthema zugewiesen habe, blieb ihre XP-Belohnung zunächst beim alten Thema.

Die Lösung war eine Umbuchungslogik:

1. Prüfen, ob sich die Themen-ID tatsächlich geändert hat.
2. Die ursprünglich verdienten XP aus `xpReward` der Notiz auslesen.
3. Das alte und das neue Thema anhand ihrer IDs finden.
4. Die XP beim alten Thema abziehen und beim neuen Thema hinzufügen.
5. Die Änderungen speichern und die Themenanzeige aktualisieren.

So entstehen beim Verschieben keine zusätzlichen XP. Die Speicherung enthält außerdem eine Fehlerbehandlung mit einem Wiederherstellungsversuch, falls ein Speicherschritt fehlschlägt.

Gerade an solchen Problemen lerne ich viel: Nicht nur *dass* eine Funktion läuft, sondern auch, wie Daten zusammenhängen und welche Sonderfälle ich berücksichtigen muss.

## 🗺️ Was ich als Nächstes plane

Die folgenden Funktionen sind **Ideen für spätere Versionen** und noch nicht Bestandteil der aktuellen Demo:

- **Animierte Momo:** Das Maskottchen soll auf Eingaben, Lernaktivitäten und Rangaufstiege reagieren.
- **Karteikarten & Wiederholungen:** Eigene Fragen mit Vorder- und Rückseite, Selbstkontrolle und später sinnvolle Wiederholungsintervalle.
- **„Momo, sortier das für mich“:** Eine KI soll ungeordnete Notizen korrigieren, strukturieren und passende Titel, Tags sowie offene Lernfragen vorschlagen. Sie soll **keine Fakten erfinden**; vor dem Speichern ist eine kontrollierbare Vorschau vorgesehen.
- **Notion-Anbindung:** Lernnotizen und Themen langfristig über die Notion-API mit einer zentralen Datenbasis verbinden.
- **Sicheres Backend:** KI- und Notion-Zugänge nicht im öffentlichen Browsercode speichern.
- **Mehr Gamification:** XP für echte Lernaktivitäten und Wiederholungen statt ausschließlich für das Archivieren von Notizen.
- **Bessere Notizformatierung:** Überschriften, Hervorhebungen und strukturierte Texte.
- **Weitere Einstellungen:** Manueller Theme-Wechsel und umfassendere Import-/Exportmöglichkeiten.

## 🌱 Warum ich dieses Projekt entwickle

Momo ist für mich Lernwerkzeug **und** Programmierübung zugleich. Ich kann eigene Ideen direkt ausprobieren, Fehler nachvollziehen, Lösungen testen und die Anwendung Stück für Stück verbessern.

Dabei lege ich Wert darauf, meinen Code zu verstehen und technische Entscheidungen erklären zu können. Zum Lernen nutze ich neben Unterrichtsunterlagen und dem Austausch mit anderen auch KI-Unterstützung, zum Beispiel zum Strukturieren von Ideen, Erklären neuer Konzepte und zur Fehlersuche.

**Momo Lunchbox ist noch nicht fertig – und genau das macht das Projekt für mich so spannend.** 🐾

---

*Die mitgelieferten Tagebuch- und Lernbeispiele dienen ausschließlich der Demonstration. Eine echte KI- oder Notion-Verbindung ist in Demo 0.1 noch nicht enthalten.*

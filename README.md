<div align="center">

# 🏋️ GymLog

**Dein täglicher Trainingsbegleiter – einfach, schnell, effektiv.**

![Version](https://img.shields.io/badge/version-1.0.0-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/status-in%20development-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Mobile-blue?style=for-the-badge)

<br/>

> Kein Account. Kein Server. Keine Ablenkung.  
> Einfach aufmachen – und loslegen.

<br/>

</div>

---

## 📖 Über das Projekt

**GymLog** ist eine minimalistische Trainings-Tracking-App, die direkt im Browser läuft. Keine Registrierung, keine Cloud, keine Kompromisse beim Datenschutz – alle Daten bleiben lokal auf deinem Gerät gespeichert.

Designed für Menschen, die täglich trainieren und sich nicht mit komplizierten Apps aufhalten wollen. Eintragen, nachschauen, besser werden.

---

## ✨ Features

| Feature | Beschreibung |
|---|---|
| 🏃 **Schnelleintrag** | Training starten mit einem Klick – Übungen, Sätze & Gewicht direkt eintragen |
| 📋 **Verlaufsansicht** | Alle vergangenen Trainings nach Datum sortiert |
| 📈 **Fortschritt** | Gewichtsverlauf pro Übung als Diagramm |
| 🔁 **Vorlagen** | Letzte Übungen mit einem Tap wiederholen |
| 🏆 **Persönliche Rekorde** | Automatische PR-Erkennung |
| 🌙 **Dark Mode** | Standardmäßig aktiv – perfekt fürs Gym |
| 📴 **Offline-fähig** | Funktioniert ohne Internetverbindung |

---

## 📱 Screenshots

> *Coming soon – App ist aktuell in Entwicklung*

---

## 🚀 Quickstart

Da die App als einzelne Datei gebaut ist, brauchst du **kein Setup**:

```bash
# Repository klonen
git clone https://github.com/DEIN-USERNAME/gymlog.git

# In den Ordner wechseln
cd gymlog

# Einfach die Datei im Browser öffnen
open index.html
```

Fertig. Keine Installation, kein `npm install`, kein Server.

---

## 🛠️ Tech Stack

```
Frontend     →  HTML / CSS / JavaScript (React)
Charts       →  Recharts / Chart.js
Datenspeicher→  localStorage (100% lokal)
Hosting      →  GitHub Pages / Netlify / lokal
```

---

## 📁 Projektstruktur

```
gymlog/
│
├── index.html          ← Die gesamte App (single-file)
├── README.md           ← Diese Datei
└── LICENSE             ← MIT Lizenz
```

---

## 💾 Datenformat

Alle Trainingsdaten werden lokal im Browser gespeichert:

```json
{
  "trainings": [
    {
      "id": "2026-05-03",
      "date": "2026-05-03",
      "exercises": [
        {
          "name": "Bankdrücken",
          "sets": [
            { "reps": 10, "weight": 60 },
            { "reps": 8,  "weight": 65 },
            { "reps": 6,  "weight": 70 }
          ]
        }
      ],
      "notes": "Starkes Training!"
    }
  ]
}
```

---

## 🗺️ Roadmap

- [x] Projektkonzept & SOP
- [ ] Grundstruktur & Navigation
- [ ] Training erfassen (Übungen, Sätze, Gewicht)
- [ ] Trainingshistorie anzeigen
- [ ] Fortschritts-Diagramme
- [ ] Persönliche Rekorde (PRs)
- [ ] Körpergewicht tracken
- [ ] Streak-Anzeige
- [ ] PWA-Support (Als App installierbar)

---

## 🤝 Mitmachen

Pull Requests sind willkommen! Für größere Änderungen bitte zuerst ein Issue öffnen.

```bash
# Fork erstellen → Branch anlegen → Änderungen committen → PR öffnen
git checkout -b feature/mein-feature
git commit -m "feat: mein neues Feature"
git push origin feature/mein-feature
```

---

## 📄 Lizenz

Dieses Projekt steht unter der **MIT Lizenz** – frei nutzbar, frei veränderbar.

---

<div align="center">

Gebaut mit 💪 für alle, die sich täglich verbessern wollen.

**⭐ Gefällt dir das Projekt? Gib einen Star!**

</div>

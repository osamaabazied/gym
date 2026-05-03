# 💪 GymLog

Ein Fitness-Tracker um Workouts und Läufe zu tracken, mit Statistiken und Cloud-Speicherung.

## ✨ Features

- **🏋️ Gym Tracking** - Übungen, Sätze, Gewichte eintragen und speichern
- **🏃 Laufen** - Stoppuhr, Distanz-Eingabe, Tempo und Kalorien werden berechnet
- **📊 Statistiken** - Workouts, Läufe und Gewichtsverlauf anzeigen
- **⏥ Streak** - Zeigt wie viele Tage hintereinander aktiv war
- **⚖️ Gewicht tracken** - Gewichtsverlauf mit Chart
- **💾 Cloud Speicherung** - Daten werden in Supabase gespeichert
- **🔐 Anmeldung** - Mit Email und Passwort

## 🛠️ Technologien

- React 19 + TypeScript
- Supabase (Datenbank)
- Tailwind CSS
- Vite (Build)

## 🚀 Installation

### Was du brauchst
- Node.js 18+
- Supabase Account (kostenlos)

### Setup

1. **Repository klonen**
```bash
git clone https://github.com/osamaabazied/gym.git
cd gym
npm install
```

2. **`.env` Datei erstellen**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. **Datenbank einrichten**

Gehe zu Supabase SQL Editor und führe das [SQL-Setup](./SQL_SETUP.md) aus

4. **App starten**
```bash
npm run dev
```

Dann öffne `http://localhost:3000` 🎉

## 📖 Bedienung

| Bereich | Was du machen kannst |
|---------|---------------------|
| **Home** | Dein Streak sehen, Woche überschauen |
| **Gym** | Trainings eintragen mit Übungen |
| **Laufen** | Lauf starten, Distanz eingeben, speichern |
| **Statistiken** | Deine Fortschritte anschauen |
| **Profil** | Gewicht tracken, Logout |

## 📝 Lizenz

MIT

---

Ein Projekt das ich in meiner Freizeit aufbaue um React und Supabase zu lernen.

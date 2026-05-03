# 💪 GymLog

A beautiful, modern fitness tracking app to log workouts and runs with real-time statistics and persistent data.

## ✨ Features

- **🏋️ Gym Tracking** - Log exercises, sets, reps, and weights
- **🏃 Running Tracker** - Live stopwatch, distance tracking, auto-calculated pace & calories  
- **📊 Real Statistics** - Actual progress tracking with charts and metrics
- **⏥ Streak Counter** - Track consecutive active days
- **⚖️ Weight Tracking** - Monitor weight progress with visual charts
- **💾 Cloud Sync** - All data persisted to Supabase
- **🔐 Secure Auth** - Email/password authentication with Row-Level Security
- **📱 Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth)
- **Charting:** Recharts
- **Build:** Vite 6

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)

### Setup

1. **Clone repo**
```bash
git clone https://github.com/osamaabazied/gym.git
cd gym
npm install
```

2. **Create `.env` file**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. **Setup Supabase Database**

Go to Supabase SQL Editor and run the [setup SQL script](./SQL_SETUP.md)

4. **Start dev server**
```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

## 📖 Usage

| Tab | Features |
|-----|----------|
| **Home** | Streak counter, weekly overview, quick start |
| **Gym** | Log exercises, sets, reps, weights |
| **Running** | Live timer, distance tracking, pace calculation |
| **Stats** | Workout count, run stats, weight charts |
| **Profile** | Weight tracking, stats, logout |

## 📝 License

MIT

---

**Built with ❤️ using React + Supabase**

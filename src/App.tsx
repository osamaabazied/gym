import { useState, useEffect, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  History as HistoryIcon,
  TrendingUp,
  User,
  Plus,
  Play,
  Check,
  ChevronRight,
  Calendar,
  Clock,
  Flame,
  Trash2,
  ChevronDown,
  X,
  PlusCircle,
  Dumbbell,
  LogOut,
  AlertCircle,
  Activity,
  Zap,
  TrendingDown
} from 'lucide-react';
import { format, parseISO, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

import { Workout, ExerciseEntry, Set, UserStats, Run } from './types';
import { COLORS, COMMON_EXERCISES, CALORIES_PER_KM } from './constants';
import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { RunningScreen } from './components/RunningScreen';
import * as db from './lib/db';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <AppContent userId={user.id} userEmail={user.email || ''} />;
}

function AppContent({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'running' | 'stats' | 'profile'>('home');
  const [isWorkingOut, setIsWorkingOut] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [weightHistory, setWeightHistory] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState('');
  const { signOut } = useAuth();

  // Load all data from Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [fetchedWorkouts, fetchedRuns, fetchedWeightHistory] = await Promise.all([
        db.fetchWorkouts(userId),
        db.fetchRuns(userId),
        db.fetchWeightHistory(userId),
      ]);
      setWorkouts(fetchedWorkouts);
      setRuns(fetchedRuns);
      setWeightHistory(fetchedWeightHistory);
      setIsLoading(false);
    };
    loadData();
  }, [userId]);

  const startNewWorkout = () => {
    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      exercises: [],
      notes: '',
    };

    setActiveWorkout(newWorkout);
    setIsWorkingOut(true);
    setSaveError(null);
  };

  const finishWorkout = async () => {
    if (!activeWorkout) return;
    if (activeWorkout.exercises.length === 0) {
      setIsWorkingOut(false);
      setActiveWorkout(null);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const saved = await db.saveWorkout(activeWorkout, userId);
    setIsSaving(false);

    if (saved) {
      setWorkouts([activeWorkout, ...workouts]);
      setIsWorkingOut(false);
      setActiveWorkout(null);
      setActiveTab('history');
    } else {
      setSaveError('Fehler beim Speichern des Trainings. Bitte versuche es später erneut.');
    }
  };

  const deleteWorkout = async (id: string) => {
    const success = await db.deleteWorkout(id);
    if (success) {
      setWorkouts(workouts.filter(w => w.id !== id));
    }
  };

  const saveWeightEntry = async () => {
    if (!newWeight || parseFloat(newWeight) <= 0) return;

    const success = await db.saveWeightEntry(userId, parseFloat(newWeight));
    if (success) {
      const newEntry: UserStats = {
        weight: parseFloat(newWeight),
        date: new Date().toISOString(),
      };
      setWeightHistory([newEntry, ...weightHistory]);
      setNewWeight('');
    }
  };

  const handleRunSaved = async () => {
    const fetchedRuns = await db.fetchRuns(userId);
    setRuns(fetchedRuns);
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[500px] mx-auto min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 pt-12 pb-24 custom-scrollbar">
        <AnimatePresence mode="wait">
          {!isWorkingOut ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'home' && (
                <HomeView
                  workouts={workouts}
                  runs={runs}
                  onStartWorkout={startNewWorkout}
                />
              )}
              {activeTab === 'history' && (
                <HistoryView
                  workouts={workouts}
                  runs={runs}
                  onDeleteWorkout={deleteWorkout}
                />
              )}
              {activeTab === 'running' && (
                <RunningScreen
                  runs={runs}
                  onRunSaved={handleRunSaved}
                  userId={userId}
                />
              )}
              {activeTab === 'stats' && (
                <StatsView
                  workouts={workouts}
                  runs={runs}
                  weightHistory={weightHistory}
                />
              )}
              {activeTab === 'profile' && (
                <ProfileView
                  userEmail={userEmail}
                  weightHistory={weightHistory}
                  newWeight={newWeight}
                  setNewWeight={setNewWeight}
                  onSaveWeight={saveWeightEntry}
                  onLogout={handleLogout}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="workout-session"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="h-full"
            >
              <WorkoutSession
                workout={activeWorkout!}
                setWorkout={setActiveWorkout}
                onFinish={finishWorkout}
                onCancel={() => setIsWorkingOut(false)}
                isSaving={isSaving}
                saveError={saveError}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {!isWorkingOut && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-background/80 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex justify-between items-center z-50">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} />} />
          <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<HistoryIcon size={22} />} />
          <div className="relative -top-8">
            <button
              onClick={startNewWorkout}
              className="w-14 h-14 bg-accent rounded-full flex items-center justify-center text-black shadow-2xl shadow-accent/20 active:scale-95 transition-transform"
            >
              <Play size={24} fill="currentColor" />
            </button>
          </div>
          <NavButton active={activeTab === 'running'} onClick={() => setActiveTab('running')} icon={<Activity size={22} />} />
          <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<TrendingUp size={22} />} />
        </nav>
      )}

      {/* Profile FAB */}
      {!isWorkingOut && (
        <button
          onClick={() => setActiveTab('profile')}
          className={`fixed bottom-8 right-6 max-w-[500px] w-12 h-12 rounded-full shadow-lg transition-all ${
            activeTab === 'profile'
              ? 'bg-accent text-black'
              : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
          }`}
        >
          <User size={20} className="mx-auto" />
        </button>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 transition-colors relative ${active ? 'text-accent' : 'text-white/40'}`}
    >
      {icon}
      {active && (
        <motion.div
          layoutId="nav-dot"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
        />
      )}
    </button>
  );
}

function HomeView({ workouts, runs, onStartWorkout }: { workouts: Workout[]; runs: Run[]; onStartWorkout: () => void }) {
  const allActivities = [...workouts, ...runs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate real streak
  const streak = useMemo(() => {
    if (allActivities.length === 0) return 0;
    let count = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);

      const hasActivity = allActivities.some(activity => {
        const actDate = new Date(activity.date);
        return isSameDay(actDate, checkDate);
      });

      if (!hasActivity && i > 0) break;
      if (hasActivity) count++;
    }
    return count;
  }, [allActivities]);

  // Week view with both workouts and runs
  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  const getActivityType = (day: Date) => {
    const hasWorkout = workouts.some(w => isSameDay(parseISO(w.date), day));
    const hasRun = runs.some(r => isSameDay(parseISO(r.date), day));
    if (hasWorkout && hasRun) return 'both';
    if (hasWorkout) return 'workout';
    if (hasRun) return 'run';
    return null;
  };

  // This week stats (real data)
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const thisWeekWorkouts = workouts.filter(w => {
    const wDate = parseISO(w.date);
    return wDate >= thisWeekStart && wDate <= thisWeekEnd;
  });

  const thisWeekRuns = runs.filter(r => {
    const rDate = parseISO(r.date);
    return rDate >= thisWeekStart && rDate <= thisWeekEnd;
  });

  const totalDistance = thisWeekRuns.reduce((sum, run) => sum + run.distance_km, 0);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🔥 {streak} Tage!</h1>
          <p className="text-white/50 text-sm mt-1">Halte deinen Streak!</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-card border border-white/5 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        </div>
      </header>

      {/* Week View */}
      <div className="flex justify-between gap-2 overflow-x-auto pb-2">
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, new Date());
          const activityType = getActivityType(day);
          const hasActivity = activityType !== null;

          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-12 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all relative ${
                isToday ? 'bg-accent text-black border-accent' :
                hasActivity ? 'bg-card border-accent/30 text-white' : 'bg-card border-white/10 text-white/30'
              }`}>
                <span className="text-[10px] uppercase font-bold">{format(day, 'EEE', { locale: de })}</span>
                <span className="text-sm font-black">{format(day, 'dd')}</span>
                {activityType === 'both' && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    <div className="w-1 h-1 bg-accent rounded-full" />
                    <div className="w-1 h-1 bg-accent rounded-full" />
                  </div>
                )}
                {activityType === 'workout' && (
                  <div className="absolute bottom-1 w-1 h-1 bg-accent rounded-full" />
                )}
                {activityType === 'run' && (
                  <div className="absolute bottom-1 w-1.5 h-1 bg-accent rounded-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Button Card */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Nächste Aktivität</h2>

        <div className="bg-card rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors" />

          <div className="relative">
            <h3 className="text-xl font-bold">Training oder Laufen?</h3>
            <p className="text-white/50 text-sm mt-1">Starte jetzt deine Aktivität</p>

            <div className="mt-8 flex justify-end">
              <button
                onClick={onStartWorkout}
                className="bg-accent text-black rounded-2xl px-5 py-3 font-bold flex items-center gap-2 active:scale-95 transition-transform"
              >
                <Play size={18} fill="currentColor" />
                Gym
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* This Week Stats */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Diese Woche</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl p-4 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Dumbbell size={20} />
            </div>
            <div>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">Workouts</p>
              <p className="text-lg font-bold">{thisWeekWorkouts.length}</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">Läufe</p>
              <p className="text-lg font-bold">{thisWeekRuns.length}</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-white/5 flex items-center gap-4 col-span-2">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <TrendingDown size={20} />
            </div>
            <div>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">Gesamte Distanz</p>
              <p className="text-lg font-bold">{totalDistance.toFixed(2)} km</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function WorkoutSession({
  workout,
  setWorkout,
  onFinish,
  onCancel,
  isSaving,
  saveError
}: {
  workout: Workout;
  setWorkout: (w: Workout) => void;
  onFinish: () => void;
  onCancel: () => void;
  isSaving: boolean;
  saveError: string | null;
}) {
  const [showAddExercise, setShowAddExercise] = useState(false);

  const addExercise = (name: string) => {
    const newExercise: ExerciseEntry = {
      id: crypto.randomUUID(),
      name,
      sets: [{ id: crypto.randomUUID(), reps: 10, weight: 0 }]
    };
    setWorkout({ ...workout, exercises: [...workout.exercises, newExercise] });
    setShowAddExercise(false);
  };

  const removeExercise = (id: string) => {
    setWorkout({ ...workout, exercises: workout.exercises.filter(e => e.id !== id) });
  };

  const addSet = (exerciseId: string) => {
    const exercise = workout.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: Set = {
      id: crypto.randomUUID(),
      reps: lastSet ? lastSet.reps : 10,
      weight: lastSet ? lastSet.weight : 0
    };
    const newExercises = workout.exercises.map(e =>
      e.id === exerciseId ? { ...e, sets: [...e.sets, newSet] } : e
    );
    setWorkout({ ...workout, exercises: newExercises });
  };

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
    const newExercises = workout.exercises.map(e => {
      if (e.id === exerciseId) {
        return {
          ...e,
          sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      }
      return e;
    });
    setWorkout({ ...workout, exercises: newExercises });
  };

  const removeSet = (exerciseId: string, setId: string) => {
    const newExercises = workout.exercises.map(e => {
      if (e.id === exerciseId) {
        return { ...e, sets: e.sets.filter(s => s.id !== setId) };
      }
      return e;
    });
    setWorkout({ ...workout, exercises: newExercises });
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Aktives Training</h1>
          <p className="text-white/40 text-sm font-medium">{format(new Date(), 'EEEE, dd. MMM', { locale: de })}</p>
        </div>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </header>

      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-3"
        >
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-500 text-sm font-medium">{saveError}</p>
        </motion.div>
      )}

      <div className="space-y-4">
        {workout.exercises.map((exercise) => (
          <motion.div
            layout
            key={exercise.id}
            className="bg-card rounded-3xl p-4 border border-white/5 space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <Dumbbell size={16} />
                </div>
                <h3 className="font-bold text-lg">{exercise.name}</h3>
              </div>
              <button
                onClick={() => removeExercise(exercise.id)}
                className="p-2 text-white/20 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-[10px] uppercase font-bold text-white/30 px-2">
                <div className="text-center">Satz</div>
                <div className="text-center">Vorher</div>
                <div className="text-center">Kg</div>
                <div className="text-center">Wdh.</div>
              </div>

              {exercise.sets.map((set, setIndex) => (
                <div key={set.id} className="grid grid-cols-4 gap-2 items-center bg-white/5 rounded-xl p-2 relative group">
                  <div className="text-center font-bold text-sm">{setIndex + 1}</div>
                  <div className="text-center text-white/30 text-xs">-</div>
                  <input
                    type="number"
                    value={set.weight || ''}
                    placeholder="0"
                    onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                    className="bg-background border border-white/5 rounded-lg h-9 text-center text-sm font-bold focus:border-accent/50 outline-none w-full"
                  />
                  <input
                    type="number"
                    value={set.reps || ''}
                    placeholder="0"
                    onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                    className="bg-background border border-white/5 rounded-lg h-9 text-center text-sm font-bold focus:border-accent/50 outline-none w-full"
                  />

                  {exercise.sets.length > 1 && (
                    <button
                      onClick={() => removeSet(exercise.id, set.id)}
                      className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 rounded-full items-center justify-center flex"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={() => addSet(exercise.id)}
                className="w-full h-10 border border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-white/40 hover:bg-white/5 text-sm transition-colors mt-2"
              >
                <Plus size={16} />
                Satz hinzufügen
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => setShowAddExercise(true)}
        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-white font-bold hover:bg-white/10 transition-colors"
      >
        <PlusCircle size={20} className="text-accent" />
        Übung hinzufügen
      </button>

      <div className="pt-8">
        <button
          onClick={onFinish}
          disabled={workout.exercises.length === 0 || isSaving}
          className="w-full h-16 bg-accent text-black rounded-2xl flex items-center justify-center gap-3 font-black text-lg active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale disabled:scale-100"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            <>
              <Check size={24} />
              Training beenden
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showAddExercise && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddExercise(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6 border-x border-t border-white/10 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Übung hinzufügen</h3>
                <button onClick={() => setShowAddExercise(false)} className="text-white/40"><X /></button>
              </div>

              <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 pb-4">
                {COMMON_EXERCISES.map(name => (
                  <button
                    key={name}
                    onClick={() => addExercise(name)}
                    className="w-full p-4 bg-white/5 hover:bg-accent/10 hover:text-accent rounded-xl text-left font-medium transition-colors border border-white/5"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HistoryView({ workouts, runs, onDeleteWorkout }: { workouts: Workout[]; runs: Run[]; onDeleteWorkout: (id: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'gym' | 'runs'>('all');

  const filteredWorkouts = filter === 'all' || filter === 'gym' ? workouts : [];
  const filteredRuns = filter === 'all' || filter === 'runs' ? runs : [];

  if (filteredWorkouts.length === 0 && filteredRuns.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-card flex items-center justify-center text-white/20">
          <HistoryIcon size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold">Noch kein Verlauf</h3>
          <p className="text-white/40 text-sm max-w-[200px] mx-auto mt-1">Starte dein erstes Training oder Lauf!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Verlauf</h1>
        <div className="flex gap-2 mt-4">
          {(['all', 'gym', 'runs'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                filter === f
                  ? 'bg-accent text-black border-accent'
                  : 'bg-transparent border-white/20 text-white/50 hover:border-white/30'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'gym' ? 'Gym' : 'Läufe'}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-4">
        {filteredRuns.map((run) => {
          const pace = (run.duration_seconds / 60) / run.distance_km;
          return (
            <motion.div key={run.id} layout className="bg-card rounded-3xl border border-white/5 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold">🏃 Lauf</h4>
                  <p className="text-xs text-white/40 flex items-center gap-1">
                    <Clock size={12} /> {Math.floor(run.duration_seconds / 60)}m · {run.distance_km.toFixed(2)} km
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/5 px-2 py-1 rounded-lg text-white/50">
                  {pace.toFixed(1)} min/km
                </div>
                <div className="bg-white/5 px-2 py-1 rounded-lg text-white/50">
                  {run.calories} kcal
                </div>
                <div className="bg-white/5 px-2 py-1 rounded-lg text-white/50">
                  {format(parseISO(run.date), 'dd. MMM', { locale: de })}
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredWorkouts.map((workout) => (
          <motion.div key={workout.id} layout className="bg-card rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-5 flex justify-between items-center">
              <div className="flex gap-4 items-center flex-1">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-white/40 uppercase">{format(parseISO(workout.date), 'MMM', { locale: de })}</span>
                  <span className="text-sm font-black">{format(parseISO(workout.date), 'dd')}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">💪 Training</h4>
                  <p className="text-xs text-white/40">{workout.exercises.length} Übungen</p>
                </div>
              </div>
              <button
                onClick={() => onDeleteWorkout(workout.id)}
                className="p-2 text-white/20 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatsView({ workouts, runs, weightHistory }: { workouts: Workout[]; runs: Run[]; weightHistory: UserStats[] }) {
  const totalWorkouts = workouts.length;
  const totalRuns = runs.length;
  const totalDistance = runs.reduce((sum, run) => sum + run.distance_km, 0);
  const totalCalories = runs.reduce((sum, run) => sum + run.calories, 0);

  const longestRun = runs.length > 0 ? Math.max(...runs.map(r => r.distance_km)) : 0;

  const chartData = useMemo(() => {
    return weightHistory
      .slice()
      .reverse()
      .map((w, i) => ({
        date: format(parseISO(w.date), 'dd. MMM', { locale: de }),
        weight: w.weight || 0,
      }));
  }, [weightHistory]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Statistiken</h1>
        <p className="text-white/50 text-sm mt-2">Dein persönlicher Fortschritt</p>
      </header>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-3xl p-6 border border-white/5">
          <p className="text-white/30 text-xs font-medium">Workouts</p>
          <p className="text-4xl font-black mt-2 text-accent">{totalWorkouts}</p>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-white/5">
          <p className="text-white/30 text-xs font-medium">Läufe</p>
          <p className="text-4xl font-black mt-2 text-accent">{totalRuns}</p>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-white/5">
          <p className="text-white/30 text-xs font-medium">Gesamte Distanz</p>
          <p className="text-3xl font-black mt-2 text-accent">{totalDistance.toFixed(1)}<span className="text-sm ml-1">km</span></p>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-white/5">
          <p className="text-white/30 text-xs font-medium">Längster Lauf</p>
          <p className="text-3xl font-black mt-2 text-accent">{longestRun.toFixed(2)}<span className="text-sm ml-1">km</span></p>
        </div>
      </div>

      {/* Weight Progress Chart */}
      {chartData.length > 1 && (
        <section className="bg-card rounded-3xl p-6 border border-white/5 h-64 w-full">
          <h2 className="text-lg font-bold mb-4">Gewicht</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#ffffff30', fontSize: 10, fontWeight: 'bold' }}
                dy={10}
              />
              <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '16px', color: '#fff' }}
                itemStyle={{ color: '#D4FF00', fontWeight: 'bold' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#D4FF00"
                strokeWidth={3}
                dot={{ fill: '#D4FF00', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
}

function ProfileView({
  userEmail,
  weightHistory,
  newWeight,
  setNewWeight,
  onSaveWeight,
  onLogout
}: {
  userEmail: string;
  weightHistory: UserStats[];
  newWeight: string;
  setNewWeight: (w: string) => void;
  onSaveWeight: () => void;
  onLogout: () => void;
}) {
  const lastWeight = weightHistory.length > 0 ? weightHistory[0].weight : null;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-accent to-accent/20 mb-4">
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border-4 border-background">
            <User size={48} className="text-white/40" />
          </div>
        </div>
        <h1 className="text-2xl font-black">{userEmail}</h1>
        <p className="text-white/40 text-sm">GymLog User</p>
      </header>

      {/* Weight Tracking */}
      <div className="bg-card rounded-3xl p-6 border border-white/5 space-y-4">
        <h2 className="text-lg font-bold">Gewicht tracken</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-white/50 mb-2">Neues Gewicht (kg)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="0"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:border-accent outline-none"
              />
              <button
                onClick={onSaveWeight}
                disabled={!newWeight || parseFloat(newWeight) <= 0}
                className="px-4 py-2 bg-accent text-black rounded-xl font-bold disabled:opacity-50 active:scale-95 transition-transform"
              >
                Speichern
              </button>
            </div>
          </div>

          {lastWeight && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-white/50 text-xs font-bold uppercase">Letztes Gewicht</p>
              <p className="text-2xl font-bold text-accent mt-1">{lastWeight} kg</p>
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full h-12 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut size={18} />
        Ausloggen
      </button>

      <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest">GymLog v2.0.0</p>
    </div>
  );
}

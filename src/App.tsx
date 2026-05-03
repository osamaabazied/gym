import { useState, useEffect, useMemo, useRef, ReactNode } from 'react';
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
  ChevronUp,
  MoreVertical,
  X,
  PlusCircle,
  Dumbbell
} from 'lucide-react';
import { format, parseISO, isSameDay, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
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
  Cell
} from 'recharts';

import { Workout, ExerciseEntry, Set, AppState, UserStats } from './types';
import { COLORS, COMMON_EXERCISES } from './constants';

const STORAGE_KEY = 'gym-log-data-v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'stats' | 'profile'>('home');
  const [isWorkingOut, setIsWorkingOut] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weightHistory, setWeightHistory] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: AppState = JSON.parse(saved);
        setWorkouts(parsed.workouts || []);
        setWeightHistory(parsed.weightHistory || []);
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save data
  useEffect(() => {
    if (!isLoading) {
      const data: AppState = { workouts, weightHistory };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [workouts, weightHistory, isLoading]);

  const startNewWorkout = () => {
    const lastWorkout = workouts[0];
    const newWorkout: Workout = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      exercises: [],
      notes: '',
    };
    
    setActiveWorkout(newWorkout);
    setIsWorkingOut(true);
  };

  const finishWorkout = () => {
    if (!activeWorkout) return;
    if (activeWorkout.exercises.length === 0) {
      setIsWorkingOut(false);
      setActiveWorkout(null);
      return;
    }
    setWorkouts([activeWorkout, ...workouts]);
    setIsWorkingOut(false);
    setActiveWorkout(null);
    setActiveTab('history');
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(w => w.id !== id));
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
                  onStartWorkout={startNewWorkout} 
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === 'history' && (
                <HistoryView 
                  workouts={workouts} 
                  onDelete={deleteWorkout}
                />
              )}
              {activeTab === 'stats' && (
                <StatsView 
                  workouts={workouts} 
                  weightHistory={weightHistory} 
                />
              )}
              {activeTab === 'profile' && (
                <ProfileView />
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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {!isWorkingOut && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-background/80 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex justify-between items-center z-50">
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
          <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<TrendingUp size={22} />} />
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={22} />} />
        </nav>
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

function HomeView({ workouts, onStartWorkout, onNavigate }: { workouts: Workout[]; onStartWorkout: () => void; onNavigate: (tab: any) => void }) {
  const lastWorkout = workouts[0];
  const streak = useMemo(() => {
    if (workouts.length === 0) return 0;
    // Simple streak logic for demo
    return 3; 
  }, [workouts]);

  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  const workoutDays = workouts.map(w => format(parseISO(w.date), 'yyyy-MM-dd'));

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Noch 3 mal!</h1>
          <p className="text-white/50 text-sm mt-1">Geh an deine Grenzen</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-card border border-white/5 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        </div>
      </header>

      {/* Week View */}
      <div className="flex justify-between gap-2 overflow-x-auto pb-2">
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, new Date());
          const hasWorkout = workoutDays.includes(format(day, 'yyyy-MM-dd'));
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-12 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                isToday ? 'bg-accent text-black border-accent' : 
                hasWorkout ? 'bg-card border-accent/30 text-white' : 'bg-card border-white/10 text-white/30'
              }`}>
                <span className="text-[10px] uppercase font-bold">{format(day, 'EEE', { locale: de })}</span>
                <span className="text-sm font-black">{format(day, 'dd')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next/Last Training Card */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {lastWorkout ? 'Letztes Training' : 'Nächstes Training'}
        </h2>
        
        <div className="bg-card rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors" />
          
          <div className="relative">
            <h3 className="text-xl font-bold">
              {lastWorkout ? 'Standard Training' : 'Schnelles Workout'}
            </h3>
            <p className="text-white/50 text-sm mt-1">
              {lastWorkout 
                ? `${lastWorkout.exercises.length} Übungen · ${format(parseISO(lastWorkout.date), 'dd. MMM', { locale: de })}` 
                : 'Starte heute deine Reise'
              }
            </p>

            <div className="mt-8 flex items-end justify-between">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-white/30 font-bold tracking-wider">Dauer</span>
                  <span className="text-sm font-semibold">45 Min.</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-white/30 font-bold tracking-wider">Geschätzt</span>
                  <span className="text-sm font-semibold">350 Kcal</span>
                </div>
              </div>
              
              <button 
                onClick={onStartWorkout}
                className="bg-accent text-black rounded-2xl px-5 py-3 font-bold flex items-center gap-2 active:scale-95 transition-transform"
              >
                <Play size={18} fill="currentColor" />
                Start
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
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">Durchschn. Kalorien</p>
              <p className="text-lg font-bold">350 Kcal</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">Durchschn. Zeit</p>
              <p className="text-lg font-bold">2h 45min</p>
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
  onCancel 
}: { 
  workout: Workout; 
  setWorkout: (w: Workout) => void;
  onFinish: () => void;
  onCancel: () => void;
}) {
  const [showAddExercise, setShowAddExercise] = useState(false);

  const addExercise = (name: string) => {
    const newExercise: ExerciseEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      sets: [{ id: Math.random().toString(36).substr(2, 9), reps: 10, weight: 0 }]
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
      id: Math.random().toString(36).substr(2, 9),
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
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50"
        >
          <X size={20} />
        </button>
      </header>

      <div className="space-y-4">
        {workout.exercises.map((exercise, exerciseIndex) => (
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
                      className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 rounded-full items-center justify-center hidden group-hover:flex"
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
          disabled={workout.exercises.length === 0}
          className="w-full h-16 bg-accent text-black rounded-2xl flex items-center justify-center gap-3 font-black text-lg active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale disabled:scale-100"
        >
          <Check size={24} />
          Training beenden
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

function HistoryView({ workouts, onDelete }: { workouts: Workout[]; onDelete: (id: string) => void }) {
  if (workouts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-card flex items-center justify-center text-white/20">
          <HistoryIcon size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold">Noch kein Verlauf</h3>
          <p className="text-white/40 text-sm max-w-[200px] mx-auto mt-1">Starte dein erstes Training, um deine Aktivitäten hier zu sehen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Verlauf</h1>
        <p className="text-white/50 text-sm mt-1">Überprüfe deine bisherige Leistung</p>
      </header>

      <div className="space-y-4">
        {workouts.map((workout) => (
          <WorkoutItem key={workout.id} workout={workout} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

interface WorkoutItemProps {
  workout: Workout;
  onDelete: (id: string) => void;
  key?: string;
}

function WorkoutItem({ workout, onDelete }: WorkoutItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card rounded-3xl border border-white/5 overflow-hidden transition-all">
      <div 
        className="p-5 flex justify-between items-center cursor-pointer active:bg-white/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-white/40 uppercase">{format(parseISO(workout.date), 'MMM', { locale: de })}</span>
            <span className="text-sm font-black">{format(parseISO(workout.date), 'dd')}</span>
          </div>
          <div>
            <h4 className="font-bold">Trainingseinheit</h4>
            <p className="text-xs text-white/40 flex items-center gap-1">
              <Clock size={12} /> 45m · {workout.exercises.length} Übungen
            </p>
          </div>
        </div>
        <ChevronDown size={20} className={`text-white/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-4">
              <div className="space-y-3">
                {workout.exercises.map((ex) => (
                  <div key={ex.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white/80">{ex.name}</span>
                      <span className="text-[10px] font-bold text-white/30 uppercase">{ex.sets.length} Sätze</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {ex.sets.map((set, i) => (
                        <div key={set.id} className="bg-white/5 px-2 py-1 rounded-lg text-white/50 border border-white/5">
                          {set.weight}kg × {set.reps}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => onDelete(workout.id)}
                  className="flex items-center gap-2 text-red-500/50 hover:text-red-500 text-xs font-bold py-2 px-3 rounded-xl hover:bg-red-500/10 transition-all uppercase tracking-wider"
                >
                  <Trash2 size={14} />
                  Eintrag löschen
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatsView({ workouts, weightHistory }: { workouts: Workout[]; weightHistory: UserStats[] }) {
  const [selectedExercise, setSelectedExercise] = useState(COMMON_EXERCISES[0]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const chartData = useMemo(() => {
    // Extract max weight per workout for selected exercise
    const data = workouts
      .filter(w => w.exercises.some(e => e.name === selectedExercise))
      .map(w => {
        const exercise = w.exercises.find(e => e.name === selectedExercise)!;
        const maxWeight = Math.max(...exercise.sets.map(s => s.weight));
        return {
          date: format(parseISO(w.date), 'dd. MMM', { locale: de }),
          weight: maxWeight,
          originalDate: w.date
        };
      })
      .reverse();
    return data;
  }, [workouts, selectedExercise]);

  const caloriesData = [
    { day: 'Mo', val: 230 },
    { day: 'Di', val: 340 },
    { day: 'Mi', val: 450 },
    { day: 'Do', val: 310 },
    { day: 'Fr', val: 560 },
    { day: 'Sa', val: 680 },
    { day: 'So', val: 590 },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Statistiken</h1>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {['September', 'Oktober', 'November'].map((m) => (
            <button key={m} className={`px-4 py-2 rounded-xl text-sm font-medium border flex items-center gap-2 transition-all ${
              m === 'September' ? 'bg-card border-white/20 text-white' : 'bg-transparent border-white/5 text-white/30'
            }`}>
              {m} <ChevronDown size={14} />
            </button>
          ))}
          <button className="px-4 py-2 rounded-xl text-sm font-medium border border-white/20 bg-card text-white flex items-center gap-2">
            Woche 1 <ChevronDown size={14} />
          </button>
        </div>
      </header>

      {/* Main Chart Card (Mimicking image 3) */}
      <section className="bg-card rounded-[40px] p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-3xl rounded-full -mr-24 -mt-24" />
        
        <div className="relative">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-white/30 text-sm font-medium">Kalorien</p>
              <h3 className="text-4xl font-black mt-1">239<span className="text-lg font-bold text-white/50 ml-1 tracking-tight">kcal</span></h3>
            </div>
          </div>

          <div className="h-40 w-full mt-4 flex items-end justify-between gap-2 px-1">
            {caloriesData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div 
                  className="w-full bg-accent rounded-full transition-all duration-500 relative"
                  style={{ 
                    height: `${(d.val / 700) * 100}%`,
                    opacity: 0.3 + (i * 0.1) 
                  }}
                >
                  {i === 5 && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-full h-full bg-accent blur-md opacity-20" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-white/20 group-hover:text-accent transition-colors">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Herzfrequenz', val: '92bpm' },
          { label: 'Schritte', val: '1.279' },
          { label: 'Distanz', val: '56km' },
          { label: 'Zeit', val: '3h 32min' },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-3xl p-6 border border-white/5">
            <p className="text-white/30 text-xs font-medium">{s.label}</p>
            <p className="text-xl font-bold mt-2">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Exercise Progress Chart */}
      <section className="space-y-4 pt-4 pb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Fortschritt</h2>
          <select 
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="bg-transparent text-accent text-sm font-bold outline-none border-none cursor-pointer"
          >
            {COMMON_EXERCISES.map(name => <option key={name} value={name} className="bg-card text-white">{name}</option>)}
          </select>
        </div>

        <div className="bg-card rounded-3xl p-6 border border-white/5 h-64 w-full">
          {chartData.length > 1 ? (
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
                <YAxis 
                  hide
                  domain={['dataMin - 10', 'dataMax + 10']}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ color: '#D4FF00', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#D4FF00" 
                  strokeWidth={4} 
                  dot={{ fill: '#D4FF00', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 8, stroke: '#0a0a0a', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-white/20">
              <TrendingUp size={32} className="mb-2" />
              <p className="text-sm">Nicht genügend Daten für<br/>{selectedExercise}.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-accent to-accent/20 mb-4">
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border-4 border-background">
            <User size={48} className="text-white/20" />
          </div>
        </div>
        <h1 className="text-2xl font-black">Fitness-Fanatiker</h1>
        <p className="text-white/40 text-sm">Level 12 Krieger</p>
      </header>

      <div className="bg-card rounded-3xl p-6 border border-white/5 space-y-6">
        <div className="flex justify-between items-center text-sm font-bold">
          <span className="text-white/40 uppercase tracking-widest text-[10px]">Einstellungen</span>
        </div>
        <div className="space-y-1">
          <ProfileItem icon={<Dumbbell size={18} />} label="Trainings-Präferenzen" />
          <ProfileItem icon={<User size={18} />} label="Persönliche Informationen" />
          <ProfileItem icon={<Calendar size={18} />} label="Workout-Erinnerung" />
        </div>
      </div>

      <div className="bg-card rounded-3xl p-6 border border-white/5 space-y-6">
        <div className="flex justify-between items-center text-sm font-bold">
          <span className="text-white/40 uppercase tracking-widest text-[10px]">App</span>
        </div>
        <div className="space-y-1">
          <ProfileItem icon={<Clock size={18} />} label="Benachrichtigungen" />
          <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="text-white/30 group-hover:text-accent transition-colors">
                <Play size={18} />
              </div>
              <span className="font-bold text-sm">Dunkelmodus</span>
            </div>
            <div className="w-10 h-6 bg-accent rounded-full flex items-center px-1">
              <div className="w-4 h-4 bg-black rounded-full ml-auto" />
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest">GymLog v1.0.0</p>
    </div>
  );
}

function ProfileItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="text-white/30 group-hover:text-accent transition-colors">
          {icon}
        </div>
        <span className="font-bold text-sm">{label}</span>
      </div>
      <ChevronRight size={18} className="text-white/10 group-hover:text-white/40" />
    </div>
  );
}


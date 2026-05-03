import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Check, Trash2, Clock, Activity, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Run } from '../types';
import * as db from '../lib/db';
import { CALORIES_PER_KM } from '../constants';

interface RunningScreenProps {
  runs: Run[];
  onRunSaved: () => void;
  userId: string;
}

export function RunningScreen({ runs, onRunSaved, userId }: RunningScreenProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [distance, setDistance] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Timer loop
  useEffect(() => {
    if (!isRunning || startTime === null) return;

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const startRun = () => {
    setIsRunning(true);
    setStartTime(Date.now());
    setElapsedSeconds(0);
  };

  const stopRun = () => {
    setIsRunning(false);
    setShowFinishDialog(true);
  };

  const finishRun = async () => {
    if (!distance || parseFloat(distance) <= 0) return;

    const distanceKm = parseFloat(distance);
    const calories = Math.round(distanceKm * CALORIES_PER_KM);

    const newRun: Run = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      duration_seconds: elapsedSeconds,
      distance_km: distanceKm,
      calories,
      notes: '',
    };

    setIsSaving(true);
    const saved = await db.saveRun(newRun, userId);
    setIsSaving(false);

    if (saved) {
      setIsRunning(false);
      setShowFinishDialog(false);
      setDistance('');
      setElapsedSeconds(0);
      setStartTime(null);
      onRunSaved();
    }
  };

  const deleteRun = async (runId: string) => {
    const success = await db.deleteRun(runId);
    if (success) {
      onRunSaved();
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const pace = distance && parseFloat(distance) > 0 ? (elapsedSeconds / 60) / parseFloat(distance) : 0;

  if (isRunning) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-40"
      >
        <div className="space-y-12 text-center">
          <div>
            <p className="text-white/50 text-sm mb-2">Zeit</p>
            <p className="text-6xl font-black text-accent font-mono">{formatTime(elapsedSeconds)}</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-white/50">Distanz (km)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="0.0"
                className="w-full bg-card border border-white/10 rounded-xl px-4 py-3 text-center text-2xl font-bold text-accent placeholder-white/20 focus:border-accent outline-none"
              />
            </div>

            {distance && parseFloat(distance) > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-xl p-4">
                  <p className="text-white/50 text-xs font-bold">Tempo</p>
                  <p className="text-xl font-black text-accent mt-1">{pace.toFixed(1)} min/km</p>
                </div>
                <div className="bg-card rounded-xl p-4">
                  <p className="text-white/50 text-xs font-bold">Kalorien</p>
                  <p className="text-xl font-black text-accent mt-1">{Math.round(parseFloat(distance) * CALORIES_PER_KM)} kcal</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={stopRun}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto active:scale-95 transition-transform shadow-2xl shadow-red-500/30"
          >
            <Square size={32} fill="white" className="text-white" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Laufen</h1>
        <p className="text-white/50 text-sm mt-1">Tracke deine Läufe und Distanz</p>
      </header>

      {/* Start Button */}
      <div className="flex justify-center pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={startRun}
          className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-black shadow-2xl shadow-accent/30 active:scale-95 transition-transform"
        >
          <Play size={48} fill="currentColor" />
        </motion.button>
      </div>

      {/* Recent Runs */}
      <section className="space-y-4 pt-8">
        <h2 className="text-lg font-semibold">Letzte Läufe</h2>

        {runs.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={40} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/40">Starte deinen ersten Lauf!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map((run) => {
              const pace = (run.duration_seconds / 60) / run.distance_km;
              return (
                <motion.div
                  key={run.id}
                  layout
                  className="bg-card rounded-2xl p-4 border border-white/5 group hover:border-accent/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold">{format(parseISO(run.date), 'dd. MMM yyyy', { locale: de })}</p>
                      <p className="text-white/50 text-sm">{format(parseISO(run.date), 'HH:mm', { locale: de })}</p>
                    </div>
                    <button
                      onClick={() => deleteRun(run.id)}
                      className="p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <p className="text-[10px] text-white/50 font-bold uppercase">Distanz</p>
                      <p className="font-bold text-accent">{run.distance_km.toFixed(2)} km</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 font-bold uppercase">Zeit</p>
                      <p className="font-bold text-accent">{Math.floor(run.duration_seconds / 60)}m</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 font-bold uppercase">Tempo</p>
                      <p className="font-bold text-accent">{pace.toFixed(1)} min/km</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 font-bold uppercase">Kalorien</p>
                      <p className="font-bold text-accent">{run.calories} kcal</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Finish Dialog */}
      <AnimatePresence>
        {showFinishDialog && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFinishDialog(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6 border-x border-t border-white/10 space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold">Lauf abgeschlossen! 🎉</h3>
                <p className="text-white/50 text-sm mt-1">Distanz eingeben zum Speichern</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-white/50 mb-2">Distanz (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-accent placeholder-white/20 focus:border-accent outline-none"
                    autoFocus
                  />
                </div>

                {distance && parseFloat(distance) > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-white/50 font-bold uppercase">Zeit</p>
                      <p className="text-sm font-bold text-accent mt-1">{Math.floor(elapsedSeconds / 60)}m</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-white/50 font-bold uppercase">Tempo</p>
                      <p className="text-sm font-bold text-accent mt-1">{pace.toFixed(1)} min/km</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-white/50 font-bold uppercase">Kalorien</p>
                      <p className="text-sm font-bold text-accent mt-1">{Math.round(parseFloat(distance) * CALORIES_PER_KM)} kcal</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={finishRun}
                disabled={!distance || parseFloat(distance) <= 0 || isSaving}
                className="w-full h-12 bg-accent text-black rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Wird gespeichert...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Speichern
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

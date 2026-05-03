import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email und Passwort erforderlich');
      setLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message || 'Login fehlgeschlagen');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message || 'Registrierung fehlgeschlagen');
        } else {
          setError('Registrierung erfolgreich! Bitte logge dich ein.');
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-3xl bg-accent/20 flex items-center justify-center">
              <Dumbbell size={32} className="text-accent" />
            </div>
          </div>
          <h1 className="text-3xl font-black">GymLog</h1>
          <p className="text-white/40 text-sm mt-2">Trainiere, verfolge, verbessere dich</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-white/80 mb-2">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              className="w-full bg-card border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/20 focus:border-accent outline-none transition-colors"
            />
          </div>

          {/* Passwort */}
          <div>
            <label className="block text-sm font-bold text-white/80 mb-2">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-card border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/20 focus:border-accent outline-none transition-colors"
            />
          </div>

          {/* Passwort bestätigen (nur bei Registrierung) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">Passwort bestätigen</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-card border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/20 focus:border-accent outline-none transition-colors"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-3"
            >
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-black rounded-2xl px-4 py-3 font-bold text-lg active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 mt-6"
          >
            {loading ? 'Wird geladen...' : isLogin ? 'Einloggen' : 'Registrieren'}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center">
          <p className="text-white/50 text-sm">
            {isLogin ? 'Noch kein Konto?' : 'Schon registriert?'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-accent font-bold hover:underline"
            >
              {isLogin ? 'Registrieren' : 'Einloggen'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

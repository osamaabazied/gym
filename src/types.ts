export interface Set {
  id: string;
  reps: number;
  weight: number;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  sets: Set[];
}

export interface Workout {
  id: string;
  date: string;
  exercises: ExerciseEntry[];
  notes?: string;
}

export interface UserStats {
  weight?: number;
  date: string;
}

export interface Run {
  id: string;
  date: string;
  duration_seconds: number;
  distance_km: number;
  calories: number;
  notes?: string;
}

export interface AppState {
  workouts: Workout[];
  weightHistory: UserStats[];
  runs?: Run[];
}

import { supabase } from './supabase';
import { Workout, ExerciseEntry, Set, UserStats, Run } from '../types';

export async function fetchWorkouts(userId: string): Promise<Workout[]> {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        id,
        date,
        notes,
        exercises (
          id,
          name,
          position,
          sets (
            id,
            reps,
            weight,
            position
          )
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching workouts:', error);
      return [];
    }

    return (data || []).map((w: any) => ({
      id: w.id,
      date: w.date,
      notes: w.notes || '',
      exercises: (w.exercises || []).map((ex: any) => ({
        id: ex.id,
        name: ex.name,
        sets: (ex.sets || []).sort((a: any, b: any) => a.position - b.position),
      })).sort((a: any, b: any) => a.position - b.position),
    }));
  } catch (error) {
    console.error('Unexpected error fetching workouts:', error);
    return [];
  }
}

export async function saveWorkout(workout: Workout, userId: string): Promise<string | null> {
  try {
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .insert([
        {
          id: workout.id,
          user_id: userId,
          date: workout.date,
          notes: workout.notes || '',
        },
      ])
      .select('id')
      .single();

    if (workoutError) {
      console.error('Error saving workout:', workoutError);
      return null;
    }

    const workoutId = workoutData.id;

    for (let exIdx = 0; exIdx < workout.exercises.length; exIdx++) {
      const exercise = workout.exercises[exIdx];
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .insert([
          {
            id: exercise.id,
            workout_id: workoutId,
            name: exercise.name,
            position: exIdx,
          },
        ])
        .select('id')
        .single();

      if (exerciseError) {
        console.error('Error saving exercise:', exerciseError);
        // Wenn Exercise-Insert fehlschlägt, ganzes Workout ungültig
        await supabase.from('workouts').delete().eq('id', workoutId);
        return null;
      }

      const exerciseId = exerciseData.id;

      for (let setIdx = 0; setIdx < exercise.sets.length; setIdx++) {
        const set = exercise.sets[setIdx];
        const { error: setError } = await supabase
          .from('sets')
          .insert([
            {
              id: set.id,
              exercise_id: exerciseId,
              reps: set.reps,
              weight: set.weight,
              position: setIdx,
            },
          ]);

        if (setError) {
          console.error('Error saving set:', setError);
          // Wenn Set-Insert fehlschlägt, ganzes Workout ungültig
          await supabase.from('workouts').delete().eq('id', workoutId);
          return null;
        }
      }
    }

    return workoutId;
  } catch (error) {
    console.error('Unexpected error in saveWorkout:', error);
    return null;
  }
}

export async function deleteWorkout(workoutId: string): Promise<boolean> {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId);

  if (error) {
    console.error('Error deleting workout:', error);
    return false;
  }

  return true;
}

export async function fetchWeightHistory(userId: string): Promise<UserStats[]> {
  const { data, error } = await supabase
    .from('weight_history')
    .select('weight, date')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching weight history:', error);
    return [];
  }

  return (data || []).map((w: any) => ({
    weight: w.weight,
    date: w.date,
  }));
}

export async function saveWeightEntry(userId: string, weight: number): Promise<boolean> {
  const { error } = await supabase
    .from('weight_history')
    .insert([
      {
        user_id: userId,
        weight,
        date: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('Error saving weight entry:', error);
    return false;
  }

  return true;
}

export async function fetchRuns(userId: string): Promise<Run[]> {
  try {
    const { data, error } = await supabase
      .from('runs')
      .select('id, date, duration_seconds, distance_km, calories, notes')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching runs:', error);
      return [];
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      date: r.date,
      duration_seconds: r.duration_seconds,
      distance_km: r.distance_km,
      calories: r.calories,
      notes: r.notes || '',
    }));
  } catch (error) {
    console.error('Unexpected error fetching runs:', error);
    return [];
  }
}

export async function saveRun(run: Run, userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('runs')
      .insert([
        {
          id: run.id,
          user_id: userId,
          date: run.date,
          duration_seconds: run.duration_seconds,
          distance_km: run.distance_km,
          calories: run.calories,
          notes: run.notes || '',
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Error saving run:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Unexpected error in saveRun:', error);
    return null;
  }
}

export async function deleteRun(runId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('runs')
      .delete()
      .eq('id', runId);

    if (error) {
      console.error('Error deleting run:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting run:', error);
    return false;
  }
}

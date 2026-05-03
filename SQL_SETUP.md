# Supabase Database Setup

Copy and paste this SQL into your Supabase SQL Editor to set up the database schema.

## 📋 SQL Script

```sql
-- Workouts table
create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date timestamptz not null default now(),
  notes text,
  created_at timestamptz default now()
);

-- Exercises table
create table exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references workouts(id) on delete cascade not null,
  name text not null,
  position integer not null default 0
);

-- Sets table
create table sets (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid references exercises(id) on delete cascade not null,
  reps integer not null default 0,
  weight numeric(6,2) not null default 0,
  position integer not null default 0
);

-- Runs table
create table runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date timestamptz not null default now(),
  duration_seconds integer not null default 0,
  distance_km numeric(6,3) not null default 0,
  calories integer not null default 0,
  notes text,
  created_at timestamptz default now()
);

-- Weight history table
create table weight_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  weight numeric(5,2),
  date timestamptz not null default now()
);

-- Enable Row Level Security for all tables
alter table workouts enable row level security;
alter table exercises enable row level security;
alter table sets enable row level security;
alter table runs enable row level security;
alter table weight_history enable row level security;

-- Add RLS policies
create policy "own workouts" on workouts 
  for all using (auth.uid() = user_id);

create policy "own exercises" on exercises 
  for all using (workout_id in (select id from workouts where user_id = auth.uid()));

create policy "own sets" on sets 
  for all using (exercise_id in (select id from exercises where workout_id in (select id from workouts where user_id = auth.uid())));

create policy "own runs" on runs 
  for all using (auth.uid() = user_id);

create policy "own weight_history" on weight_history 
  for all using (auth.uid() = user_id);
```

## ✅ Steps

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL above
6. Click **Run**
7. Done! ✨

All tables are now set up with proper authentication and security.

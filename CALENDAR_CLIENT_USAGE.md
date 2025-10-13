# Ръководство за използване на Calendar Integration за клиенти

## Как да добавите `SyncToCalendarButton` в client workout view

### Пример 1: В списък с тренировки

```tsx
import { SyncToCalendarButton } from "@/components/workout/SyncToCalendarButton";

function WorkoutList({ workouts }) {
  return (
    <div>
      {workouts.map((workout) => (
        <div key={workout.id} className="border p-4 rounded-lg">
          <h3>{workout.name}</h3>
          <p>{workout.description}</p>

          <div className="flex gap-2 mt-4">
            <Button>Start Workout</Button>

            {/* Добавете sync бутон */}
            <SyncToCalendarButton
              workoutSessionId={workout.id}
              workoutName={workout.name}
              scheduledDate={workout.scheduled_date}
              isSynced={!!workout.google_calendar_event_id}
              size="default"
              variant="outline"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Пример 2: В workout details страница

```tsx
import { SyncToCalendarButton } from "@/components/workout/SyncToCalendarButton";

function WorkoutDetailsPage({ workout }) {
  return (
    <div>
      <h1>{workout.name}</h1>

      {/* Sync to calendar section */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Добави в календар</h3>
            <p className="text-sm text-muted-foreground">
              Синхронизирай тази тренировка с твоя Google Calendar
            </p>
          </div>

          <SyncToCalendarButton
            workoutSessionId={workout.id}
            workoutName={workout.name}
            scheduledDate={workout.scheduled_date}
            isSynced={!!workout.google_calendar_event_id}
          />
        </div>
      </Card>

      {/* Rest of workout details */}
    </div>
  );
}
```

### Пример 3: В client dashboard

```tsx
// В components/fitness/client-dashboard.tsx

import { SyncToCalendarButton } from "@/components/workout/SyncToCalendarButton";

function TodayWorkoutCard({ workout }) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium">{workout.name}</h4>
      <p className="text-sm text-muted-foreground">{workout.description}</p>

      <div className="flex gap-2 mt-4">
        <Button asChild>
          <Link href={`/protected/workouts`}>Start</Link>
        </Button>

        <SyncToCalendarButton
          workoutSessionId={workout.id}
          workoutName={workout.name}
          scheduledDate={workout.scheduled_date}
          isSynced={!!workout.google_calendar_event_id}
          size="sm"
          variant="ghost"
        />
      </div>
    </div>
  );
}
```

## Как да добавите автоматична синхронизация когато треньорът назначи workout

### В API route за създаване на workout session

```tsx
// Пример: app/api/programs/assign-workout/route.ts

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { client_id, workout_data } = await request.json();

  // Create workout session
  const { data: session, error } = await supabase
    .from("workout_sessions")
    .insert({
      client_id,
      ...workout_data
    })
    .select()
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "Failed to create workout" }, { status: 500 });
  }

  // Auto-sync to client's calendar (non-blocking)
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/calendar/sync-client-workout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id,
      workout_session_id: session.id
    })
  }).catch(err => {
    console.error("Failed to auto-sync workout:", err);
    // Don't fail the main request if calendar sync fails
  });

  return NextResponse.json({ success: true, session });
}
```

## Проверка дали клиентът има свързан календар

```tsx
import { createSupabaseClient } from "@/utils/supabase/client";

async function checkCalendarIntegration(userId: string) {
  const supabase = createSupabaseClient();

  const { data: integration } = await supabase
    .from("calendar_integrations")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "google")
    .single();

  return {
    hasIntegration: !!integration,
    syncEnabled: integration?.sync_enabled || false,
    autoSyncEnabled: integration?.auto_sync || false
  };
}

// Използване:
const { hasIntegration, autoSyncEnabled } = await checkCalendarIntegration(user.id);

if (!hasIntegration) {
  // Покажи prompt за свързване на календар
}
```

## Tips & Best Practices

### 1. Показвайте статус на синхронизация

```tsx
{workout.google_calendar_event_id ? (
  <Badge variant="success">
    <Check className="h-3 w-3 mr-1" />
    В календара
  </Badge>
) : (
  <SyncToCalendarButton {...props} />
)}
```

### 2. Prompt за свързване на календар

```tsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "lucide-react";

function CalendarPrompt() {
  return (
    <Alert>
      <Calendar className="h-4 w-4" />
      <AlertDescription>
        Свържете вашия Google Calendar за автоматична синхронизация на тренировки.
        <Link href="/protected/settings" className="font-medium text-blue-600 ml-2">
          Свържи сега →
        </Link>
      </AlertDescription>
    </Alert>
  );
}
```

### 3. Bulk sync за всички предстоящи тренировки

```tsx
async function syncAllUpcomingWorkouts(userId: string) {
  const supabase = createSupabaseClient();

  const { data: workouts } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("client_id", userId)
    .gte("scheduled_date", new Date().toISOString())
    .is("google_calendar_event_id", null);

  if (!workouts) return;

  const promises = workouts.map(workout =>
    fetch("/api/calendar/google/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workout_id: workout.id,
        scheduled_date: workout.scheduled_date,
        workout_name: workout.name
      })
    })
  );

  await Promise.allSettled(promises);
  toast.success(`Синхронизирани ${workouts.length} тренировки`);
}
```

## Troubleshooting

### Клиентът не вижда бутона за sync

**Решение:**
1. Проверете дали е импортиран `SyncToCalendarButton`
2. Проверете дали workout има `id` и `scheduled_date`

### Sync не работи

**Решение:**
1. Проверете дали клиентът има свързан Google Calendar в Settings
2. Проверете дали има `sync_enabled: true`
3. Погледнете browser console за errors
4. Проверете Network tab - status 404 означава че няма свързан календар

### Auto-sync не се случва

**Решение:**
1. Проверете дали клиентът има `auto_sync: true`
2. Проверете дали API route извиква `/api/calendar/sync-client-workout`
3. Проверете Supabase logs за errors

## Support & Documentation

- [CALENDAR_INTEGRATION_README.md](./CALENDAR_INTEGRATION_README.md) - Пълна документация
- [Google Calendar API](https://developers.google.com/calendar) - Official docs
- Settings Page: `/protected/settings` - Клиентски настройки

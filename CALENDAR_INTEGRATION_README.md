# Calendar Integration Documentation

## Обзор

Fitness Training App поддържа интеграция с **Google Calendar** и **Apple Calendar** за автоматична синхронизация на тренировки.

## Функционалности

### Google Calendar
- ✅ OAuth 2.0 автентикация
- ✅ Автоматична синхронизация на тренировки
- ✅ Двупосочна връзка (създаване на events)
- ✅ Автоматично опресняване на токени
- ✅ Настройки за включване/изключване на sync
- ✅ Визуализация на последна синхронизация

### Apple Calendar
- ✅ Export в .ics (iCalendar) формат
- ✅ Съвместимост с всички calendar приложения
- ✅ Включва всички детайли на тренировката
- ✅ Автоматични reminders (30 мин преди тренировка)

## Setup

### 1. Google Calendar Setup

#### Стъпка 1: Създаване на Google Cloud Project
1. Отворете [Google Cloud Console](https://console.cloud.google.com/)
2. Създайте нов проект или изберете съществуващ
3. Активирайте **Google Calendar API**:
   - Отидете на "APIs & Services" > "Library"
   - Търсете "Google Calendar API"
   - Кликнете "Enable"

#### Стъпка 2: Създаване на OAuth 2.0 Credentials
1. Отидете на "APIs & Services" > "Credentials"
2. Кликнете "Create Credentials" > "OAuth client ID"
3. Изберете "Web application"
4. Конфигурирайте:
   - **Authorized JavaScript origins**: `http://localhost:3001` (за development)
   - **Authorized redirect URIs**: `http://localhost:3001/api/calendar/google/callback`
5. За production добавете:
   - Origins: `https://yourdomain.com`
   - Redirect URI: `https://yourdomain.com/api/calendar/google/callback`
6. Копирайте **Client ID** и **Client Secret**

#### Стъпка 3: Конфигуриране на OAuth Consent Screen
1. Отидете на "OAuth consent screen"
2. Изберете "External" (освен ако не използвате Google Workspace)
3. Попълнете задължителните полета:
   - App name
   - User support email
   - Developer contact email
4. Добавете scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. Добавете тест потребители (за development)

#### Стъпка 4: Environment Variables
Добавете в `.env.local`:
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. Database Migration

Приложете миграцията за calendar_integrations таблица:

```bash
# Ако използвате Supabase CLI
supabase db push

# Или приложете директно в Supabase Dashboard:
# SQL Editor > Нов Query > Копирайте съдържанието на
# supabase/migrations/20250113_calendar_integrations.sql
```

## Използване

### За Треньори и Клиенти

И треньорите, и клиентите могат да свържат своите Google Calendar за автоматична синхронизация на тренировки.

#### Свързване с Google Calendar

**За треньори:**
1. Отидете на **Account** > **Интеграция с календар**
2. Кликнете "Свържи" при Google Calendar
3. Влезте с вашия Google акаунт
4. Разрешете достъп до календара
5. След успешно свързване, можете да:
   - Включите/изключите синхронизацията
   - Включите автоматична синхронизация

**За клиенти:**
1. Отидете на **Настройки** (от user menu в header)
2. Изберете таб "Календар"
3. Кликнете "Свържи" при Google Calendar
4. Влезте с вашия Google акаунт
5. Разрешете достъп до календара
6. Включете автоматична синхронизация за автоматично добавяне на нови тренировки

#### Ръчна синхронизация на тренировка (Клиенти)

Клиентите могат да добавят конкретна тренировка към своя календар:
1. Отидете на вашите тренировки
2. Кликнете бутона "Добави в календар" до всяка тренировка
3. Тренировката ще бъде добавена към Google Calendar с:
   - Детайли за упражненията
   - Автоматични reminders (30 мин и 10 мин преди)
   - Линк към програмата

#### Експортиране за Apple Calendar

**За всички потребители:**
1. Отидете на **Account** (треньори) или **Настройки** (клиенти) > **Интеграция с календар**
2. Кликнете "Експорт" при Apple Calendar
3. Изтеглете .ics файла
4. Отворете файла или го импортирайте в:
   - Apple Calendar (Mac/iPhone)
   - Outlook Calendar
   - Google Calendar (като импорт)
   - Всяко друго calendar приложение

#### Автоматична синхронизация (За клиенти с включен Google Calendar)

Когато треньорът назначи нова тренировка на клиент:
- Ако клиентът има свързан Google Calendar
- И има включена автоматична синхронизация
- Тренировката автоматично се добавя към неговия календар
- Без нужда от допълнителни действия!

## API Endpoints

### Google Calendar

#### GET `/api/calendar/google/auth`
Генерира OAuth URL за автентикация.

**Response:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### GET `/api/calendar/google/callback`
OAuth callback endpoint. Автоматично обработва код и съхранява токени.

**Query Params:**
- `code`: Authorization code от Google
- `state`: User ID за валидация

#### POST `/api/calendar/google/disconnect`
Изключва Google Calendar интеграцията.

**Response:**
```json
{
  "success": true
}
```

#### POST `/api/calendar/google/sync`
Синхронизира workout към Google Calendar.

**Request Body:**
```json
{
  "workout_id": "uuid",
  "program_id": "uuid",
  "scheduled_date": "2025-01-15T10:00:00Z",
  "workout_name": "Upper Body Strength",
  "workout_description": "Focus on chest and back",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 4,
      "reps": "8-10"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "event_id": "google_event_id",
  "event_link": "https://calendar.google.com/..."
}
```

### Apple Calendar

#### GET `/api/calendar/apple/export`
Експортира тренировки в .ics формат.

**Query Params (optional):**
- `client_id`: Филтър по клиент
- `start_date`: Начална дата (ISO 8601)
- `end_date`: Крайна дата (ISO 8601)

**Response:**
- Content-Type: `text/calendar`
- File download: `workouts-YYYY-MM-DD.ics`

### Client Auto-Sync

#### POST `/api/calendar/sync-client-workout`
Автоматично синхронизира тренировка към клиентския календар.

**Request Body:**
```json
{
  "client_id": "uuid",
  "workout_session_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "event_id": "google_event_id",
  "event_link": "https://calendar.google.com/..."
}
```

**Note:** Този endpoint се извиква автоматично от backend когато треньорът назначи тренировка на клиент с включена автоматична синхронизация.

## Database Schema

### calendar_integrations

```sql
CREATE TABLE public.calendar_integrations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  provider TEXT NOT NULL, -- 'google' or 'apple'

  -- Google Calendar
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_calendar_id TEXT,
  google_token_expiry TIMESTAMP WITH TIME ZONE,

  -- Apple Calendar (CalDAV)
  caldav_url TEXT,
  caldav_username TEXT,
  caldav_password TEXT,

  -- Settings
  sync_enabled BOOLEAN DEFAULT true,
  auto_sync BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(user_id, provider)
);
```

## Security

### Google Calendar
- ✅ OAuth 2.0 с refresh tokens
- ✅ Токените са криптирани в database
- ✅ Автоматично опресняване на изтекли токени
- ✅ Row Level Security (RLS) политики

### Apple Calendar
- ✅ Локален експорт (no credentials needed)
- ✅ Безопасен .ics формат
- ✅ No sensitive data в експортираните файлове

## Troubleshooting

### Google Calendar не се свързва

**Проблем:** "Error: redirect_uri_mismatch"
**Решение:** Проверете дали redirect URI в Google Cloud Console съвпада точно с:
- Development: `http://localhost:3001/api/calendar/google/callback`
- Production: `https://yourdomain.com/api/calendar/google/callback`

**Проблем:** "Access blocked: This app's request is invalid"
**Решение:** Конфигурирайте OAuth consent screen и добавете необходимите scopes.

**Проблем:** Token expired
**Решение:** Токените автоматично се опресняват. Ако проблемът продължава, изключете и свържете отново календара.

### Експортът не работи

**Проблем:** Празен .ics файл
**Решение:** Проверете дали има scheduled workouts с валидни scheduled_date полета.

**Проблем:** Apple Calendar не импортира файла
**Решение:** Проверете дали файлът е валиден .ics формат. Опитайте с друго calendar приложение за тест.

## Best Practices

1. **Security:**
   - Никога не commit-вайте `.env.local` файла
   - Използвайте environment variables за API keys
   - Редовно обновявайте OAuth credentials

2. **Performance:**
   - Включете auto_sync само ако е необходим
   - Използвайте batch exports за множество тренировки
   - Кеширайте calendar data когато е възможно

3. **UX:**
   - Показвайте ясни error messages на потребителите
   - Добавете loading states при sync операции
   - Потвърждавайте успешни синхронизации с toast notifications

## Future Enhancements

- [ ] Двупосочна синхронизация (промени от календар към app)
- [ ] Outlook Calendar integration
- [ ] Bulk sync за множество тренировки наведнъж
- [ ] Webhook notifications при промени в календара
- [ ] Sync на nutrition plans
- [ ] Персонализирани reminders
- [ ] Multi-calendar support (работа с повече от един календар)

## Support

За въпроси или проблеми:
1. Проверете тази документация
2. Погледнете error logs в browser console
3. Проверете Supabase logs за database errors
4. Проверете Google Cloud Console logs за API errors

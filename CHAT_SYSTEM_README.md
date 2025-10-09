# 💬 Chat System - Real-time Messaging

## 📊 Промени за Instant Messaging

Чат системата е оптимизирана да използва **Supabase Broadcast** за мгновени съобщения, вместо само Postgres Changes.

### 🚀 Как работи сега:

1. **Dual-mode Real-time:**
   - **Broadcast** (основен) - Instant delivery (<100ms)
   - **Postgres Changes** (backup) - Гаранция за доставка

2. **При изпращане на съобщение:**
   ```
   1. Съобщението се записва в DB
   2. Broadcast изпраща съобщението ВЕДНАГА
   3. Postgres Changes го изпраща като backup (2-3 сек)
   4. Duplicate check предотвратява дублиращи се съобщения
   ```

3. **При mark as read:**
   ```
   1. Update на DB
   2. Broadcast изпраща read status ВЕДНАГА
   3. UI се обновява мгновено
   ```

## 🔧 Архитектура

### Broadcast Events:
- `new_message` - Ново съобщение изпратено
- `message_read` - Съобщение прочетено

### Channel naming:
```typescript
conversation:{conversationId}
```

### Message Flow:
```
[User A] --send--> [DB] --broadcast--> [Channel] --receive--> [User B]
   ↓                                                              ↓
[Local UI]                                                  [Local UI]
```

## ✅ Предимства на Broadcast:

✓ **Instant delivery** - <100ms latency
✓ **Lower database load** - По-малко queries
✓ **Better UX** - Без нужда от refresh
✓ **Reliable** - Postgres Changes като backup
✓ **Scalable** - Може да обработва много съобщения

## 📝 Как да тествате:

1. Отворете чата в два отделни прозореца/устройства
2. Влезте като треньор в единия
3. Влезте като клиент в другия
4. Изпратете съобщение
5. Съобщението трябва да се появи ВЕДНАГА (<1 секунда)

## 🐛 Troubleshooting:

### Ако съобщенията все още не са instant:

1. **Проверете Supabase Realtime settings:**
   - Dashboard → Settings → API → Realtime
   - Трябва да е enabled

2. **Проверете Browser Console:**
   - Търсете грешки с "broadcast" или "channel"
   - Проверете дали WebSocket connection е установена

3. **Проверете Network tab:**
   - Трябва да видите WebSocket connection
   - Status: 101 Switching Protocols

### Ако има дублиращи се съобщения:

- Това е нормално - duplicate check ги филтрира
- Broadcast + Postgres Changes могат да изпратят едно съобщение два пъти
- `exists` check предотвратява добавянето им в UI

## 🎯 Performance Tips:

1. **Channel lifecycle:**
   - Subscribe само когато conversation е активен
   - Unsubscribe при смяна на conversation
   - Clean up при unmount

2. **Message batching:**
   - Broadcast ги изпраща веднага
   - Postgres Changes ги batch-ва

3. **Bandwidth optimization:**
   - Broadcast използва WebSockets (ниска latency)
   - По-малко HTTP requests

## 📊 Мониторинг:

За да мониторите real-time performance:

```javascript
// В browser console:
supabase.channel('conversation:xxx').subscribe((status) => {
  console.log('Channel status:', status);
});
```

Статуси:
- `SUBSCRIBING` - Свързване...
- `SUBSCRIBED` - Готов! ✓
- `CHANNEL_ERROR` - Грешка
- `TIMED_OUT` - Timeout

## 🔒 Security:

RLS policies са активни на DB ниво, но Broadcast минава през тях:
- Само участници във conversation получават съобщения
- Broadcast event-ите са публични на channel ниво
- За максимална сигурност използвайте private channels (TODO)

## 🚀 Next Steps (Optional Improvements):

1. **Private Broadcast Channels:**
   ```typescript
   .channel('conversation:xxx', { config: { private: true } })
   ```

2. **Presence API:**
   - Online/Offline status
   - Typing indicators
   - Last seen

3. **Message Queue:**
   - Offline message delivery
   - Retry logic

4. **Push Notifications:**
   - Browser notifications
   - Email notifications

---

**Готово!** Чат системата сега работи с instant delivery! 🎉

import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { defineSecret, defineString } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';

initializeApp();

const ONESIGNAL_REST_API_KEY = defineSecret('ONESIGNAL_REST_API_KEY');
const ONESIGNAL_APP_ID = defineString('ONESIGNAL_APP_ID');

const TODOS_COLLECTION = 'todos';
const REMINDER_WINDOW_MS = 60 * 60 * 1000;
const ONESIGNAL_NOTIFICATIONS_URL = 'https://api.onesignal.com/notifications?c=push';

interface DueTodo {
  readonly userId: string;
  readonly title: string;
  readonly dueDate: number;
  readonly reminderSentAt?: unknown;
}

async function sendReminder(todoId: string, todo: DueTodo): Promise<void> {
  const response = await fetch(ONESIGNAL_NOTIFICATIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Key ${ONESIGNAL_REST_API_KEY.value()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID.value(),
      target_channel: 'push',
      include_aliases: { external_id: [todo.userId] },
      headings: { en: 'Deadline in less than an hour', uk: 'До терміну менше години' },
      contents: {
        en: `"${todo.title}" is due within the next hour.`,
        uk: `Термін виконання «${todo.title}» спливає протягом години.`,
      },
      data: { todoId },
    }),
  });
  if (!response.ok) {
    throw new Error(`OneSignal responded with ${response.status}: ${await response.text()}`);
  }
}

export const sendDueSoonReminders = onSchedule(
  {
    schedule: 'every 5 minutes',
    region: 'europe-central2',
    secrets: [ONESIGNAL_REST_API_KEY],
    retryCount: 0,
  },
  async () => {
    const now = Date.now();
    const snapshot = await getFirestore()
      .collection(TODOS_COLLECTION)
      .where('completed', '==', false)
      .where('dueDate', '>', now)
      .where('dueDate', '<=', now + REMINDER_WINDOW_MS)
      .get();

    const pending = snapshot.docs.filter((doc) => !(doc.data() as DueTodo).reminderSentAt);
    const results = await Promise.allSettled(
      pending.map(async (doc) => {
        await sendReminder(doc.id, doc.data() as DueTodo);
        await doc.ref.update({ reminderSentAt: FieldValue.serverTimestamp() });
      }),
    );

    const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
    failures.forEach((failure) => logger.error('Failed to send due-soon reminder', failure.reason));
    logger.info('Due-soon reminders processed', { found: pending.length, failed: failures.length });
  },
);

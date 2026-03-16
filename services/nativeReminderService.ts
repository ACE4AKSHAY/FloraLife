import { Capacitor } from '@capacitor/core';
import {
  LocalNotifications,
  type DeliveredNotificationSchema,
  type LocalNotificationSchema,
} from '@capacitor/local-notifications';
import { Plant, Reminder, ReminderIntervalHours, ReminderScheduleType } from '../types';

const REMINDER_GROUP = 'floralife-reminders';
const DEFAULT_INTERVAL_HOURS: ReminderIntervalHours = 6;
const MIN_INTERVAL_HOURS: ReminderIntervalHours = 1;
const MAX_INTERVAL_HOURS: ReminderIntervalHours = 24;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const ONE_TIME_REPEAT_MINUTES = 5;
const ONE_TIME_REPEAT_COUNT = 48;
const INTERVAL_OCCURRENCE_COUNT = 36;
const MAX_SCHEDULED_NOTIFICATIONS = Math.max(ONE_TIME_REPEAT_COUNT + 1, INTERVAL_OCCURRENCE_COUNT);

const isNativePlatform = () => Capacitor.getPlatform() !== 'web';

const parseTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return {
    hours: Number.isFinite(hours) ? hours : 8,
    minutes: Number.isFinite(minutes) ? minutes : 0,
  };
};

const buildLocalDate = (date: string, time: string) => {
  const [year, month, day] = date.split('-').map(Number);
  const { hours, minutes } = parseTime(time);
  return new Date(year, (month || 1) - 1, day || 1, hours, minutes, 0, 0);
};

const getTodayAsLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateParts = (value: number | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  return {
    day: `${date.getDate()}`.padStart(2, '0'),
    month: `${date.getMonth() + 1}`.padStart(2, '0'),
    year: date.getFullYear(),
    date,
  };
};

const hashToPositiveInt = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }

  return Math.max(1, Math.abs(hash));
};

const normalizeIntervalHours = (intervalHours?: number): ReminderIntervalHours => {
  const safeIntervalHours = Math.round(Number(intervalHours ?? DEFAULT_INTERVAL_HOURS));

  if (!Number.isFinite(safeIntervalHours)) {
    return DEFAULT_INTERVAL_HOURS;
  }

  return Math.min(MAX_INTERVAL_HOURS, Math.max(MIN_INTERVAL_HOURS, safeIntervalHours));
};

const getAllReminderNotificationIds = (reminderId: string) =>
  Array.from({ length: MAX_SCHEDULED_NOTIFICATIONS }, (_, index) =>
    hashToPositiveInt(`floralife-reminder:${reminderId}:${index}`),
  );

const getNotificationIdsForReminder = (reminder: Reminder) => {
  const allIds = getAllReminderNotificationIds(reminder.id);

  if (reminder.scheduleType === 'daily') {
    return allIds.slice(0, 1);
  }

  if (reminder.scheduleType === 'interval') {
    return allIds.slice(0, INTERVAL_OCCURRENCE_COUNT);
  }

  return allIds.slice(0, ONE_TIME_REPEAT_COUNT + 1);
};

const getReminderTime = (reminder: Reminder) => {
  const date = new Date(reminder.dateTime);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const getNotificationBody = (plantName: string, reminder: Reminder) => {
  if (reminder.scheduleType === 'daily') {
    return `${plantName} needs attention today.`;
  }

  if (reminder.scheduleType === 'interval') {
    return `${plantName} needs attention. Repeats every ${normalizeIntervalHours(reminder.intervalHours)} hours.`;
  }

  return `${plantName} needs attention now. FloraLife will remind again every 5 minutes until it is marked done.`;
};

const buildNotification = (
  notificationId: number,
  plantName: string,
  reminder: Reminder,
  schedule: LocalNotificationSchema['schedule'],
): LocalNotificationSchema => ({
  id: notificationId,
  title: reminder.title,
  body: getNotificationBody(plantName, reminder),
  largeBody: `${reminder.title} for ${plantName}. Open FloraLife to review or update this reminder.`,
  summaryText: 'FloraLife reminder',
  schedule,
  group: REMINDER_GROUP,
  autoCancel: true,
  extra: {
    source: REMINDER_GROUP,
    plantName,
    reminderId: reminder.id,
    scheduleType: reminder.scheduleType,
  },
});

const getNextIntervalTimestamp = (startTimestamp: number, intervalMs: number) => {
  if (startTimestamp > Date.now()) {
    return startTimestamp;
  }

  const elapsed = Date.now() - startTimestamp;
  const steps = Math.floor(elapsed / intervalMs) + 1;
  return startTimestamp + steps * intervalMs;
};

const buildOneTimeNotifications = (plantName: string, reminder: Reminder, ids: number[]) => {
  const followUpMs = ONE_TIME_REPEAT_MINUTES * MINUTE_MS;
  const firstTimestamp = getNextIntervalTimestamp(reminder.dateTime, followUpMs);

  return ids.map((id, index) =>
    buildNotification(id, plantName, reminder, {
      at: new Date(firstTimestamp + index * followUpMs),
      allowWhileIdle: true,
    }),
  );
};

const buildIntervalNotifications = (plantName: string, reminder: Reminder, ids: number[]) => {
  const intervalHours = normalizeIntervalHours(reminder.intervalHours);
  const intervalMs = intervalHours * HOUR_MS;
  const firstTimestamp = getNextIntervalTimestamp(reminder.dateTime, intervalMs);

  return ids.map((id, index) =>
    buildNotification(id, plantName, reminder, {
      at: new Date(firstTimestamp + index * intervalMs),
      allowWhileIdle: true,
    }),
  );
};

const buildNotificationsForReminder = (plantName: string, reminder: Reminder): LocalNotificationSchema[] => {
  const ids = getNotificationIdsForReminder(reminder);

  if (reminder.scheduleType === 'daily') {
    const { hours, minutes } = parseTime(getReminderTime(reminder));

    return [
      buildNotification(ids[0], plantName, reminder, {
        on: {
          hour: hours,
          minute: minutes,
        },
        allowWhileIdle: true,
      }),
    ];
  }

  if (reminder.scheduleType === 'interval') {
    return buildIntervalNotifications(plantName, reminder, ids);
  }

  return buildOneTimeNotifications(plantName, reminder, ids);
};

const clearDeliveredNotifications = async (notificationIds: number[]) => {
  if (!isNativePlatform()) {
    return;
  }

  const delivered = await LocalNotifications.getDeliveredNotifications();
  const matchingDelivered: DeliveredNotificationSchema[] = delivered.notifications.filter(notification =>
    notificationIds.includes(notification.id),
  );

  if (matchingDelivered.length > 0) {
    await LocalNotifications.removeDeliveredNotifications({ notifications: matchingDelivered });
  }
};

export const normalizeReminder = (reminder: Reminder): Reminder => {
  const scheduleType: ReminderScheduleType = reminder.scheduleType ?? 'once';
  const completed = Boolean(reminder.completed);

  return {
    ...reminder,
    completed,
    scheduleType,
    intervalHours: scheduleType === 'interval' ? normalizeIntervalHours(reminder.intervalHours) : undefined,
    enabled: reminder.enabled ?? !completed,
  };
};

export const isRepeatingReminder = (reminder: Reminder) => normalizeReminder(reminder).scheduleType !== 'once';

export const isReminderActive = (reminder: Reminder) => {
  const normalizedReminder = normalizeReminder(reminder);

  if (normalizedReminder.scheduleType === 'once') {
    return normalizedReminder.enabled !== false && !normalizedReminder.completed;
  }

  return normalizedReminder.enabled !== false;
};

export const countActiveReminders = (reminders: Reminder[]) =>
  reminders.reduce((count, reminder) => count + (isReminderActive(reminder) ? 1 : 0), 0);

export const formatReminderTime = (reminder: Reminder) =>
  formatDateParts(reminder.dateTime).date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

export const formatReminderDate = (reminder: Reminder) => {
  const { day, month, year } = formatDateParts(reminder.dateTime);
  return `${day}/${month}/${year}`;
};

export const formatReminderScheduleLabel = (reminder: Reminder) => {
  const normalizedReminder = normalizeReminder(reminder);

  if (normalizedReminder.scheduleType === 'daily') {
    return `Daily at ${formatReminderTime(normalizedReminder)}`;
  }

  if (normalizedReminder.scheduleType === 'interval') {
    return `Every ${normalizeIntervalHours(normalizedReminder.intervalHours)} hours from ${formatReminderTime(normalizedReminder)}`;
  }

  return `${formatReminderDate(normalizedReminder)} at ${formatReminderTime(normalizedReminder)} then every 5 min until done`;
};

export const formatReminderModeChip = (reminder: Reminder) => {
  const normalizedReminder = normalizeReminder(reminder);

  if (normalizedReminder.scheduleType === 'daily') {
    return 'Daily';
  }

  if (normalizedReminder.scheduleType === 'interval') {
    return `Every ${normalizeIntervalHours(normalizedReminder.intervalHours)}h`;
  }

  return 'One Time';
};

export const buildOneTimeReminderTimestamp = (date: string, time: string) => buildLocalDate(date, time).getTime();

export const buildRepeatingReminderTimestamp = (
  time: string,
  scheduleType: ReminderScheduleType,
  intervalHours?: ReminderIntervalHours,
) => {
  const now = new Date();
  const nextRun = buildLocalDate(getTodayAsLocalDate(), time);

  if (scheduleType === 'daily') {
    if (nextRun.getTime() <= now.getTime()) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun.getTime();
  }

  const safeIntervalHours = normalizeIntervalHours(intervalHours);

  while (nextRun.getTime() <= now.getTime()) {
    nextRun.setHours(nextRun.getHours() + safeIntervalHours);
  }

  return nextRun.getTime();
};

export const requestReminderPermissions = async () => {
  if (!isNativePlatform()) {
    return {
      displayGranted: true,
    };
  }

  let displayPermissions = await LocalNotifications.checkPermissions();

  if (displayPermissions.display !== 'granted') {
    displayPermissions = await LocalNotifications.requestPermissions();
  }

  return {
    displayGranted: displayPermissions.display === 'granted',
  };
};

export const cancelReminderSchedule = async (reminderId: string) => {
  if (!isNativePlatform()) {
    return;
  }

  const notificationIds = getAllReminderNotificationIds(reminderId);

  await LocalNotifications.cancel({
    notifications: notificationIds.map(id => ({ id })),
  });

  await clearDeliveredNotifications(notificationIds);
};

export const syncReminderSchedule = async (plantName: string, reminder: Reminder) => {
  const normalizedReminder = normalizeReminder(reminder);

  if (!isNativePlatform()) {
    return normalizedReminder;
  }

  await cancelReminderSchedule(normalizedReminder.id);

  if (!isReminderActive(normalizedReminder)) {
    return normalizedReminder;
  }

  try {
    await LocalNotifications.schedule({
      notifications: buildNotificationsForReminder(plantName, normalizedReminder),
    });
  } catch (error) {
    console.warn('Failed to schedule native reminder:', error);
  }

  return normalizedReminder;
};

const pruneOrphanedReminderNotifications = async (plants: Plant[]) => {
  if (!isNativePlatform()) {
    return;
  }

  const allowedIds = new Set(
    plants.flatMap(plant => plant.reminders.flatMap(reminder => getAllReminderNotificationIds(reminder.id))),
  );

  const pending = await LocalNotifications.getPending();
  const orphanedPending = pending.notifications
    .filter(notification => notification.extra?.source === REMINDER_GROUP && !allowedIds.has(notification.id))
    .map(notification => ({ id: notification.id }));

  if (orphanedPending.length > 0) {
    await LocalNotifications.cancel({ notifications: orphanedPending });
  }

  const delivered = await LocalNotifications.getDeliveredNotifications();
  const orphanedDelivered = delivered.notifications.filter(
    notification =>
      (notification.data?.source === REMINDER_GROUP || notification.extra?.source === REMINDER_GROUP) &&
      !allowedIds.has(notification.id),
  );

  if (orphanedDelivered.length > 0) {
    await LocalNotifications.removeDeliveredNotifications({ notifications: orphanedDelivered });
  }
};

export const syncAllReminderSchedules = async (plants: Plant[]) => {
  const normalizedPlants = plants.map(plant => ({
    ...plant,
    reminders: plant.reminders.map(normalizeReminder),
  }));

  if (!isNativePlatform()) {
    return normalizedPlants;
  }

  for (const plant of normalizedPlants) {
    for (const reminder of plant.reminders) {
      await syncReminderSchedule(plant.customName, reminder);
    }
  }

  await pruneOrphanedReminderNotifications(normalizedPlants);

  return normalizedPlants;
};

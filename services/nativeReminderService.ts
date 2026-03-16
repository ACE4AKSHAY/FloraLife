import { Capacitor } from '@capacitor/core';
import { LocalNotifications, type DeliveredNotificationSchema, type LocalNotificationSchema } from '@capacitor/local-notifications';
import { Plant, Reminder, ReminderIntervalHours, ReminderScheduleType } from '../types';

const REMINDER_GROUP = 'floralife-reminders';
const MAX_INTERVAL_OCCURRENCES = 6;
const REMINDER_INTERVALS: ReminderIntervalHours[] = [4, 6, 8, 12];

const isNativePlatform = () => Capacitor.getPlatform() !== 'web';
const isAndroidPlatform = () => Capacitor.getPlatform() === 'android';

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

const hashToPositiveInt = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }

  return Math.max(1, Math.abs(hash));
};

const getAllReminderNotificationIds = (reminderId: string) =>
  Array.from({ length: MAX_INTERVAL_OCCURRENCES }, (_, index) =>
    hashToPositiveInt(`floralife-reminder:${reminderId}:${index}`),
  );

const getNotificationIdsForReminder = (reminder: Reminder) => {
  const allIds = getAllReminderNotificationIds(reminder.id);

  if (reminder.scheduleType === 'interval') {
    const intervalHours = normalizeIntervalHours(reminder.intervalHours);
    return allIds.slice(0, 24 / intervalHours);
  }

  return allIds.slice(0, 1);
};

const normalizeIntervalHours = (intervalHours?: number): ReminderIntervalHours =>
  REMINDER_INTERVALS.includes(intervalHours as ReminderIntervalHours)
    ? (intervalHours as ReminderIntervalHours)
    : 6;

const getReminderTime = (reminder: Reminder) => {
  const date = new Date(reminder.dateTime);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const getNotificationBody = (plantName: string, reminder: Reminder) => {
  if (reminder.scheduleType === 'daily') {
    return `${plantName} needs attention today. This reminder repeats every day.`;
  }

  if (reminder.scheduleType === 'interval') {
    return `${plantName} needs attention. This reminder repeats every ${normalizeIntervalHours(reminder.intervalHours)} hours.`;
  }

  return `${plantName} needs attention now.`;
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
    const { hours, minutes } = parseTime(getReminderTime(reminder));
    const intervalHours = normalizeIntervalHours(reminder.intervalHours);
    const occurrences = 24 / intervalHours;

    return Array.from({ length: occurrences }, (_, index) =>
      buildNotification(ids[index], plantName, reminder, {
        on: {
          hour: (hours + index * intervalHours) % 24,
          minute: minutes,
        },
        allowWhileIdle: true,
      }),
    );
  }

  return [
    buildNotification(ids[0], plantName, reminder, {
      at: new Date(reminder.dateTime),
      allowWhileIdle: true,
    }),
  ];
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

export const isReminderOverdue = (reminder: Reminder) => {
  const normalizedReminder = normalizeReminder(reminder);
  return normalizedReminder.scheduleType === 'once' && isReminderActive(normalizedReminder) && normalizedReminder.dateTime < Date.now();
};

export const countActiveReminders = (reminders: Reminder[]) =>
  reminders.reduce((count, reminder) => count + (isReminderActive(reminder) ? 1 : 0), 0);

export const formatReminderTime = (reminder: Reminder) =>
  new Date(reminder.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const formatReminderDate = (reminder: Reminder) =>
  new Date(reminder.dateTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const formatReminderScheduleLabel = (reminder: Reminder) => {
  const normalizedReminder = normalizeReminder(reminder);

  if (normalizedReminder.scheduleType === 'daily') {
    return `Daily at ${formatReminderTime(normalizedReminder)}`;
  }

  if (normalizedReminder.scheduleType === 'interval') {
    return `Every ${normalizeIntervalHours(normalizedReminder.intervalHours)} hours from ${formatReminderTime(normalizedReminder)}`;
  }

  return `${formatReminderDate(normalizedReminder)} at ${formatReminderTime(normalizedReminder)}`;
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

export const getReminderPermissionStatus = async () => {
  if (!isNativePlatform()) {
    return {
      displayGranted: true,
      exactAlarmGranted: true,
    };
  }

  const displayPermissions = await LocalNotifications.checkPermissions();
  const exactAlarmGranted = isAndroidPlatform()
    ? (await LocalNotifications.checkExactNotificationSetting()).exact_alarm === 'granted'
    : true;

  return {
    displayGranted: displayPermissions.display === 'granted',
    exactAlarmGranted,
  };
};

export const requestReminderPermissions = async () => {
  if (!isNativePlatform()) {
    return {
      displayGranted: true,
      exactAlarmGranted: true,
    };
  }

  let displayPermissions = await LocalNotifications.checkPermissions();

  if (displayPermissions.display !== 'granted') {
    displayPermissions = await LocalNotifications.requestPermissions();
  }

  const exactAlarmGranted = isAndroidPlatform()
    ? (await LocalNotifications.checkExactNotificationSetting()).exact_alarm === 'granted'
    : true;

  return {
    displayGranted: displayPermissions.display === 'granted',
    exactAlarmGranted,
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

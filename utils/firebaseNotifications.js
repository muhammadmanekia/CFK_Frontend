import notifee, {TriggerType, AndroidImportance} from '@notifee/react-native';

export const scheduleEventNotification = async event => {
  const eventId = event.id;

  // Parse the date string to create a Date object
  const eventDate = new Date(event.date);

  // Get current time in UTC
  const currentTime = new Date();

  // Parse time components
  const timeMatch = event.startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!timeMatch) {
    console.error('Invalid time format:', event.startTime);
    return;
  }

  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  const period = timeMatch[3]?.toUpperCase();

  // Convert to 24-hour format if needed
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  // Get the local timezone offset in minutes
  const tzOffset = eventDate.getTimezoneOffset();

  // Set the time components in UTC
  eventDate.setUTCHours(hours + tzOffset / 60, minutes, 0, 0);

  // Calculate notification time (30 minutes before event)
  const notificationTime = new Date(eventDate.getTime() - 30 * 60 * 1000);

  console.log('Debug timestamps:', {
    currentTimeUTC: currentTime.toISOString(),
    eventTimeUTC: eventDate.toISOString(),
    notificationTimeUTC: notificationTime.toISOString(),
    currentTimeLocal: currentTime.toLocaleString(),
    eventTimeLocal: eventDate.toLocaleString(),
    notificationTimeLocal: notificationTime.toLocaleString(),
  });

  // Validate that notification time is in the future
  if (notificationTime.getTime() <= currentTime.getTime()) {
    console.log('Current time:', currentTime.toISOString());
    console.log('Notification time:', notificationTime.toISOString());
    console.warn(
      'Cannot schedule notification: Event time is in the past or too soon',
    );
    return;
  }

  // Create a channel (Required for Android)
  const channelId = await notifee.createChannel({
    id: 'event',
    name: 'Event Notifications',
    importance: AndroidImportance.HIGH,
  });

  // Create the time-based trigger
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: notificationTime.getTime(),
  };

  try {
    // Schedule the notification
    await notifee.createTriggerNotification(
      {
        id: eventId,
        title: `Upcoming Event: ${event.title}`,
        body: `Your event "${event.title}" starts in 30 minutes.`,
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          categoryId: 'event',
        },
        data: {
          targetScreen: 'Details',
          eventId: eventId,
        },
      },
      trigger,
    );

    console.log('Notification scheduled successfully');
    console.log('Event time (UTC):', eventDate.toISOString());
    console.log('Notification time (UTC):', notificationTime.toISOString());
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
};

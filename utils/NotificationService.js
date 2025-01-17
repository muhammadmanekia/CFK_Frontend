import notifee, {EventType} from '@notifee/react-native';
import {Platform} from 'react-native';

// Export this so it's available everywhere
export const handleNotification = async remoteMessage => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
  }

  await notifee.displayNotification({
    title: remoteMessage.notification.title,
    body: remoteMessage.notification.body,
    data: remoteMessage.data,
    android: {
      channelId: 'default',
      pressAction: {
        id: 'default',
      },
    },
  });
};

export const handleNavigationFromNotification = (navigation, data) => {
  if (data?.targetScreen) {
    if (data.eventId) {
      navigation.navigate(data.targetScreen, {eventId: data.eventId});
    } else {
      navigation.navigate(data.targetScreen);
    }
  }
};

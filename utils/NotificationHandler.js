import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  handleNotification,
  handleNavigationFromNotification,
} from './NotificationService';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';

export const NotificationHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    };

    if (Platform.OS === 'ios') {
      requestUserPermission();
    }

    messaging()
      .subscribeToTopic('event_test')
      .then(() => console.log('Subscribed to topic: event_test'));

    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      handleNotification(remoteMessage);
    });

    const unsubscribeBackground = messaging().onNotificationOpenedApp(
      remoteMessage => {
        if (remoteMessage.data) {
          handleNavigationFromNotification(navigation, remoteMessage.data);
        }
      },
    );

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage && remoteMessage.data) {
          handleNavigationFromNotification(navigation, remoteMessage.data);
        }
      });

    const unsubscribeNotifee = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS && detail.notification) {
        handleNavigationFromNotification(navigation, detail.notification.data);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
      unsubscribeNotifee();
    };
  }, [navigation]);

  return null;
};

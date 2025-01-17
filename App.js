import React, {useEffect, useRef, useState} from 'react';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthProvider} from './utils/AuthContext';
import {Alert, Image, StyleSheet, useColorScheme, View} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import {firebase} from '@react-native-firebase/app';
import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import DonateScreen from './screens/DonationScreen';
import DetailsScreen from './screens/DetailsScreen';
import UpcomingEvents from './screens/UpcomingEvents';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import AccountScreen from './screens/AccountScreen';
import RSVPList from './screens/RSVPList';
import EventFormScreen from './screens/EventFormScreen';
import CreateNotifications from './screens/CreateNotifications';
import SheikhMessagesScreen from './screens/SheikhMessageScreen';
import MembershipScreen from './screens/MembershipScreen';
import ListNotificationsScreen from './screens/ListNotificationsScreen';
import notifee, {EventType} from '@notifee/react-native';
// Create the Stack Navigator
const Stack = createNativeStackNavigator();

// Request permission for notifications
const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission({
    alert: true,
    announcement: false,
    badge: true,
    sound: true,
  });

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    Alert.alert(
      'Notification Permission',
      'Please enable notifications in settings for the app to function properly.',
    );
  }
};

// Create notification channels for Android
const createNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
  }
};

// Display notification
const handleNotification = async (remoteMessage, navigation) => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
  }

  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'Default Title',
    body: remoteMessage.notification?.body || 'Default Body',
    data: remoteMessage.data,
    android: {
      channelId: 'default',
      pressAction: {
        id: 'default',
      },
    },
  });
};

const App = () => {
  const navigation = useRef();
  const [navigateTo, setNavigateTo] = useState();
  const colorScheme = useColorScheme(); // Detect the current color scheme (light or dark)

  useEffect(() => {
    // Request permission for notifications
    requestUserPermission();

    // Create notification channels
    createNotificationChannels();

    // Subscribe to the topic
    const subscribeToEventTopic = async () => {
      await messaging().subscribeToTopic('event_test');
      console.log('Subscribed to topic: event_test');
    };

    subscribeToEventTopic();

    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message:', remoteMessage);
      await handleNotification(remoteMessage);
    });

    // Handle notifications in the foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message:', remoteMessage);
      await handleNotification(remoteMessage);
    });

    // Handle app opened from background notification
    const unsubscribeBackground = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('Notification opened from background:', remoteMessage);
      },
    );

    // Handle app opened from quit state notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification opened from quit state:', remoteMessage);
        }
      });

    // Handle notification clicks using Notifee
    const unsubscribeNotifee = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS && detail.notification) {
        // Handle navigation if data is present
        if (detail.notification.data?.targetScreen) {
          console.log('TARGET SCREEN', detail.notification.data?.targetScreen);
          setNavigateTo({
            screen: detail.notification.data?.targetScreen,
            data: {
              event: {
                id:
                  detail.notification.data?.eventId &&
                  detail.notification.data?.eventId,
              },
            },
          });
          // navigation.navigate(detail.notification.data?.targetScreen, {
          //   eventId: detail.notification.data?.eventId || null,
          // });
        }
        console.log('Notification pressed:', detail.notification);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
      unsubscribeNotifee();
    };
  }, []);

  useEffect(() => {
    if (navigateTo) {
      navigation.current.navigate(
        navigateTo.screen,
        navigateTo.data && navigateTo.data,
      );
    }
  }, [navigateTo]);

  // Define header styles based on the color scheme
  const headerStyle = {
    backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
  };
  const headerTintColor = colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <AuthProvider>
      <NavigationContainer ref={navigation}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: true,
            headerStyle: headerStyle,
            headerTintColor: headerTintColor,
            headerTitleStyle: {fontWeight: 'bold'},
          }}>
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen name="Account" component={AccountScreen} />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{title: 'Calendar'}}
          />
          <Stack.Screen
            name="Donate"
            component={DonateScreen}
            options={{title: 'Donate'}}
          />
          <Stack.Screen
            name="RSVPList"
            component={RSVPList}
            options={{title: 'RSVP List'}}
          />
          <Stack.Screen
            name="EventForm"
            component={EventFormScreen}
            options={{title: 'Add Event Form'}}
          />
          <Stack.Screen
            name="SheikhMessaging"
            component={SheikhMessagesScreen}
            options={{title: `Shaykh's Corner`}}
          />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={{title: 'Details'}}
          />
          <Stack.Screen
            name="UpcomingEvents"
            component={UpcomingEvents}
            options={{title: 'Upcoming Events'}}
          />
          <Stack.Screen
            name="AdminNotifications"
            component={CreateNotifications}
            options={{title: 'Create Notifications'}}
          />
          <Stack.Screen
            name="ListNotifications"
            component={ListNotificationsScreen}
            options={{title: 'Past Notifications'}}
          />
          <Stack.Screen
            name="MembershipScreen"
            component={MembershipScreen}
            options={{title: 'Become a Member'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;

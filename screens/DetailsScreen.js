import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Linking,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import HeaderComponent from '../components/HeaderComponent';
import RSVPPopup from '../components/RSVPPopup';
import {useAuth} from '../utils/AuthContext';
import {fetchEvent} from '../utils/apiUtils';
import {copyEventDetails, shareImageToWhatsApp} from '../utils/messageFormat';
import PushNotification from 'react-native-push-notification';
import AdminActionsModal from '../components/AdminActionsModal';
import {useColorScheme} from 'react-native';
import FastImage from 'react-native-fast-image';
import {BlurView} from '@react-native-community/blur';

const DetailsScreen = ({route, navigation}) => {
  const [isRSVPVisible, setIsRSVPVisible] = useState(false);
  const [isAdminModalVisible, setIsAdminModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const {user} = useAuth();

  const [fetchedEvent, setFetchedEvent] = useState({});

  const event = route?.params?.event || {};

  const colorScheme = useColorScheme();

  const fetchEventDetails = async () => {
    try {
      const fetchingEvent = await fetchEvent(event.id);
      if (fetchingEvent) {
        // Create a new event object instead of mutating the existing one
        const updatedEvent = {
          ...fetchingEvent,
          imageUrl: fetchingEvent.imageUrl,
        };
        setFetchedEvent(updatedEvent);
      } else {
        setFetchedEvent(event);
        console.error('Failed to fetch event details');
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  // Call the function to fetch event details when the screen mounts
  useEffect(() => {
    setLoading(true);
    fetchEventDetails().finally(() => setLoading(false));
    console.log('FE', fetchedEvent);
  }, []);

  // Define styles based on the color scheme
  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  const InfoItem = ({icon, text}) => (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={20} color="#CDA323" />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );

  return (
    <>
      {loading ? (
        <View
          style={[
            styles.container,
            {
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          <Image
            source={require('../assets/images/loading.gif')}
            style={{width: 250, height: 250}}
          />
        </View>
      ) : (
        <SafeAreaView style={styles.container}>
          <RSVPPopup
            visible={isRSVPVisible}
            onClose={() => setIsRSVPVisible(false)}
            eventTitle={fetchedEvent.title}
            eventId={fetchedEvent.id}
          />
          {fetchedEvent && (
            <ScrollView>
              <View style={styles.imageContainer}>
                <FastImage
                  style={styles.backgroundImage}
                  source={{
                    uri: fetchedEvent.imageUrl,
                    priority: FastImage.priority.high,
                  }}
                  resizeMode={FastImage.resizeMode.cover}

                  // onLoadStart={() => setLoading(true)}
                  // onLoadEnd={() => setLoading(false)}
                />
                <BlurView
                  style={StyleSheet.absoluteFill} // Fullscreen blur effect
                  blurType="light"
                  blurAmount={20}
                  reducedTransparencyFallbackColor="white" // For devices without blur support
                />
                <FastImage
                  style={styles.image}
                  source={{
                    uri: fetchedEvent.imageUrl,
                    priority: FastImage.priority.high,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                  blurRadius={20}
                  // onLoadStart={() => setLoading(true)}
                  // onLoadEnd={() => setLoading(false)}
                />
              </View>
              <View style={styles.content}>
                <Text style={styles.title}>{fetchedEvent.title}</Text>
                <View style={styles.infoContainer}>
                  {fetchedEvent.date && (
                    <InfoItem
                      icon="calendar-outline"
                      text={new Intl.DateTimeFormat('en-US', {
                        weekday: 'long', // Adds the day of the week
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'UTC',
                      }).format(new Date(fetchedEvent.date))}
                    />
                  )}
                  <InfoItem
                    icon="time-outline"
                    text={
                      fetchedEvent.endTime
                        ? `${fetchedEvent.startTime} - ${fetchedEvent.endTime}`
                        : fetchedEvent.startTime
                    }
                  />
                  <InfoItem
                    icon="location-outline"
                    text={fetchedEvent.location}
                  />
                </View>
                <Text style={styles.sectionTitle}>About the Event</Text>
                <Text style={styles.description}>
                  {fetchedEvent.description}
                </Text>
                <Text style={styles.sectionTitle}>Event Details</Text>
                <InfoItem
                  icon="person-outline"
                  text={`Organizer: ${fetchedEvent.organizers}`}
                />
                {fetchedEvent.price && (
                  <InfoItem
                    icon="pricetag-outline"
                    text={`Price: ${fetchedEvent.price}`}
                  />
                )}
                {fetchedEvent.capacity && (
                  <InfoItem
                    icon="people-outline"
                    text={`Audience: ${fetchedEvent.capacity}`}
                  />
                )}
                {fetchedEvent.registrationLink ? (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() =>
                      Linking.openURL(fetchedEvent.registrationLink)
                    }>
                    <Text style={styles.buttonText}>Register Here</Text>
                  </TouchableOpacity>
                ) : user == null || user.id != 'cfkadmin_id' ? (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => setIsRSVPVisible(!isRSVPVisible)}>
                    <Text style={styles.buttonText}>RSVP</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() =>
                        navigation.navigate('RSVPList', {eventId: event.id})
                      }>
                      <Text style={styles.buttonText}>RSVP List</Text>
                    </TouchableOpacity>
                  </>
                )}
                {user && user.id === 'cfkadmin_id' && (
                  <TouchableOpacity
                    style={[styles.editButton, {backgroundColor: 'green'}]}
                    onPress={() => setIsAdminModalVisible(true)}>
                    <Entypo name="tools" size={20} color="white" />
                    <Text
                      style={{padding: 4, color: 'white', fontWeight: '700'}}>
                      Admin Actions
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <AdminActionsModal
                event={fetchedEvent}
                navigation={navigation}
                isVisible={
                  isAdminModalVisible && user && user.id === 'cfkadmin_id'
                }
                onClose={() => setIsAdminModalVisible(false)}
              />
            </ScrollView>
          )}
        </SafeAreaView>
      )}
    </>
  );
};

// Define light styles
const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '95%',
    height: '95%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#010000',
    marginBottom: 15,
  },
  infoContainer: {
    marginBottom: 0,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#5D5D5D',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#010000',
    marginTop: 25,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#5D5D5D',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#CDA323',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});
// Define dark styles
const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  imageContainer: {
    width: '100%',
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '95%',
    height: '95%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  infoContainer: {
    marginBottom: 0,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#BDBDBD',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 25,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#BDBDBD',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#CDA323',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

export default DetailsScreen;

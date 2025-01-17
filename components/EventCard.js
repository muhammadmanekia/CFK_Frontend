import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  useColorScheme,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const EventCard = ({event, onPress}) => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme(); // Detect the current color scheme (light or dark)

  // Define styles based on the color scheme
  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;
  const handleNavigation = () => {
    navigation.navigate('Details', {event: {id: event.id}});
  };

  return (
    <TouchableOpacity
      style={styles.eventCard}
      activeOpacity={0.7}
      onPress={handleNavigation}>
      <Image source={{uri: event.imageUrl}} style={styles.eventImage} />
      <Text style={styles.eventTitle} numberOfLines={1}>
        {event.title}
      </Text>
      <View style={styles.eventDetails}>
        <View style={styles.eventDateContainer}>
          <Ionicons
            name="calendar-clear-outline"
            size={18}
            color={styles.iconColor}
          />
          <Text style={styles.eventDate}>
            {new Intl.DateTimeFormat('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC',
            }).format(new Date(event.date))}
          </Text>
        </View>
        {event.registrationLink ? (
          <TouchableOpacity
            style={styles.rsvpButton}
            onPress={() => Linking.openURL(event.registrationLink)}>
            <Text style={styles.rsvpText}>Register</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.rsvpButton} onPress={onPress}>
            <Text style={styles.rsvpText}>RSVP</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Define light styles
const lightStyles = StyleSheet.create({
  eventCard: {
    width: 310,
    borderRadius: 16,
    elevation: 6,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginLeft: 5,
    marginRight: 5,
  },
  eventImage: {
    height: 160,
    width: '100%',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    margin: 12,
    letterSpacing: -0.3,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  eventDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 14,
    color: '#666666',
    paddingLeft: 6,
    fontWeight: '500',
  },
  rsvpButton: {
    backgroundColor: '#CDA323',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rsvpText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  iconColor: '#666666', // Icon color for light mode
});

// Define dark styles
const darkStyles = StyleSheet.create({
  eventCard: {
    width: 310,
    borderRadius: 16,
    elevation: 6,
    backgroundColor: '#111111', // Dark background
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginLeft: 5,
    marginRight: 5,
  },
  eventImage: {
    width: '100%',
    minHeight: 160,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF', // Light text color
    margin: 12,
    letterSpacing: -0.3,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  eventDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 14,
    color: '#CCCCCC', // Light text color for date
    paddingLeft: 6,
    fontWeight: '500',
  },
  rsvpButton: {
    backgroundColor: '#CDA323',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rsvpText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  iconColor: '#CCCCCC', // Icon color for dark mode
});

export default EventCard;

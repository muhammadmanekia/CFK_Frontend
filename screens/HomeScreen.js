import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  useColorScheme,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getCurrentPrayer,
  DEFAULT_PRAYER_TIMES,
  formatTime,
  fetchPrayerTimes,
  getHijriDate,
} from '../utils/prayerUtils';
import {useNavigation} from '@react-navigation/native';
import EventCard from '../components/EventCard';
import RSVPPopup from '../components/RSVPPopup';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAuth} from '../utils/AuthContext';
import {fetchUpcomingEvents, getAdjustment} from '../utils/apiUtils';

const CFKApp = () => {
  const [currentPrayerIndex, setCurrentPrayerIndex] = useState();
  const [isRSVPVisible, setIsRSVPVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState();
  const [events, setEvents] = useState([]);
  const [hijriDate, setHijriDate] = useState(null);
  const {user} = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedEvent, setSelectedEvent] = useState(null); // State to hold the selected event
  const colorScheme = useColorScheme(); // Detect the current color scheme (light or dark)
  const [dateAdjustment, setDateAdjustment] = useState(0);

  // Define styles based on the color scheme
  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  const handleRSVPPress = event => {
    setSelectedEvent(event); // Set the selected event
    setIsRSVPVisible(true); // Show the RSVP popup
  };

  // Update current prayer index every minute
  useEffect(() => {
    // Run once immediately
    if (prayerTimes) {
      setCurrentPrayerIndex(getCurrentPrayer(prayerTimes));
    }

    // Then set up interval to run every minute
    const interval = setInterval(() => {
      if (prayerTimes) {
        setCurrentPrayerIndex(getCurrentPrayer(prayerTimes));
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [prayerTimes]); // Re-run effect when prayerTimes changes

  useEffect(() => {
    const adjusted = async () => {
      await getAdjustment().then(adjust => {
        setDateAdjustment(adjust[0].value);
      });
    };

    adjusted();
  }, []);

  useEffect(() => {
    setLoading(true);

    const loadHijriDate = async () => {
      const today = new Date();
      const islamicDate = await getHijriDate(today, dateAdjustment);
      if (islamicDate) {
        setHijriDate(islamicDate);
      }
      setLoading(false);
    };

    const loadPrayerTimes = async () => {
      const today = new Date();
      const times = await fetchPrayerTimes(
        today,
        '1800 Golden Trail Ct, Carrollton, TX 75010',
      );
      setPrayerTimes(times);
    };

    loadPrayerTimes();
    loadHijriDate();
  }, [dateAdjustment]);

  const loadEvents = async () => {
    try {
      const fetchedEvents = await fetchUpcomingEvents();
      setEvents(fetchedEvents); // Set the formatted events to state
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };
  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Check if we need to refresh the events
      if (
        navigation.getState().routes[navigation.getState().index].params
          ?.refresh
      ) {
        loadEvents(); // Reload events if refresh is true
      }
    });

    return unsubscribe; // Clean up the listener on unmount
  }, [navigation]);

  const renderPrayerTimes = () => (
    <View style={styles.prayerTimesContainer}>
      {/* <Text style={styles.prayerTimesTitle}>Prayer Times</Text> */}
      <View style={styles.prayerTimesGrid}>
        {prayerTimes &&
          prayerTimes.map((prayer, index) => {
            const formattedTime = formatTime(prayer.time);
            return (
              <View
                key={index}
                style={[
                  styles.prayerTime,
                  index === currentPrayerIndex && styles.highlight,
                ]}>
                <Text
                  style={[
                    styles.prayerName,
                    index === currentPrayerIndex && {color: 'white'},
                  ]}>
                  {prayer.name}
                </Text>
                <View style={styles.prayerTimeContainer}>
                  <Text
                    style={[
                      styles.prayerTimeText,
                      index === currentPrayerIndex && {color: 'white'},
                    ]}>
                    {formattedTime.time}
                  </Text>
                  <Text
                    style={[
                      styles.amPmText,
                      index === currentPrayerIndex && {color: 'white'},
                    ]}>
                    {formattedTime.period}
                  </Text>
                </View>
              </View>
            );
          })}
      </View>
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
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}>
            <View style={[styles.header, {paddingTop: insets.top + 16}]}>
              <View style={styles.subHeader}>
                <View style={styles.headerLeft}>
                  <Text style={styles.greeting}>Salam</Text>
                  <Text style={styles.userName}>
                    {user ? user.name : 'Alaikum'}
                  </Text>
                </View>
                <View style={styles.headerIcons}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      user && user.id === 'cfkadmin_id'
                        ? navigation.navigate('AdminNotifications')
                        : navigation.navigate('ListNotifications');
                    }}>
                    <Ionicons
                      name="notifications-circle"
                      size={28}
                      color={styles.iconColor}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      user
                        ? navigation.navigate('Account')
                        : navigation.navigate('SignIn');
                    }}>
                    <Ionicons
                      name="person-circle-sharp"
                      size={28}
                      color={styles.iconColor}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.dateCard}
                onPress={() => navigation.navigate('Calendar')}>
                <Ionicons name="calendar-outline" size={18} color="#666666" />
                <Text style={styles.hijriDate}>
                  {hijriDate ? hijriDate.fullDate : 'Loading...'}
                </Text>
              </TouchableOpacity>

              {renderPrayerTimes()}

              <LinearGradient
                colors={['#FFD700', '#CDA323', '#FFD700']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.goldStrip}
              />
            </View>

            {selectedEvent && (
              <RSVPPopup
                visible={isRSVPVisible}
                onClose={() => setIsRSVPVisible(false)}
                eventTitle={selectedEvent.title} // Pass the event title
                eventId={selectedEvent.id} // Pass the event ID
              />
            )}
            {/* Upcoming Events */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('UpcomingEvents', {events})
                  }>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {events &&
                  events
                    .slice(0, 5)
                    .map((event, index) => (
                      <EventCard
                        key={index}
                        event={event}
                        onPress={() => handleRSVPPress(event)}
                      />
                    ))}
              </ScrollView>
            </View>

            {/* Feature Buttons */}
            <View style={styles.featureButtons}>
              {[
                {
                  text: 'Event Calendar',
                  icon: 'calendar-outline',
                  color: colorScheme != 'dark' ? '#1A1A1A' : 'white',
                  navigate: 'Calendar',
                },
                {
                  text: "Shaykh's Corner",
                  icon: 'chat-processing-outline',
                  color: colorScheme != 'dark' ? '#1A1A1A' : 'white',
                  navigate: 'SheikhMessaging',
                },
                {
                  text: 'Live Stream',
                  icon: 'youtube',
                  color: '#E53935',
                  url: 'https://www.youtube.com/@CityofKnowledge1/streams',
                },
                {
                  text: 'Donate To CFK',
                  icon: 'charity',
                  color: colorScheme != 'dark' ? '#1A1A1A' : 'white',
                  image:
                    colorScheme != 'dark'
                      ? require('../assets/images/donate_icon.png')
                      : require('../assets/images/donate_icon_white.png'),
                  navigate: 'Donate',
                },
                {
                  text: 'MIZAN Institute',
                  image: require('../assets/images/mizan_logo.png'),
                  url: 'https://fiqh.mizaninstitute.org/',
                },
                {
                  text: 'Membership Form',
                  color: colorScheme != 'dark' ? '#1A1A1A' : 'white',
                  icon: 'account-group-outline',
                  navigate: 'MembershipScreen',
                },
              ].map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.featureButton}
                  activeOpacity={0.7}
                  onPress={() =>
                    feature.navigate
                      ? navigation.navigate(feature.navigate)
                      : Linking.openURL(feature.url)
                  }>
                  <View style={styles.featureIconContainer}>
                    {feature.icon ? (
                      <MaterialCommunityIcons
                        name={feature.icon}
                        size={24}
                        color={feature.color}
                      />
                    ) : (
                      <Image
                        source={feature.image}
                        style={styles.featureIcon}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Newsletter and Social */}
            <TouchableOpacity style={styles.newsletterButton}>
              <Text style={styles.newsletterText}>Join Our Newsletter</Text>
            </TouchableOpacity>

            <View style={styles.socialIcons}>
              {[
                {
                  name: 'logo-facebook',
                  color: '#4267B2',
                  link: 'https://www.facebook.com/ckdfw',
                },
                {
                  name: 'logo-instagram',
                  color: '#E1306C',
                  link: 'https://www.instagram.com/cfkdfw/?hl=en',
                },
                {
                  name: 'logo-whatsapp',
                  color: '#25D366',
                  link: 'https://chat.whatsapp.com/LVKmi9GrBDZ2m8UzmDsIqs',
                },
              ].map((platform, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.socialIcon}
                  onPress={() => Linking.openURL(platform.link)}>
                  <Ionicons
                    name={platform.name}
                    size={30}
                    color={platform.color}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {user && user.id == 'cfkadmin_id' && (
            <>
              <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => navigation.navigate('EventForm')}>
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.floatingButtonText}>Add Event</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </>
  );
};

// Define light styles
const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  greeting: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    color: '#1A1A1A',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  hijriDate: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  prayerTimesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    // borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  prayerTimesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  prayerTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  prayerTime: {
    width: '31%', // Allows 3 items per row with gap
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  highlight: {
    backgroundColor: '#CDA323',
    borderColor: '#CDA323',
  },
  prayerName: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  prayerTimeContainer: {
    alignItems: 'center',
  },
  prayerTimeText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  amPmText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: 16,
    color: '#CDA323',
    fontWeight: '600',
  },

  featureButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  featureButton: {
    width: '45%',
    margin: 6,
    paddingVertical: 16,
    paddingHorizontal: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  featureIcon: {
    width: 26,
    height: 26,
  },
  featureText: {
    fontSize: 13,
    textAlign: 'left',
    color: '#1A1A1A',
    fontWeight: '600',
    marginLeft: 10,
  },
  newsletterButton: {
    backgroundColor: '#CDA323',
    padding: 18,
    borderRadius: 12,
    margin: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newsletterText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    marginBottom: 40,
  },
  socialIcon: {
    padding: 12,
    marginHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 50,
  },
  goldStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 1,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#CDA323',
    borderRadius: 50,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    flexDirection: 'row',
  },
  floatingSecondButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#CDA323',
    borderRadius: 50,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    flexDirection: 'row',
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
    paddingLeft: 10,
  },
  iconColor: '#1A1A1A',
});

// Define dark styles
const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Softer dark background
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#333333',
    borderRadius: 12,
  },
  greeting: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222222',
    padding: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  hijriDate: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  prayerTimesContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    // borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  prayerTimesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  prayerTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  highlight: {
    backgroundColor: '#CDA323',
    borderColor: '#CDA323',
  },
  prayerTime: {
    width: '31%', // Allows 3 items per row with gap
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  prayerName: {
    fontSize: 13,
    color: '#BDBDBD',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  prayerTimeContainer: {
    alignItems: 'center',
  },
  prayerTimeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  amPmText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: 16,
    color: '#CDA323',
    fontWeight: '600',
  },

  featureButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  featureButton: {
    width: '45%',
    margin: 6,
    paddingVertical: 16,
    paddingHorizontal: 6,
    backgroundColor: '#000000',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  featureIcon: {
    width: 26,
    height: 26,
  },
  featureText: {
    fontSize: 13,
    textAlign: 'left',
    marginLeft: 10,
    color: '#E0E0E0',
    fontWeight: '600',
  },
  newsletterButton: {
    backgroundColor: '#CDA323',
    padding: 18,
    borderRadius: 12,
    margin: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newsletterText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    marginBottom: 40,
  },
  socialIcon: {
    padding: 12,
    marginHorizontal: 12,
    backgroundColor: '#000000',
    borderRadius: 50,
  },
  goldStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 1,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#CDA323',
    borderRadius: 50,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    flexDirection: 'row',
  },
  floatingSecondButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#CDA323',
    borderRadius: 50,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    flexDirection: 'row',
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
    paddingLeft: 10,
  },
  iconColor: '#FFFFFF',
});

export default CFKApp;

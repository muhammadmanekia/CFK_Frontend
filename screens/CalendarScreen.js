import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  Image,
  useColorScheme,
} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  fetchEvents,
  fetchIslamicDates,
  getAdjustment,
  saveAdjustment,
} from '../utils/apiUtils';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment-hijri';
import {useAuth} from '../utils/AuthContext';

LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  dayNames: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

LocaleConfig.defaultLocale = 'en';

const CalendarComponent = () => {
  const islamicMonths = [
    'Muharram',
    'Safar',
    'Rabi al-Awwal',
    'Rabi al-Thani',
    'Jumada al-Awwal',
    'Jumada al-Thani',
    'Rajab',
    'Shaban',
    'Ramadan',
    'Shawwal',
    'Dhu al-Qadah',
    'Dhu al-Hijjah',
  ];

  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().split('T')[0].slice(0, 7),
  );

  const today = moment().format('YYYY-MM-DD');
  const [data, setData] = useState([]);
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(today);
  const [islamicEvents, setIslamicEvents] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentIslamicMonths, setCurrentIslamicMonths] = useState([]);
  const [currentIslamicYears, setCurrentIslamicYears] = useState([]);
  const [dateAdjustment, setDateAdjustment] = useState(0);
  const {user} = useAuth();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const adjusted = async () => {
      await getAdjustment().then(adjust => {
        adjustDates(adjust[0].value);
      });
    };

    adjusted();
  }, []);

  const styles = isDarkMode ? darkStyles : lightStyles;

  const calendarTheme = isDarkMode
    ? {
        // Dark theme
        calendarBackground: '#121212',
        textSectionTitleColor: '#B0B0B0',
        selectedDayBackgroundColor: '#CDA323',
        selectedDayTextColor: '#121212',
        todayTextColor: '#856713',
        dayTextColor: '#FFFFFF',
        textDisabledColor: '#404040',
        dotColor: '#856713',
        selectedDotColor: '#121212',
        arrowColor: '#CDA323',
        monthTextColor: '#FFFFFF',
        textDayFontFamily: 'System',
        textMonthFontFamily: 'System',
        textDayHeaderFontFamily: 'System',
        textDayFontWeight: '300',
        textMonthFontWeight: 'bold',
        textDayHeaderFontWeight: '300',
        textDayFontSize: 16,
        textMonthFontSize: 18,
        textDayHeaderFontSize: 14,
      }
    : {
        // Light theme
        calendarBackground: '#FFFFFF',
        textSectionTitleColor: '#5D5D5D',
        selectedDayBackgroundColor: '#856713',
        selectedDayTextColor: '#FFFFFF',
        todayTextColor: '#010000',
        dayTextColor: '#010000',
        textDisabledColor: '#D3D3D3',
        dotColor: '#CDA323',
        selectedDotColor: '#FFFFFF',
        arrowColor: '#856713',
        monthTextColor: '#010000',
        textDayFontFamily: 'System',
        textMonthFontFamily: 'System',
        textDayHeaderFontFamily: 'System',
        textDayFontWeight: '300',
        textMonthFontWeight: 'bold',
        textDayHeaderFontWeight: '300',
        textDayFontSize: 16,
        textMonthFontSize: 18,
        textDayHeaderFontSize: 14,
      };
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await fetchEvents();
        const fetchedIslamicDates = await fetchIslamicDates();

        setIslamicEvents(fetchedIslamicDates);

        const allEvents = [...fetchedEvents];
        const formattedEvents = {};

        // Mark regular events
        fetchedEvents.forEach(event => {
          const eventDate = moment.utc(event.date).format('YYYY-MM-DD');
          console.log(event, eventDate);
          formattedEvents[eventDate] = {
            marked: true,
            dotColor: '#43693e', // Using the same color for all events
          };
        });

        // Track unique Islamic months and years
        const islamicMonthsInPeriod = new Set();
        const islamicYearsInPeriod = new Set();

        // Get current month's start and end dates
        const monthStart = moment(currentMonth + '-01');
        const monthEnd = moment(monthStart).endOf('month');

        // Process Islamic events
        fetchedIslamicDates.forEach(({month, events}) => {
          if (Array.isArray(events)) {
            events.forEach(event => {
              for (
                let year = monthStart.iYear() - 1;
                year <= monthStart.iYear() + 1;
                year++
              ) {
                const islamicDate = moment
                  .utc()
                  .iYear(year)
                  .iMonth(islamicMonths.indexOf(month))
                  .iDate(event.day)
                  .add(-dateAdjustment, 'days')
                  .format('YYYY-MM-DD');

                const gregorianMoment = moment(islamicDate);

                if (
                  gregorianMoment.isSameOrAfter(monthStart, 'day') &&
                  gregorianMoment.isSameOrBefore(monthEnd, 'day')
                ) {
                  islamicMonthsInPeriod.add(month);
                  islamicYearsInPeriod.add(year);

                  // Set single dot marking regardless of existing events
                  formattedEvents[islamicDate] = {
                    marked: true,
                    dotColor: '#43693e',
                  };

                  allEvents.push({
                    id: `islamic-${month}-${event.day}`,
                    title: event.event,
                    date: islamicDate,
                    description: `Islamic Event - ${event.day} ${month}`,
                  });
                }
              }
            });
          }
        });

        // Update state with processed data
        setData(allEvents);
        setCurrentIslamicMonths(Array.from(islamicMonthsInPeriod));
        setCurrentIslamicYears(Array.from(islamicYearsInPeriod));
        setEvents(formattedEvents);
        setSelectedDate(today);
        setLoading(false);
        console.log(events);
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    };
    loadEvents();
  }, [currentMonth, dateAdjustment]);

  const adjustDates = amount => {
    setDateAdjustment(prevAdjustment => prevAdjustment + amount);
  };

  const submitDates = () => {
    const res = saveAdjustment(dateAdjustment);
  };

  const resetAdjustment = () => {
    setDateAdjustment(0);
  };

  const onDayPress = useCallback(
    day => {
      setSelectedDate(day.dateString);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    },
    [fadeAnim],
  );

  const getEventsForSelectedDate = useCallback(() => {
    return data.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === selectedDate;
    });
  }, [selectedDate, data]);

  const onMonthChange = month => {
    setCurrentMonth(month.dateString.slice(0, 7));
  };

  const EventItem = ({event}) => {
    const navigation = useNavigation();

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Details', {event})}
        style={
          event.id.includes('islamic')
            ? styles.islamicEventItem
            : styles.eventItem
        }
        disabled={event.id.includes('islamic')}>
        <Ionicons
          name="radio-button-on"
          size={24}
          color={event.id.includes('islamic') ? '#43693e' : '#CDA323'}
          style={styles.eventIcon}
        />
        <View style={styles.eventDetails}>
          <Text style={styles.eventName}>{event.title}</Text>
          {event.description && (
            <Text style={styles.eventDescription} numberOfLines={2}>
              {event.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  const renderCustomHeader = date => {
    const gregorianMonth = date.toString('MMMM yyyy');
    const islamicMonthDisplay =
      currentIslamicMonths.length > 1
        ? `${currentIslamicMonths.join(' / ')} ${currentIslamicYears.join(
            ' / ',
          )}`
        : `${currentIslamicMonths[0] || ''} ${currentIslamicYears[0] || ''}`;

    return (
      <View style={styles.customHeader}>
        <Text style={styles.gregorianMonth}>{gregorianMonth}</Text>
        <Text style={styles.islamicMonth}>{islamicMonthDisplay}</Text>
      </View>
    );
  };

  const renderCustomDay = ({date, state}) => {
    if (!date) return <View style={styles.customDay} />;

    const adjustedDate = moment
      .utc(date.dateString)
      .add(dateAdjustment, 'days');
    const islamicDay = adjustedDate.format('iD');
    const islamicMonth = adjustedDate.format('iM');
    const isFirstOfIslamicMonth = islamicDay === '1';
    const isSelected = date.dateString === selectedDate;
    const isToday = date.dateString === today;
    const hasEvents = events[date.dateString]?.marked;

    return (
      <TouchableOpacity
        style={styles.customDay}
        onPress={() => onDayPress(date)}>
        <View
          style={[
            styles.day,
            isSelected && styles.selectedDay,
            isToday && styles.todayDay,
          ]}>
          <Text
            style={[
              styles.gregorianDayText,
              isSelected
                ? {color: 'white'}
                : isToday
                ? styles.todayText
                : styles.gregorianDayText,
              state === 'disabled' && styles.disabledDayText,
            ]}>
            {date.day}
          </Text>

          <View style={styles.islamicDateContainer}>
            {isFirstOfIslamicMonth ? (
              <Text
                style={[
                  styles.islamicMonthText,
                  isSelected && {color: 'white'},
                  state === 'disabled' && styles.disabledDayText,
                  isToday && styles.todayText,
                ]}>
                {islamicMonths[parseInt(islamicMonth) - 1].substring(0, 3)} 1
              </Text>
            ) : (
              <Text
                style={[
                  styles.islamicDayText,
                  isSelected
                    ? {color: 'white'}
                    : isToday
                    ? styles.todayText
                    : styles.islamicDayText,
                  state === 'disabled' && styles.disabledDayText,
                ]}>
                {islamicDay}
              </Text>
            )}
          </View>
        </View>
        {hasEvents && <View style={styles.eventDot} />}
      </TouchableOpacity>
    );
  };

  const markedDates = {
    ...events,
    [selectedDate]: {
      ...events[selectedDate],
      selected: true,
      selectedColor: '#856713',
    },
  };
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
          <Calendar
            current={`${currentMonth}-01`}
            markedDates={markedDates}
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
            renderHeader={renderCustomHeader}
            dayComponent={renderCustomDay}
            theme={calendarTheme}
            style={styles.calendar}
          />
          <Animated.View
            style={[styles.eventListContainer, {opacity: fadeAnim}]}>
            <Text style={styles.eventListTitle}>Events for {selectedDate}</Text>
            <FlatList
              data={getEventsForSelectedDate()}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => <EventItem event={item} />}
              ListEmptyComponent={
                <Text style={styles.noEventsText}>No events found</Text>
              }
            />
          </Animated.View>
          {user && user.id == 'cfkadmin_id' && (
            <View style={styles.floatingContainer}>
              <Text style={styles.adjustCalendarText}>
                Modify Islamic Calendar
              </Text>
              <View style={styles.adjustmentButtonsContainer}>
                <TouchableOpacity
                  onPress={() => adjustDates(-1)}
                  style={styles.adjustButton}>
                  <Text style={styles.adjustButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={resetAdjustment}
                  style={styles.resetButton}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => adjustDates(1)}
                  style={styles.adjustButton}>
                  <Text style={styles.adjustButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={submitDates}
                style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </>
  );
};

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  eventListContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 5,
  },
  eventListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#010000',
    marginBottom: 15,
  },
  day: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#CDA323',
  },
  islamicEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#43693e',
  },
  eventIcon: {
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontWeight: 'bold',
    color: '#010000',
    fontSize: 16,
  },
  eventDescription: {
    color: '#5D5D5D',
    fontSize: 12,
    marginTop: 4,
  },
  noEventsText: {
    textAlign: 'center',
    color: '#5D5D5D',
    marginTop: 20,
    fontSize: 16,
  },
  calendar: {
    marginBottom: 10,
  },
  customHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
  },
  gregorianMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#010000',
  },
  islamicMonth: {
    fontSize: 14,
    color: '#5D5D5D',
  },
  // Calendar Day Styles
  customDay: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 2,
    height: 42,
    width: '100%',
  },
  selectedDay: {
    backgroundColor: '#856713',
    borderRadius: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayDay: {
    borderColor: '#CDA323',
    borderRadius: 24,
    width: 38,
    height: 38,
    alignItems: 'center',
  },
  // Text Styles
  gregorianDayText: {
    fontSize: 16,
    color: '#010000',
    textAlign: 'center',
    marginBottom: 2,
  },
  islamicDateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
  },
  islamicDayText: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 12,
  },
  islamicMonthText: {
    fontSize: 10,
    color: '#856713',
    lineHeight: 12,
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  todayText: {
    color: '#856713',
  },
  disabledDayText: {
    color: '#D3D3D3',
  },
  // Event Dot
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CDA323',
    marginTop: 2,
  },
  // Admin Controls
  floatingContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustCalendarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010000',
    textAlign: 'center',
    marginTop: 10,
  },
  adjustmentButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    width: '50%',
    alignSelf: 'center',
  },
  adjustButton: {
    padding: 10,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  resetButton: {
    padding: 0,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  adjustButtonText: {
    color: 'gray',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: '#CDA323',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resetButtonText: {
    color: 'gray',
    fontSize: 12,
    fontWeight: 'bold',
  },
  customHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
  },
  weekdayHeader: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  eventListContainer: {
    flex: 1,
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 5,
  },
  eventListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  day: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#856713',
  },
  islamicEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#6B9A65',
  },
  eventIcon: {
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  eventDescription: {
    color: '#B0B0B0',
    fontSize: 12,
    marginTop: 4,
  },
  noEventsText: {
    textAlign: 'center',
    color: '#B0B0B0',
    marginTop: 20,
    fontSize: 16,
  },
  calendar: {
    marginBottom: 10,
  },
  customHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
  },
  gregorianMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  islamicMonth: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  // Calendar Day Styles
  customDay: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 2,
    height: 42,
    width: '100%',
  },
  selectedDay: {
    backgroundColor: '#CDA323',
    borderRadius: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayDay: {
    borderColor: '#856713',
    borderRadius: 24,
    width: 38,
    height: 38,
    alignItems: 'center',
  },
  // Text Styles
  gregorianDayText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 2,
    textAlign: 'center',
  },
  islamicDateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
  },
  islamicDayText: {
    fontSize: 12,
    color: '#B0B0B0',
    lineHeight: 12,
  },
  islamicMonthText: {
    fontSize: 10,
    color: '#CDA323',
    lineHeight: 12,
  },
  selectedDayText: {
    color: '#FFFFFFF',
  },
  todayText: {
    color: '#856713',
  },
  disabledDayText: {
    color: '#404040',
  },
  // Event Dot
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CDA323',
    marginTop: 2,
  },
  customHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
  },
  // Admin Controls
  floatingContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 25,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustCalendarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
  },
  adjustmentButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    width: '50%',
    alignSelf: 'center',
  },
  adjustButton: {
    padding: 10,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  resetButton: {
    padding: 0,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  adjustButtonText: {
    color: '#B0B0B0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: '#856713',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resetButtonText: {
    color: '#B0B0B0',
    fontSize: 12,
    fontWeight: 'bold',
  },
  weekdayHeader: {
    fontSize: 12,
    color: '#B0B0B0',
    fontWeight: '500',
  },
});

export default CalendarComponent;

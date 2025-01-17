import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import EventCard from '../components/EventCard';
import HeaderComponent from '../components/HeaderComponent';
import {useNavigation} from '@react-navigation/native';

const UpcomingEvents = ({route}) => {
  const navigation = useNavigation();
  const [isRSVPVisible, setIsRSVPVisible] = useState(false);
  const events = route.params.events;
  const colorScheme = useColorScheme();

  const renderEventCard = ({item}) => (
    <EventCard
      event={item}
      onPress={() => navigation.navigate('EventDetails', {event: item})}
    />
  );

  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={styles.container}>
      {/* <HeaderComponent title="Upcoming Events" /> */}
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={styles.footer} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#5D5D5D',
    marginBottom: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  separator: {
    height: 16,
  },
  footer: {
    height: 40,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  separator: {
    height: 16,
  },
  footer: {
    height: 40,
  },
});

export default UpcomingEvents;

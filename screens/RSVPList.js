import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet, useColorScheme} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {api} from '../utils/api';

const ApplicantItem = ({applicant, styles, index}) => (
  <View style={styles.applicantItem}>
    <View style={styles.applicantHeader}>
      <Ionicons name="person-circle-outline" size={24} color="#CDA323" />
      <Text style={styles.applicantName}>{applicant.name}</Text>
    </View>
    <Text style={styles.applicantDetail}>ID: {index}</Text>
    <Text style={styles.applicantDetail}>Email: {applicant.email}</Text>
    <Text style={styles.applicantDetail}>
      Additional Guests: {applicant.numberOfGuests || 'None'}
    </Text>
    {applicant.notes && (
      <View style={styles.notesContainer}>
        <Ionicons name="chatbox-ellipses-outline" size={18} color="#666666" />
        <Text style={styles.notesText}>{applicant.notes}</Text>
      </View>
    )}
  </View>
);
//  [
//   {name: 'User 1', id: '1', email: 'mm@ma.com'},
//   {name: 'User 1', id: '2', email: 'mm@ma.com'},
//   {name: 'User 1', id: '3', email: 'mm@ma.com'},
//   {name: 'User 1', id: '4', email: 'mm@ma.com'},
//   {name: 'User 1', id: '5', email: 'mm@ma.com'},
// ];

const RSVPList = ({route, applicants}) => {
  const colorScheme = useColorScheme();
  const {eventId} = route.params;
  const [applicant, setApplicant] = useState([]);

  useEffect(() => {
    fetchRSVPs(eventId);
  }, [eventId]);

  const fetchRSVPs = async eventId => {
    try {
      const response = await api.get(`/api/rsvps/${eventId}`);
      console.log(response.data);
      setApplicant(response.data);
    } catch (error) {
      console.log('RSVP submission failed:', error);
    }
  };

  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  return (
    <View style={styles.container}>
      {applicant.length === 0 ? (
        <Text style={styles.noApplicantsText}>No RSVPs for this event</Text>
      ) : (
        <FlatList
          data={applicant}
          renderItem={({item, index}) => (
            <ApplicantItem applicant={item} styles={styles} index={index + 1} />
          )}
          keyExtractor={(item, index) => item.id || `guest-${index}`}
          ListHeaderComponent={
            <Text style={styles.title}>Applicants List</Text>
          }
        />
      )}
    </View>
  );
};

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  noApplicantsText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
  },
  applicantItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  applicantDetail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  noApplicantsText: {
    fontSize: 18,
    color: '#B0B0B0',
    textAlign: 'center',
    marginTop: 20,
  },
  applicantItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  applicantDetail: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginLeft: 8,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#444444',
    marginVertical: 8,
  },
});

export default RSVPList;

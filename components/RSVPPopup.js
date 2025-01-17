import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useColorScheme,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../utils/AuthContext';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';

const RSVPPopup = ({visible, onClose, onSubmit, eventTitle, eventId}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [guests, setGuests] = useState('0');
  const [notes, setNotes] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [userId, setUserId] = useState('');

  const navigation = useNavigation();
  const {user} = useAuth();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const checkUser = async () => {
      if (user) {
        setUserExists(true);
        setUserId(user.id);
        setName(user.name);
        setEmail(user.email);
      }
    };

    checkUser();
  }, [user]);

  const handleSubmit = async () => {
    try {
      if (name && email) {
        const response = await axios.post(
          'http://env-8355920.atl.jelastic.vps-host.net/api/rsvps',
          {
            userID: user && user.id,
            event: eventId,
            name,
            email,
            numberOfGuests: parseInt(guests),
            additionalNotes: notes,
          },
        );

        Alert.alert(response.data.message);
      } else {
        Alert.alert('Please enter your name and email');
      }

      onClose();
    } catch (error) {
      console.error('RSVP submission failed:', error);
    }
  };

  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#5D5D5D" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>RSVP</Text>
          <Text style={styles.eventTitle}>{eventTitle}</Text>

          {!userExists && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </>
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignSelf: 'center',
            }}>
            <Text style={styles.additionalGuests}>Additional Guests: </Text>
            <TextInput
              style={styles.guests}
              placeholder="Number of Guests"
              value={guests}
              onChangeText={setGuests}
              keyboardType="numeric"
            />
          </View>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Additional Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Confirm RSVP</Text>
          </TouchableOpacity>
          {!userExists && (
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => {
                navigation.navigate('SignIn');
                onClose();
              }}>
              <Text style={styles.signUpButtonText}>
                SIGN IN TO RSVP IN TWO CLICKS
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const lightStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 10,
  },
  additionalNotes: {
    color: 'black',
  },
  additionalGuests: {
    color: 'black',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#010000',
  },
  eventTitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#5D5D5D',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#CDA323',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '100%',
  },
  guests: {
    borderColor: '#CDA323',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#CDA323',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  signUpButton: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  signUpButtonText: {
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    textDecorationLine: 'underline',
  },
});

const darkStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#FFFFFF',
  },
  eventTitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#B0B0B0',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#CDA323',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '100%',
    backgroundColor: '#2C2C2C',
    color: '#FFFFFF',
  },
  additionalNotes: {
    color: 'white',
  },
  additionalGuests: {
    color: 'white',
  },
  guests: {
    borderColor: '#CDA323',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#2C2C2C',
    color: '#FFFFFF',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
    backgroundColor: '#2C2C2C',
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#CDA323',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  signUpButton: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    textDecorationLine: 'underline',
  },
});

export default RSVPPopup;

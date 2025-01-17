import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import {useAuth} from '../utils/AuthContext';
import {sendAdminNotification} from '../utils/apiUtils';
// import {sendPushNotificationToAllUsers} from '../utils/firebaseNotifications';

const CreateNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const {user} = useAuth();
  const colorScheme = useColorScheme();
  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  const handleSendNotification = async () => {
    // Validation
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Please enter both title and message');
      return;
    }

    // Check if user is admin
    if (user?.id !== 'cfkadmin_id') {
      Alert.alert('Unauthorized', 'Only admins can send notifications');
      return;
    }

    try {
      sendAdminNotification(title, message, 'ListNotifications');
      Alert.alert('Success', 'Notification sent to all users');

      // Reset fields
      setTitle('');
      setMessage('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Send Notification</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Notification Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter notification title"
          value={title}
          onChangeText={setTitle}
          maxLength={50}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Notification Message</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Enter notification message"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          maxLength={300}
        />
      </View>

      <TouchableOpacity
        style={styles.sendButton}
        onPress={handleSendNotification}>
        <Text style={styles.sendButtonText}>Send Notification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#CDA323',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1A1A1A', // Dark background
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFFFFF', // Light text for dark background
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#E0E0E0', // Light grey for better contrast
  },
  input: {
    borderWidth: 1,
    borderColor: '#444444', // Darker border for contrast
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#2A2A2A', // Slightly lighter than background for contrast
    color: '#FFFFFF', // Light text
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#CDA323', // Kept the same as it's already a strong color
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  sendButtonText: {
    color: '#1A1A1A', // Dark text for contrast on the button
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateNotifications;

import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  useColorScheme,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {deleteEvent, sendAdminNotification} from '../utils/apiUtils';
import {copyEventDetails, shareImageToWhatsApp} from '../utils/messageFormat';
import PushNotification from 'react-native-push-notification';

const AdminActionsModal = ({event, navigation, isVisible, onClose}) => {
  const colorScheme = useColorScheme();

  const handleEditEvent = () => {
    navigation.navigate('EventForm', {
      event: event,
      isEditing: true,
    });
    onClose();
  };

  const handleScheduleNotification = () => {
    sendAdminNotification(
      'Event Reminder',
      `${event.title} starting now!`,
      'Details',
      event.id,
    );
    // PushNotification.localNotification({
    //   channelId: 'event-reminders',
    //   title: 'Event Reminder',
    //   message: `${event.title} starting now!`,
    //   allowWhileIdle: true,
    // });
    // Alert.alert(
    //   'Notification Scheduled',
    //   'A reminder will be sent 30 minutes before the event.',
    // );
    onClose();
  };

  const handleShareImage = () => {
    shareImageToWhatsApp(event);
    onClose();
  };

  const handleShareDetails = () => {
    copyEventDetails(event);
    onClose();
  };

  const handleDeleteEvent = () => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          try {
            deleteEvent(event.id);
            Alert.alert('Success', 'Event has been deleted');
            navigation.navigate('Home', {refresh: true});
          } catch (e) {
            Alert.alert('Error', e.toString());
          }
        },
      },
    ]);
  };

  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Admin Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditEvent}>
            <Ionicons name="pencil" size={20} color="#CDA323" />
            <Text style={styles.actionButtonText}>Edit Event</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleScheduleNotification}>
            <Ionicons name="notifications" size={20} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Send Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareImage}>
            <Ionicons name="image" size={20} color="#2196F3" />
            <Text style={styles.actionButtonText}>Share Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareDetails}>
            <Ionicons name="share-social" size={20} color="#9C27B0" />
            <Text style={styles.actionButtonText}>Share Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteEvent}>
            <Ionicons name="trash" size={20} color="#F44336" />
            <Text style={styles.deleteButtonText}>Delete Event</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const lightStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#010000',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#010000',
  },
  deleteButton: {
    borderBottomWidth: 0,
  },
  deleteButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#CDA323',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const darkStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },
  deleteButton: {
    borderBottomWidth: 0,
  },
  deleteButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#CDA323',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminActionsModal;

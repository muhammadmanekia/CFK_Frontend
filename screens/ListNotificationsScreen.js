import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {getNotifications} from '../utils/apiUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';

const ListNotificationsScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const fetchedNotifications = await getNotifications();
        if (fetchedNotifications) {
          setNotifications(fetchedNotifications.reverse());
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const openModal = notification => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  const renderNotificationItem = ({item}) => {
    const truncatedBody =
      item.body.length > 40 ? item.body.substring(0, 100) + '...' : item.body; // Truncate body

    return (
      <TouchableOpacity onPress={() => openModal(item)}>
        <View style={styles.notificationItem}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color="#2196F3"
            style={styles.icon}
          />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{truncatedBody}</Text>
            <Text style={styles.notificationDate}>
              {moment(item.updatedAt).fromNow()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderModalContent = () => {
    if (!selectedNotification) return null;
    console.log(selectedNotification);

    return (
      <View style={styles.modalContent}>
        <View style={{flexDirection: 'row'}}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color="#2196F3"
            style={styles.icon}
          />
          <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
        </View>
        <Text style={styles.modalBody}>{selectedNotification.body}</Text>
        {selectedNotification.screen &&
          selectedNotification.screen != 'Home' &&
          selectedNotification.screen != 'ListNotifications' && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                navigation.navigate(
                  selectedNotification.screen,
                  selectedNotification.eventId && {
                    event: {id: selectedNotification.eventId},
                  },
                );
                setModalVisible(false);
                setSelectedNotification(null);
              }}>
              <Text style={styles.navButtonText}>Go To The Message</Text>
            </TouchableOpacity>
          )}
        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
          <Text style={styles.closeButtonText}>Close Notification</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyListContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" /> // Use ActivityIndicator
      ) : (
        <Text style={styles.emptyListText}>No notifications yet.</Text>
      )}
    </View>
  );

  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        refreshing={isLoading}
        onRefresh={() => {}}
        showsVerticalScrollIndicator
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>{renderModalContent()}</View>
      </Modal>
    </View>
  );
};

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Softer background
  },
  header: {
    fontSize: 22, // Slightly smaller header
    fontWeight: '600', // Slightly lighter font weight
    color: '#222',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Lighter border
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10, // Add some top padding
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: 12, // More rounded corners
    padding: 16, // Increased padding
    marginVertical: 8, // Increased margin
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3, // Increased elevation for more pronounced shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    marginRight: 16, // Increased margin
    color: '#2196F3',
  },
  notificationContent: {
    flex: 1, // Allow content to take up available space
  },
  notificationTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
  },
  notificationMessage: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  notificationDate: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20, // Add vertical padding
  },
  emptyListText: {
    fontSize: 16,
    color: '#777',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: '90%', // Occupy most of the screen width
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 16,
    padding: 8,
  },
  navButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButton: {
    padding: 10,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Dark background
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff', // Light text color
    padding: 16,
    backgroundColor: '#333', // Dark header background
    borderBottomWidth: 1,
    borderBottomColor: '#444', // Darker border
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  notificationItem: {
    backgroundColor: '#2C2C2C', // Dark notification background
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    marginRight: 16,
    color: '#2196F3',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#fff', // Light text color
  },
  notificationMessage: {
    fontSize: 15,
    color: '#ccc', // Light message color
    marginTop: 4,
  },
  notificationDate: {
    fontSize: 13,
    color: '#aaa', // Light date color
    marginTop: 4,
    textAlign: 'right',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: '#bbb', // Light empty list text color
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#333', // Dark modal background
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff', // Light modal title color
  },
  modalBody: {
    fontSize: 16,
    padding: 8,
    color: '#fff', // Light modal body color
  },
  navButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButton: {
    padding: 10,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButtonText: {
    color: 'white', // Light close button text color
    fontWeight: 'bold',
  },
});

export default ListNotificationsScreen;

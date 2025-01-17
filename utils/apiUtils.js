import axios from 'axios';
import {api, localhost} from './api';
import {scheduleEventNotification} from './firebaseNotifications';

const cleanEventsData = events => {
  return events.map(event => ({
    id: event._id,
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    description: event.description,
    location:
      event.location ||
      'City of Knowledge, 1800 Golden Trail Ct, Carrollton, TX 75010', // Default message if location is null
    imageUrl: event.imageUrl,
    organizers: event.organizers || 'City of Knowledge',
    price: event.price,
    capacity: event.capacity,
    ...event,
  }));
};

const cleanEventData = event => {
  return {
    id: event._id,
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    description: event.description,
    location:
      event.location ||
      'City of Knowledge, 1800 Golden Trail Ct, Carrollton, TX 75010', // Default message if location is null
    imageUrl: event.imageUrl,
    organizers: event.organizers || 'City of Knowledge',
    price: event.price,
    capacity: event.capacity,
    ...event,
  };
};

export const fetchUpcomingEvents = async () => {
  try {
    const response = await api.get(`/api/events/upcoming`);
    const cleanedData = cleanEventsData(response.data); // Clean the data
    // Schedule notifications for each event
    for (const event of cleanedData) {
      await scheduleEventNotification(event); // Await the notification scheduling
    }
    return cleanedData; // Return cleaned data
  } catch (error) {
    console.log(error);
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

export const fetchEvents = async () => {
  try {
    const response = await api.get(`/api/events/`);
    const cleanedData = cleanEventsData(response.data); // Clean the data

    return cleanedData; // Return cleaned data
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const fetchEvent = async id => {
  try {
    const response = await api.get(`/api/events/${id}`);
    const cleanedData = cleanEventData(response.data); // Clean the data
    return cleanedData; // Return cleaned data
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

export const fetchIslamicDates = async () => {
  try {
    const response = await api.get(`/api/events/islamic-dates`);
    return response.data; // Return cleaned data
  } catch (error) {
    console.error('Error fetching islamic events:', error);
    throw error;
  }
};

export const createEvent = async eventData => {
  try {
    const response = await api.post(`/api/events/`, eventData);
    return response.data; // Return created event data
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.put(`/api/events/${eventId}`, eventData);
    return response.data; // Return updated event data
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async eventId => {
  try {
    const response = await api.delete(`/api/events/${eventId}`);
    return response.data; // Return deleted event data
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const saveAdjustment = async adjustment => {
  try {
    const response = await api.post(`/api/date-adjust/save-adjustment`, {
      adjustment: adjustment,
    });
    return response; // Return deleted event data
  } catch (error) {
    console.error('Error saving date adjustment:', error);
    throw error;
  }
};

export const getAdjustment = async () => {
  try {
    const response = await api.get(`/api/date-adjust/get-adjustment`);
    return response.data; // Return deleted event data
  } catch (error) {
    console.error('Error getting date adjustment:', error);
    throw error;
  }
};

export const sendAdminNotification = async (title, body, screen, eventId) => {
  try {
    const response = await api.post('/api/firebase/send-notification', {
      topic: 'event_test',
      title: title,
      body: body,
      screen: screen,
      eventId: eventId ? eventId : 'null',
    });
    console.log('Notification sent:', response.data);
  } catch (error) {
    console.error('Error sending notification:', error.message);
  }
};

export const fetchSheikhMessages = async () => {
  try {
    const response = await api.get('/api/messages');
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

export const postSheikhMessages = async message => {
  try {
    const response = await api.post('/api/messages', message);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

export const getNotifications = async () => {
  try {
    const response = await api.get(`/api/firebase/get-notifications`);
    return response.data; // Return deleted event data
  } catch (error) {
    console.error('Error getting date adjustment:', error);
    throw error;
  }
};

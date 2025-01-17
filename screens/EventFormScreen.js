import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
  useColorScheme,
  Image,
  ActivityIndicator,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {createEvent, updateEvent} from '../utils/apiUtils';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

const EventFormScreen = ({route, navigation}) => {
  const colorScheme = useColorScheme();

  // Check if we're editing an existing event
  const {event} = route.params || {};
  const isEditing = !!event;

  const parseTimeString = timeString => {
    const [hour, minute] = timeString.split(/:| /);
    const isPM = timeString.toLowerCase().includes('pm');
    const date = new Date();
    date.setHours(isPM ? parseInt(hour, 10) + 12 : parseInt(hour, 10));
    date.setMinutes(parseInt(minute, 10));
    date.setSeconds(0);
    return date;
  };

  const formatTime = date => {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };
  // Initialize state with existing event details or default values
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState(
    event?.date ? new Date(event.date) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(
    event?.startTime ? parseTimeString(event.startTime) : null,
  );
  const [endTime, setEndTime] = useState(
    event?.endTime ? parseTimeString(event.endTime) : null,
  );
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [location, setLocation] = useState(
    event?.location ||
      'City of Knowledge, 1800 Golden Trail Ct, Carrollton, TX 75010',
  );
  const [imageUrl, setImageUrl] = useState(event?.imageUrl || '');
  const [price, setPrice] = useState(event?.price || '');
  const [organizers, setOrganizers] = useState(event?.organizers || '');
  const [registrationLink, setRegistrationLink] = useState(
    event?.registrationLink || '',
  );
  const [contact, setContact] = useState(event?.contact || '');
  const [audience, setAudience] = useState(event?.audience || '');
  const [requireRSVP, setRequireRSVP] = useState(event?.requireRSVP || false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set navigation title based on whether we're editing or creating
    navigation.setOptions({
      title: isEditing ? 'Edit Event' : 'Create Event',
    });
  }, []);

  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const imageUri = response.assets[0].uri;

        try {
          const uploadedUrl = await uploadImageToFirebase(imageUri);
          setImageUrl(uploadedUrl);
        } catch (error) {
          console.log('Error uploading image:', error);
        }
      }
    });
  };

  const uploadImageToFirebase = async imageUri => {
    setLoading(true);
    const fileName = imageUri.substring(imageUri.lastIndexOf('/') + 1);
    const storageRef = storage().ref(`event-images/${fileName}`);

    // Upload image to Firebase Storage
    const task = storageRef.putFile(imageUri);

    return new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        snapshot => {
          // You can track upload progress here if needed
          console.log(
            `Progress: ${
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            }%`,
          );
        },
        error => reject(error),
        async () => {
          // Get the download URL after upload completes
          const downloadUrl = await storageRef.getDownloadURL();
          setLoading(false);
          resolve(downloadUrl);
        },
      );
    });
  };

  const handleSubmit = async () => {
    const eventData = {
      title,
      description,
      date,
      location,
      imageUrl,
      organizers,
      registrationLink,
      startTime: formatTime(startTime),
      endTime: endTime ? formatTime(endTime) : null,
      contact,
      requireRSVP,
      audience,
      price,
    };

    try {
      if (isEditing) {
        // Update existing event logic
        await updateEvent(event._id, eventData);
        Alert.alert('Updated Event', eventData.title);
      } else {
        // Create new event logic
        await createEvent(eventData);
        Alert.alert('Created New Event', eventData.title);
      }

      // Navigate back to previous screen and trigger refresh
      navigation.navigate('Home', {refresh: true});
    } catch (e) {
      console.log(e);
    }
  };

  // Define styles based on the color scheme
  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.modalTitle}>
          {isEditing ? 'Edit Event' : 'Create Event'}
        </Text>
        <Text style={styles.modalSubTitle}>Event Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Event Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#888"
        />
        <Text style={styles.modalSubTitle}>Event Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Event Description"
          value={description}
          onChangeText={setDescription}
          multiline
          placeholderTextColor="#888"
        />
        <Text style={styles.modalSubTitle}>Event Date</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateTimeButton}>
          <Text style={styles.dateTimeText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <DatePicker
          modal
          open={showDatePicker}
          date={date}
          onConfirm={selectedDate => {
            setShowDatePicker(false);
            setDate(selectedDate);
          }}
          onCancel={() => setShowDatePicker(false)}
          mode="date"
        />
        <Text style={styles.modalSubTitle}>Event Start Time</Text>
        <TouchableOpacity
          onPress={() => setShowStartTimePicker(true)}
          style={styles.dateTimeButton}>
          <Text style={styles.dateTimeText}>
            {startTime
              ? startTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Set Start Time'}
          </Text>
        </TouchableOpacity>
        <DatePicker
          modal
          open={showStartTimePicker}
          date={startTime || new Date()}
          onConfirm={selectedTime => {
            setShowStartTimePicker(false);
            setStartTime(selectedTime);
          }}
          onCancel={() => setShowStartTimePicker(false)}
          mode="time"
        />
        <Text style={styles.modalSubTitle}>Event End Time (Optional)</Text>
        <TouchableOpacity
          onPress={() => setShowEndTimePicker(true)}
          style={styles.dateTimeButton}>
          <Text style={styles.dateTimeText}>
            {endTime
              ? endTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Set End Time'}
          </Text>
        </TouchableOpacity>
        <DatePicker
          modal
          open={showEndTimePicker}
          date={endTime || new Date()}
          onConfirm={selectedTime => {
            setShowEndTimePicker(false);
            setEndTime(selectedTime);
          }}
          onCancel={() => setShowEndTimePicker(false)}
          mode="time"
        />
        <Text style={styles.modalSubTitle}>Event Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#888"
        />
        <Text style={styles.modalSubTitle}>Event Flyer/Image</Text>
        <View style={{flexDirection: 'row'}}>
          <TextInput
            style={styles.imageInput}
            placeholder="Enter Url"
            value={imageUrl}
            onChangeText={url => {
              setImageUrl(url);
            }}
            placeholderTextColor="#888"
          />
          <Text style={styles.orText}>Or</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {loading ? (
              <ActivityIndicator size={20} />
            ) : imageUrl ? (
              <Image source={{uri: imageUrl}} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imagePickerText}>Pick an Image</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.modalSubTitle}>Event Organizers</Text>
        <TextInput
          style={styles.input}
          placeholder="example (CFK Admins/Al-Mizan Institute)"
          value={organizers}
          onChangeText={setOrganizers}
          placeholderTextColor="#888"
        />
        <Text style={styles.modalSubTitle}>
          Event Registration Link (Optional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="http://... (Registration link will disable RSVP)"
          value={registrationLink}
          onChangeText={setRegistrationLink}
          placeholderTextColor="#888"
        />
        <Text style={styles.modalSubTitle}>Event Contact Info (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="example (John Doe - (123) 456-7890)"
          value={contact}
          onChangeText={setContact}
          placeholderTextColor="#888"
        />
        <Text style={styles.modalSubTitle}>Event Price (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="example ($5 per person/Youth: $5)"
          value={price}
          onChangeText={setPrice}
          placeholderTextColor="#888"
        />
        <Text style={styles.modalSubTitle}>Event Audience (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="example (Ladies only/Gents only/Youth) "
          value={audience}
          onChangeText={setAudience}
          placeholderTextColor="#888"
        />
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Add RSVP (optional)</Text>
          <Switch
            value={requireRSVP}
            disabled={registrationLink.length > 0}
            onValueChange={setRequireRSVP}
            trackColor={{false: '#767577', true: '#CDA323'}}
            thumbColor={requireRSVP ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor:
                !title ||
                !description ||
                !date ||
                !location ||
                !imageUrl ||
                !organizers ||
                !startTime
                  ? 'lightgray'
                  : '#CDA323',
            },
          ]}
          disabled={
            !title ||
            !description ||
            !date ||
            !location ||
            !imageUrl ||
            !organizers ||
            !startTime
          }
          onPress={handleSubmit}>
          <Text style={[styles.submitButtonText]}>
            {isEditing ? 'Update Event' : 'Create Event'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Define light styles
const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    padding: 20,
  },
  modalSubTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
    marginBottom: 4,
    marginLeft: 2,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#CDA323',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '100%',
    backgroundColor: 'white',
    fontSize: 16,
  },
  imageInput: {
    height: 50,
    borderColor: '#CDA323',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '50%',
    backgroundColor: 'white',
    fontSize: 16,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  dateTimeButton: {
    height: 50,
    borderColor: '#CDA323',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  imagePicker: {
    flex: 1,
    borderColor: '#CDA323',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  imagePreview: {
    borderRadius: 10,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#888',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  orText: {
    color: 'black',
    justifyContent: 'center',
    alignContent: 'center',
  },
  submitButton: {
    backgroundColor: '#CDA323',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

// Define dark styles
const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    padding: 20,
  },
  modalSubTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B0B0B0',
    textAlign: 'left',
    marginBottom: 4,
    marginLeft: 2,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  imageInput: {
    height: 50,
    borderColor: '#CDA323',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '50%',
    backgroundColor: '#1E1E1E',
    fontSize: 16,
    color: 'white',
  },
  orText: {
    color: 'white',
    justifyContent: 'center',
    textAlign: 'center',
    paddingVertical: 15,
    paddingHorizontal: 8,
  },
  input: {
    height: 50,
    borderColor: '#CDA323',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '100%',
    backgroundColor: '#1E1E1E',
    fontSize: 16,
    color: '#FFFFFF',
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  imagePicker: {
    flex: 1,
    borderColor: '#CDA323',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },

  dateTimeButton: {
    height: 50,
    borderColor: '#CDA323',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  imagePreview: {
    width: 100,
    height: 50,
    borderRadius: 10,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#888',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  submitButton: {
    backgroundColor: '#CDA323',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default EventFormScreen;

import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  useColorScheme,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import {launchImageLibrary} from 'react-native-image-picker';
import {useAuth} from '../utils/AuthContext';
import storage from '@react-native-firebase/storage';
import * as Progress from 'react-native-progress';
import {
  fetchSheikhMessages,
  postSheikhMessages,
  sendAdminNotification,
} from '../utils/apiUtils';
import YoutubePlayer from 'react-native-youtube-iframe';
import ImageResizer from 'react-native-image-resizer';
import {createThumbnail} from 'react-native-create-thumbnail';

const VIDEO_HEIGHT = 400;
const IMAGE_RESIZE_WIDTH = 1280;
const IMAGE_RESIZE_HEIGHT = 720;
const IMAGE_QUALITY = 0.7;
const THUMBNAIL_SIZE = 50;

const SheikhMessagesScreen = () => {
  const [messageText, setMessageText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [fullScreenMedia, setFullScreenMedia] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(100);
  const [isUploading, setIsUploading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [playingVideos, setPlayingVideos] = useState({});
  const [uploadTask, setUploadTask] = useState(null);
  const [isUploadCancellable, setIsUploadCancellable] = useState(true);
  const colorScheme = useColorScheme(); // Detect the current color scheme (light or dark)

  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  const flatListRef = useRef(null);
  const {user} = useAuth();

  // Extract YouTube video ID from URL
  const getYoutubeVideoId = url => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const optimizeImage = async uri => {
    try {
      const response = await ImageResizer.createResizedImage(
        uri,
        IMAGE_RESIZE_WIDTH,
        IMAGE_RESIZE_HEIGHT,
        'JPEG',
        IMAGE_QUALITY,
      );
      return response.uri;
    } catch (error) {
      console.error('Image optimization failed:', error);
      return uri;
    }
  };

  useEffect(() => {
    fetchMessages().then(() => {
      scrollToBottom();
    });
  }, []);

  const fetchMessages = async () => {
    const fetchMsg = await fetchSheikhMessages();
    setMessages(fetchMsg);
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: false});
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const uploadMedia = async () => {
    if (!selectedMedia) return null;

    setIsUploading(true);
    setUploadProgress(0);
    setIsUploadCancellable(true); // Set isUploadCancellable to true

    try {
      const reference = storage().ref(`media/${selectedMedia.name}`);

      const metadata = {
        contentType: selectedMedia.type,
        cacheControl: 'public,max-age=31536000',
      };

      // Create upload task
      const task = reference.putFile(selectedMedia.uri, metadata);

      setUploadTask(task);

      // Track upload progress
      task.on(
        'state_changed',
        snapshot => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        error => {
          console.error('Upload error:', error);
          setIsUploading(false);
          setIsUploadCancellable(false); // Set isUploadCancellable to false on error
          return null;
        },
      );

      // Wait for upload to complete
      await task;

      // Get download URL
      setIsFinalizing(true);
      const downloadURL = await reference.getDownloadURL();

      setIsUploading(false);
      setIsFinalizing(false);
      setIsUploadCancellable(false); // Set isUploadCancellable to false on completion

      return downloadURL;
    } catch (error) {
      console.error('Error preparing upload:', error);
      setIsUploading(false);
      setIsFinalizing(false);
      setIsUploadCancellable(false); // Set isUploadCancellable to false on error
      return null;
    }
  };

  const toggleVideoPlay = useCallback(messageId => {
    setPlayingVideos(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  }, []);

  const renderSelectedMedia = useCallback(
    media => (
      <View style={styles.selectedMediaContainer}>
        {media.isVideo ? (
          <View style={styles.mediaPreview}>
            <View style={styles.videoPreviewContent}>
              <Ionicons name="videocam" size={24} color="#007a6e" />
              <Text style={styles.videoText}>Video</Text>
            </View>
          </View>
        ) : (
          <Image source={{uri: media.uri}} style={styles.mediaPreview} />
        )}
        <TouchableOpacity
          onPress={() => setSelectedMedia(null)}
          style={styles.removeButton}>
          <Ionicons name="close-circle" size={24} color="red" />
        </TouchableOpacity>
      </View>
    ),
    [],
  );
  // Optimized media selection
  const selectMedia = useCallback(async () => {
    const options = {
      mediaType: 'mixed',
      quality: IMAGE_QUALITY,
      videoQuality: 'medium',
    };

    try {
      setIsAttaching(true);
      const result = await launchImageLibrary(options);

      if (result.assets?.[0]) {
        const file = result.assets[0];
        const timestamp = Date.now();
        const extension = file.type.split('/')[1];
        const filename = `${timestamp}_${Math.random()
          .toString(36)
          .substring(7)}.${extension}`;

        let optimizedUri = file.uri;
        const isVideo = file.type.includes('video');

        if (!isVideo) {
          optimizedUri = await optimizeImage(file.uri);
        }

        setSelectedMedia({
          uri: optimizedUri,
          name: filename,
          type: file.type,
          size: file.fileSize,
          isVideo,
        });
      }
    } catch (error) {
      console.error('Media selection failed:', error);
    } finally {
      setIsAttaching(false);
    }
  }, []);

  const removeMedia = () => {
    setSelectedMedia(null);
  };

  const sendMessage = async () => {
    if (!messageText.trim() && !selectedMedia) {
      console.log('No message to send');
      return;
    }

    setIsLoading(true);
    try {
      let mediaUrl = null;
      if (selectedMedia) {
        console.log('Uploading Media');
        mediaUrl = await uploadMedia();

        if (!mediaUrl) {
          throw new Error('Failed to upload media');
        }
      }

      const newMessage = {
        text: messageText,
        url: mediaUrl,
        mediaType: selectedMedia?.type || null,
      };

      console.log('Posting Message', selectedMedia, mediaUrl, newMessage);
      const postMessage = await postSheikhMessages(newMessage);

      if (!selectedMedia) {
        sendAdminNotification(
          'New Message From Shaykh',
          messageText,
          'SheikhMessaging',
        );
      } else if (!messageText) {
        sendAdminNotification(
          'New Message From Shaykh',
          'Sent an attachment',
          'SheikhMessaging',
        );
      } else {
        sendAdminNotification(
          'New Message From Shaykh',
          messageText,
          'SheikhMessaging',
        );
      }

      setMessageText('');
      setSelectedMedia(null);
      await fetchMessages();
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.', [
        {text: 'OK'},
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  const groupMessagesByDate = messages => {
    const groups = {};

    messages.forEach(message => {
      const date = new Date(message.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateString;
      if (date.toDateString() === today.toDateString()) {
        dateString = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateString = 'Yesterday';
      } else {
        dateString = date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }

      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      groups[dateString].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
      id: date,
    }));
  };

  const cancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setIsUploading(false);
      setIsUploadCancellable(false);
    }
  };

  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  const renderMessage = useCallback(
    ({item}) => {
      const youtubeId = item.text ? getYoutubeVideoId(item.text) : null;
      const isPlaying = playingVideos[item._id] || false;

      return (
        <View style={styles.messageContainer}>
          <View style={[styles.message, {minWidth: youtubeId ? '85%' : '75%'}]}>
            {youtubeId && (
              <View style={styles.youtubeContainer}>
                <YoutubePlayer
                  height={VIDEO_HEIGHT}
                  videoId={youtubeId}
                  play={false}
                />
              </View>
            )}

            {item.url && !youtubeId && (
              <View style={styles.mediaContainer}>
                {item.mediaType?.includes('video') ? (
                  <View style={styles.videoWrapper}>
                    <Video
                      source={{uri: item.url}}
                      style={styles.video}
                      controls={isPlaying}
                      resizeMode="contain"
                      paused={!isPlaying}
                      onError={error => console.error('Video Error:', error)}
                      onEnd={() =>
                        setPlayingVideos(prev => ({...prev, [item._id]: false}))
                      }
                    />
                    {!isPlaying && (
                      <TouchableOpacity
                        style={styles.videoOverlay}
                        onPress={() => toggleVideoPlay(item._id)}>
                        <Ionicons name="play-circle" size={50} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => handleMediaPress(item.url)}>
                    <Image
                      style={styles.image}
                      source={{uri: item.url}}
                      loading="lazy"
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {item.text && !youtubeId && (
              <Text style={[styles.messageText, item.url && {marginTop: 4}]}>
                {item.text}
              </Text>
            )}

            <Text style={[styles.timestamp, !item.text && {marginTop: 10}]}>
              {new Date(item.date).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      );
    },
    [playingVideos, toggleVideoPlay],
  );

  const renderDateGroup = ({item}) => (
    <View style={styles.dateGroup}>
      <View style={styles.dateHeader}>
        <View style={styles.dateLine} />
        <Text style={styles.dateText}>{item.date}</Text>
        <View style={styles.dateLine} />
      </View>
      {item.messages.map(message => (
        <View key={message._id || `${message.date}-${message.text}`}>
          {renderMessage({item: message})}
        </View>
      ))}
    </View>
  );

  const handleMediaPress = useCallback(async mediaUri => {
    setFullScreenMedia(mediaUri);
    setIsImageModalVisible(true);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{
              uri: 'https://i0.wp.com/cfkdfw.org/wp-content/uploads/2021/10/31d401cb-940a-48a2-b28c-3dae0fa06105-_1_.jpg?w=835&ssl=1',
            }}
            style={styles.headerImage}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Shaykh Mahdi Rastani</Text>
            <Text style={styles.subHeaderText}>Resident Aalim</Text>
          </View>
        </View>

        {/* Messages List */}

        <FlatList
          ref={flatListRef}
          data={groupedMessages}
          renderItem={renderDateGroup}
          keyExtractor={item => item.date}
          contentContainerStyle={styles.listContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />

        {/* Input Area */}

        {user && user.id === 'cfkadmin_id' && (
          <View style={styles.inputArea}>
            {selectedMedia && renderSelectedMedia(selectedMedia)}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message"
                placeholderTextColor={'#8E8E93'}
                onChangeText={setMessageText}
                value={messageText}
                multiline
                maxHeight={100}
              />
              <TouchableOpacity
                style={styles.attachButton}
                onPress={selectMedia}
                disabled={isUploading || isAttaching}>
                {isAttaching ? (
                  <ActivityIndicator size="small" color="#007a6e" />
                ) : (
                  <Ionicons
                    name="attach"
                    size={24}
                    color={isUploading || isAttaching ? '#ccc' : '#007a6e'}
                  />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                !messageText.trim() &&
                  !selectedMedia &&
                  styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={isLoading || (!messageText.trim() && !selectedMedia)}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Modals and Overlays */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isImageModalVisible}
          onRequestClose={() => setIsImageModalVisible(false)}>
          <View style={styles.fullScreenContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsImageModalVisible(false)}>
              <Ionicons name="close-circle" size={30} color="white" />
            </TouchableOpacity>
            {fullScreenMedia && (
              <Image
                source={{uri: fullScreenMedia}}
                style={styles.fullScreenImage}
                resizeMode="contain"
                loading="lazy"
              />
            )}
          </View>
        </Modal>

        {/* Upload Progress Overlay */}
        {isUploading && (
          <View style={styles.centerScreenContainer}>
            <View style={styles.progressBarContainer}>
              <Text style={styles.uploadingText}>Uploading File</Text>
              <Progress.Bar
                progress={uploadProgress / 100}
                width={null}
                height={10}
                color="#ad0011"
                unfilledColor="#b3b3b3"
                borderWidth={0}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(uploadProgress)}%
            </Text>
            {uploadProgress === 100 && isFinalizing && (
              <Text style={styles.finalizingText}>Finalizing...</Text>
            )}
            {isUploadCancellable && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelUpload}>
                <Text style={styles.cancelText}>Cancel Upload</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#007a6e',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  mediaPreview: {
    width: 50,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'black', // Important for video thumbnails
  },
  subHeaderText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 15,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 14,
    color: '#666666',
    marginHorizontal: 10,
    fontWeight: '500',
  },
  listContainer: {
    paddingVertical: 15,
  },
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 15,
  },
  message: {
    backgroundColor: '#007a6e',
    borderRadius: 18,
    padding: 12,
    maxWidth: '85%',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    // marginBottom: 10,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  mediaContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: 'black',
  },
  youtubeContainer: {
    minWidth: '85%',
    height: '180',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    padding: 8,
    borderRadius: 5,
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  videoWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  inputArea: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadingText: {
    textAlign: 'center',
    fontWeight: '700',
    color: 'white',
  },

  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 20,
    marginRight: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#000000',
  },
  attachButton: {
    marginLeft: 5,
    width: 40, // Fixed width to prevent layout shift
    height: 40, // Fixed height to prevent layout shift
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButton: {
    backgroundColor: '#007a6e',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  selectedMediaContainer: {
    marginBottom: 10,
    marginRight: 10,
    position: 'relative',
  },
  mediaPreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewContent: {
    alignItems: 'center',
  },
  videoText: {
    fontSize: 10,
    color: '#007a6e',
    marginTop: 2,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  progressBarContainer: {
    width: 200,
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 10,
    color: 'white',
    fontWeight: '600',
  },

  finalizingText: {
    marginTop: 5,
    fontSize: 14,
    color: '#555', // Dark gray text
    textAlign: 'center',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#007a6e',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mediaPreview: {
    width: 50,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'black', // Important for video thumbnails
  },
  subHeaderText: {
    fontSize: 14,
    color: '#BBBBBB',
    marginTop: 2,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 15,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 14,
    color: '#BBBBBB',
    marginHorizontal: 10,
    fontWeight: '500',
  },
  listContainer: {
    paddingVertical: 15,
  },
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 15,
  },
  message: {
    backgroundColor: '#007a6e',
    borderRadius: 18,
    padding: 12,
    maxWidth: '85%',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    // marginBottom: 10,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  mediaContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: 'black',
  },
  youtubeContainer: {
    minWidth: '85%',
    height: '180',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    padding: 8,
    borderRadius: 5,
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  videoWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  inputArea: {
    padding: 10,
    backgroundColor: '#333333',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadingText: {
    textAlign: 'center',
    fontWeight: '700',
    color: 'white',
  },

  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 20,
    marginRight: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#000000',
  },
  attachButton: {
    marginLeft: 5,
    width: 40, // Fixed width to prevent layout shift
    height: 40, // Fixed height to prevent layout shift
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButton: {
    backgroundColor: '#007a6e',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  selectedMediaContainer: {
    marginBottom: 10,
    marginRight: 10,
    position: 'relative',
  },
  mediaPreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewContent: {
    alignItems: 'center',
  },
  videoText: {
    fontSize: 10,
    color: '#007a6e',
    marginTop: 2,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  progressBarContainer: {
    width: 200,
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 10,
    color: 'white',
    fontWeight: '600',
  },

  finalizingText: {
    marginTop: 5,
    fontSize: 14,
    color: '#555', // Dark gray text
    textAlign: 'center',
  },
});

export default SheikhMessagesScreen;

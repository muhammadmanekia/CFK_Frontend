import Clipboard from '@react-native-clipboard/clipboard';
import {Alert} from 'react-native';

export const shareImageToWhatsApp = event => {
  const imageUrl = event.imageUrl;
  Clipboard.setString(imageUrl);
  Alert.alert('Copied!', 'Image has been copied to clipboard.');
};

export const copyEventDetails = event => {
  const formattedDetails = `
    بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      
    🎉 ${event.title} 🎉
      
    📅 Date: ${new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}
    🕒 Time: ${
      event.endTime ? `${event.startTime} - ${event.endTime}` : event.startTime
    }
    📍 Location: ${event.location}
      
    📝 About the Event:
    ${event.description}
      
    👤 Organizer: ${event.organizers}
    ${event.price ? `💰 Price: ${event.price}\n` : ''}${
    event.capacity ? `👥 Audience: ${event.capacity}\n` : ''
  }
      `;
  Clipboard.setString(formattedDetails);
  Alert.alert('Copied!', 'Event details have been copied to clipboard.');
};

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient

const DonateScreen = () => {
  const colorScheme = useColorScheme(); // Detect the current color scheme
  const isDarkMode = colorScheme === 'dark';

  const styles = isDarkMode ? darkStyles : lightStyles; // Choose styles based on the color scheme

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={[styles.quote, {fontSize: 24}]}>
          أكثِرُوا مِنَ الصَّدَقَةِ تُرزَقُوا
        </Text>
        <Text style={styles.quote}>
          "Increase your charity and you will be given [increased] sustenance."
        </Text>
        <Text style={styles.attribution}>- Prophet Muhammad (S)</Text>
      </View>
      <View style={styles.buttonContainer}>
        <LinearGradient
          colors={['#CDA323', '#856713']}
          style={styles.button}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL('https://cityofknowledge-bloom.kindful.com/');
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.buttonText}>Donate with </Text>
              <Image
                source={require('../assets/images/kindful.png')}
                style={{
                  width: 35,
                  height: 35,
                  marginLeft: 6,
                }}
              />
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 10,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quote: {
    fontSize: 18,
    textAlign: 'center',
    color: '#5D5D5D',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  attribution: {
    fontSize: 14,
    color: 'black',
    fontWeight: '700',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 20,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    paddingTop: 10,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quote: {
    fontSize: 18,
    textAlign: 'center',
    color: '#B0B0B0',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  attribution: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 20,
  },
});

export default DonateScreen;

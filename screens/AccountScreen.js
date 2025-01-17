import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  useColorScheme,
} from 'react-native';
import axios from 'axios';
import {useAuth} from '../utils/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AccountScreen = ({navigation}) => {
  const {user, logout, login} = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateAccount = async () => {
    try {
      const response = await axios.put(
        'http://env-8355920.atl.jelastic.vps-host.net/api/auth/update',
        {id: user.id, name, email},
      );
      Alert.alert('Success', response.data.message);
      login(response.data.token);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(
        'http://env-8355920.atl.jelastic.vps-host.net/api/auth/delete',
        {id: user.id},
      );
      Alert.alert('Success', response.data.message);
      logout();
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Delete failed');
    }
  };

  const handleSignOut = () => {
    logout();
    navigation.navigate('Home');
  };

  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  return (
    <>
      <View style={styles.header}>
        <Image
          source={require('../assets/images/avatar.png')}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.userEmail}>{email}</Text>
        <Text style={styles.title}>Update Account Information</Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={24}
            color="#666666"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#666666"
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={24}
            color="#666666"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#666666"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleUpdateAccount}>
          <Text style={styles.buttonText}>Update Account</Text>
        </TouchableOpacity>
      </View>
      <View style={{position: 'absolute', bottom: 0, width: '100%'}}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Light mode color
  },
  header: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Light mode color
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000', // Light mode color
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666', // Light mode color
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Light mode color
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#CCCCCC', // Light mode color
  },
  title: {
    color: 'black', // Light mode color
    marginTop: 50,
    marginBottom: 15,
    fontWeight: '600',
  },
  icon: {
    marginRight: 12,
    color: '#666666', // Light mode color
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000000', // Light mode color
  },
  button: {
    backgroundColor: '#CDA323', // Light mode color
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF', // Kept white for contrast
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  signOutButton: {
    padding: 0,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 0,
  },
  signOutButtonText: {
    color: '#CDA323', // Light mode color
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.3,
  },
  deleteButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
  },
  deleteButtonText: {
    color: '#FF3B30', // Light mode color
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.3,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
  header: {
    flex: 1,
    backgroundColor: '#222222',
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444444',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#555555',
  },
  title: {
    color: 'white',
    marginTop: 50,
    marginBottom: 15,
    fontWeight: '600',
  },
  icon: {
    marginRight: 12,
    color: '#BBBBBB',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#CDA323',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  signOutButton: {
    padding: 0,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 0,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.3,
  },
  deleteButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
  },
  deleteButtonText: {
    color: '#FF4D4D',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.3,
  },
});

export default AccountScreen;

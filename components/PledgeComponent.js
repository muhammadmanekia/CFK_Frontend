import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../utils/AuthContext';

const PledgeComponent = () => {
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const {user} = useAuth();

  useEffect(() => {
    if (user) {
      setId(user.id);
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handlePledgeSubmit = () => {
    const amount = parseFloat(pledgeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid pledge amount.');
      return;
    }

    axios
      .post('http://env-8355920.atl.jelastic.vps-host.net/api/pledges', {
        amount,
        pledgerId: id,
        pledgerName: name,
        pledgerEmail: email,
      })
      .then(response => {
        if (response.status !== 201) {
          throw new Error('Network response was not ok');
        }
        Alert.alert('Pledge Submitted', `Thank you for pledging $${amount}!`);
        setPledgeAmount('');
        setName('');
        setEmail('');
      })
      .catch(error => {
        Alert.alert(
          'Submission Error',
          'There was an error submitting your pledge. Please try again.',
        );
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pledge a Donation</Text>
      {!user && (
        <>
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
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#666666"
            />
          </View>
        </>
      )}
      <View style={styles.inputContainer}>
        <Ionicons
          name="cash-outline"
          size={24}
          color="#666666"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter pledge amount"
          keyboardType="numeric"
          value={pledgeAmount}
          onChangeText={setPledgeAmount}
          placeholderTextColor="#666666"
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handlePledgeSubmit}>
        <Text style={styles.buttonText}>Submit Pledge</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.5,
    marginVertical: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1A1A1A',
  },
  button: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 0,
    backgroundColor: '#CDA323',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.3,
  },
});

export default PledgeComponent;

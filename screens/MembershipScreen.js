import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  useColorScheme,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {api} from '../utils/api';

const MembershipForm = ({setShowForm}) => {
  const [formData, setFormData] = useState({
    startDate: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    spouseFirstName: '',
    spouseLastName: '',
    spousePhoneNumber: '',
    spouseEmail: '',
    mailingAddress: '',
    membershipType: 'Family',
    isVotingMember: false,
  });

  const colorScheme = useColorScheme(); // Detect the current color scheme
  const isDarkMode = colorScheme === 'dark';

  const styles = isDarkMode ? darkStyles : lightStyles; // Choose styles based on the color scheme

  const handleSubmit = () => {
    console.log(formData);

    const submitFormData = async () => {
      try {
        const response = await api.post('/api/membership', formData);
        console.log('Form submitted successfully:', response.data);
        Alert.alert('Form submitted successfully');
      } catch (error) {
        console.error('Failed to submit form:', error);
        Alert.alert('Failed to submit form');
      }
    };

    submitFormData();
    setShowForm(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#636c72'}
            placeholder="Membership Start Date (MM/DD/YYYY) *"
            value={formData.startDate}
            onChangeText={text => setFormData({...formData, startDate: text})}
          />

          <TextInput
            style={styles.input}
            placeholderTextColor={'#636c72'}
            placeholder="First Name *"
            value={formData.firstName}
            onChangeText={text => setFormData({...formData, firstName: text})}
          />

          <TextInput
            style={styles.input}
            placeholderTextColor={'#636c72'}
            placeholder="Last Name *"
            value={formData.lastName}
            onChangeText={text => setFormData({...formData, lastName: text})}
          />

          <TextInput
            style={styles.input}
            placeholderTextColor={'#636c72'}
            placeholder="Phone Number *"
            value={formData.phoneNumber}
            onChangeText={text => setFormData({...formData, phoneNumber: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Email *"
            placeholderTextColor={'#636c72'}
            value={formData.email}
            onChangeText={text => setFormData({...formData, email: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Spouse's First Name"
            value={formData.spouseFirstName}
            placeholderTextColor={'#636c72'}
            onChangeText={text =>
              setFormData({...formData, spouseFirstName: text})
            }
          />

          <TextInput
            style={styles.input}
            placeholderTextColor={'#636c72'}
            placeholder="Spouse's Last Name"
            value={formData.spouseLastName}
            onChangeText={text =>
              setFormData({...formData, spouseLastName: text})
            }
          />

          <TextInput
            style={styles.input}
            placeholderTextColor={'#636c72'}
            placeholder="Spouse's Phone Number"
            value={formData.spousePhoneNumber}
            onChangeText={text =>
              setFormData({...formData, spousePhoneNumber: text})
            }
          />

          <TextInput
            style={styles.input}
            placeholderTextColor={'#636c72'}
            placeholder="Spouse's Email"
            value={formData.spouseEmail}
            onChangeText={text => setFormData({...formData, spouseEmail: text})}
          />

          <TextInput
            style={styles.input}
            placeholderTextColor={'#636c72'}
            placeholder="Mailing Address *"
            value={formData.mailingAddress}
            onChangeText={text =>
              setFormData({...formData, mailingAddress: text})
            }
          />

          <Text style={styles.label}>Membership Type *</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                formData.membershipType === 'Family' && styles.activeToggle,
              ]}
              onPress={() =>
                setFormData({...formData, membershipType: 'Family'})
              }>
              <Text style={styles.toggleText}>Family</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                formData.membershipType === 'Student' && styles.activeToggle,
              ]}
              onPress={() =>
                setFormData({...formData, membershipType: 'Student'})
              }>
              <Text style={styles.toggleText}>Student or Youth (18-25)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Do you want to be a voting member?</Text>
            <Switch
              value={formData.isVotingMember}
              onValueChange={value =>
                setFormData({...formData, isVotingMember: value})
              }
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Application</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MembershipScreen = () => {
  const [showForm, setShowForm] = useState(false);

  const colorScheme = useColorScheme(); // Detect the current color scheme
  const isDarkMode = colorScheme === 'dark';

  const styles = isDarkMode ? darkStyles : lightStyles; // Choose styles based on the color scheme

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Sustaining Membership</Text>
        {showForm ? (
          <MembershipForm setShowForm={setShowForm} />
        ) : (
          <>
            <View style={styles.infoSection}>
              <Text style={styles.description}>
                Support CFK's vision and mission by becoming a Sustaining
                Member. As a member, you'll receive discounted rates on certain
                services.
              </Text>
              <Text style={styles.requirementsTitle}>
                Membership Requirements:
              </Text>
              <View style={styles.requirementsList}>
                <Text style={styles.requirement}>
                  • Must be 18 years or older
                </Text>
                <Text style={styles.requirement}>
                  • Families: Minimum $50 monthly contribution
                </Text>
                <Text style={styles.requirement}>
                  • Students (18-25): Minimum $20 monthly contribution
                </Text>
              </View>
            </View>

            <View style={styles.formContainer}>
              <TouchableOpacity
                onPress={() => setShowForm(true)}
                style={styles.openFormButton}>
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="white"
                />
                <Text style={styles.openFormButtonText}>
                  Open Membership Form
                </Text>
              </TouchableOpacity>

              <View style={styles.contactSection}>
                <Text style={styles.contactTitle}>Questions?</Text>
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={20} color="#CDA323" />
                  <Text style={styles.contactText}>membership@cfkdfw.org</Text>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="logo-whatsapp" size={20} color="#CDA323" />
                  <Text style={styles.contactText}>
                    Br. Asif Patel +1 (214) 978-7731
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    color: '#CDA323',
  },
  requirementsList: {
    marginLeft: 10,
  },
  requirement: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },

  openFormButton: {
    backgroundColor: '#CDA323',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  openFormButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  contactSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  contactTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 15,
    color: '#010000',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  infoSection: {
    padding: 10,
    backgroundColor: '#F5F5F5',
    margin: 15,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  requirementsTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  activeToggle: {
    backgroundColor: '#CDA323',
  },
  requirements: {
    marginLeft: 10,
  },
  formContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'column',
  },
  radioButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#CDA323',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  toggleText: {
    color: '#000',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  contactSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F5F5F5',
  },
  contactTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    color: '#CDA323', // Kept the same for brand consistency
  },
  requirementsList: {
    marginLeft: 10,
  },
  requirement: {
    fontSize: 16,
    marginBottom: 5,
    color: '#E0E0E0', // Lighter text for dark background
  },
  openFormButton: {
    backgroundColor: '#CDA323', // Kept the same
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  openFormButtonText: {
    color: '#121212', // Dark text for contrast on gold button
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  contactSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#1E1E1E', // Slightly lighter than main background
    borderRadius: 10,
  },
  contactTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 15,
    color: '#FFFFFF', // White text
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#E0E0E0', // Light grey text
  },
  infoSection: {
    padding: 10,
    backgroundColor: '#1E1E1E', // Slightly lighter than main background
    margin: 15,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    color: '#E0E0E0', // Light grey text
  },
  requirementsTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#FFFFFF', // White text
  },
  activeToggle: {
    backgroundColor: '#CDA323', // Kept the same
  },
  requirements: {
    marginLeft: 10,
  },
  formContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#FFFFFF', // White text
  },
  input: {
    borderWidth: 1,
    borderColor: '#444', // Darker border
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#2A2A2A', // Slightly lighter than main background
    color: '#FFFFFF', // White text
  },
  radioContainer: {
    flexDirection: 'column',
  },
  radioButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#444', // Darker border
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#2A2A2A', // Slightly lighter than main background
  },
  submitButton: {
    backgroundColor: '#CDA323', // Kept the same
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#121212', // Dark text for contrast on gold button
    fontWeight: 'bold',
  },
  toggleText: {
    color: '#FFFFFF', // White text
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
    color: '#E0E0E0', // Light grey text
  },
  contactSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1E1E1E', // Slightly lighter than main background
  },
  contactTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#FFFFFF', // White text
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#444', // Darker border
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A', // Slightly lighter than main background
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default MembershipScreen;

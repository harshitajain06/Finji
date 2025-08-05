import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, Alert, Image
} from 'react-native';
import { db, storage } from '../../config/firebase'; // Adjust as needed
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CreateFundingPostScreen = () => {
  const [applicantName, setApplicantName] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [daysRemaining, setDaysRemaining] = useState('');
  const [description, setDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [useOfFunds, setUseOfFunds] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission denied', 'You need to allow access to pick an image.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!pickerResult.canceled) {
      setImage(pickerResult.uri);
    }
  };

  const handleSubmit = async () => {
    if (!applicantName || !location || !goalAmount || !description || !useOfFunds) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = '';

      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const fileRef = ref(storage, `fundingPosts/${Date.now()}.jpg`);
        await uploadBytes(fileRef, blob);
        imageUrl = await getDownloadURL(fileRef);
      }

      const postData = {
        applicantName,
        location,
        category,
        goalAmount: parseFloat(goalAmount),
        daysRemaining: parseInt(daysRemaining),
        description,
        teamMembers: teamMembers ? teamMembers.split(',').map(m => m.trim()) : [],
        useOfFunds,
        loanPurpose,
        imageUrl,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'fundingPosts'), postData);
      Alert.alert('Success', 'Your funding request has been posted!');

      // Reset form
      setApplicantName('');
      setLocation('');
      setCategory('');
      setGoalAmount('');
      setDaysRemaining('');
      setDescription('');
      setTeamMembers('');
      setUseOfFunds('');
      setLoanPurpose('');
      setImage(null);
    } catch (error) {
      console.error('Error posting data:', error);
      Alert.alert('Error', 'Failed to create the post.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Funding Request</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={applicantName}
        onChangeText={setApplicantName}
        placeholder="Your name or organization"
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="City, Country"
      />

      <Text style={styles.label}>Business Category</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="e.g., Farming, Retail, Food"
      />

      <Text style={styles.label}>Funding Goal (USD)</Text>
      <TextInput
        style={styles.input}
        value={goalAmount}
        onChangeText={setGoalAmount}
        keyboardType="numeric"
        placeholder="e.g., 1000"
      />

      <Text style={styles.label}>Days to Reach Goal</Text>
      <TextInput
        style={styles.input}
        value={daysRemaining}
        onChangeText={setDaysRemaining}
        keyboardType="numeric"
        placeholder="e.g., 30"
      />

      <Text style={styles.label}>How Will the Funds Be Used?</Text>
      <TextInput
        style={styles.inputMulti}
        value={useOfFunds}
        onChangeText={setUseOfFunds}
        multiline
        placeholder="Describe how the money will help"
      />

      <Text style={styles.label}>About You / Business</Text>
      <TextInput
        style={styles.inputMulti}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Brief background or story"
      />

      <Text style={styles.label}>Team Members (optional)</Text>
      <TextInput
        style={styles.input}
        value={teamMembers}
        onChangeText={setTeamMembers}
        placeholder="Comma separated names if any"
      />

      <Text style={styles.label}>Loan Purpose (optional)</Text>
      <TextInput
        style={styles.inputMulti}
        value={loanPurpose}
        onChangeText={setLoanPurpose}
        multiline
        placeholder="Explain why this loan is important"
      />

      <Text style={styles.label}>Photo (optional)</Text>
      <TouchableOpacity onPress={handleImagePick} style={styles.imageButton}>
        <Text style={styles.imageButtonText}>Pick Image</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={uploading}>
        <Text style={styles.buttonText}>{uploading ? 'Submitting...' : 'Submit Request'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateFundingPostScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FAFAFA',
    paddingBottom: 80,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    marginTop: 12,
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 6,
  },
  inputMulti: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 6,
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 14,
    marginTop: 24,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  imageButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
  },
  imageButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  imagePreview: {
    marginTop: 10,
    height: 200,
    width: '100%',
    borderRadius: 10,
  },
});

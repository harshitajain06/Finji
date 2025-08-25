import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import { db, storage } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ✅ For web alerts
const showMessage = (msg, type = "success") => {
  if (Platform.OS === "web") {
    alert(msg);
  } else {
    import("react-native").then(({ Alert }) => Alert.alert(type, msg));
  }
};

const CreateFundingPostScreen = () => {
  const [applicantName, setApplicantName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [daysRemaining, setDaysRemaining] = useState("");
  const [description, setDescription] = useState("");
  const [teamMembers, setTeamMembers] = useState("");
  const [useOfFunds, setUseOfFunds] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Pick Image (with Web fallback)
  const handleImagePick = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setImage(URL.createObjectURL(file));
        }
      };
      input.click();
    } else {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showMessage("You need to allow access to pick an image.", "Error");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.7,
      });

      if (!pickerResult.canceled) {
        setImage(pickerResult.assets[0].uri);
      }
    }
  };

  // ✅ Submit Post
  const handleSubmit = async () => {
    if (!applicantName || !location || !goalAmount || !description || !useOfFunds) {
      showMessage("Please fill all required fields.", "Validation Error");
      return;
    }

    try {
      setUploading(true);
      let imageUrl = "";

      if (image && Platform.OS !== "web") {
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
        teamMembers: teamMembers
          ? teamMembers.split(",").map((m) => m.trim())
          : [],
        useOfFunds,
        loanPurpose,
        imageUrl,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "fundingPosts"), postData);
      showMessage("Your funding request has been posted!", "Success");

      // Reset form
      setApplicantName("");
      setLocation("");
      setCategory("");
      setGoalAmount("");
      setDaysRemaining("");
      setDescription("");
      setTeamMembers("");
      setUseOfFunds("");
      setLoanPurpose("");
      setImage(null);
    } catch (error) {
      console.error("Error posting data:", error);
      showMessage("Failed to create the post.", "Error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>💰 Funding Request</Text>

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
          <Text style={styles.imageButtonText}>📷 Pick Image</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

        <TouchableOpacity
          style={[styles.button, uploading && { backgroundColor: "#aaa" }]}
          onPress={handleSubmit}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>
            {uploading ? "Submitting..." : "🚀 Submit Request"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateFundingPostScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f7fa",
    flexGrow: 1,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    width: "100%",
    maxWidth: 600,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2c3e50",
  },
  label: {
    marginTop: 12,
    fontWeight: "600",
    fontSize: 15,
    color: "#333",
  },
  input: {
    backgroundColor: "#fdfdfd",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 6,
  },
  inputMulti: {
    backgroundColor: "#fdfdfd",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 6,
    minHeight: 90,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#28a745",
    padding: 16,
    marginTop: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  imageButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 10,
    alignItems: "center",
  },
  imageButtonText: {
    color: "white",
    fontWeight: "600",
  },
  imagePreview: {
    marginTop: 12,
    height: 200,
    width: "100%",
    borderRadius: 12,
    resizeMode: "cover",
  },
});

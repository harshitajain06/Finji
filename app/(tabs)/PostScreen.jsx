import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db, storage } from "../../config/firebase";
import { useUserRole } from "../../contexts/UserRoleContext";

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// ✅ For web alerts
const showMessage = (msg, type = "success") => {
  if (isWeb) {
    alert(msg);
  } else {
    Alert.alert(type, msg);
  }
};

const CreateFundingPostScreen = () => {
  const { user, userRole } = useUserRole();
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
  const [existingPost, setExistingPost] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Check for existing post and load data
  useEffect(() => {
    const checkExistingPost = async () => {
      if (!user || userRole !== 'applicant') {
        setLoading(false);
        return;
      }

      try {
        const postsRef = collection(db, "fundingPosts");
        const q = query(
          postsRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const postData = querySnapshot.docs[0].data();
          const postId = querySnapshot.docs[0].id;
          
          setExistingPost({ id: postId, ...postData });
          setIsEditMode(true);
          
          // Load existing data into form
          setApplicantName(postData.applicantName || "");
          setLocation(postData.location || "");
          setCategory(postData.category || "");
          setGoalAmount(postData.goalAmount?.toString() || "");
          setDaysRemaining(postData.daysRemaining?.toString() || "");
          setDescription(postData.description || "");
          setTeamMembers(postData.teamMembers?.join(", ") || "");
          setUseOfFunds(postData.useOfFunds || "");
          setLoanPurpose(postData.loanPurpose || "");
          setImage(postData.imageUrl || null);
        }
      } catch (error) {
        console.error("Error checking existing post:", error);
        showMessage("Failed to load existing data.", "Error");
      } finally {
        setLoading(false);
      }
    };

    checkExistingPost();
  }, [user, userRole]);

  // ✅ Pick Image (with Web fallback)
  const handleImagePick = async () => {
    if (isWeb) {
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
    let imageUrl = existingPost?.imageUrl || "";

    if (image && image !== existingPost?.imageUrl) {
      // Only upload new image if it's different from existing one
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
      userId: user.uid, // Add user ID for tracking
      updatedAt: serverTimestamp(),
    };

    if (isEditMode && existingPost) {
      // Update existing post
      const postRef = doc(db, "fundingPosts", existingPost.id);
      await updateDoc(postRef, postData);
      showMessage("Your funding request has been updated!", "Success");
    } else {
      // Create new post
      await addDoc(collection(db, "fundingPosts"), {
        ...postData,
        createdAt: serverTimestamp(),
      });
      showMessage("Your funding request has been posted!", "Success");
    }

    // Don't reset form in edit mode, keep the data
    if (!isEditMode) {
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
    }
  } catch (error) {
    console.error("Error posting data:", error);
    showMessage("Failed to save the post.", "Error");
  } finally {
    setUploading(false);
  }
};

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.header}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>
          {isEditMode ? "✏️ Edit Funding Request" : "💰 Create Funding Request"}
        </Text>
        
        {isEditMode && (
          <View style={styles.editModeBanner}>
            <Text style={styles.editModeText}>
              📝 You already have a funding request. You can edit it here.
            </Text>
          </View>
        )}

        <View style={styles.formGrid}>
          <View style={styles.formSection}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={applicantName}
              onChangeText={setApplicantName}
              placeholder="Your name or organization"
            />

            <Text style={styles.label}>Location *</Text>
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
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Funding Goal (USD) *</Text>
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
          </View>
        </View>

        <Text style={styles.label}>How Will the Funds Be Used? *</Text>
        <TextInput
          style={styles.inputMulti}
          value={useOfFunds}
          onChangeText={setUseOfFunds}
          multiline
          placeholder="Describe how the money will help"
        />

        <Text style={styles.label}>About You / Business *</Text>
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
            {uploading 
              ? (isEditMode ? "Updating..." : "Submitting...") 
              : (isEditMode ? "💾 Update Request" : "🚀 Submit Request")
            }
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateFundingPostScreen;

const styles = StyleSheet.create({
  container: {
    padding: isWeb ? 40 : 20,
    backgroundColor: "#f5f7fa",
    flexGrow: 1,
    alignItems: "center",
    minHeight: isWeb ? '100vh' : undefined,
  },
  card: {
    backgroundColor: "#fff",
    padding: isWeb ? 40 : 20,
    borderRadius: 20,
    width: "100%",
    maxWidth: isWeb ? 800 : 600,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    ...(isWeb && {
      boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 50px rgba(0,0,0,0.15)',
      }
    }),
  },
  header: {
    fontSize: isWeb ? 32 : 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: isWeb ? 30 : 20,
    color: "#2c3e50",
  },
  formGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: isWeb ? 20 : 0,
    marginBottom: 20,
  },
  formSection: {
    flex: isWeb ? 1 : undefined,
  },
  label: {
    marginTop: isWeb ? 20 : 12,
    fontWeight: "600",
    fontSize: isWeb ? 16 : 15,
    color: "#333",
  },
  input: {
    backgroundColor: "#fdfdfd",
    borderRadius: 12,
    padding: isWeb ? 16 : 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 6,
    fontSize: isWeb ? 16 : undefined, // Prevent zoom on iOS
    ...(isWeb && {
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      cursor: 'text',
      ':focus': {
        borderColor: '#007bff',
        boxShadow: '0 0 0 3px rgba(0,123,255,0.1)',
      }
    }),
  },
  inputMulti: {
    backgroundColor: "#fdfdfd",
    borderRadius: 12,
    padding: isWeb ? 16 : 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 6,
    minHeight: isWeb ? 120 : 90,
    textAlignVertical: "top",
    fontSize: isWeb ? 16 : undefined, // Prevent zoom on iOS
    ...(isWeb && {
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      cursor: 'text',
      resize: 'vertical',
      ':focus': {
        borderColor: '#007bff',
        boxShadow: '0 0 0 3px rgba(0,123,255,0.1)',
      }
    }),
  },
  button: {
    backgroundColor: "#28a745",
    padding: isWeb ? 20 : 16,
    marginTop: isWeb ? 30 : 24,
    borderRadius: 12,
    alignItems: "center",
    cursor: isWeb ? 'pointer' : 'default',
    transition: isWeb ? 'all 0.2s ease' : undefined,
    ...(isWeb && {
      ':hover': {
        backgroundColor: '#218838',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(40,167,69,0.3)',
      },
      ':active': {
        transform: 'translateY(0)',
      }
    }),
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: isWeb ? 18 : 16,
  },
  imageButton: {
    marginTop: 10,
    padding: isWeb ? 16 : 12,
    backgroundColor: "#007bff",
    borderRadius: 10,
    alignItems: "center",
    cursor: isWeb ? 'pointer' : 'default',
    transition: isWeb ? 'all 0.2s ease' : undefined,
    ...(isWeb && {
      ':hover': {
        backgroundColor: '#0056b3',
        transform: 'translateY(-1px)',
      }
    }),
  },
  imageButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: isWeb ? 16 : 14,
  },
  imagePreview: {
    marginTop: 12,
    height: isWeb ? 250 : 200,
    width: "100%",
    borderRadius: 12,
    resizeMode: "cover",
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      ':hover': {
        transform: 'scale(1.02)',
      }
    }),
  },
  editModeBanner: {
    backgroundColor: "#e3f2fd",
    padding: isWeb ? 16 : 12,
    borderRadius: 8,
    marginBottom: isWeb ? 20 : 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  editModeText: {
    color: "#1976d2",
    fontSize: isWeb ? 14 : 13,
    fontWeight: "500",
    textAlign: "center",
  },
});

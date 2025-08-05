import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomePage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Logo */}
      {/* <Image source={require('../../assets/images/Logo.png')} style={styles.logo} /> */}

      {/* Title and Subtitle */}
      <Text style={styles.title}>Welcome to</Text>
      <Text style={styles.subtitle}>Finji</Text>
      <Text style={styles.author}>Created by Aanika Asnani </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCE9FE',
  },
  logo: {
    width: 100, // Adjusted to match the logo size on the Login page
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#567396',
  },
  subtitle: {
    fontSize: 45,
    fontWeight: 'bold',
    color: '#567396',
    marginBottom: 20,
  },
  author: {
    fontSize: 16,
    color: '#567396',
    marginBottom: 40,
  },
});

export default HomePage;

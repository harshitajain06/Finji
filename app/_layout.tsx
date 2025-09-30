import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { UserRoleProvider } from '../contexts/UserRoleContext';
import StackLayout from './(tabs)/_layout';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <UserRoleProvider>
      <StackLayout />
      <StatusBar style="auto" />
    </UserRoleProvider>
  );
}

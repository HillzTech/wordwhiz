import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import MainMenuScreen from './Screens/MainMenuScreen';
import GameScreen from './Screens/GameScreen';
import { CoinPurchaseScreen } from './Screens/CoinPurchaseScreen';
import DictionaryScreen from './Screens/DictionaryScreen';
import DailyPuzzleScreen from './Screens/DailyPuzzleScreen';
import { SoundProvider } from './SoundContext';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { initializePurchases } from './purchases';
import { DrawerScreen } from './Screens/Drawerscreen';
import SettingScreen from './Screens/settingScreen';
import { useInterstitialAd } from './Components/useInterstitialAd'; 
import { GameProvider } from './Components/GameContext';
import { Text,  Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import LoginScreen from './Screens/LoginScreen';


const Stack = createStackNavigator();


/*
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Function to handle errors during registration
function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

// Function to register for push notifications
async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If permission is not granted, throw an error
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    // Ensure a project ID is available
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }

    try {
      // Get the Expo push token
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log('Expo Push Token:', pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

const notificationMessages = [
  "Time to play the daily puzzle!",
  "Get free coins now!",
  "Your next challenge awaits you, are you ready?",
  "Collect your daily reward now!",
  "Unlock new levels today!"
];
*/


export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.otf'),
    'Poppins-ExtraBold': require('./assets/fonts/Poppins-ExtraBold.otf'),
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.otf'),
    'Poppins-BoldItalic': require('./assets/fonts/Poppins-BoldItalic.otf'),
    'OpenSans-Bold': require('./assets/fonts/OpenSans-Bold.ttf'),
    'OpenSans-ExtraBold': require('./assets/fonts/OpenSans-ExtraBold.ttf'),
  });

  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    setSplashVisible(false);
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 5000); // 5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    Purchases.configure({ apiKey: 'goog_xPhhFyZWbrmRZoMWRJqXyZHZzqi' });
  }, []);

  useEffect(() => {
    initializePurchases();
  }, []);

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();


  /*
  useEffect(() => {
    // Automatically register for push notifications on app launch
    registerForPushNotificationsAsync()
    .then(token => {
      setExpoPushToken(token ?? '');
      console.log(token);  // Console log the token here
    })
      .catch(error => setExpoPushToken(`${error}`));

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    const sendNotification = async () => {
      const randomIndex = Math.floor(Math.random() * notificationMessages.length);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "IQ Quest",
          body: notificationMessages[randomIndex],
          data: { someData: 'goes here' },
          
        },
        trigger: { seconds: 1 },
      });
    };
  
    
    const intervalId = setInterval(() => {
      sendNotification();
    }, 86400000); 
  
    return () => clearInterval(intervalId); 
  }, []);
  */

  return (
    <GameProvider>
      <SoundProvider>
      <NavigationContainer>
        
          {splashVisible ? (
            <SplashScreenComponent />
          ) : (
            <Stack.Navigator
              initialRouteName="MainMenu"
              screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                cardStyle: { backgroundColor: '#152238' },
                animationEnabled: true, // Enable animation
                ...TransitionPresets.ModalSlideFromBottomIOS, // Slide-up transition
              }}
            >
              <Stack.Screen name="MainMenu" component={MainMenuScreen} />
              <Stack.Screen name="Game" component={GameScreen} />
              <Stack.Screen name="CoinPurchase" component={CoinPurchaseScreen} />
              <Stack.Screen name="Dictionary" component={DictionaryScreen} />
              <Stack.Screen name="DailyPuzzle" component={DailyPuzzleScreen} />
              <Stack.Screen name="Settings" component={SettingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen
                name="Drawer"
                component={DrawerScreen}
                options={{
                  cardStyle: {
                    backgroundColor: 'black',
                    width: '80%',
                    alignSelf: 'flex-end',
                  },
                  gestureDirection: 'horizontal',
                  cardStyleInterpolator: ({ current: { progress } }) => ({
                    cardStyle: {
                      transform: [
                        {
                          translateX: Animated.multiply(
                            progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1000, 0],
                              extrapolate: 'clamp',
                            }),
                            0.8
                          ),
                        },
                      ],
                    },
                    overlayStyle: {
                      opacity: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.5],
                        extrapolate: 'clamp',
                      }),
                      backgroundColor: 'rgba(0, 290, 249, 80)',
                    },
                  }),
                }}
              />
            </Stack.Navigator>
          )}
        
      </NavigationContainer>
      </SoundProvider>
    </GameProvider>
  );
};

const SplashScreenComponent: React.FC = () => {
  return (
    <View style={styles.splashContainer}>
      {/* Render SplashScreen UI */}
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#152238',
  },
});



import React, { useEffect, useState, memo } from 'react';
import { BackHandler, ImageBackground, SafeAreaView, Text, TouchableOpacity, View, ActivityIndicator, Dimensions } from 'react-native';
import { GoogleSignin, GoogleSigninButton, User } from "@react-native-google-signin/google-signin";
import Background from '../Components/Background';
import StrokedText from '../Components/StrokedText';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebase from 'firebase/compat/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../Components/GameContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [error, setError] = useState<string | undefined>();
  const [userInfo, setUserInfo] = useState<User | false>(false);
  const { currentLevel, score, setCurrentLevel, setScore } = useGame();
  const [difficulty, setDifficulty] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const {width, height} = Dimensions.get('window');
  const iconSize = width < 395 ? 23 : 25
 
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "1010756774819-grhfqmcraa9jeb34rulv4h9obd0hu4sg.apps.googleusercontent.com"
    });

    const checkInitialAuthState = async () => {
      try {
        await GoogleSignin.hasPlayServices();
        const user = await GoogleSignin.getCurrentUser();
        if (user) {
          setUserInfo(user);
          setError(undefined);
        }
      } catch (e) {
        setError(String(e));
      }
    };

    checkInitialAuthState();
  }, []);

  const signin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const user: any = await GoogleSignin.signIn();

      if (user) {
        console.log("User signed in. userId:", user);
        const progressExists = await checkProgressInFirebase(user.user?.id);
        if (!progressExists) {
          await saveProgressToFirebase(user.user?.id, score, currentLevel, difficulty);
        }
        await retrieveProgressFromFirebase(user.user?.id);
        setUserInfo(user);
        setError(undefined);
        console.log('You have logged in successfully');
        return;
      }

      setError("User not signed in. Please sign in to save progress.");
    } catch (e) {
      setError(String(e));
    }
  };

  const checkProgressInFirebase = async (userId: string): Promise<boolean> => {
    try {
      const progressRef = firestore.collection('progress').doc(userId);
      const progressDoc = await progressRef.get();
      return progressDoc.exists;
    } catch (error) {
      console.error('Error checking progress:', error);
      return false;
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('MainMenu');
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, [navigation]);

  const handleNext = async () => {
    try {
      setLoading(true);
      if (userInfo) {
        await saveProgressToFirebase(userInfo.user?.id, score, currentLevel, difficulty);
        console.log('Progress saved to Firebase');
      }

      setCurrentLevel(currentLevel);
      setScore(score);
  
      await AsyncStorage.setItem('difficulty', String(difficulty));
      console.log('Progress saved locally');

      navigation.push('MainMenu', { score, currentLevel, difficulty });
    } catch (error) {
      console.error('Error handling next:', error);
    } finally {
      setLoading(false);
    }
  };

  const firebaseConfig = {
    apiKey: "AIzaSyAIUPo9ObMtdlHUEiH32D5vxsVn_Z86xag",
    authDomain: "wordwhiz-195d1.firebaseapp.com",
    projectId: "wordwhiz-195d1",
    storageBucket: "wordwhiz-195d1.appspot.com",
    messagingSenderId: "1010756774819",
    appId: "1:1010756774819:web:5792ee8af2d8822b7e0816",
    measurementId: "G-741XMJWL17"
  };
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const firestore = firebase.firestore();

  const saveProgressToFirebase = async (userId: string, score: number, currentLevel: number, difficulty: number) => {
    try {
      const progressRef = firestore.collection('progress').doc(userId);
      await progressRef.set({
        score,
        currentLevel,
        difficulty
      });
      console.log('score and currentLevel saved successfully');
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const retrieveProgressFromFirebase = async (userId: string) => {
    try {
      const progressRef = firestore.collection('progress').doc(userId);
      const progressDoc = await progressRef.get();
      if (progressDoc.exists) {
        const { score: savedScore, currentLevel: savedCurrentLevel , difficulty: savedDifficulty } = progressDoc.data() as { score: number, currentLevel: number, progress: number, difficulty: number };
        setScore(savedScore);
        setCurrentLevel(savedCurrentLevel);
        setDifficulty(savedDifficulty);
        console.log('Progress retrieved successfully');
      } else {
        console.log('No progress found for the user');
      }
    } catch (error) {
      console.error('Error retrieving progress:', error);
    }
  };

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <Text style={{ textAlign: 'center', color: 'white', fontFamily: 'Poppins-Regular', fontSize: RFValue(10), top: hp('10%') }}>{error}</Text>
          {userInfo && (
            <View style={{ top: hp('20%'), backgroundColor: '#00007B', width: wp('97%'), left: wp('1.5%'), borderColor: "blue", borderWidth: 2, borderRadius: 20 }}>
              <ImageBackground
                source={require('../assets/cloudVector.png')} style={{ width: wp('60%'), height: hp('24%'), left: wp('18%'), bottom: hp('15%') }}
              />
              <Text style={{ color: 'white', textAlign: 'center', fontSize:  RFValue(23), marginTop:hp('-11%') , fontFamily: 'Poppins-ExtraBold' }}>Done, Progress saved!</Text>
              <Text style={{ color: 'yellow', textAlign: 'center', fontSize: RFValue(17), fontFamily: 'Poppins-BoldItalic' }}>Synchronized via Google</Text>
              <>
                <View style={{ flexDirection: "row", justifyContent: 'center', alignContent: 'center', top:  hp('10%'), borderColor: '#859410', gap:  wp('1%') }}>
                  <ImageBackground
                    source={require('../assets/Images/coin.png')}
                    style={{ width:  wp('5%'), height:  hp('2%'), top: '8%' }}
                  />
                  <Text style={{ fontFamily: 'Poppins-Bold', color: "white", fontSize: RFValue(17), top:  hp('3%') }}>{score}</Text>
                </View>
              </>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', top: hp('3%') }}>
                <ImageBackground source={require('../assets/Images/LevelImg.png')} style={{ width: wp('15%'), height: hp('10%') }} />
              </View>
              <Text style={{ fontSize: RFValue(14), color: 'white', fontFamily: 'Poppins-Bold', textAlign: 'center', top: hp('2%'), }}>{currentLevel}</Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: hp('23%') }}>
                <View style={{ bottom: hp('6%') }}>
                  <Text style={{ color: "white", textAlign: 'center', fontFamily: 'Poppins-Regular', fontSize: RFValue(11) }}>Discard Retrieved Data</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('MainMenu')} style={{ backgroundColor: 'green', width: wp('38%'), height: hp('5.8%'), borderRadius: 10, borderBottomColor: 'yellow', borderWidth: 1 }}>
                    <StrokedText text="Continue" strokeColor="black" strokeWidth={2} fontSize={RFValue(22)} />
                  </TouchableOpacity>
                </View>
                <View style={{ bottom: hp('6%') }}>
                  <Text style={{ color: "white", textAlign: 'center', fontFamily: 'Poppins-Regular', fontSize: RFValue(11) }}>Save Data</Text>
                  <TouchableOpacity onPress={handleNext} style={{ backgroundColor: 'green',  width: wp('38%'), height: hp('5.8%'), borderRadius: 10, borderBottomColor: 'yellow', borderWidth: 1 }}>
                    <StrokedText text="Save" strokeColor="black" strokeWidth={2} fontSize={RFValue(22)} /><Ionicons name='cloud-upload' size={iconSize} color={'white'} style={{ left: wp('28%'), bottom: hp('3.5%') }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          {!userInfo && (
            <View style={{ marginTop: hp('20%'), backgroundColor: '#00007B', width: wp('98%'), left: '1%', borderColor: "blue", borderWidth: 2, borderRadius: 20, height: hp('72%') }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ImageBackground source={require('../assets/cloudVector.png')} style={{ width: wp('55%'), height: hp('20%'), bottom: hp('14%') }} />
                <Text style={{ color: "white", fontSize: RFValue(15), textAlign: "center", bottom: hp('12%'), paddingHorizontal: hp('3%'), fontFamily: 'Poppins-Bold' }}>Sign in and save your game progress!{'\n'} You can then access your score on other devices</Text>
                <ImageBackground source={require('../assets/adaptive-icon.png')} style={{ width: wp('70%'), height: hp('30%'), bottom: hp('13%') }} />
                <GoogleSigninButton
                  size={GoogleSigninButton.Size.Wide}
                  color={GoogleSigninButton.Color.Dark}
                  onPress={signin}
                  style={{ bottom: hp('12%'), height: hp('7.5%') }}
                />
              </View>
            </View>
          )}
          {loading && (
            <View style={{ position: 'absolute', top: hp('60%'), left: hp('50%'), transform: [{ translateX: -50 }, { translateY: -50 }] }}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Background>
  );
};

export default memo(LoginScreen);

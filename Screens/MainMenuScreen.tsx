import React, { useEffect, useState, useCallback,memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ImageBackground, BackHandler, Button, Pressable, ActivityIndicator, Dimensions, Animated, Easing } from 'react-native';
import Background from '../Components/Background';
import { Ionicons } from '@expo/vector-icons';
import { Animation } from '../Components/Animation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import Sound from 'react-native-sound';
import { useSound } from '../SoundContext';
import throttle from 'lodash.throttle';
import { useGame } from '../Components/GameContext'; 
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';



const MainMenuScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { score, currentLevel, setScore, setCurrentLevel } = useGame(); 
 const { playSound } = useSound();
  const [showLevelRequirement, setShowLevelRequirement] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const {width, height} = Dimensions.get('window');
  const iconSize = width < 395 ? 25 : 35
  const addSize = width < 395 ? 13 : 15
  const bounceAnim = useRef(new Animated.Value(1)).current;
 



  const handleDailyPuzzlePress = useCallback(throttle(() => {
    if (currentLevel >= 20) {
      playSound('remove')
      navigation.push('DailyPuzzle');
    } else {
      setShowLevelRequirement(true);
      setTimeout(() => setShowLevelRequirement(false), 3000);
    }
  }, 1000), [currentLevel, navigation]);

// Create the continuous bounce animation
const startBounce = () => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.2, // Scale up
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1, // Scale down
        duration: 500,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  ).start();
};

// Start the bounce animation when the component mounts
useEffect(() => {
  startBounce();
}, []);

  

  const handlePlay = useCallback(throttle(() => {
    navigation.navigate('Game');
    setIsLoading(true);
    playSound('remove')
    setIsLoading(false);
  }, 300), [navigation]);

 
  const handleWord = useCallback(() => {
    navigation.navigate('Dictionary');
    playSound('remove')
  }, [navigation]);

  const handleSetting = useCallback(() => {
    navigation.navigate('Settings');
    playSound('remove')
  }, [navigation]);


  const handleLogin = useCallback(() => {
    navigation.navigate('Login', { score, currentLevel });
    playSound('remove')
  }, [navigation, score, currentLevel]);

  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleCoin = () => {
    navigation.navigate('CoinPurchase'); 
    playSound('remove');
  };
 

  

  return (
    <Background>
      <StatusBar />
      <SafeAreaView>
     
        <View style={{ flexDirection: 'row', justifyContent: "flex-end", marginVertical: hp('2%'), right: wp('1%'), top:hp('3%') }}>
          <View style={{right: wp('3%'), top:hp('0.4%') }}>
            <TouchableOpacity onPress={handleSetting} >
        <Ionicons name='settings' size={iconSize} color={'white'} />
        </TouchableOpacity></View>
          
          <Pressable onPress={handleCoin} style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', borderWidth: 1, borderColor: '#859410', borderRadius: 10, paddingHorizontal: wp('2.5%'), gap: 1, backgroundColor: 'black', right: wp('1.%') , height:hp('3%'), top: hp('0.5%')}}>
            <ImageBackground
              source={require('../assets/Images/coin.png')}
              style={{ width: wp('4%'), height: hp('2%'), top: hp('0.4%')
               }}
            />
            <View>
              <Text style={{ fontFamily: 'Poppins-Regular', color: "white", fontSize:  RFValue(16), bottom:hp('0.2%') }}>{score}<Ionicons name="add-circle" size={addSize} color="green" /></Text>
            </View>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 9, borderColor: '#B59410', borderWidth: 2.5, padding: hp('0.4%'), marginTop: hp('2%') }}>
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
            <ImageBackground source={require('../assets/Images/cloud.png')} style={{ width: wp('15%'), height: hp('8%'), top: hp('0.4%'), left:wp('2%') }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleWord}>
            <ImageBackground source={require('../assets/glossary.png')} style={{ width: wp('22%'), height: hp('8%'), right: wp('1.4%') }} />
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom:hp('1%') }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ImageBackground
              source={require('../assets/Images/LevelImg.png')}
              style={{ width:wp('18%'), height:hp('10%'), top: hp('0.01%') }}
            />
          </View>
          <Text style={{ position: 'relative', bottom:hp('1%'), textAlign: 'center', color: '#fff', fontFamily: 'Poppins-Bold', fontSize: RFValue(14) }}>{currentLevel}</Text>
        </View>

        <View style={{ flex: 1, justifyContent: "center", alignItems: 'center', marginTop: hp('9%'), top: hp('2%') }}>
          {showLevelRequirement && (
            <Text style={styles.levelRequirementText}>You need to reach level 20 to access this feature.</Text>
          )}
          <Pressable onPress={handleDailyPuzzlePress}>
            <ImageBackground source={require('../assets/dailyimge.png')} style={{ width:  wp('50%'), height:  hp('10%') }} />
          </Pressable>
        </View>

        <View style={{ top: hp('24%'), flexDirection: 'row', justifyContent: 'center', alignContent: "center" }}>
        <ImageBackground
              source={require('../assets/playimg.png')}
              style={{ width: wp('70%'), height: hp('35%') }}
            />
        </View>
        <Pressable onPress={handlePlay}>
         <Animated.View style={{  transform: [{ scale: bounceAnim }], top: hp('1.2%'), flexDirection: 'row', justifyContent: 'center', alignContent: "center" }}>
         <ImageBackground
               source={require('../assets/playbtn.png')}
               style={{ width: wp('62%'), height: hp('10%') }}
             />
         </Animated.View>
         </Pressable>
 
        

    
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  levelRequirementText: {
    fontFamily: 'Poppins-Regular',
    color: 'white',
    fontSize: RFValue(12),
    marginBottom: hp('0.3%'),
    textAlign: 'center',
    position: 'absolute',
    bottom: hp('0.1%'),
    width: wp('47%'),
    backgroundColor: 'black',
    borderRadius: 20,
    padding: wp('2.7%')
  },

});

export default memo(MainMenuScreen);

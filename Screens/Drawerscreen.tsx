import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, ImageBackground, BackHandler, Text, Alert, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { AdEventType, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import Background from '../Components/Background';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializePurchases} from '../purchases';
import { SafeAreaView } from 'react-native-safe-area-context';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import StrokedText from '../Components/StrokedText';
import Sound from 'react-native-sound';
import {  useSound } from '../SoundContext'
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../Components/GameContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const DrawerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [showAd, setShowAd] = useState<boolean>(false);
  const { score, setScore } = useGame();
  const unityGameId = '5664698'
  const testMode = false;
  const adUnitId = 'ca-app-pub-1458204118033702/9133923793';
  const rewarded = RewardedAd.createForAdRequest(adUnitId, {
    keywords: ['food', 'cooking', 'fruit'],
    requestNonPersonalizedAdsOnly: true,
  });
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [pendingScore, setPendingScore] = useState<number | null>(null);
  const {width, height} = Dimensions.get('window');
  const [correctSound, setCorrectSound] = useState<Sound | null>(null);
  const { soundEnabled } = useSound();
  const { playSound } = useSound();
  const [loadingAd, setLoadingAd] = useState<boolean>(false);
  const [adError, setAdError] = useState<boolean>(false);
  const [buttonClicked, setButtonClicked] = useState<boolean>(false); 
  const iconSize = width < 395 ? 37 : 40 




  useEffect(() => {
    if (pendingScore !== null) {
      setTimeout(() => {
        setScore(pendingScore);
        setPendingScore(null);
      }, 1000); // Delay updating the score for 1 second
    }
  }, [pendingScore, setScore]);

  useEffect(() => {
    const saveGameProgress = async () => {
      try {
        await AsyncStorage.setItem('score', score.toString());
      } catch (error) {
        console.error('Error saving game progress:', error);
      }
    };

    saveGameProgress();
  }, [score]);


  useEffect(() => {
    const loadCombinedScore = async () => {
      try {
        const savedScore = await AsyncStorage.getItem('combinedScore');
        if (savedScore !== null) {
          setScore(parseInt(savedScore));
        }
      } catch (error) {
        console.error('Error loading combined score:', error);
      }
    };

    loadCombinedScore();
  }, []);

  useEffect(() => {
    const saveCombinedScore = async () => {
      try {
        await AsyncStorage.setItem('combinedScore', score.toString());
      } catch (error) {
        console.error('Error saving combined score:', error);
      }
    };

    saveCombinedScore();
  }, [score]);

  useEffect(() => {
    const adEventListener = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('Ad Loaded');
      setAdError(false);
      if (showAd) {
        rewarded.show();
        AsyncStorage.setItem('score', score.toString());
        setPendingScore(score + 50);
        setShowAd(false);
        setLoadingAd(false); 
        
      }
    });

    const rewardEventListener = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      console.log('user earned reward');
    
      
      rewarded.load(); // Load a new ad after receiving the reward
    });

    const adErrorListener = rewarded.addAdEventListener(AdEventType.ERROR, () => {
      console.log('Ad Error');
      if (buttonClicked) { // Only show error if button was clicked
        setAdError(true);
      }
      setLoadingAd(false);
    });


    

    rewarded.load();

    return () => {
      adEventListener();
      rewardEventListener();
      adErrorListener();
    };
  }, [showAd, score , setScore, buttonClicked]);

  const handleShowAd = () => {
    console.log('Button clicked');
    setLoadingAd(true);
    setShowAd(true);
    setButtonClicked(true); // Set button clicked to true
    setAdError(false);
  };


  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('Game', { score: score });
      return true; // Prevent default behavior (closing the app)
    });

    return () => {
      backHandler.remove(); // Remove the event listener when component unmounts
    };
  }, [navigation, score]);

  

  useEffect(() => {
    const getPackages = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (e) {
        console.error("Error fetching offerings: ", e);
      }
    };

    getPackages();
  }, []);

  const onSelection = async (productPackage: PurchasesPackage) => {
    setIsPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(productPackage);
      if (customerInfo.entitlements.active["score"] !== undefined) {
        console.log("Purchase successful, coins purchased");
      }
      // If purchase is successful, update score accordingly
      switch (productPackage.identifier) {
        case '1000 coins':
          await updateScoreAndSave(1000); // Await here to ensure score is updated before proceeding
          console.log('Package 1000 purchased successfully.');
          break;
        case '5000 coins':
          await updateScoreAndSave(5000);
          console.log('Package 5000 purchased successfully.');
          break;
        case '10000 coins':
          await updateScoreAndSave(10000);
          console.log('Package 10000 purchased successfully.');
          break;
        default:
          break;
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        showError(e);
      } else {
        console.log("User cancelled the purchase");
      }
    } finally {
      setIsPurchasing(false);
    }
  };
  
  const updateScoreAndSave = async (increment: number) => {
    try {
      const newScore = score + increment;
      setPendingScore(newScore); // Update pending score immediately
      playSound('daily');
  
      // Save the updated score to AsyncStorage
      await AsyncStorage.setItem('score', newScore.toString());
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };
  


  

  const handleExit = useCallback(() => {
    navigation.navigate('Game');
  }, [navigation]);
  

  return (
    
      <View style={{ flex: 1, marginTop: hp('6%') }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', bottom: hp('2%') }}>
          <ImageBackground source={require('../assets/Images/newcoin.png')} style={{ width: wp('19%'), height: hp('12%') }} />
          <Text style={{ color: 'white', textAlign: 'center', fontSize: RFValue(17), fontFamily: 'Poppins-Bold', bottom: hp('8%')}}>{score}</Text>
        </View>
      <View style={{justifyContent:'center', alignItems:'flex-end', right:wp('4%'), bottom:hp('20%')}}>
      <TouchableOpacity onPress={handleExit}>
        <Ionicons name='close' size={iconSize} color={'white'}/>
         </TouchableOpacity>
        <View>
        <Text style={{ color: 'white', textAlign: 'center', fontSize: RFValue(22), fontFamily: 'Poppins-Bold',top:hp('6%'),right:wp('11%')}}>Special Offers!</Text>
            <ImageBackground source={require('../assets/box.png')} style={{width:wp('25%'), height:hp('13%'), top:hp('5.5%'), right: wp('1%')}}/>
        </View>
      </View> 

      
      
  
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', bottom:hp('18.8%') }}>
        {adError && buttonClicked && <Text style={styles.errorText}>Ad not available at the moment. Please try again later.</Text>}
        {loadingAd && <ActivityIndicator style={{ marginTop: hp('58%') }} size='small' color="#0000ff" />} 
          <TouchableOpacity onPress={handleShowAd}>
            <ImageBackground source={require('../assets/watchad.png')} style={{ width: wp('60%'), height: wp('25%')}} />
          </TouchableOpacity>
          {loadingAd && <ActivityIndicator style={{ marginTop: hp('58%') }} size='small' color="white" />} 
          
        </View>
      
  

        <View style={{bottom: hp('25%'), flex: 1, maxWidth:wp('59%'), left:wp('11%')}}>
          {isPurchasing && <ActivityIndicator size="large" color="#0000ff" />}
          {!isPurchasing &&
            packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.identifier}
                style={styles.package}
                onPress={() => onSelection(pkg)}
              >
                <ImageBackground source={require('../assets/1000coins.png')} style={{ width: wp('14%'), height: hp('5%'), left:wp('20%')}} />
                
                <View style={{top:hp('-2%')}}>
                <StrokedText text={pkg.product.description} strokeColor="black" strokeWidth={8} fontSize={RFValue(22)} />
                </View>
                
                <View style={{marginLeft:wp('8%'), borderRadius:20, top:hp('-3%')}}>
                <Text style={{textAlign:'right', color:'white', paddingHorizontal:4, right:1, fontFamily:'OpenSans-Bold', fontSize: RFValue(12)}}>¤{pkg.product.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>
           
        

      </View>
    
  );
};

const styles = StyleSheet.create({
 
  package: {
    height:hp('11.7%'),
    marginBottom: wp('2%'),
    padding: hp('2%'),
    backgroundColor: '#001260',
    borderRadius: 23,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderColor:'#FFD991',
    borderRightColor:'black',
    borderWidth:1
  },

  errorText: {
    color: 'red',
    fontSize: RFValue(13),
    marginTop: hp('-5%'),
    paddingHorizontal: hp('5%')

  
    
  },
});
function showError(e: any) {
  throw new Error('Function not implemented.');
}


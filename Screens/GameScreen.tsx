import React, { useEffect, useState, useRef } from 'react';
import { BackHandler, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View, Platform, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import Background from '../Components/Background';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import BackgroundBtn from '../Components/BackgroundBtn';
import { Animated, Easing } from 'react-native';
import PartyPopperAnimation from '../Components/PartyPopperAnimation';
import levels from '../Components/Level';
import { StatusBar } from 'expo-status-bar'
import CorrectImage from '../Components/CorrectImage';
import WrongImage from '../Components/WrongImage';
import CategoryImage from '../Components/CategoryImage';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { useInterstitialAd } from '../Components/useInterstitialAd';
import { useFocusEffect } from '@react-navigation/native';
import Share from 'react-native-share';
import { useSound } from '../SoundContext';
import ProgressBar from '../Components/ProgressBar'; 
import BouncingImage from '../Components/BouncingImage';
import Video from 'react-native-video';
import { useGame } from '../Components/GameContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

  const GameScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { currentLevel, setCurrentLevel, score, setScore } = useGame();
  const [currentGuess, setCurrentGuess] = useState<string[]>(['', '', '', '']);
  const [letterBox, setLetterBox] = useState<string[]>([]);
  const [showImage, setShowImage] = useState(false);
const [showWrongImage, setShowWrongImage] = useState(false);
const [showCategoryImage, setShowCategoryImage] = useState(false);
 const [progress, setProgress] = useState(0);
const fillAnimation = useRef(new Animated.Value(0)).current;
const [coinVisible, setCoinVisible] = useState(false);
const [iqVisible, setIqVisible] = useState(false);

const {width, height} = Dimensions.get('window');
const { playSound } = useSound();
  const [coinAnimation] = useState(new Animated.ValueXY({ x: 0, y: 0 }));
  const [iqAnimation] = useState(new Animated.ValueXY({ x: 0, y: 0 }));
  const [extraAnimation] = useState(new Animated.ValueXY({ x: 0, y: 0 }));
  const [pendingScore, setPendingScore] = useState<number | null>(null);
  const [showPartyPopper, setShowPartyPopper] = useState(false); 
  const translateX = useRef(new Animated.Value(500)).current;
  const { handleManualRefresh } = useInterstitialAd();
  const [screenshotUri, setScreenshotUri] = useState<string>('');
  const viewShotRef = useRef<View>(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [showTutorial, setShowTutorial] = useState(false);
  const wobbleAnimation = useRef(new Animated.Value(0)).current;
  const [showVideo, setShowVideo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const iconSize = width < 395 ? 13 : 15
  const addSize = width < 395 ? 35 : 40
  const bounceAnim = useRef(new Animated.Value(1)).current;



  useEffect(() => {
    checkTutorialStatus();
   /* checkVideoStatus(); */
  }, []);

  useEffect(() => {
    if (showTutorial) {
      startWobbleAnimation();
    }
  }, [showTutorial]);

  const startWobbleAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleAnimation, {
          toValue: 1,
          duration: 70, // Decreased duration for faster animation
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnimation, {
          toValue: -1,
          duration: 70, // Decreased duration for faster animation
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnimation, {
          toValue: 0,
          duration: 70, // Decreased duration for faster animation
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        
        
      ]),
      {
        iterations: 13,
      }
    ).start();
  };

  const wobbleInterpolate = wobbleAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3deg', '3deg'],
  });

  const wobbleStyle = {
    transform: [{ rotate: wobbleInterpolate }],
  };



  const checkTutorialStatus = async () => {
    try {
      const tutorialShown = await AsyncStorage.getItem('tutorialShown');
      if (!tutorialShown) {
        setTimeout(() => {
          setShowTutorial(true);
        }, 300); // 18 seconds delay
      }
    } catch (error) {
      console.error('Error checking tutorial status:', error);
    }
  };

  

  const hideTutorial = async () => {
    try {
      await AsyncStorage.setItem('tutorialShown', 'true');
      setShowTutorial(false);
    } catch (error) {
      console.error('Error setting tutorial status:', error);
    }
  };

  


  

  useEffect(() => {
    if (screenshotUri !== '') {
      shareScreenshot();
    }
  }, [screenshotUri]);
  
  // Function to capture the screenshot
  const takeScreenshot = async () => {
    setIsLoading(true);
  
    try {
      // Capture the current screen as base64
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
        result: 'base64', // Capture directly as base64
      });
  
      // Set the base64 URI for sharing
      const base64Image = `data:image/png;base64,${uri}`;
      setScreenshotUri(base64Image);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to share the screenshot
  const shareScreenshot = async () => {
    try {
      const link = 'https://play.google.com/store/apps/details?id=com.harrison.ugwu.IQquest'; // Game link
      const message = `What do you think the word is? ${link}`;
  
      // Directly share the base64 image without saving it to the device
      await Share.open({
        title: 'Share this awesome screenshot',
        message: message,
        url: screenshotUri, // Use the base64 string directly
        type: 'image/png',
        failOnCancel: false, // To avoid any crash if the user cancels the share
      });
    } catch (error) {
      console.error('Error sharing screenshot:', error);
    }
  };

  // useEffect to handle the refresh when the screen is mounted
     useEffect(() => {
    handleManualRefresh(); // Refresh the interstitial ad when the screen mounts
  }, []);

  // useFocusEffect to handle the refresh when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      handleManualRefresh(); // Refresh the interstitial ad when the screen is focused
      return () => {
        // Cleanup function if needed
      };
    }, [])
  );


  
  
 // Create the continuous bounce animation
 const startBounce = () => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.2, // Scale up
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1, // Scale down
        duration: 2000,
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

  
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.push('MainMenu', { score: score });

      return true; 
    });

    return () => {
      backHandler.remove();
    };
  }, [navigation, score]);
  




  useEffect(() => {
    // Update the score after a delay
    if (pendingScore !== null) {
      setTimeout(() => {
        setScore(pendingScore);
        setPendingScore(null);
      }, 1000); // Delay updating the score for 1 second
    }
  }, [pendingScore]);
  
  const moveCoin = () => {
    Animated.timing(coinAnimation, {
      toValue: { x: 0, y: -740 }, // Adjust the value to move the coin to the score area
      duration: 1300, // Adjust the duration as needed
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      setCoinVisible(false); // Hide the coin after animation
      coinAnimation.setValue({ x: 0, y: 0 }); // Reset animation valuez
    });
  };

  const moveIq = () => {
    Animated.timing(iqAnimation, {
      toValue: { x: 0, y: -800 }, // Adjust the value to move the coin to the score area
      duration: 1300, // Adjust the duration as needed
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      setIqVisible(false); // Hide the coin after animation
      iqAnimation.setValue({ x: 0, y: 0 }); // Reset animation value
    });
  };

 


  useEffect(() => {
    loadGameProgress(); // Load game progress when component mounts
  
  }, []);
    useEffect(() => {
    // Save game progress whenever score or current level changes
    saveGameProgress();
  }, [score]);

  

  const loadGameProgress = async () => {
    try {
      
      const savedScore = await AsyncStorage.getItem('score');
      const savedProgress = await AsyncStorage.getItem('progress');
      


      if (savedScore !== null) {
      
        setScore(parseInt(savedScore));
      }
      if (savedProgress !== null) {
        setProgress(JSON.parse(savedProgress));
      }
      
    } catch (error) {
      console.error('Error loading game progress:', error);
    }
  };

  const saveGameProgress = async () => {
    try {
      
      await AsyncStorage.setItem('score', score.toString());
      
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
  };
  

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
    // Initialize guess boxes based on the length of the word for the current level
    setCurrentGuess(Array(levels[currentLevel].word.length).fill(''));
    // Initialize letter box with 10 random letters and letters from the current word
    const wordLetters = levels[currentLevel].word.split('');
    const remainingLetters = Array.from({ length: 10 - wordLetters.length }, () => {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    });
    const shuffledLetters = shuffle(wordLetters.concat(remainingLetters));
    setLetterBox(shuffledLetters);
  }, [currentLevel]);

  const handleGuessInputPress = async (index: number) => {
    const letterToMove = currentGuess[index];
    if (letterToMove !== '') {
      // Remove the letter from the guess box
      const updatedGuess = [...currentGuess];
      updatedGuess[index] = ''; // Clear the guess box
      setCurrentGuess(updatedGuess);
      playSound('button'); 
  
      // Add the letter back to the letter box at the original position
      const updatedLetterBox = [...letterBox];
      const originalIndex = letterBox.indexOf('');
      if (originalIndex !== -1) {
        updatedLetterBox[originalIndex] = letterToMove;
      }
      setLetterBox(updatedLetterBox);
    }
  };
  
 

const handleNav = () => {
  navigation.navigate('CoinPurchase');
  playSound('help')
 }

 const handleDrawer = () => {
  navigation.navigate('Drawer');
  
 }



  const handleLetterBoxPress = async (index: number) => {
   try{
    playSound('remove');
   
    // Move the letter to the first empty guess input box
    const emptyIndex = currentGuess.findIndex((letter) => letter === '');
  if (emptyIndex !== -1) {
    const updatedGuess = [...currentGuess];
    updatedGuess[emptyIndex] = letterBox[index];
    setCurrentGuess(updatedGuess);
    
    // Create a copy of letterBox and remove the letter at the specified index
    const updatedLetterBox = [...letterBox];
    updatedLetterBox[index] = '';  // or use null or any placeholder that represents an empty slot
    setLetterBox(updatedLetterBox);
  } 
} catch (error) {
  console.error('Error handling letterbox press:', error);
}
  };

  const shuffle = (array: string[]) => {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  useEffect(() => {
    // Automatically check the guess when the guess box is full
    if (currentGuess.every((letter) => letter !== '')) {
      checkGuess();
    }
  }, [currentGuess]);

  const checkGuess = () => {
    const currentWord = levels[currentLevel].word;
    if (currentGuess.join('').toUpperCase() === currentWord) {
      setShowPartyPopper(true);
      playSound('correct');
      setCoinVisible(true); // Show the coin
      setIqVisible(true); // Show the coin
      setShowImage(true); 
      setTimeout(() => {
        setShowImage(false);
      }, 3900);
      setTimeout(() => {
        moveCoin(); // Move the coin to the score area
        
      }, 500);
      setTimeout(() => {
         // Move the iq to the iq area
        moveIq();
        playSound('iq');
        setScore(score + 5); // Increment score after animation
      }, 1500);
      const newProgress = progress + 0.25;
    setProgress(newProgress); 
    setTimeout(() => {
      
      increaseDifficulty();
   }, 3900);
    
      // Move to the next level
      setTimeout(() => {
        setCurrentLevel(currentLevel + 1);
        AsyncStorage.setItem('progress', JSON.stringify(newProgress))
        .then(() => console.log('Progress saved successfully'))
        .catch(error => console.error('Error saving progress:', error));
        Animated.timing(fillAnimation, {
          toValue: newProgress,
          duration: 500, // Adjust duration as needed
          easing: Easing.linear,
          useNativeDriver: false
        }).start();
      }, 4000);
    } else {
      playSound('incorrect');
      setShowWrongImage(true);
      setTimeout(() => {
        setShowWrongImage(false); // Hide the wrong image after 2 seconds
      }, 1000);
      
    }
  };
  
  
  

  const handleNavigation = () => {
   navigation.push('MainMenu'); 
 };

 const openDrawer = async () => {
  playSound('help');
  
  if (score >= 50) {
    setScore(score - 50);
     
    // Get the word for the current level
    const currentWord = levels[currentLevel].word;

    // Find an empty guess box
    const emptyIndex = currentGuess.findIndex((letter) => letter === '');

    // Find a random letter from the word
    const nextIndex = currentGuess.findIndex((letter) => letter === '');
    const randomLetter = currentWord[nextIndex];


    if (emptyIndex !== -1 && randomLetter) {
      // Update the guess box with the random letter
      const updatedGuess = [...currentGuess];
      updatedGuess[emptyIndex] = randomLetter.toUpperCase();
      setCurrentGuess(updatedGuess);
      
      // Create a copy of letterBox and remove the random letter
      const updatedLetterBox = [...letterBox];
      updatedLetterBox[nextIndex] = ''; // or use null or any placeholder that represents an empty slot
      setLetterBox(updatedLetterBox);
    }
  } else {
    navigation.push('CoinPurchase');
  }
};



 const [difficulty, setDifficulty] = useState(1);

  useEffect(() => {
    // Load difficulty from AsyncStorage when component mounts
    AsyncStorage.getItem('difficulty')
      .then((storedDifficulty) => {
        if (storedDifficulty) {
          setDifficulty(parseInt(storedDifficulty));
        } else {
          setDifficulty(1); // Default starting difficulty
        }
      })
      .catch((error) => {
        console.error('Error loading difficulty from AsyncStorage:', error);
      });
  }, []);

  const increaseDifficulty = () => {
    setDifficulty((prevDifficulty) => {
      const newDifficulty = prevDifficulty + 1;
      if (newDifficulty >= 11) {
         // Set showWrongImage to true if newDifficulty is 11 or greater
    
          setShowCategoryImage(true);
          playSound('level');
        
        setTimeout(() => {
         setShowCategoryImage(false); // Reset showWrongImage after 4 seconds
        }, 5000);
        return 1; // Reset difficulty after it reaches 11
      } else {
        return newDifficulty;
      }
    });
  };

  useEffect(() => {
    // Store the current difficulty in AsyncStorage whenever it changes
    AsyncStorage.setItem('difficulty', difficulty.toString())
      .catch((error) => {
        console.error('Error saving difficulty to AsyncStorage:', error);
      });
  }, [difficulty]);

  
  useEffect(() => {
    // Load currentLevel from AsyncStorage when component mounts
    AsyncStorage.getItem('currentLevel')
      .then((storedCurrentLevel) => {
        if (storedCurrentLevel) {
          setCurrentLevel(parseInt(storedCurrentLevel));
        } else {
          setCurrentLevel(1); // Default starting difficulty
        }
      })
      .catch((error) => {
        console.error('Error loading level from AsyncStorage:', error);
      });
  }, []);

  const reshuffle = (array: any) => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };
  const shuffleLetterBox = () => {
    if (score >= 2) {
      const shuffledLetters = reshuffle(letterBox);
    setLetterBox(shuffledLetters);
      setScore(score - 2);
    } else {
      navigation.navigate('CoinPurchase');
    }
  };

  


return(

<Background>
<SafeAreaView style={styles.safe}>
<StatusBar />


   <View style={styles.header}>
              <View>
                <View style={styles.back}>
                  <TouchableOpacity onPress={handleNavigation}>
                    <ImageBackground
                      source={require('../assets/Images/backIcon.png')}
                      style={styles.backImg} />

                  </TouchableOpacity>

                </View>


                <View style={styles.brain}>
                  <Image source={require('../assets/Images/brain.png')} style={styles.brainImg} />

                </View>
                <View style={styles.animatedcontainer}>
                  <Animated.View
                    style={{
                      height: 6,
                      width: fillAnimation.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%']
                      }),
                      backgroundColor: 'green',
                    }} />
                  <Text style={styles.iq}>IQ</Text>
                </View>

              </View>

              <View style={styles.levelcontainer}>
                <ImageBackground
                  source={require('../assets/Images/LevelImg.png')}
                  style={styles.levelimg} />

                <Text style={styles.currentlevel}>{currentLevel}</Text>

              </View>

              <TouchableOpacity onPress={handleNav} style={{ flexDirection: "row", justifyContent: 'space-around', alignContent: 'flex-start', top: hp('6.5%'), right: wp('2%'), borderColor: '#859410', borderWidth: 1, borderRadius: 10, marginBottom: hp('7%'), paddingHorizontal: wp('2%'), gap: wp('0.4%') }}>
                <ImageBackground
                  source={require('../assets/Images/coin.png')}
                  style={{ width: wp('4%'), height: hp('2%'), top: hp('0.3%') }} />
                <View >

                  <Text style={{ fontFamily: 'Poppins-Regular', color: "white", fontSize: RFValue(14), top: hp('0.0.8%') }}>{score}<Ionicons name="add-circle" size={iconSize} color="green" /></Text>


                </View>


              </TouchableOpacity>

            </View>
            <View ref={viewShotRef} collapsable={false} style={styles.viewshot}>
              <View style={{flexDirection:'column', justifyContent:'center', alignItems:'center', bottom: hp('2.2%')}}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center'}}>
                  <Text style={{ color: '#fffff1', fontSize:RFValue(16), fontFamily: 'OpenSans-Bold', borderColor: 'black', borderWidth: 1, backgroundColor: 'black', paddingHorizontal: wp('2%'), borderTopLeftRadius: 8, borderBottomLeftRadius: 8, paddingLeft:wp('4%') }}>Category</Text>

                  <Text style={{ color: 'white', fontSize: RFValue(16), fontFamily: 'OpenSans-Bold', borderColor: 'black', borderWidth: 2, paddingHorizontal: wp('2%'), borderTopRightRadius: 8, borderBottomRightRadius: 8, backgroundColor: 'grey' }}>{levels[currentLevel].category}</Text>

                </View>

                
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', gap:wp('1%'), bottom:hp('1.5%'), left: wp('1%') }}>
                  <View>
                  <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'OpenSans-Bold', fontSize:  RFValue(9), }}>Difficulty</Text>
                  </View>
                  <View>

                    <ProgressBar difficulty={difficulty} />
                  </View>
                </View>
              </View>

          
              <View style={{ left: wp('40%'), top:hp('-15%')}}>
                <TouchableOpacity onPress={handleDrawer}>
                  <BouncingImage source={require("../assets/box.png")} style={{ width: wp('10%'), height: hp('4%'),}} />
                </TouchableOpacity>
                </View>



                <Animated.View style={{
                  transform: [{ scale: bounceAnim }],
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignContent: 'center',
                  flexWrap: 'wrap',
                  top: hp('-6%'),
              
                }}>
                  {levels[currentLevel].images.map((imageSource, index) => (
                    <Image key={index} source={imageSource} style={{
                      width: wp('39%'),
                      height: hp('19%'),
                      margin: wp('1.1%'),
                      borderWidth: 3,
                      borderColor: 'grey',
                      borderRadius: 10
                    }} />
                  ))}
                </Animated.View>




                {coinVisible && (
                  <Animated.View
                    style={[
                      styles.coinContainer,
                      {
                        transform: [{ translateY: coinAnimation.y }],
                      },
                    ]}
                  >
                    <ImageBackground source={require('../assets/Images/coin.png')} style={{ width: wp('7%'), height: hp('3%') }}>
                      <Text style={styles.coinText}>5</Text>
                    </ImageBackground>
                  </Animated.View>
                )}
                {showPartyPopper && (
                  <PartyPopperAnimation onAnimationComplete={() => setShowPartyPopper(false)} />
                )}

                {iqVisible && (
                  <Animated.View
                    style={[
                      styles.iqContainer,
                      {
                        transform: [{ translateY: iqAnimation.y }],
                      },
                    ]}
                  >
                    <ImageBackground source={require('../assets/Images/iq.png')} style={{ width: wp('3%'), height: hp('3%') }}>

                    </ImageBackground>
                  </Animated.View>
                )}

                {showPartyPopper && (
                  <PartyPopperAnimation onAnimationComplete={() => setShowPartyPopper(false)} />
                )}



                <Animated.View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', bottom: hp('1.9%') }}>
                  {/* Guess boxes */}
                  {currentGuess.map((letter, index) => (
                    <TouchableOpacity key={index} onPress={() => handleGuessInputPress(index)}>
                      <View style={{ padding: hp('0.6%'), margin: wp('0.25%'), paddingHorizontal: wp('3.5%'), backgroundColor: 'black', borderRadius: 5, borderWidth: 1, borderColor: 'white' }}>
                        <Text style={{ fontSize: RFValue(21), color: 'white', textAlign: 'center', fontFamily: 'OpenSans-Bold' }}>{letter}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </Animated.View>

 
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignContent: 'space-around', top: hp('3.5%')}}>
                {/* Render letter box */}

                
                    
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', width: wp('85%')}}>
                  <View style={styles.container}>
                    {letterBox.map((letter, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleLetterBoxPress(index)}
                        style={styles.box}
                      >
                        <Text style={{ fontSize: RFValue(30), fontFamily: 'OpenSans-ExtraBold', textAlign: 'center' }}>{letter}</Text>
                      </TouchableOpacity>
                    ))}


                  </View>


                </View>

                <View style={{ justifyContent:'center', alignItems:'center', right: wp('4.5%')}}>
                <View>
                <View>
                  <TouchableOpacity onPress={openDrawer}>
                    <BackgroundBtn children={undefined}>

                    </BackgroundBtn>

                  </TouchableOpacity>
                </View>
              </View>
              


              </View>

              </View>
              <View>


              <View style={{flexDirection:'row', justifyContent:'space-around', alignItems:"center", top:hp('3.3%')}}>
              <View >
                <TouchableOpacity onPress={shuffleLetterBox} >
               <ImageBackground source={require('../assets/shuffle.png')} style={{width:wp('84%'), height:hp('6.8%'), left:wp('0.7%')}} />
              </TouchableOpacity>
  
            </View>

                <View style={{right:wp('4%')}}>
                {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
                  <TouchableOpacity onPress={takeScreenshot}>
                    <ImageBackground source={require('../assets/share.png')} style={{ width: wp('17%'), height: hp('6.5%') }} />
                  </TouchableOpacity>
                   )}
                </View>
              </View>
              </View>
            
              </View>
             
      
          {showImage && <CorrectImage />}

{showWrongImage && <WrongImage />}

{showCategoryImage && <CategoryImage />}


 


      
      {showTutorial && (
        <TouchableOpacity style={styles.tutorialOverlay} onPress={hideTutorial}>
          <Animated.View style={[styles.tutorialContent, wobbleStyle]}>
           <Ionicons name="arrow-up" size={addSize} color={"white"}/>
            <Text style={styles.tutorialText}>Get coins</Text>
        
          </Animated.View>

          <Animated.View style={[styles.guess, wobbleStyle]}>
            <Text style={{color:'white', fontSize:RFValue(15), fontFamily: 'Poppins-Bold' }}>Guess The Word</Text>
          </Animated.View>
         
          <Animated.View style={[styles.hint, wobbleStyle]}>
          <Text style={styles.tutorialTexts}>Get Hint</Text>
           <Ionicons name="arrow-down" size={addSize} color={"white"}/>
            
        
          </Animated.View>
          
        </TouchableOpacity>


      )}
      

     </SafeAreaView>
   </Background>

)



}
const styles = StyleSheet.create({
   
  header: {
    backgroundColor:'black', 
    height:hp('10%'), 
    flexDirection: 'row', 
    justifyContent:'space-between', 
    alignContent:'space-between'
  },
  back: {
    top:hp('6%')
  },
  backImg: {
    width:wp('10%'), 
    height: hp('4%'), 
    marginBottom:hp('-6%'), 
    left:wp('2%')
  },
  brain: {
    top:hp('6%')
  },
  brainImg: {
    width:wp('5%'), 
    height:hp('3.9%'), 
    left:wp('13%')
  },
   animatedcontainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    top:hp('2.5%'),
     left: wp('18%'),
     backgroundColor:'white', 
     width:wp('8%'), 
     height:hp('1%'), 
     borderRadius: 10
   },
   
  iq: {
    fontSize:RFValue(6), 
    left:wp('2%'), 
    fontFamily:'OpenSans-Bold'
  },
  levelcontainer: {
    left:wp('3%'), 
    marginRight:wp('-4%'), 
    top:hp('5.5%')
  },
  levelimg: {
    width: wp('17%'), 
    height: hp('9%')
  },
 currentlevel:{
  fontFamily: 'Poppins-Bold', 
  position:'relative', 
  textAlign: 'center', 
  color: '#fff', 
  fontSize: RFValue(14), 
  top:hp('-6%'), 
  
 },










    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      
      
      
      
    },
    box: {
      borderWidth: 2,
      borderColor: 'black',
      margin: wp('0.20%'),
      borderRadius: 6,
      backgroundColor: 'white',
      minWidth: wp('14.7%'),
      maxWidth: wp('14.7%'),
      padding: wp('0.5%'),

      
      
    },
    coinContainer: {
      position: 'absolute',
      top: hp('80%'), 
      left: wp('99.9%'), 
      marginLeft: wp('-17.5%'), 
      zIndex: 1000, 
    },
    coinText: {
      color: 'white',
      fontSize: RFValue(17),
      position: 'absolute',
      top: 0,
      left: wp('70%'),
      fontFamily:'Poppins-Regular'
    },

    iqContainer: {
      position: 'absolute',
      top: hp('100%'), 
      left: wp('23%'), 
      marginLeft: wp('-10%'), 
      zIndex: 1000, 
    },

   

    imageStyle: {
      width: wp('80%'),
      height: hp('30%'),
      position: 'absolute',
      top: hp('50%'), 
      left: wp('10%'),
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999, // Ensure the image appears above other content
    },

    wrongImageStyle: {
      width: wp('60%'),
      height: hp('30%'),
      position: 'absolute',
      top: hp('10%'), 
      left: wp('14%'),
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999, // Ensure the image appears above other content
    },

    startButton: {
      backgroundColor: '#009688',
      padding: wp('3%'),
      borderRadius: 8,
    },
    startButtonText: {
      color: '#ffffff',
      fontSize: RFValue(18),
    },
    tutorialOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',

      justifyContent: 'center',
      alignItems: 'center',
    },
    tutorialContent: {
      left: wp('39%'),
      bottom: hp('33%'),
      alignItems: 'center',
    },
    
    tutorialText: {
      fontSize: RFValue(13),
      textAlign: 'center',
      color:'white',
      fontFamily:'Poppins-Regular'
    },

    tutorialTexts: {
      fontSize: RFValue(13),
      textAlign: 'center',
      color:'white',
      fontFamily:'Poppins-Regular',
      right:7
    },

    guess: {
    top:hp('27%')
    },
    hint: {
      top: hp('17.4%'),
      left:wp('38%')
    },
    safe: {
       flex: 1 
    },

    



  viewshot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },









  });
  
  


export default GameScreen;
import React, { useEffect, useState, useRef } from 'react';
import { BackHandler, Dimensions, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Background from '../Components/Background';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Easing } from 'react-native';
import PartyPopperAnimation from '../Components/PartyPopperAnimation';
import Puzzle from '../Components/Puzzle';
import { StatusBar } from 'expo-status-bar';
import {  useSound } from '../SoundContext';
import { useGame } from '../Components/GameContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';




  const DailyPuzzleScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  
    const [currentPuzzle, setCurrentPuzzle] = useState(1); 
    const { score, setScore } = useGame();
  const [currentGuess, setCurrentGuess] = useState<string[]>(['', '', '', '']);
  const [letterBox, setLetterBox] = useState<string[]>([]);
  const [correctSound, setCorrectSound] = useState<Sound | null>(null);
  const [buttonSound, setButtonSound] = useState<Sound | null>(null);
  const [coinVisible, setCoinVisible] = useState(false);
  const [removeSound, setRemoveSound] = useState<Sound | null>(null);
  const [incorrectSound, setIncorrectSound] = useState<Sound | null>(null);
  const [fanfareSound, setFanfareSound] = useState<Sound | null>(null);
  const [comicSound, setComicSound] = useState<Sound | null>(null);
  const {width, height} = Dimensions.get('window');
  const [coinAnimation] = useState(new Animated.ValueXY({ x: 0, y: 0 }));
  const { soundEnabled } = useSound();
  const [pendingScore, setPendingScore] = useState<number | null>(null);
  const [showPartyPopper, setShowPartyPopper] = useState(false);
  const translateX = useRef(new Animated.Value(500)).current;
  const [loading, setLoading] = useState(false);
  const LoadingImage = require('../assets/loadingImg.gif');
  const completionTimeKey = 'lastCompletionTime';
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const { playSound } = useSound();

  useEffect(() => {
    loadGameProgress();
  
  }, [])

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 1800, 
      useNativeDriver: true,
    }).start();
  }, [currentPuzzle]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Navigate to MainMenuScreen and pass score and current level
      navigation.navigate('MainMenu');

      return true; // Prevent default behavior (closing the app)
    });

    return () => {
      backHandler.remove(); 
    };
  }, [navigation, score, currentPuzzle]);

  
 




  useEffect(() => {
    // Update the score after a delay
    if (pendingScore !== null) {
      setTimeout(() => {
        setScore(pendingScore);
        setPendingScore(null);
      }, 300); // Delay updating the score for 1 second
    }
  }, [pendingScore]);
  
  const moveCoin = () => {
    Animated.parallel([
      Animated.timing(coinAnimation, {
        toValue: { x: 0, y: -820 },
        duration: 1300,
        easing: Easing.bezier(0.17, 0.67, 0.83, 0.67),
        useNativeDriver: false,
      }),
      Animated.timing(coinAnimation, {
        toValue: { x: 1, y: 1 },
        duration: 1300,
        easing: Easing.bezier(0.17, 0.67, 0.83, 0.67),
        useNativeDriver: false,
      }),
      Animated.timing(coinAnimation, {
        toValue: 0, // Reset scale back to original
        duration: 0,
        delay: 1300, // Delay reset to match the end of movement animation
        useNativeDriver: false,
      }),
      Animated.timing(coinAnimation, {
        toValue: 0, // Reset opacity back to original
        duration: 0,
        delay: 1300, // Delay reset to match the end of movement animation
        useNativeDriver: false,
      }),
    ]).start(() => {
      setCoinVisible(false);
      coinAnimation.setValue({ x: 0, y: 0 });
    });
  };
  
  useEffect(() => {
    if (currentGuess.every((letter) => letter !== '')) {
      checkGuess();
    }
  }, [currentGuess]);

  
  useEffect(() => {
    if (currentPuzzle > Puzzle.length) {
      setCurrentPuzzle(1);
    }
  }, [currentPuzzle]);
 
    useEffect(() => {
    // Save game progress whenever score or current level changes
    saveGameProgress();
  }, [score]);

  const loadGameProgress = async () => {
    try {
      
      const savedScore = await AsyncStorage.getItem('score');
      
      if (savedScore !== null) {
        
        setScore(parseInt(savedScore));
        const lastCompletionTime = await AsyncStorage.getItem(completionTimeKey);
        if (lastCompletionTime) {
          const timeDifference = Date.now() - parseInt(lastCompletionTime);
          if (timeDifference < 24 * 60 * 60 * 1000) {
            const remainingTime = 24 * 60 * 60 * 1000 - timeDifference;
            setRemainingTime(remainingTime); // Update remaining time state
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, remainingTime);
          }
        }
      }
      
    } catch (error) {
      console.error('Error loading game progress:', error);
    }
  };

  const saveCompletionTime = async () => {
    try {
      await AsyncStorage.setItem(completionTimeKey, Date.now().toString());
    } catch (error) {
      console.error('Error saving completion time:', error);
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
    setCurrentGuess(Array(Puzzle[currentPuzzle].word.length).fill(''));
    // Initialize letter box with 10 random letters and letters from the current word
    const wordLetters = Puzzle[currentPuzzle].word.split('');
    const remainingLetters = Array.from({ length: 10 - wordLetters.length }, () => {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    });
    const shuffledLetters = shuffle(wordLetters.concat(remainingLetters));
    setLetterBox(shuffledLetters);
  }, [currentPuzzle]);

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
    const currentWord = Puzzle[currentPuzzle].word;
    if (currentGuess.join('').toUpperCase() === currentWord) {
      setShowPartyPopper(true);
      playSound('correct');
      playSound('level');
      setCoinVisible(true); // Show the coin
      setTimeout(() => {
        playSound('daily');
        
      }, 2200)
      
      setTimeout(() => {
        
        setLoading(true);
         
        
      }, 4000)
      setTimeout(() => {
        
        increasePuzzle();
        
      }, 4500)
      
      saveCompletionTime();
      setTimeout(() => {
        setLoading(false);
        
        
      }, 24 * 60 * 60 * 1000);
      setTimeout(() => {
        moveCoin(); // Move the coin to the score area
        AsyncStorage.setItem('score', score.toString())
        setPendingScore(score + 100); // Increment score after animation
      }, 2000);
        
    } else {
      playSound('incorrect');
    }
  };
  
  

  const handleMovement = () => {
   navigation.navigate('MainMenu'); 
 };

 const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

 
useEffect(() => {
  // Load currentPuzzle from AsyncStorage when component mounts
  AsyncStorage.getItem('currentPuzzle')
    .then((storedCurrentPuzzle) => {
      if (storedCurrentPuzzle) {
        setCurrentPuzzle(parseInt(storedCurrentPuzzle));
      } else {
        setCurrentPuzzle(1); // Default starting difficulty
      }
    })
    .catch((error) => {
      console.error('Error loading Puzzle from AsyncStorage:', error);
    });
}, []);

const increasePuzzle = () => {
  setCurrentPuzzle((prevCurrentPuzzle) => {
    const newCurrentPuzzle = prevCurrentPuzzle + 1;
    return newCurrentPuzzle; 
  });
};
useEffect(() => {
  // Store the current difficulty in AsyncStorage whenever it changes
  AsyncStorage.setItem('currentPuzzle', currentPuzzle.toString())
    .catch((error) => {
      console.error('Error saving currentPuzzle to AsyncStorage:', error);
    });
}, [currentPuzzle]);






return(

<Background>
<StatusBar />
   <View style={{backgroundColor:'black', height: hp('10%'), flexDirection: 'row', justifyContent:'space-between', alignContent:'space-around'}}>
    
         <View>
            <TouchableOpacity onPress={handleMovement} >
            <ImageBackground 
            source={require('../assets/Images/backIcon.png')}
            style={{width:wp('10%'), height: hp('4%'), marginTop: hp('6%'), left: wp('3%')}}
            
            />
               
            </TouchableOpacity>
            
         </View>
         

   <View style={{ flexDirection:"row",justifyContent:'space-around', alignContent:'flex-start', top:hp('6%'), right:wp('3%'), borderColor:'#859410', borderWidth:1, borderRadius:10, marginBottom:hp('6.5%'), paddingHorizontal:wp('3%'), gap:wp('0.6%')}}>
   <ImageBackground
            source={require('../assets/Images/coin.png')} 
            style={{width: wp('5%'), height: hp('2%'), top:hp('0.6%')}}
               
         /> 
        <View >
        
         <Text style={{ fontFamily:'Poppins-Regular', color: "white", fontSize: RFValue(15)}}>{score}</Text>


        </View>
         
         
          
        
</View>
     
   </View>

    
   <View style={{ }}>
    
      {loading ? (
        <View style={{ marginTop: hp('8%'), backgroundColor:'#00007B', width:wp('98%'), borderColor:"blue", borderWidth:2, borderRadius:20 , height:hp('70%'), left:wp('1%')}}>
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}> 
          
          
          
          <ImageBackground source={require('../assets/adaptive-icon.png')} style={{width:wp('60%'), height:hp('34%'), bottom:hp('2%')}}/>

          
          <Text style={{fontFamily:'Poppins-Bold',color:'white', padding:wp('4%'), textAlign:'center', fontSize:RFValue(16), marginTop:hp('2%')}}>You have played your puzzle for the day!</Text>
        {remainingTime !== null && (
          <View style={{backgroundColor:'#152238', borderRadius:12}}>
          <Text style={{fontFamily:'Poppins-Regular',color:'white', padding: wp('2%'), textAlign:'center', fontSize:RFValue(13), marginTop:hp('1%')}}>
            Remaining time: {formatTime(remainingTime)}
          </Text>
          </View>
           )}
        </View>
         </View>
        
      
      ) : (
    

        
 <View>
   <View style={{paddingHorizontal:wp('4%')}}>

    <ImageBackground source={require('../assets/board.png')} style={{width:wp('92%'), height:hp('7%'), top:hp('2.5%')}} />
   
  <Text style={{fontFamily:'Poppins-BoldItalic',color:'white', textAlign:'center', fontSize:RFValue(16), bottom:hp('2%')}}>{Puzzle[currentPuzzle].question}</Text>
 </View>
      
     
 
 <Animated.View style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignContent: 'center',
                  flexWrap: 'wrap',
                  top: hp('2%'),
                  transform: [{ translateX }]
                }}>
      {Puzzle[currentPuzzle].images.map((imageSource, index) => (
        <Image key={index} source={imageSource} style={{
          width:  wp('45%'),
          height: hp('21%'),
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
          <ImageBackground source={require('../assets/Images/coin.png')} style={{ width: wp('5%'), height: hp('3%') }}>
            <Text style={styles.coinText}>60</Text>
          </ImageBackground>
          
        </Animated.View>
      )}
        {showPartyPopper && (
        <PartyPopperAnimation onAnimationComplete={() => setShowPartyPopper(false)} />
      )}



    <View style={{flexDirection: 'row', flexWrap:'wrap', justifyContent:'center', alignContent:'center', top:hp('7%')}}>
      {/* Guess boxes */}
      {currentGuess.map((letter, index) => (
        <TouchableOpacity key={index} onPress={() => handleGuessInputPress(index) }>
          <View style={{ padding: hp('0.6%'), margin: wp('0.5%'),paddingHorizontal:'3.5%', backgroundColor:'black', borderRadius:5, borderWidth:1, borderColor:'white'}}>
            <Text style={{fontFamily:'OpenSans-Bold',fontSize:RFValue(21),  color:'white', textAlign:'center'}}>{letter}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>

    

      {/* Render letter box */}
      <View style={{flexDirection:'row', justifyContent:'space-around',alignContent:'center', width:wp('95%'),top:hp('6.5%')}}>
      <View style={styles.container}>
        {letterBox.map((letter, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleLetterBoxPress(index)}
            style={styles.box}
          >
            <Text style={{fontFamily:'Poppins-ExtraBold',fontSize:RFValue(30),textAlign:'center'}}>{letter}</Text>
          </TouchableOpacity>
        ))}

        
      </View>
      
       
      

      
      </View>
      
      
      </View>
       )}
       </View>
      
     
   </Background>
   

)



}
const styles = StyleSheet.create({
   
  

    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginVertical: hp('6%'),
      width: wp('85%'),
      marginLeft: wp('5%'),
      
      
      
      
    },
    box: {
      borderWidth: 2,
      borderColor: 'black',
      padding: wp('0.02%'),
      margin: wp('0.4%'),
      borderRadius: 6,
      backgroundColor: 'white',
      minWidth: wp('14.5%'),
      maxWidth: wp('14.5%'),
      
      

      
      
    },
    coinContainer: {
      position: 'absolute',
      top: hp('-3%'), 
      left:  wp('90%'), 
      marginLeft: wp('-11%'), 
      zIndex: 1000, 
      width:'100%'
    },
    coinText: {

      color: 'white',
      fontSize: RFValue(13),
      position: 'absolute',
      top: 0,
      right: wp('2%'),
      fontFamily:'Poppins-Bold',
    },

    

    imageStyle: {
      width: wp('80%'),
      height: hp('30%'),
      position: 'absolute',
      top: hp('50%'), 
      left: wp('5%'),
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
    
  });
  
  


export default DailyPuzzleScreen;

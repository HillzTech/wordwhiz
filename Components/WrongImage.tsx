
import React, { useEffect,  useRef } from 'react';
import { Animated, ImageBackground, StyleSheet, Text } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const WrongImage = () => {
    const popOutAnimation = useRef(new Animated.Value(0)).current;
  
    useEffect(() => {
      Animated.timing(popOutAnimation, {
        toValue: 1,
        duration: 500, // Adjust duration as needed
        useNativeDriver: true,
      }).start();
    }, []);
  
    return (
      <Animated.View
        style={[
          styles.imageContainer,
          {
            transform: [
              {
                scale: popOutAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
          },
        ]}
      >
        <ImageBackground
          source={require('../assets/wrongImg.png')}
          style={styles.imageStyle}
        />
        
      </Animated.View>
    );
  };
  

const styles = StyleSheet.create({
    imageContainer: {
        position: 'absolute',
        top: hp('-4%'),
        left: wp('3%'),
        right: 0,
        bottom: hp('3%'),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      },
  imageStyle: {
    width: wp('54%'),
    height: hp('30%'),
    position: 'absolute',
    
  },
});

export default WrongImage;

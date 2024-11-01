import React, { useEffect,  useRef } from 'react';
import { Animated, ImageBackground, StyleSheet, Text } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const CorrectImage = () => {
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
          source={require('../assets/rightImg.png')}
          style={styles.imageStyle}
        />
        <Text style={{color:'yellow', fontSize:RFValue(35), textAlign:'center', fontFamily:'Poppins-Bold', top:hp('17%'), right:wp('1.4%'), }}>Great!</Text>
      </Animated.View>
    );
  };
  

const styles = StyleSheet.create({
    imageContainer: {
        position: 'absolute',
        top: hp('-4%'),
        left: wp('5%'),
        right: wp('0%'),
        bottom: hp('2%'),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      },
  imageStyle: {
    width: wp('75%'),
    height: hp('30%'),
    position: 'absolute',
    
    
  },
});

export default CorrectImage;

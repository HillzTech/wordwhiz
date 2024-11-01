import React, { useEffect, useState } from 'react'
import { Animated, Image, View, StyleSheet } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


export const Animation = () => {
    const [spinAnimation] = useState(new Animated.Value(0));
    useEffect(() => {
        startAnimation();
      }, []);

      const startAnimation = () => {
        Animated.loop(
          Animated.timing(spinAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ).start();
      };
    
      const spin = spinAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });
   
  return (
    <View style={styles.container}>
      <View style={styles.proton}>
        <Image source={require('../assets/Images/brain.png')} style={{ width:  wp('46%'), height: hp('31%') }} />
        <Animated.View style={[styles.electron, { transform: [{ rotate: spin }] }]}>
          <Image source={require('../assets/Images/earth.png')} style={{ height: hp('10%'), width: wp('15%') }} />
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    proton: {
      width: 139,
      height: 390,
      borderRadius: 50,
      position: 'relative',
      top: 70,
    },
    electron: {
      width: 30,
      height: 30,
      position: 'absolute',
      borderRadius: 50,
      padding: 5,
      left: 57,
      top: 41,
      borderWidth: 1,
      borderColor: 'black',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

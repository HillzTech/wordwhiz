import React, { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

// Define type for onAnimationComplete function
type OnAnimationComplete = () => void;

// Define PartyPopperAnimation component
const PartyPopperAnimation: React.FC<{ onAnimationComplete: OnAnimationComplete }> = ({ onAnimationComplete }) => {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 4000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      onAnimationComplete();
    });
  }, []);

  return (
    <View style={styles.partyPopperContainer}>
      <Animated.Image
        source={require('../assets/Images/party-popper.png')}
        style={[
          styles.partyPopper,
          {
            transform: [
              {
                scale: animation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1.5, 1],
                }),
              },
              {
                translateY: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -700],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    partyPopperContainer: {
      position: 'absolute',
      top: '80%', // Adjust as needed
      left: '50%', // Adjust as needed
      transform: [{ translateX: -50 }, { translateY: -90 }],
      zIndex: 999, // Ensure the party popper appears on top
    },
    partyPopper: {
      width: 100,
      height: 100,
    },
  });

  export default PartyPopperAnimation
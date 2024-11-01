// BouncingImage.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';

interface BouncingImageProps {
  source: any;
  style?: any;
}

const BouncingImage: React.FC<BouncingImageProps> = ({ source, style }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [bounceAnim]);

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <Animated.Image
      source={source}
      style={[style, { transform: [{ scale: bounce }] }]}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 50,
    height: 50,
  },
});

export default BouncingImage;

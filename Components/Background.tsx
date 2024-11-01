import React, { ReactNode } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

interface BackgroundProps {
  children: ReactNode;
}

const Background: React.FC<BackgroundProps> = ({ children }) => {
  return (
    <ImageBackground
      source={require('../assets/Images/peakpx.jpg')}
      style={styles.background}
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    
  },
});

export default Background;

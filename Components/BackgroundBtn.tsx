import React, { ReactNode } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface BackgroundProps {
  children: ReactNode;
}

const BackgroundBtn: React.FC<BackgroundProps> = ({ children }) => {
  return (
    <ImageBackground
      source={require('../assets/hint.png')}
      style={styles.background}
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: wp('15%'),
    height: hp('14.5%'),
    
  
  },
});

export default BackgroundBtn;

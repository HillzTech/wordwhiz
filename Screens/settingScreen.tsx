import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ImageBackground, BackHandler, Button, Pressable, ActivityIndicator, Vibration , Dimensions, Switch} from 'react-native';
import Background from '../Components/Background';
import { Ionicons } from '@expo/vector-icons';
import { Animation } from '../Components/Animation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import Sound from 'react-native-sound';
import { useSound } from '../SoundContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const settingScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const [score, setScore] = useState<string>('0');
  const [currentLevel, setCurrentLevel] = useState<string>('1');
  const [helpSound, setHelpSound] = useState<Sound | null>(null);
  const { soundEnabled, vibrationEnabled, toggleSound, toggleVibration, playSound, vibrate } = useSound();
  const {width, height} = Dimensions.get('window');
  const iconSize = width < 395 ? 32 : 36

  
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.push('MainMenu');

      return true; 
    });

    return () => {
      backHandler.remove(); 
    };
  }, [navigation]);

  const handleBack = useCallback(() => {
    navigation.push('MainMenu');
  }, [navigation]);

 
  return (
    <Background>
      <StatusBar />
      <SafeAreaView style={{flex:1}}>
        <View style={{flexDirection:'row', justifyContent:'center', top:hp('6.5%'), backgroundColor:'#1c2e5a'}}>
            <Text style={{textAlign:'center', color:'white', fontFamily:'Poppins-Regular', top:hp('1%'), left:10}}>Settings</Text>
            <TouchableOpacity onPress={handleBack} style={{left:wp('34%')}}>
            <Ionicons name='close' color={'white'} size={iconSize} />
            </TouchableOpacity>
        </View>
        
        
        
        <View style={styles.menu}>
          <View style={styles.settingRow}>
            
              
            <Text style={styles.settingText}>Sound</Text>
            
            
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={soundEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSound}
              value={soundEnabled}
            />
          </View>
        </View>

        <View style={styles.menu}>
          <View style={styles.settingRow}>
            
            <Text style={styles.settingText}>Vibration</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={vibrationEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleVibration}
              value={vibrationEnabled}
            />
          </View>
        </View>


        <View style={{marginTop:hp('70%'), backgroundColor:'#1c2e5a', height:wp('37%')}}>
           <Text style={{textAlign:'center', color:'#1c2e9a', fontFamily:'Poppins-Bold', fontSize:RFValue(17), top:hp('5%')}}>Version 1.1.6</Text>
           <Text style={{textAlign:'center', color:'#1c2e9a', fontFamily:'Poppins-Bold', fontSize:RFValue(17), top: hp('4%')}}>HillzTech Studio</Text>
        </View>
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    gap:wp('8%'),
    padding:hp('8%'),
    marginTop:hp('10%')
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('8%'),
    borderRadius: 5,
  },
  toggleText: {
    marginLeft: wp('8%'),
    fontFamily:'Poppins-Regular'
  },
  levelRequirementText: {
    color: 'red',
    fontSize: RFValue(16),
    marginBottom: hp('2%'),
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1.6%'),
    padding:10,
    backgroundColor:'#1c2e5a',
  },
  settingText: {
    color: 'white',
    fontSize: RFValue(18),
    marginLeft: wp('3%'),
  },
  menu: {
    top: hp('8%'),
     
   },
});

export default memo(settingScreen);

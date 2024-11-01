import React, { useEffect, useState, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, Image, ImageSourcePropType, Keyboard, BackHandler, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import levels from '../Components/Level';
import Background from '../Components/Background';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const DictionaryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [error, setError] = useState('');
  const [images, setImages] = useState<ImageSourcePropType[]>([]);
  const {width, height} = Dimensions.get('window');
  const iconSize = width < 395 ? 27 : 30

  const searchDictionary = () => {
    Keyboard.dismiss();
    const searchTerm = word.trim().toLowerCase();
    const foundWord = levels.find(level => level.word.toLowerCase() === searchTerm);

    if (foundWord) {
      setDefinition(foundWord.definition || 'Definition not available');
      const wordImages = foundWord.images.map((image, index) => image);
      setImages(wordImages);
      setError('');
    } else {
      setError('Word not found in the glossary.');
      setDefinition('');
      setImages([]);
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack('MainMenu');
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, [navigation]);

  return (
    <Background>
      <SafeAreaView style={{flex:1}}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
      >
       
        <View>
          <Text style={{ textAlign: 'center', color: 'white', marginTop: hp('4%'), fontFamily: 'Poppins-BoldItalic', fontSize:  RFValue(18), top:hp('1%') }}>
            Welcome to the Glossary!
          </Text>
          <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center', color: 'white', marginBottom: hp('3%'), paddingHorizontal: wp('7%') }}>
            Search and get more information of words used in the game.
          </Text>

          <View style={{ backgroundColor: '#00006B', width: wp('97%'), height: hp('85%'), borderRadius: 20, left: '1.6%', top: hp('-1%'), borderWidth: 2, borderColor: 'blue' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', top: hp('3%') }}>
              <TextInput
                 placeholder="Enter word"
                placeholderTextColor={'white'}
                value={word}
                onChangeText={setWord}
                onSubmitEditing={searchDictionary}
                style={{ borderWidth: 1, borderColor: 'white', borderRadius: 10, padding: 1, width:wp('80%'), color: 'white', left: wp('6%'), textAlign: 'center', height: hp('5%'), fontSize: RFValue(17), fontFamily: 'Poppins-Regular' }}
              />
              <Ionicons name="search" size={iconSize} color="white" style={{ right: 30 }} onPress={searchDictionary} />
            </View>

            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: wp('1%'), top: hp('4%'), width: wp('87%'), borderRadius: 20 }}>
              {images.length > 0 && (
                <View style={{flex:1, justifyContent:'center', alignItems:'center', left:wp('16%')}}> 
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: hp('1%') }}>
                  {images.map((image, index) => (
                    <Image key={index} source={image} style={{ width: wp('27%'), height: hp('11.5%'), margin: 4 }} />
                  ))}
                  </View>
                </View>
              )}

              <ScrollView style={{top:hp('25%'), maxHeight: hp('45%'), left:wp('4%') }}>
                {definition ? (
                  <Text style={{ fontSize: RFValue(14), color: 'white', textAlign: 'justify', fontFamily: 'Poppins-Regular' }}>
                    {definition}
                  </Text>
                ) : null}
                {error ? (
                  <Text style={{ marginTop:hp('1%'), fontSize: RFValue(13), color: 'white', fontFamily: 'Poppins-Regular', textAlign:'center',  marginBottom:hp('3%') }}>
                    {error}
                  </Text>
                ) : null}
              </ScrollView>
            </View>
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </Background>
  );
};

export default memo (DictionaryScreen);

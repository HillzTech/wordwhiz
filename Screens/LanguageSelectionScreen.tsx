import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const languages = ['English', 'Spanish', 'French', 'Portuguese', 'German'];

const LanguageSelectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const selectLanguage = async (language: string) => {
    await AsyncStorage.setItem('selectedLanguage', language);
    navigation.replace('GameScreen'); // Navigate to the main game screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Language</Text>
      {languages.map((lang) => (
        <TouchableOpacity key={lang} onPress={() => selectLanguage(lang)} style={styles.button}>
          <Text style={styles.buttonText}>{lang}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
  button: { padding: 10, backgroundColor: '#007BFF', borderRadius: 5, marginVertical: 5 },
  buttonText: { color: '#fff', fontSize: 18 },
});

export default LanguageSelectionScreen;

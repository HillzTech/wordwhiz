import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SoundContextType {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  toggleSound: () => void;
  toggleVibration: () => void;
  playSound: (soundName: string) => void;
  vibrate: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const soundObjectsRef = useRef<{ [key: string]: Sound | null }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedSoundEnabled = await AsyncStorage.getItem('soundEnabled');
        const savedVibrationEnabled = await AsyncStorage.getItem('vibrationEnabled');

        if (savedSoundEnabled !== null) {
          setSoundEnabled(savedSoundEnabled === 'true');
        }
        if (savedVibrationEnabled !== null) {
          setVibrationEnabled(savedVibrationEnabled === 'true');
        }
      } catch (error) {
        console.error('Error fetching sound and vibration settings:', error);
      }
    };

    fetchData();

    const loadSounds = async () => {
      try {
        soundObjectsRef.current['button'] = new Sound(require('./assets/sounds/button.mp3'), (error) => {
          if (error) console.error('Failed to load button sound', error);
        });
        soundObjectsRef.current['remove'] = new Sound(require('./assets/sounds/remove.mp3'), (error) => {
          if (error) console.error('Failed to load remove sound', error);
        });
        soundObjectsRef.current['help'] = new Sound(require('./assets/sounds/sharpButton.mp3'), (error) => {
          if (error) console.error('Failed to load help sound', error);
        });
        soundObjectsRef.current['correct'] = new Sound(require('./assets/sounds/correct.mp3'), (error) => {
          if (error) console.error('Failed to load correct sound', error);
        });
        soundObjectsRef.current['incorrect'] = new Sound(require('./assets/sounds/incorrect.mp3'), (error) => {
          if (error) console.error('Failed to load incorrect sound', error);
        });
        soundObjectsRef.current['iq'] = new Sound(require('./assets/sounds/iq.mp3'), (error) => {
          if (error) console.error('Failed to load iq sound', error);
        });
        soundObjectsRef.current['level'] = new Sound(require('./assets/sounds/levelpassed.mp3'), (error) => {
          if (error) console.error('Failed to load level sound', error);
        });
         soundObjectsRef.current['daily'] = new Sound(require('./assets/sounds/dailycorrect.mp3'), (error) => {
          if (error) console.error('Failed to load daily sound', error);
        });
      } catch (error) {
        console.error('Error loading sounds:', error);
      }
    };

    loadSounds();

    return () => {
      // Cleanup function to release sounds when component unmounts
      Object.values(soundObjectsRef.current).forEach((soundObject) => {
        soundObject?.release();
      });
    };
  }, []);

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    AsyncStorage.setItem('soundEnabled', newValue.toString());
  };

  const toggleVibration = () => {
    const newValue = !vibrationEnabled;
    setVibrationEnabled(newValue);
    AsyncStorage.setItem('vibrationEnabled', newValue.toString());
  };

  const playSound = (soundName: string) => {
    const soundObject = soundObjectsRef.current[soundName];
    if (soundEnabled && soundObject) {
      soundObject.play((success) => {
        if (!success) {
          console.error(`Failed to play ${soundName} sound`);
        }
      });
    }
  };

  const vibrate = () => {
    // Implement vibrate function as per your existing logic
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, vibrationEnabled, toggleSound, toggleVibration, playSound, vibrate }}>
      {children}
    </SoundContext.Provider>
  );
};

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RewardPopup from './RewardPopup'; // Import the RewardPopup component

interface GameContextType {
  currentLevel: number;
  score: number;
  setCurrentLevel: (level: number) => void;
  setScore: (score: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [showRewardPopup, setShowRewardPopup] = useState<boolean>(false);

  const DAILY_REWARD = 100;

  useEffect(() => {
    const loadGameProgress = async () => {
      try {
        const savedLevel = await AsyncStorage.getItem('currentLevel');
        const savedScore = await AsyncStorage.getItem('score');
        const lastLoginDate = await AsyncStorage.getItem('lastLoginDate');
        
        // Load saved game state
        if (savedLevel !== null) {
          setCurrentLevel(parseInt(savedLevel, 10));
        }
        if (savedScore !== null) {
          setScore(parseInt(savedScore, 10));
        }

        // Check if daily reward is applicable
        const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        if (lastLoginDate !== today) {
          // Reward user and show popup
          const newScore = (savedScore !== null ? parseInt(savedScore, 10) : 0) + DAILY_REWARD;
          setScore(newScore);
          await AsyncStorage.setItem('lastLoginDate', today); // Update the last login date
          
          // Show the reward popup
          setShowRewardPopup(true);
        }
      } catch (error) {
        console.error('Error loading game progress:', error);
      }
    };

    loadGameProgress();
  }, []);

  useEffect(() => {
    const saveGameProgress = async () => {
      try {
        await AsyncStorage.setItem('currentLevel', currentLevel.toString());
        await AsyncStorage.setItem('score', score.toString());
      } catch (error) {
        console.error('Error saving game progress:', error);
      }
    };

    saveGameProgress();
  }, [currentLevel, score]);

  const closeRewardPopup = () => {
    setShowRewardPopup(false);
  };

  return (
    <GameContext.Provider value={{ currentLevel, score, setCurrentLevel, setScore }}>
      {children}

      {/* Render RewardPopup component */}
      <RewardPopup visible={showRewardPopup} onClose={closeRewardPopup} />
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

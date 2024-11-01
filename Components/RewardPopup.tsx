import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Easing, TouchableOpacity, StyleSheet } from 'react-native';

interface RewardPopupProps {
  visible: boolean;
  onClose: () => void;
}

const RewardPopup: React.FC<RewardPopupProps> = ({ visible, onClose }) => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial value for opacity

  useEffect(() => {
    if (visible) {
      // Fade-in animation when popup becomes visible
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500, // Duration of fade-in
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade-out animation when popup is closed
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500, // Duration of fade-out
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null; // Don't render the popup if it's not visible

  

  return (
    <View style={styles.modalBackground}>
      <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
      <Text style={styles.HeaderText}>Daily Rewards!</Text>
        <Text style={styles.modalText}>You have received 100 coins!</Text>
        <FontAwesome5 name="coins" size={23} color="gold" />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    bottom: 140,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#152238',
    zIndex: 1000,
    position: 'absolute',
    borderRadius: 10,
    left: 50,
  },
  modalContent: {
    
    backgroundColor: '#152238',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'white',
   
  },
  HeaderText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  closeButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default RewardPopup;

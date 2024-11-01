import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  difficulty: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ difficulty }) => {
  const renderBars = () => {
    const bars = [];
    for (let i = 1; i <= 10; i++) {
      let backgroundColor = '#FF0000'; // Red for hard levels
      if (i <= 4) {
        backgroundColor = '#0000FF'; // Blue for easy levels
      } else if (i <= 7) {
        backgroundColor = '#00FF00'; // Green for medium levels
      }

      const completed = difficulty >= i;

      bars.push(
        <View
          key={i}
          style={[
            styles.bar,
            { backgroundColor: completed ? backgroundColor : '#CCC' },
          ]}
        />
      );
    }
    return bars;
  };

  return <View style={styles.container}>{renderBars()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    width: 90,
  },
  bar: {
    flex: 1,
    height: 5,
    marginHorizontal: 2,
  },
});

export default ProgressBar;

import React from 'react';
import { Animated, StyleSheet, ImageStyle } from 'react-native';

type Props = {
  source: any;
  style?: ImageStyle;
  rounded?: boolean;
};

const MyImageComponent: React.FC<Props> = ({ source, style, rounded }) => {
  return (
    <Animated.Image
      style={[style, styles.container, rounded && { borderRadius: 15 }]}
      source={source}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});

export default MyImageComponent;
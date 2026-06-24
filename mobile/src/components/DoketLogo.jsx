import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

export default function DoketLogo({ size = 48, borderRadius }) {
  const r = borderRadius ?? size * 0.2;
  return (
    <View style={{ width: size, height: size, borderRadius: r, overflow: 'hidden' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Rect width="100" height="100" rx={r * (100 / size)} fill="#004E89" />
        <Path
          d="M30 35C30 32.2386 32.2386 30 35 30H55L70 45V70C70 72.7614 67.7614 75 65 75H35C32.2386 75 30 72.7614 30 70V35Z"
          fill="white"
        />
        <Path d="M55 30V45H70L55 30Z" fill="#D4D4D8" />
        <Rect x="40" y="55" width="20" height="4" rx="2" fill="#FF6B35" />
        <Rect x="40" y="62" width="12" height="4" rx="2" fill="#FF6B35" />
      </Svg>
    </View>
  );
}

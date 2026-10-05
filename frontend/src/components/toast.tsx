import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "@/src/theme";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  message: string;
};

export function Toast({ visible, onDismiss, message }: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 180 });
      translateY.value = withTiming(0, { duration: 180 });
      const t = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 180 }, (finished) => {
          if (finished) runOnJS(onDismiss)();
        });
        translateY.value = withTiming(16, { duration: 180 });
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [visible, opacity, translateY, onDismiss]);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <Animated.View style={[styles.card, animated]}>
        <Pressable onPress={onDismiss}>
          <View style={styles.inner}>
            <View style={styles.text}>
              <Animated.Text style={styles.message}>{message}</Animated.Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 100,
    alignItems: "center",
    zIndex: 1000,
  },
  card: {
    backgroundColor: colors.surfaceInverse,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: { paddingHorizontal: 4 },
  message: {
    color: colors.onSurfaceInverse,
    fontWeight: "600",
    fontSize: 14,
  },
});

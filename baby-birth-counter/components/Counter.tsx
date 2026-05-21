import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface CounterProps {
  count: number;
}

export default function Counter({ count }: CounterProps) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);

  useEffect(() => {
    if (count !== prevCount.current) {
      // Bounce animation on count change
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      prevCount.current = count;
    }
  }, [count]);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.count,
          {
            color: theme.colors.primaryAccent,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {count}
      </Animated.Text>
      <Text style={[styles.label, { color: theme.colors.secondaryText }]}>
        Births Recorded
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  count: {
    fontSize: 72,
    fontWeight: "800",
    lineHeight: 80,
  },
  label: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: "500",
  },
});

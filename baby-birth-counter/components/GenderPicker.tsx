import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { Gender } from "../lib/births";

interface GenderPickerProps {
  value: Gender | null;
  onChange: (gender: Gender | null) => void;
}

const options: { label: string; value: Gender; symbol: string; activeColor: string }[] = [
  { label: "Male", value: "male", symbol: "♂", activeColor: "#64B5F6" },
  { label: "Female", value: "female", symbol: "♀", activeColor: "#F48FB1" },
];

export default function GenderPicker({ value, onChange }: GenderPickerProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.primaryText }]}>
        Sex
      </Text>
      <View style={styles.optionsRow}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected
                    ? option.activeColor + "20"
                    : theme.colors.inputBackground,
                  borderColor: isSelected
                    ? option.activeColor
                    : theme.colors.inputBorder,
                },
              ]}
              onPress={() =>
                onChange(isSelected ? null : option.value)
              }
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.symbol,
                  {
                    color: isSelected
                      ? option.activeColor
                      : theme.colors.secondaryText,
                  },
                ]}
              >
                {option.symbol}
              </Text>
              <Text
                style={[
                  styles.optionLabel,
                  {
                    color: isSelected
                      ? option.activeColor
                      : theme.colors.secondaryText,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  optionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  symbol: {
    fontSize: 18,
    fontWeight: "700",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
});
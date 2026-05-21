import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../hooks/useTheme";

export type FilterPeriod = "week" | "month" | "ytd" | "all";

interface FilterBarProps {
  selected: FilterPeriod;
  onChange: (period: FilterPeriod) => void;
}

const filters: { label: string; value: FilterPeriod }[] = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "ytd" },
  { label: "All Time", value: "all" },
];

export default function FilterBar({ selected, onChange }: FilterBarProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((filter) => {
        const isSelected = selected === filter.value;
        return (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected
                  ? colors.primaryAccent
                  : colors.surface,
                borderColor: isSelected
                  ? colors.primaryAccent
                  : colors.divider,
              },
            ]}
            onPress={() => onChange(filter.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color: isSelected ? "#FFFFFF" : colors.secondaryText,
                  fontWeight: isSelected ? "700" : "500",
                },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
  },
});

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { BirthEntry } from "../lib/births";

interface BirthCardProps {
  entry: BirthEntry;
  onEdit: (entry: BirthEntry) => void;
  onDelete: (entry: BirthEntry) => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getGenderDisplay(gender: string | null): {
  symbol: string;
  color: string;
  label: string;
} {
  switch (gender) {
    case "male":
      return { symbol: "\u2642", color: "#64B5F6", label: "Male" };
    case "female":
      return { symbol: "\u2640", color: "#F48FB1", label: "Female" };
    case "unknown":
      return { symbol: "?", color: "#BDBDBD", label: "Unknown" };
    default:
      return { symbol: "-", color: "#BDBDBD", label: "Not specified" };
  }
}

export default function BirthCard({ entry, onEdit, onDelete }: BirthCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const genderInfo = getGenderDisplay(entry.gender);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.mainRow}>
        {/* Gender badge */}
        <View
          style={[
            styles.genderBadge,
            { backgroundColor: genderInfo.color + "20" },
          ]}
        >
          <Text style={[styles.genderSymbol, { color: genderInfo.color }]}>
            {genderInfo.symbol}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.date, { color: colors.primaryText }]}>
            {formatDate(entry.date)}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.genderLabel, { color: colors.secondaryText }]}>
              {genderInfo.label}
            </Text>
            {entry.isHistorical && (
              <View
                style={[
                  styles.historicalBadge,
                  { backgroundColor: colors.divider },
                ]}
              >
                <Text
                  style={[
                    styles.historicalText,
                    { color: colors.secondaryText },
                  ]}
                >
                  Historical
                </Text>
              </View>
            )}
          </View>
          {entry.notes && (
            <Text
              style={[styles.notes, { color: colors.secondaryText }]}
              numberOfLines={1}
            >
              {entry.notes}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(entry)}
            activeOpacity={0.6}
          >
            <Text style={[styles.actionText, { color: colors.primaryAccent }]}>
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(entry)}
            activeOpacity={0.6}
          >
            <Text style={[styles.actionText, { color: colors.destructive }]}>
              Del
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  genderBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  genderSymbol: {
    fontSize: 20,
    fontWeight: "700",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  date: {
    fontSize: 15,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  genderLabel: {
    fontSize: 13,
  },
  historicalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historicalText: {
    fontSize: 11,
    fontWeight: "500",
  },
  notes: {
    fontSize: 13,
    marginTop: 2,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

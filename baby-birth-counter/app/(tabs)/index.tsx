import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useBirths } from "../../hooks/useBirths";
import Counter from "../../components/Counter";
import AddEntrySheet from "../../components/AddEntrySheet";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { totalCount, add } = useBirths();
  const [showAddSheet, setShowAddSheet] = useState(false);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {/* Header */}
        <Text style={[styles.greeting, { color: colors.secondaryText }]}>
          Baby Birth Counter
        </Text>

        {/* Counter */}
        <View style={styles.counterSection}>
          <Counter count={totalCount} />
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primaryAccent }]}
          onPress={() => setShowAddSheet(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Record Birth</Text>
        </TouchableOpacity>
      </View>

      {/* Add Entry Bottom Sheet */}
      <AddEntrySheet
        visible={showAddSheet}
        onSubmit={async (data) => {
          await add(data);
        }}
        onClose={() => setShowAddSheet(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 16,
    fontWeight: "500",
    position: "absolute",
    top: 60,
  },
  counterSection: {
    flex: 1,
    justifyContent: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    marginBottom: 40,
    width: "100%",
  },
  addButtonIcon: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

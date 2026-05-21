import { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useTheme } from "../../hooks/useTheme";
import { useBirths } from "../../hooks/useBirths";
import { BirthEntry } from "../../lib/births";
import FilterBar, { FilterPeriod } from "../../components/FilterBar";
import BirthCard from "../../components/BirthCard";
import AddEntrySheet from "../../components/AddEntrySheet";
import ConfirmDialog from "../../components/ConfirmDialog";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

/**
 * Filter births by the selected period and return matching entries.
 */
function filterBirths(births: BirthEntry[], period: FilterPeriod): BirthEntry[] {
  const now = new Date();

  switch (period) {
    case "week": {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return births.filter((b) => b.date >= startOfWeek);
    }
    case "month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return births.filter((b) => b.date >= startOfMonth);
    }
    case "ytd": {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return births.filter((b) => b.date >= startOfYear);
    }
    case "all":
    default:
      return births;
  }
}

/**
 * Build chart data for the selected period.
 */
function buildChartData(
  births: BirthEntry[],
  period: FilterPeriod
): { labels: string[]; data: number[] } {
  if (births.length === 0) return { labels: [], data: [] };

  const now = new Date();

  switch (period) {
    case "week": {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const counts = new Array(7).fill(0);
      births.forEach((b) => counts[b.date.getDay()]++);
      return { labels: days, data: counts };
    }
    case "month": {
      // Group by week of month (W1-W5)
      const weeks: number[] = [0, 0, 0, 0, 0];
      births.forEach((b) => {
        const weekIndex = Math.min(Math.floor((b.date.getDate() - 1) / 7), 4);
        weeks[weekIndex]++;
      });
      return {
        labels: ["W1", "W2", "W3", "W4", "W5"],
        data: weeks,
      };
    }
    case "ytd": {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      const currentMonth = now.getMonth();
      const counts = new Array(currentMonth + 1).fill(0);
      births.forEach((b) => {
        const m = b.date.getMonth();
        if (m <= currentMonth) counts[m]++;
      });
      return {
        labels: months.slice(0, currentMonth + 1),
        data: counts,
      };
    }
    case "all":
    default: {
      // Group by month across all years
      const monthMap = new Map<string, number>();
      births.forEach((b) => {
        const key = `${b.date.getFullYear()}-${String(b.date.getMonth() + 1).padStart(2, "0")}`;
        monthMap.set(key, (monthMap.get(key) || 0) + 1);
      });
      const sorted = Array.from(monthMap.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
      );
      // Show last 6 months max for readability
      const recent = sorted.slice(-6);
      return {
        labels: recent.map(([key]) => {
          const [y, m] = key.split("-");
          const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          return `${monthNames[parseInt(m) - 1]} '${y.slice(2)}`;
        }),
        data: recent.map(([, count]) => count),
      };
    }
  }
}

/**
 * Get gender breakdown counts.
 */
function getGenderBreakdown(births: BirthEntry[]) {
  let male = 0, female = 0, unknown = 0;
  births.forEach((b) => {
    if (b.gender === "male") male++;
    else if (b.gender === "female") female++;
    else unknown++;
  });
  return { male, female, unknown };
}

/**
 * Get the period label.
 */
function getPeriodLabel(period: FilterPeriod): string {
  switch (period) {
    case "week": return "this week";
    case "month": return "this month";
    case "ytd": return "year-to-date";
    case "all": return "all time";
  }
}

export default function HistoryScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { births, loading, add, update, remove } = useBirths();

  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("all");
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editEntry, setEditEntry] = useState<BirthEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<BirthEntry | null>(null);

  const filteredBirths = useMemo(
    () => filterBirths(births, filterPeriod),
    [births, filterPeriod]
  );

  const chartData = useMemo(
    () => buildChartData(filteredBirths, filterPeriod),
    [filteredBirths, filterPeriod]
  );

  const genderBreakdown = useMemo(
    () => getGenderBreakdown(filteredBirths),
    [filteredBirths]
  );

  const handleEdit = (entry: BirthEntry) => {
    setEditEntry(entry);
    setShowAddSheet(true);
  };

  const handleDelete = (entry: BirthEntry) => {
    setDeleteEntry(entry);
  };

  const confirmDelete = async () => {
    if (deleteEntry) {
      await remove(deleteEntry.id);
      setDeleteEntry(null);
    }
  };

  const renderHeader = () => (
    <View style={styles.analyticsSection}>
      {/* Filter Bar */}
      <FilterBar selected={filterPeriod} onChange={setFilterPeriod} />

      {/* Stats */}
      <View style={styles.statsRow}>
        <Text style={[styles.statNumber, { color: colors.primaryAccent }]}>
          {filteredBirths.length}
        </Text>
        <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
          {" "}births {getPeriodLabel(filterPeriod)}
        </Text>
      </View>

      {/* Gender breakdown */}
      <View style={styles.genderRow}>
        {genderBreakdown.male > 0 && (
          <Text style={[styles.genderStat, { color: "#64B5F6" }]}>
            {genderBreakdown.male} {"\u2642"}
          </Text>
        )}
        {genderBreakdown.female > 0 && (
          <Text style={[styles.genderStat, { color: "#F48FB1" }]}>
            {genderBreakdown.female} {"\u2640"}
          </Text>
        )}
        {genderBreakdown.unknown > 0 && (
          <Text style={[styles.genderStat, { color: "#BDBDBD" }]}>
            {genderBreakdown.unknown} ?
          </Text>
        )}
      </View>

      {/* Chart */}
      {chartData.data.length > 0 && chartData.data.some((d) => d > 0) ? (
        <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
          <BarChart
            data={{
              labels: chartData.labels,
              datasets: [{ data: chartData.data }],
            }}
            width={screenWidth - 64}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: () => colors.primaryAccent,
              labelColor: () => colors.secondaryText,
              barPercentage: 0.6,
              propsForLabels: {
                fontSize: 11,
              },
            }}
            style={styles.chart}
          />
        </View>
      ) : (
        <View style={[styles.emptyChart, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.secondaryText, fontSize: 14 }}>
            Not enough data to display chart
          </Text>
        </View>
      )}

      {/* Birth Log Header */}
      <View style={styles.logHeader}>
        <Text style={[styles.logTitle, { color: colors.primaryText }]}>
          Birth Log
        </Text>
        <TouchableOpacity
          style={[styles.addLogButton, { backgroundColor: colors.primaryAccent }]}
          onPress={() => {
            setEditEntry(null);
            setShowAddSheet(true);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.addLogButtonText}>+ Add Entry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryAccent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={filteredBirths}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BirthCard
            entry={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={{ color: colors.secondaryText, fontSize: 15 }}>
              No births recorded yet. Tap "+ Add Entry" to get started!
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Add/Edit Sheet */}
      <AddEntrySheet
        visible={showAddSheet}
        editEntry={editEntry}
        onSubmit={async (data) => {
          if (editEntry) {
            await update(editEntry.id, {
              date: data.date,
              gender: data.gender,
              deliveryMethod: data.deliveryMethod,
              notes: data.notes,
            });
          } else {
            await add(data);
          }
        }}
        onClose={() => {
          setShowAddSheet(false);
          setEditEntry(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={!!deleteEntry}
        title="Delete Entry?"
        message="This will permanently remove this birth record. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteEntry(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingTop: 60,
  },
  analyticsSection: {
    gap: 12,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  genderRow: {
    flexDirection: "row",
    gap: 16,
  },
  genderStat: {
    fontSize: 15,
    fontWeight: "600",
  },
  chartContainer: {
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
  },
  chart: {
    borderRadius: 12,
  },
  emptyChart: {
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  logTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  addLogButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addLogButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyList: {
    paddingVertical: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },
});

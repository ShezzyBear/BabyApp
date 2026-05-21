import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import SimpleBottomSheet from "./SimpleBottomSheet";
import { useTheme } from "../hooks/useTheme";
import GenderPicker from "./GenderPicker";
import DeliveryMethodPicker, { DeliveryMethod } from "./DeliveryMethodPicker";
import { Gender, BirthEntry } from "../lib/births";

interface AddEntrySheetProps {
  visible: boolean;
  editEntry?: BirthEntry | null;
  onSubmit: (data: {
    date: Date;
    gender: Gender | null;
    deliveryMethod: DeliveryMethod | null;
    notes: string | null;
    isHistorical: boolean;
  }) => Promise<void>;
  onClose: () => void;
}

export default function AddEntrySheet({
  visible,
  editEntry,
  onSubmit,
  onClose,
}: AddEntrySheetProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [date, setDate] = useState(new Date());
  const [gender, setGender] = useState<Gender | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === "ios");

  // Validation check - both gender and delivery method must be selected
  const isValid = gender !== null && deliveryMethod !== null;

  // Reset form when opening or when editEntry changes
  useEffect(() => {
    if (visible) {
      if (editEntry) {
        setDate(editEntry.date);
        setGender(editEntry.gender);
        setDeliveryMethod(editEntry.deliveryMethod || null);
        setNotes(editEntry.notes || "");
      } else {
        setDate(new Date());
        setGender(null);
        setDeliveryMethod(null);
        setNotes("");
      }
      setShowDatePicker(Platform.OS === "ios");
    }
  }, [visible, editEntry]);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const now = new Date();
      // If date is more than 24 hours in the past from "now", it's historical
      const isHistorical = now.getTime() - date.getTime() > 86400000;

      await onSubmit({
        date,
        gender,
        deliveryMethod,
        notes: notes.trim() || null,
        isHistorical: editEntry ? editEntry.isHistorical : isHistorical,
      });
      onClose();
    } catch (error) {
      console.error("Error saving entry:", error);
    } finally {
      setSaving(false);
    }
  };

  const isEditing = !!editEntry;

  return (
    <SimpleBottomSheet visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.primaryText }]}>
          {isEditing ? "Edit Entry" : "Record Birth"}
        </Text>

        {/* Date & Time */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.primaryText }]}>
            Date & Time
          </Text>
          {Platform.OS === "android" && (
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: colors.primaryText }}>
                {date.toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={handleDateChange}
              themeVariant={theme.mode}
            />
          )}
        </View>

        {/* Delivery Method */}
        <DeliveryMethodPicker value={deliveryMethod} onChange={setDeliveryMethod} />

        {/* Gender */}
        <GenderPicker value={gender} onChange={setGender} />

        {/* Notes */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.primaryText }]}>
            Notes (optional)
          </Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.primaryText,
              },
            ]}
            placeholder="Add any notes..."
            placeholderTextColor={colors.placeholder}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={[styles.cancelText, { color: colors.secondaryText }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.primaryAccent },
              !isValid && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isValid || saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitText}>
                {isEditing ? "Save Changes" : "Record Birth"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SimpleBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  dateButton: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "500",
  },
  submitButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 140,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
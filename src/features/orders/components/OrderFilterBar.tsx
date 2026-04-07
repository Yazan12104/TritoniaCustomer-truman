import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";

export type TimeFilter =
  | "recent"
  | "today"
  | "week"
  | "month"
  | "year"
  | "all"
  | "custom";

interface FilterOption {
  label: string;
  value: TimeFilter;
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: "الأحدث", value: "recent" },
  { label: "اليوم", value: "today" },
  { label: "الأسبوع", value: "week" },
  { label: "الشهر", value: "month" },
  { label: "السنة", value: "year" },
  { label: "الكل", value: "all" },
  { label: "مخصص", value: "custom" },
];

interface OrderFilterBarProps {
  selectedFilter: TimeFilter;
  onFilterChange: (
    filter: TimeFilter,
    startDate?: string,
    endDate?: string
  ) => void;
}

export const OrderFilterBar = ({
  selectedFilter,
  onFilterChange,
}: OrderFilterBarProps) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const colors = useThemeColors();

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleApply = () => {
    onFilterChange("custom", formatDate(startDate), formatDate(endDate));
  };

  const handleOptionPress = (optionValue: TimeFilter) => {
    if (optionValue !== "custom") {
      onFilterChange(optionValue);
    } else {
      onFilterChange("custom", formatDate(startDate), formatDate(endDate));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleOptionPress(option.value)}
            style={[
              styles.chip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              selectedFilter === option.value && [
                styles.selectedChip,
                { backgroundColor: colors.primary, borderColor: colors.primary },
              ],
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.text },
                selectedFilter === option.value && [
                  styles.selectedChipText,
                  { color: colors.background },
                ],
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedFilter === "custom" && (
        <View style={styles.customContainer}>
          <View style={styles.dateFieldContainer}>
            <Text style={[styles.dateFieldLabel, { color: colors.textLight }]}>
              من:
            </Text>
            <TouchableOpacity
              style={[
                styles.dateInput,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={[styles.dateInputText, { color: colors.text }]}>
                {formatDate(startDate)}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event: any, selectedDate?: Date) => {
                  setShowStartPicker(Platform.OS === "ios");
                  if (selectedDate) setStartDate(selectedDate);
                }}
              />
            )}
          </View>

          <View style={styles.dateFieldContainer}>
            <Text style={[styles.dateFieldLabel, { color: colors.textLight }]}>
              إلى:
            </Text>
            <TouchableOpacity
              style={[
                styles.dateInput,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={[styles.dateInputText, { color: colors.text }]}>
                {formatDate(endDate)}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event: any, selectedDate?: Date) => {
                  setShowEndPicker(Platform.OS === "ios");
                  if (selectedDate) setEndDate(selectedDate);
                }}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            onPress={handleApply}
          >
            <Text style={[styles.applyBtnText, { color: colors.background }]}>
              تطبيق
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.s,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    flexDirection: "row-reverse",
  },
  chip: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: spacing.s,
  },
  selectedChip: {},
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedChipText: {},
  customContainer: {
    paddingHorizontal: spacing.m,
    marginTop: spacing.s,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.s,
    flexWrap: "wrap",
  },
  dateFieldContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
    minWidth: 100,
  },
  dateFieldLabel: {
    fontSize: 14,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: spacing.s,
    padding: spacing.s,
    justifyContent: "center",
    alignItems: "center",
  },
  dateInputText: {
    fontSize: 14,
  },
  applyBtn: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
    justifyContent: "center",
  },
  applyBtnText: {
    fontWeight: "bold",
  },
});

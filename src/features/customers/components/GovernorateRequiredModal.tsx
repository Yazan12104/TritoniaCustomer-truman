import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Typography } from "../../../shared/components/Typography";
import { Button } from "../../../shared/components/Button";
import { useThemeColors } from "../../../shared/theme/colors";
import { radii, spacing } from "../../../shared/theme/spacing";
import { useGovernorateStore } from "../store/governorateStore";
import { useAuthStore } from "../../auth/store/authStore";
import { isWriteNetworkError } from "../../../core/api/apiClient";

interface GovernorateRequiredModalProps {
  visible: boolean;
}

export const GovernorateRequiredModal: React.FC<GovernorateRequiredModalProps> = ({
  visible,
}) => {
  const colors = useThemeColors();
  const [selectedGovernorateId, setSelectedGovernorateId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const {
    governorates,
    isLoading,
    isLoadingMore,
    isSubmitting,
    hasMore,
    error,
    fetchGovernorates,
    resetGovernorates,
    updateMyGovernorate,
  } = useGovernorateStore();
  const { updateUser } = useAuthStore();

  useEffect(() => {
    if (!visible) {
      setSelectedGovernorateId(null);
      setLocalError(null);
      resetGovernorates();
      return;
    }

    fetchGovernorates({ reset: true });
  }, [fetchGovernorates, resetGovernorates, visible]);

  const selectedGovernorate = useMemo(
    () => governorates.find((item) => item.id === selectedGovernorateId) || null,
    [governorates, selectedGovernorateId]
  );

  const handleSubmit = async () => {
    if (!selectedGovernorateId || isSubmitting) return;

    try {
      const result = await updateMyGovernorate(selectedGovernorateId);
      updateUser({ governorate_id: result.governorate_id });
    } catch (err: any) {
      if (isWriteNetworkError(err)) {
        setSelectedGovernorateId(null);
        setLocalError("حدث خطأ ما، يرجى اختيار المحافظة مرة أخرى.");
      }
    }
  };

  const displayedError = localError || error;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={[styles.overlay, { backgroundColor: colors.isDark ? "#000000cc" : "#00000080" }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.text,
            },
          ]}
        >
          <View style={[styles.badge, { backgroundColor: colors.primary + "18" }]}>
            <Typography variant="body" color={colors.primary} weight="700">
              الخطوة الأخيرة
            </Typography>
          </View>

          <Typography variant="h3" color={colors.text} align="center">
            أكمل إنشاء حسابك
          </Typography>
          <Typography
            variant="body"
            color={colors.textLight}
            align="center"
            style={styles.description}
          >
            اختر المحافظة الخاصة بك لإكمال تفعيل الحساب ومتابعة استخدام التطبيق.
          </Typography>

          <View
            style={[
              styles.listContainer,
              { borderColor: colors.border, backgroundColor: colors.background },
            ]}
          >
            {isLoading ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.helperText, { color: colors.textLight }]}>
                  جارٍ تحميل المحافظات...
                </Text>
              </View>
            ) : (
              <FlatList
                data={governorates}
                keyExtractor={(item) => item.id}
                onEndReachedThreshold={0.35}
                onEndReached={() => {
                  if (hasMore && !isLoadingMore) {
                    fetchGovernorates();
                  }
                }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const selected = item.id === selectedGovernorateId;

                  return (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        setSelectedGovernorateId(item.id);
                        setLocalError(null);
                      }}
                      style={[
                        styles.option,
                        {
                          backgroundColor: selected ? colors.primary + "12" : colors.surface,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.radio,
                          {
                            borderColor: selected ? colors.primary : colors.border,
                            backgroundColor: selected ? colors.primary : "transparent",
                          },
                        ]}
                      />
                      <Text style={[styles.optionText, { color: colors.text }]}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.centerState}>
                    <Text style={[styles.helperText, { color: colors.textLight }]}>
                      لا توجد محافظات متاحة حالياً
                    </Text>
                  </View>
                }
                ListFooterComponent={
                  isLoadingMore ? (
                    <View style={styles.footerLoader}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : null
                }
              />
            )}
          </View>

          {selectedGovernorate && (
            <Text style={[styles.selectionHint, { color: colors.textLight }]}>
              المحافظة المختارة: {selectedGovernorate.name}
            </Text>
          )}

          {!!displayedError && (
            <Text style={[styles.errorText, { color: colors.error }]}>{displayedError}</Text>
          )}

          <Button
            title="تأكيد المحافظة"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!selectedGovernorateId || isLoading}
            style={styles.submitButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.l,
  },
  card: {
    borderRadius: radii.xl,
    padding: spacing.l,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  badge: {
    alignSelf: "center",
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
    marginBottom: spacing.m,
  },
  description: {
    marginTop: spacing.s,
    marginBottom: spacing.l,
    lineHeight: 22,
  },
  listContainer: {
    maxHeight: 320,
    borderRadius: radii.l,
    borderWidth: 1,
    padding: spacing.s,
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  helperText: {
    marginTop: spacing.s,
    fontSize: 13,
    textAlign: "center",
  },
  option: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderWidth: 1,
    borderRadius: radii.m,
    marginBottom: spacing.s,
    gap: spacing.s,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    textAlign: "right",
    fontWeight: "600",
  },
  footerLoader: {
    paddingVertical: spacing.s,
  },
  selectionHint: {
    marginTop: spacing.m,
    textAlign: "center",
    fontSize: 13,
  },
  errorText: {
    marginTop: spacing.s,
    textAlign: "center",
    fontSize: 13,
  },
  submitButton: {
    marginTop: spacing.l,
  },
});

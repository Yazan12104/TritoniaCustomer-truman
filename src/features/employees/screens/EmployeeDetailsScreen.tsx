import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { Typography } from "../../../shared/components/Typography";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";
import { employeesApi } from "../api/employeesApi";
import { Employee } from "../types";
import { useAuthStore } from "../../auth/store/authStore";

const ROLE_LABELS: Record<string, string> = {
  GENERAL_SUPERVISOR: "مشرف عام",
  SUPERVISOR: "مشرف",
  MARKETER: "مسوق",
  BRANCH_MANAGER: "مدير فرع",
};

export const EmployeeDetailsScreen = ({ route, navigation }: any) => {
  const { employeeId } = route.params;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState("");
  const [showDemoteModal, setShowDemoteModal] = useState(false);
  const [generalSupervisors, setGeneralSupervisors] = useState<Employee[]>([]);
  const [gsSearchQuery, setGsSearchQuery] = useState("");
  const [loadingGSs, setLoadingGSs] = useState(false);
  const { user: currentUser } = useAuthStore();
  const colors = useThemeColors();

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("نجاح", "تم نسخ الرقم إلى الحافظة.");
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await employeesApi.getEmployeeById(employeeId);
        setEmployee(data);
      } catch (err: any) {
        setError(err.message || "فشل تحميل بيانات الموظف");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [employeeId]);

  if (loading) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error || !employee) {
    return (
      <ScreenContainer style={styles.center}>
        <Typography variant="body" color={colors.error}>
          {error || "الموظف غير موجود"}
        </Typography>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.retryText, { color: colors.primary }]}>
            رجوع
          </Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const getBranchName = () => {
    if (!employee.branchName) return "غير محدد";
    if (typeof employee.branchName === "object") {
      return (
        (employee.branchName as any).governorate ||
        (employee.branchName as any).name ||
        "غير محدد"
      );
    }
    return employee.branchName;
  };

  return (
    <ScreenContainer scrollable={true}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.primary }]}>
          ← الموظفين
        </Text>
      </TouchableOpacity>

      <View style={styles.profileHeader}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: colors.primary + "20",
              borderColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {employee.name.charAt(0)}
          </Text>
        </View>
        <Typography variant="h2" color={colors.primary} style={styles.name}>
          {employee.name}
        </Typography>
        <Text style={[styles.roleHeader, { color: colors.textLight }]}>
          {ROLE_LABELS[employee.role] || employee.role}
        </Text>
        <View
          style={[
            styles.statusBadge,
            employee.status === "ACTIVE"
              ? { backgroundColor: colors.success + "20" }
              : { backgroundColor: colors.error + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  employee.status === "ACTIVE" ? colors.success : colors.error,
              },
            ]}
          >
            {employee.status === "ACTIVE" ? "نشط" : "معطل"}
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatBox
          label="إجمالي الطلبات"
          value={employee.orderCount?.toString() || "0"}
          icon="📦"
          colors={colors}
        />
        <StatBox
          label="إجمالي الراتب"
          value={(employee.salary || 0).toLocaleString() + " ل.س"}
          icon="💰"
          colors={colors}
        />
      </View>

      <SectionTitle title="المعلومات الأساسية" colors={colors} />
      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <InfoRow
          label="رقم الهاتف"
          value={employee.phone}
          onCopy={() => handleCopy(employee.phone)}
          colors={colors}
        />
        <InfoRow
          label="البريد الإلكتروني"
          value={employee.email || "غير محدد"}
          colors={colors}
        />
        <InfoRow label="الفرع" value={getBranchName()} colors={colors} />
        <InfoRow
          label="تاريخ الانضمام"
          value={new Date(employee.createdAt).toLocaleDateString("ar-SY")}
          colors={colors}
        />
      </View>

      {(employee.supervisor || employee.general_supervisor) && (
        <>
          <SectionTitle title="التسلسل الإداري" colors={colors} />
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {employee.general_supervisor && (
              <InfoRow
                label="المشرف العام"
                value={
                  typeof employee.general_supervisor === "object"
                    ? employee.general_supervisor.name
                    : employee.general_supervisor
                }
                colors={colors}
                onPress={() => {
                  const supervisorId =
                    typeof employee.general_supervisor === "object"
                      ? employee.general_supervisor.id
                      : null;
                  if (supervisorId)
                    navigation.push("EmployeeDetailsScreen", {
                      employeeId: supervisorId,
                    });
                }}
              />
            )}
            {employee.supervisor && (
              <InfoRow
                label="المشرف المباشر"
                value={
                  typeof employee.supervisor === "object"
                    ? employee.supervisor.name
                    : employee.supervisor
                }
                colors={colors}
                onPress={() => {
                  const supervisorId =
                    typeof employee.supervisor === "object"
                      ? employee.supervisor.id
                      : null;
                  if (supervisorId)
                    navigation.push("EmployeeDetailsScreen", {
                      employeeId: supervisorId,
                    });
                }}
              />
            )}
          </View>
        </>
      )}

      {employee.orders && employee.orders.length > 0 && (
        <>
          <SectionTitle title="آخر الطلبات" colors={colors} />
          <View
            style={[
              styles.listCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {employee.orders.map((order) => (
              <View
                key={order.id}
                style={[
                  styles.listItem,
                  { borderBottomColor: colors.border + "30" },
                ]}
              >
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>
                    طلب #{order.id.substring(0, 6)}
                  </Text>
                  <Text style={[styles.itemSub, { color: colors.textLight }]}>
                    {order.customer?.name || "عميل مجهول"}
                  </Text>
                </View>
                <View style={styles.itemValueContainer}>
                  <Text style={[styles.itemValue, { color: colors.primary }]}>
                    {order.total_sold_price?.toLocaleString() || "0"} ل.س
                  </Text>
                  <Text style={[styles.itemDate, { color: colors.textLight }]}>
                    {new Date(order.created_at).toLocaleDateString("ar-SY")}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {employee.customers && employee.customers.length > 0 && (
        <>
          <SectionTitle title="العملاء المسجلين" colors={colors} />
          <View
            style={[
              styles.listCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {employee.customers.map((customer) => (
              <View
                key={customer.id}
                style={[
                  styles.listItem,
                  { borderBottomColor: colors.border + "30" },
                ]}
              >
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>
                    {customer.name}
                  </Text>
                  <Text style={[styles.itemSub, { color: colors.textLight }]}>
                    {customer.governorate}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.customerPhoneContainer,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleCopy(customer.phone)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.itemValue, { color: colors.primary }]}>
                    {customer.phone}
                  </Text>
                  <Text style={styles.copyTinyIcon}>📋</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}

      {currentUser?.role === "ADMIN" && (
        <View style={{ marginTop: spacing.l }}>
          {!showResetForm ? (
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { alignSelf: "flex-end", backgroundColor: colors.primary },
              ]}
              onPress={() => setShowResetForm(true)}
            >
              <Text style={[styles.saveBtnText, { color: "#ffffff" }]}>
                إعادة تعيين كلمة المرور
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.infoCard,
                {
                  marginTop: spacing.s,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={resetPassword}
                onChangeText={setResetPassword}
                placeholder="كلمة المرور الجديدة"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                textAlign="right"
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    marginTop: spacing.s,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={resetPasswordConfirm}
                onChangeText={setResetPasswordConfirm}
                placeholder="تأكيد كلمة المرور الجديدة"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                textAlign="right"
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: spacing.s,
                  marginTop: spacing.m,
                }}
              >
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={async () => {
                    if (!resetPassword || !resetPasswordConfirm) {
                      Alert.alert("خطأ", "يرجى تعبئة الحقول");
                      return;
                    }
                    if (resetPassword !== resetPasswordConfirm) {
                      Alert.alert("خطأ", "كلمتا المرور غير متطابقتين");
                      return;
                    }
                    try {
                      const userId = employee.userId || "";
                      if (!userId) {
                        Alert.alert("خطأ", "معرّف المستخدم غير متوفر");
                        return;
                      }
                      await employeesApi.adminResetPassword(
                        userId,
                        resetPassword
                      );
                      Alert.alert("نجاح", "تم إعادة تعيين كلمة المرور");
                      setShowResetForm(false);
                      setResetPassword("");
                      setResetPasswordConfirm("");
                    } catch (err: any) {
                      Alert.alert("خطأ", err.message || "فشل إعادة التعيين");
                    }
                  }}
                >
                  <Text style={[styles.saveBtnText, { color: "#ffffff" }]}>
                    حفظ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: colors.border }]}
                  onPress={() => {
                    setShowResetForm(false);
                    setResetPassword("");
                    setResetPasswordConfirm("");
                  }}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.text }]}>
                    إلغاء
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {employee.status === "ACTIVE" && (
            <>
              {(employee.role === "MARKETER" ||
                employee.role === "SUPERVISOR") && (
                <TouchableOpacity
                  style={[
                    styles.promoteButton,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                  onPress={() => {
                    const targetRole =
                      employee.role === "MARKETER" ? "مشرف" : "مشرف عام";
                    Alert.alert(
                      "تأكيد الترقية",
                      `هل أنت متأكد من ترقية ${employee.name} إلى ${targetRole}؟`,
                      [
                        { text: "إلغاء", style: "cancel" },
                        {
                          text: "ترقية",
                          onPress: async () => {
                            try {
                              await employeesApi.promoteEmployee(employeeId);
                              Alert.alert(
                                "نجاح",
                                `تمت ترقية ${employee.name} إلى ${targetRole} بنجاح`
                              );
                              navigation.goBack();
                            } catch (err: any) {
                              Alert.alert(
                                "خطأ",
                                err.message || "فشل ترقية الموظف"
                              );
                            }
                          },
                        },
                      ]
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.promoteButtonText, { color: colors.primary }]}
                  >
                    ترقية (
                    {employee.role === "MARKETER" ? "إلى مشرف" : "إلى مشرف عام"})
                  </Text>
                </TouchableOpacity>
              )}

              {(employee.role === "GENERAL_SUPERVISOR" ||
                employee.role === "SUPERVISOR") && (
                <TouchableOpacity
                  style={[
                    styles.demoteButton,
                    { backgroundColor: colors.warning + "15" },
                  ]}
                  onPress={async () => {
                    const targetRole =
                      employee.role === "GENERAL_SUPERVISOR"
                        ? "مشرف"
                        : "مسوق";

                    if (employee.role === "GENERAL_SUPERVISOR") {
                      try {
                        setLoadingGSs(true);
                        setShowDemoteModal(true);
                        const { data: allEmployees } =
                          await employeesApi.getEmployees({ limit: 200 });
                        const otherGSs = allEmployees.filter(
                          (e: Employee) =>
                            e.role === "GENERAL_SUPERVISOR" &&
                            e.id !== employeeId &&
                            e.status === "ACTIVE"
                        );
                        setGeneralSupervisors(otherGSs);
                      } catch (err: any) {
                        setShowDemoteModal(false);
                        Alert.alert("خطأ", "فشل جلب قائمة المشرفين");
                      } finally {
                        setLoadingGSs(false);
                      }
                    } else {
                      Alert.alert(
                        "تأكيد التخفيض",
                        `هل أنت متأكد من تخفيض ${employee.name} إلى ${targetRole}؟`,
                        [
                          { text: "إلغاء", style: "cancel" },
                          {
                            text: "تخفيض",
                            style: "destructive",
                            onPress: async () => {
                              try {
                                await employeesApi.demoteEmployee(employeeId);
                                Alert.alert(
                                  "نجاح",
                                  `تم تخفيض ${employee.name} إلى ${targetRole} بنجاح`
                                );
                                navigation.goBack();
                              } catch (err: any) {
                                Alert.alert(
                                  "خطأ",
                                  err.message || "فشل تخفيض الموظف"
                                );
                              }
                            },
                          },
                        ]
                      );
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.demoteButtonText, { color: colors.warning }]}
                  >
                    تخفيض (
                    {employee.role === "GENERAL_SUPERVISOR"
                      ? "إلى مشرف"
                      : "إلى مسوق"}
                    )
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.removeEmployeeButton,
                  { backgroundColor: colors.error + "15" },
                ]}
                onPress={() => {
                  Alert.alert(
                    "تحويل إلى عميل",
                    `هل أنت متأكد من تحويل ${employee.name} إلى عميل؟ سيتم إلغاء جميع المعاملات المالية.`,
                    [
                      { text: "إلغاء", style: "cancel" },
                      {
                        text: "تحويل",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await employeesApi.removeEmployee(employeeId);
                            Alert.alert(
                              "نجاح",
                              "تم تحويل الموظف إلى عميل بنجاح"
                            );
                            navigation.goBack();
                          } catch (err: any) {
                            Alert.alert(
                              "خطأ",
                              err.message || "فشل تحويل الموظف"
                            );
                          }
                        },
                      },
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.removeEmployeeButtonText,
                    { color: colors.error },
                  ]}
                >
                  تحويل إلى عميل
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {employee.salary_requests && employee.salary_requests.length > 0 && (
        <>
          <SectionTitle title="طلبات الراتب" colors={colors} />
          <View
            style={[
              styles.listCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {employee.salary_requests.map((request) => (
              <View
                key={request.id}
                style={[
                  styles.listItem,
                  { borderBottomColor: colors.border + "30" },
                ]}
              >
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>
                    طلب سلفه / راتب
                  </Text>
                  <Text
                    style={[
                      styles.statusText,
                      request.status === "APPROVED"
                        ? { color: colors.success }
                        : request.status === "PENDING"
                        ? { color: colors.warning }
                        : { color: colors.error },
                    ]}
                  >
                    {request.status === "APPROVED"
                      ? "تمت الموافقة"
                      : request.status === "PENDING"
                      ? "قيد الانتظار"
                      : "مرفوض"}
                  </Text>
                </View>
                <View style={styles.itemValueContainer}>
                  <Text style={[styles.itemValue, { color: colors.primary }]}>
                    {request.requested_amount?.toLocaleString() || "0"} ل.س
                  </Text>
                  <Text style={[styles.itemDate, { color: colors.textLight }]}>
                    {new Date(request.created_at).toLocaleDateString("ar-SY")}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <Modal
        visible={showDemoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDemoteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Typography
                variant="h3"
                style={[styles.modalTitle, { color: colors.text }]}
              >
                اختر المشرف العام الجديد
              </Typography>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDemoteModal(false)}
              >
                <Text style={[styles.modalCloseButtonText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingGSs ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.modalLoadingText, { color: colors.textLight }]}>
                  جاري تحميل المشرفين...
                </Text>
              </View>
            ) : generalSupervisors.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={[styles.modalEmptyText, { color: colors.text }]}>
                  لا يوجد مشرفين عامين متاحين
                </Text>
                <Text style={[styles.modalEmptySubtext, { color: colors.textLight }]}>
                  يجب أن يكون هناك مشرف عام واحد على الأقل غير الموظف المراد تخفيضه.
                </Text>
                <TouchableOpacity
                  style={[styles.modalCloseBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setShowDemoteModal(false)}
                >
                  <Text style={[styles.modalCloseBtnText, { color: "#ffffff" }]}>
                    إغلاق
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.modalSearchContainer}>
                  <TextInput
                    style={[
                      styles.modalSearchInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="بحث عن مشرف عام..."
                    value={gsSearchQuery}
                    onChangeText={setGsSearchQuery}
                    placeholderTextColor={colors.textLight}
                    textAlign="right"
                  />
                </View>

                <FlatList
                  data={generalSupervisors.filter(
                    (gs) =>
                      gs.name
                        .toLowerCase()
                        .includes(gsSearchQuery.toLowerCase()) ||
                      gs.phone
                        .toLowerCase()
                        .includes(gsSearchQuery.toLowerCase())
                  )}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.gsItem, { borderBottomColor: colors.border + "30" }]}
                      onPress={async () => {
                        try {
                          const targetRole = "مشرف";
                          await employeesApi.demoteEmployee(
                            employeeId,
                            item.id
                          );
                          setShowDemoteModal(false);
                          Alert.alert(
                            "نجاح",
                            `تم تخفيض ${employee?.name} إلى ${targetRole} بنجاح`
                          );
                          navigation.goBack();
                        } catch (err: any) {
                          setShowDemoteModal(false);
                          Alert.alert("خطأ", err.message || "فشل تخفيض الموظف");
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.gsAvatar, { backgroundColor: colors.primary + "20" }]}>
                        <Text style={[styles.gsAvatarText, { color: colors.primary }]}>
                          {item.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.gsInfo}>
                        <Text style={[styles.gsName, { color: colors.text }]}>
                          {item.name}
                        </Text>
                        <Text style={[styles.gsPhone, { color: colors.textLight }]}>
                          {item.phone}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.modalEmpty}>
                      <Text style={[styles.modalEmptyText, { color: colors.textLight }]}>
                        لا توجد نتائج
                      </Text>
                    </View>
                  }
                  style={styles.gsList}
                />
              </>
            )}
          </View>
        </View>
      </Modal>

      <View style={{ height: spacing.xl }} />
    </ScreenContainer>
  );
};

const SectionTitle = ({ title, colors }: { title: string; colors: any }) => (
  <Typography
    variant="h3"
    style={[styles.sectionTitle, { color: colors.text }]}
  >
    {title}
  </Typography>
);

const StatBox = ({ label, value, icon, colors }: any) => (
  <View
    style={[
      styles.statBox,
      { backgroundColor: colors.surface, borderColor: colors.border },
    ]}
  >
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textLight }]}>{label}</Text>
  </View>
);

const InfoRow = ({
  label,
  value,
  onPress,
  onCopy,
  colors,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  onCopy?: () => void;
  colors: any;
}) => (
  <View style={[styles.infoRow, { borderBottomColor: colors.border + "50" }]}>
    <Text style={[styles.infoLabel, { color: colors.textLight }]}>{label}:</Text>
    <View style={styles.valueContainer}>
      <TouchableOpacity
        style={[styles.valueTouch, !onPress && { flex: 1 }]}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.infoValue,
            { color: colors.text },
            onPress && [styles.linkText, { color: colors.primary }],
          ]}
        >
          {value}
        </Text>
        {onPress && (
          <Text style={[styles.chevron, { color: colors.primary }]}>←</Text>
        )}
      </TouchableOpacity>

      {onCopy && (
        <TouchableOpacity
          style={[
            styles.inlineCopyBtn,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={onCopy}
          activeOpacity={0.7}
        >
          <Text style={styles.copyIconSmall}>📋</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center" },
  retryBtn: { marginTop: spacing.m },
  retryText: { fontWeight: "bold" },
  backButton: { paddingVertical: spacing.s, marginBottom: spacing.m },
  backButtonText: { fontWeight: "600", fontSize: 16 },
  profileHeader: { alignItems: "center", marginBottom: spacing.l },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.s,
    borderWidth: 2,
  },
  avatarText: { fontSize: 32, fontWeight: "bold" },
  name: { marginBottom: 2 },
  roleHeader: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.s,
  },
  statusBadge: {
    paddingHorizontal: spacing.m,
    paddingVertical: 4,
    borderRadius: spacing.l,
  },
  statusText: { fontSize: 12, fontWeight: "bold" },

  statsGrid: { flexDirection: "row", gap: spacing.m, marginBottom: spacing.xl },
  statBox: {
    flex: 1,
    borderRadius: spacing.m,
    padding: spacing.m,
    alignItems: "center",
    borderWidth: 1,
    elevation: 2,
  },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 11, marginTop: 2 },

  sectionTitle: {
    marginBottom: spacing.s,
    marginTop: spacing.l,
    textAlign: "right",
  },
  infoCard: {
    borderRadius: spacing.m,
    padding: spacing.m,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: 15,
    textAlign: "right",
  },
  infoLabel: {
    width: 110,
    fontWeight: "700",
    fontSize: 13,
  },
  valueContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  infoValue: { fontSize: 13, textAlign: "right" },
  linkText: { fontWeight: "bold" },
  chevron: { marginLeft: spacing.s, fontSize: 14 },

  valueTouch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  inlineCopyBtn: {
    marginLeft: spacing.s,
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  copyIconSmall: { fontSize: 12 },
  customerPhoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  copyTinyIcon: { fontSize: 12 },

  listCard: {
    borderRadius: spacing.m,
    padding: spacing.s,
    borderWidth: 1,
  },
  listItem: {
    flexDirection: "row",
    padding: spacing.s,
    borderBottomWidth: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: "bold", textAlign: "right" },
  itemSub: { fontSize: 12, marginTop: 2, textAlign: "right" },
  itemValueContainer: { alignItems: "flex-end" },
  itemValue: { fontSize: 14, fontWeight: "bold" },
  itemDate: { fontSize: 11, marginTop: 2 },
  saveBtn: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 8,
  },
  saveBtnText: { fontWeight: "bold", fontSize: 14 },
  cancelBtn: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelBtnText: { fontWeight: "bold", fontSize: 14 },

  promoteButton: {
    marginTop: spacing.m,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  promoteButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  demoteButton: {
    marginTop: spacing.s,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  demoteButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  removeEmployeeButton: {
    marginTop: spacing.s,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  removeEmployeeButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.l,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: 20,
    padding: spacing.l,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.l,
  },
  modalTitle: {
    textAlign: "right",
    flex: 1,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalCloseButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalLoading: {
    padding: spacing.xl,
    alignItems: "center",
  },
  modalLoadingText: {
    marginTop: spacing.m,
    fontSize: 14,
  },
  modalEmpty: {
    padding: spacing.xl,
    alignItems: "center",
  },
  modalEmptyText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: spacing.s,
  },
  modalEmptySubtext: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: spacing.l,
  },
  modalCloseBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.s,
    borderRadius: 8,
  },
  modalCloseBtnText: {
    fontWeight: "bold",
  },
  modalSearchContainer: {
    marginBottom: spacing.m,
  },
  modalSearchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: 14,
  },
  gsList: {
    maxHeight: 400,
  },
  gsItem: {
    flexDirection: "row",
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  gsAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.m,
  },
  gsAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  gsInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  gsName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  gsPhone: {
    fontSize: 12,
    marginTop: 2,
  },
});

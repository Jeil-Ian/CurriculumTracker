import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  getProgress,
  saveSubjectStatus,
  computeAllStatuses,
  getMissingPrereqs,
  cascadeFailure,
  getSubjectStatus,
} from "../utils/progressStore";
import { subjects, getDependents } from "../data/curriculum";
import * as authService from "../src/services/auth";
import { Feather } from "@expo/vector-icons";

const STATUS_CONFIG = {
  passed: {
    color: "#34d399",
    bg: "rgba(6,78,59,0.5)",
    border: "rgba(52,211,153,0.3)",
    label: "Passed",
    icon: "check",
    gradient: ["#064e3b", "#0f172a"],
  },
  enrolled: {
    color: "#60a5fa",
    bg: "rgba(30,58,95,0.5)",
    border: "rgba(96,165,250,0.3)",
    label: "Enrolled",
    icon: "circle",
    gradient: ["#1e3a5f", "#0f172a"],
  },
  failed: {
    color: "#f87171",
    bg: "rgba(76,29,29,0.5)",
    border: "rgba(248,113,113,0.3)",
    label: "Failed",
    icon: "x",
    gradient: ["#4c1d1d", "#0f172a"],
  },
  available: {
    color: "#fbbf24",
    bg: "rgba(69,26,3,0.5)",
    border: "rgba(251,191,36,0.3)",
    label: "Available",
    icon: "disc",
    gradient: ["#451a03", "#0f172a"],
  },
  locked: {
    color: "#475569",
    bg: "rgba(15,23,42,0.5)",
    border: "rgba(71,85,105,0.2)",
    label: "Locked",
    icon: "lock",
    gradient: ["#1e293b", "#0f172a"],
  },
};

function RelatedSubjectCard({ subjectKey, status, onPress }) {
  const sub = subjects[subjectKey];
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.locked;
  return (
    <TouchableOpacity
      style={[
        styles.relatedCard,
        { borderColor: cfg.border, backgroundColor: cfg.bg },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.relatedAccent, { backgroundColor: cfg.color }]} />
      <View style={styles.relatedInner}>
        <Text style={styles.relatedCode}>{sub?.code}</Text>
        <Text style={styles.relatedName} numberOfLines={1}>
          {sub?.name}
        </Text>
      </View>
      <View
        style={[
          styles.relatedBadge,
          { backgroundColor: `${cfg.color}22`, borderColor: `${cfg.color}44` },
        ]}
      >
        <View style={styles.iconRow}>
          <Feather name={cfg.icon} size={12} color={cfg.color} />
          <Text style={[styles.relatedBadgeText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SubjectDetailScreen({ route, navigation }) {
  const { subjectKey } = route.params;
  const subject = subjects[subjectKey];

  const [progress, setProgress] = useState({});
  const [currentStatus, setCurrentStatus] = useState("locked");
  const [allStatuses, setAllStatuses] = useState({});
  const [userId, setUserId] = useState(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setUserId(user.id);
          const p = await getProgress(user.id);
          setProgress(p);
          setAllStatuses(computeAllStatuses(p));
          setCurrentStatus(getSubjectStatus(subjectKey, p));
        }
      } catch (err) {
        console.error("Error loading subject detail:", err);
      }
    })();
    navigation.setOptions({ title: subject?.code ?? "Subject" });
  }, [subjectKey]);

  const pulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSetStatus = async (newStatus) => {
    if (!userId) return;
    let updated = { ...progress };

    if (newStatus === "failed") {
      Alert.alert(
        "Mark as Failed?",
        `Marking ${subject.code} as failed will lock subjects that depend on it.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Mark Failed",
            style: "destructive",
            onPress: async () => {
              updated = cascadeFailure(subjectKey, progress);
              for (const [key, status] of Object.entries(updated)) {
                await saveSubjectStatus(
                  userId,
                  subjects[key]?.code ?? "",
                  subjects[key]?.name ?? "",
                  status,
                );
              }
              setProgress(updated);
              setAllStatuses(computeAllStatuses(updated));
              setCurrentStatus(getSubjectStatus(subjectKey, updated));
              pulse();
            },
          },
        ],
      );
      return;
    }

    if (newStatus === "clear") {
      delete updated[subjectKey];
      await saveSubjectStatus(userId, subjectKey, subject.name, "available");
    } else {
      updated[subjectKey] = newStatus;
      await saveSubjectStatus(userId, subjectKey, subject.name, newStatus);
    }

    setProgress(updated);
    setAllStatuses(computeAllStatuses(updated));
    setCurrentStatus(getSubjectStatus(subjectKey, updated));
    pulse();
  };

  const missingPrereqs = getMissingPrereqs(subjectKey, progress);
  const dependents = getDependents(subjectKey);
  const cfg = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.locked;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={["#0c1f3a", "#0f172a"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
      />

      {/* Hero subject card */}
      <Animated.View
        style={[styles.hero, { transform: [{ scale: pulseAnim }] }]}
      >
        <LinearGradient
          colors={cfg.gradient}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroTop}>
            <View style={[styles.yearBadge, { borderColor: cfg.border }]}>
              <Text style={[styles.yearBadgeText, { color: cfg.color }]}>
                Year {subject.year} ·{" "}
                {subject.sem === 3
                  ? "Summer"
                  : subject.sem === 1
                    ? "1st Sem"
                    : "2nd Sem"}
              </Text>
            </View>
            <View style={[styles.unitsBadge, { borderColor: cfg.border }]}>
              <Text style={[styles.unitsBadgeText, { color: cfg.color }]}>
                {subject.units} units
              </Text>
            </View>
          </View>
          <Text style={styles.heroCode}>{subject.code}</Text>
          <Text style={styles.heroName}>{subject.name}</Text>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: `${cfg.color}22`,
                borderColor: `${cfg.color}55`,
              },
            ]}
          >
            <View style={styles.iconRow}>
              <Feather name={cfg.icon} size={14} color={cfg.color} />
              <Text style={[styles.statusPillText, { color: cfg.color }]}>
                {cfg.label}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.body}>
        {/* Status Actions */}
        <Text style={styles.sectionTitle}>Update Status</Text>
        <View style={styles.actionRow}>
          {["passed", "enrolled", "failed"].map((s) => {
            const c = STATUS_CONFIG[s];
            const isActive = currentStatus === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => handleSetStatus(s)}
                activeOpacity={0.7}
                style={styles.actionBtnWrap}
              >
                <LinearGradient
                  colors={
                    isActive
                      ? [c.color + "33", c.color + "11"]
                      : ["#1e293b", "#1e293b"]
                  }
                  style={[
                    styles.actionBtn,
                    {
                      borderColor: isActive ? c.color : "#334155",
                      borderWidth: isActive ? 2 : 1,
                    },
                  ]}
                >
                  <Feather
                    name={c.icon}
                    size={20}
                    color={isActive ? c.color : "#64748b"}
                    style={{ marginBottom: 4 }}
                  />
                  <Text
                    style={[
                      styles.actionLabel,
                      { color: isActive ? c.color : "#64748b" },
                    ]}
                  >
                    {c.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {currentStatus !== "locked" && currentStatus !== "available" && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => handleSetStatus("clear")}
          >
            <Text style={styles.clearBtnText}>↩ Clear Status</Text>
          </TouchableOpacity>
        )}

        {/* Missing prereqs warning */}
        {missingPrereqs.length > 0 && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠ Missing prerequisites</Text>
            <View style={styles.warningChips}>
              {missingPrereqs.map((code) => (
                <View key={code} style={styles.warningChip}>
                  <Text style={styles.warningChipText}>{code}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Prerequisites */}
        <Text style={styles.sectionTitle}>Prerequisites</Text>
        {subject.prerequisites.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No prerequisites — open to all students
            </Text>
          </View>
        ) : (
          subject.prerequisites.map((prereqKey) => (
            <RelatedSubjectCard
              key={prereqKey}
              subjectKey={prereqKey}
              status={allStatuses[prereqKey] ?? "locked"}
              onPress={() =>
                navigation.push("SubjectDetail", { subjectKey: prereqKey })
              }
            />
          ))
        )}

        {/* Unlocks */}
        <Text style={styles.sectionTitle}>Unlocks These Subjects</Text>
        {dependents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No subjects depend on this one</Text>
          </View>
        ) : (
          dependents.map((depKey) => (
            <RelatedSubjectCard
              key={depKey}
              subjectKey={depKey}
              status={allStatuses[depKey] ?? "locked"}
              onPress={() =>
                navigation.push("SubjectDetail", { subjectKey: depKey })
              }
            />
          ))
        )}
      </View>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  hero: {
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e3a5f",
  },
  heroGradient: { padding: 20 },
  heroTop: { flexDirection: "row", gap: 8, marginBottom: 14 },
  yearBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  yearBadgeText: { fontSize: 11, fontWeight: "700" },
  unitsBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unitsBadgeText: { fontSize: 11, fontWeight: "700" },
  heroCode: {
    fontSize: 13,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#f8fafc",
    marginBottom: 14,
    lineHeight: 28,
  },
  statusPill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusPillText: { fontWeight: "800", fontSize: 13 },
  body: { paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#3b82f6",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 10,
  },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  actionBtnWrap: { flex: 1, borderRadius: 12, overflow: "hidden" },
  actionBtn: { paddingVertical: 14, alignItems: "center", borderRadius: 12 },
  actionIcon: { fontSize: 20, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: "800" },
  clearBtn: {
    alignSelf: "center",
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  clearBtnText: { color: "#64748b", fontSize: 12, fontWeight: "600" },
  warningBox: {
    backgroundColor: "rgba(124,45,18,0.4)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
  },
  warningTitle: {
    color: "#fbbf24",
    fontWeight: "800",
    fontSize: 13,
    marginBottom: 10,
  },
  warningChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  warningChip: {
    backgroundColor: "rgba(251,191,36,0.15)",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
  },
  warningChipText: { color: "#fbbf24", fontSize: 12, fontWeight: "700" },
  relatedCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: "hidden",
  },
  relatedAccent: { width: 3, alignSelf: "stretch" },
  relatedInner: { flex: 1, paddingHorizontal: 12, paddingVertical: 10 },
  relatedCode: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  relatedName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e2e8f0",
    marginTop: 2,
  },
  relatedBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  relatedBadgeText: { fontSize: 10, fontWeight: "800" },
  emptyCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  emptyText: { color: "#475569", fontSize: 13 },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

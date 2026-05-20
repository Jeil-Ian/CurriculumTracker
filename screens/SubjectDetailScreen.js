import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import {
  getProgress,
  saveProgress,
  computeAllStatuses,
  getMissingPrereqs,
  cascadeFailure,
  getSubjectStatus,
} from "../utils/progressStore";
import { subjects, getDependents } from "../data/curriculum";

const STATUS_CONFIG = {
  passed:    { color: "#22c55e", label: "Passed",    emoji: "✅" },
  enrolled:  { color: "#3b82f6", label: "Enrolled",  emoji: "📘" },
  failed:    { color: "#ef4444", label: "Failed",    emoji: "❌" },
  available: { color: "#f59e0b", label: "Available", emoji: "🔓" },
  locked:    { color: "#6b7280", label: "Locked",    emoji: "🔒" },
};

export default function SubjectDetailScreen({ route, navigation }) {
  const { subjectKey } = route.params;
  const subject = subjects[subjectKey];

  const [progress, setProgress] = useState({});
  const [currentStatus, setCurrentStatus] = useState("locked");
  const [allStatuses, setAllStatuses] = useState({});

  useEffect(() => {
    (async () => {
      const p = await getProgress();
      setProgress(p);
      setAllStatuses(computeAllStatuses(p));
      setCurrentStatus(getSubjectStatus(subjectKey, p));
    })();
    navigation.setOptions({ title: subject?.code ?? "Subject" });
  }, [subjectKey]);

  const handleSetStatus = async (newStatus) => {
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
              await saveProgress(updated);
              setProgress(updated);
              setAllStatuses(computeAllStatuses(updated));
              setCurrentStatus(getSubjectStatus(subjectKey, updated));
            },
          },
        ]
      );
      return;
    }

    if (newStatus === "clear") {
      delete updated[subjectKey];
    } else {
      updated[subjectKey] = newStatus;
    }

    await saveProgress(updated);
    setProgress(updated);
    setAllStatuses(computeAllStatuses(updated));
    setCurrentStatus(getSubjectStatus(subjectKey, updated));
  };

  const missingPrereqs = getMissingPrereqs(subjectKey, progress);
  const dependents = getDependents(subjectKey);
  const cfg = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.locked;

  return (
    <ScrollView style={styles.container}>
      {/* Subject Header */}
      <View style={[styles.header, { borderLeftColor: cfg.color }]}>
        <Text style={styles.code}>{subject.code}</Text>
        <Text style={styles.name}>{subject.name}</Text>
        <Text style={styles.meta}>
          Year {subject.year} · {subject.sem === 3 ? "Summer" : subject.sem === 1 ? "1st Sem" : "2nd Sem"} · {subject.units} units
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: cfg.color + "33" }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>
            {cfg.emoji}  {cfg.label}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <Text style={styles.sectionTitle}>Update Status</Text>
      <View style={styles.actionRow}>
        {["passed", "enrolled", "failed"].map((s) => {
          const c = STATUS_CONFIG[s];
          const isActive = currentStatus === s;
          return (
            <TouchableOpacity
              key={s}
              style={[
                styles.actionBtn,
                { borderColor: c.color },
                isActive && { backgroundColor: c.color },
              ]}
              onPress={() => handleSetStatus(s)}
            >
              <Text style={styles.actionEmoji}>{c.emoji}</Text>
              <Text
                style={[
                  styles.actionLabel,
                  { color: isActive ? "#fff" : c.color },
                ]}
              >
                {c.label}
              </Text>
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

      {/* Prerequisites */}
      <Text style={styles.sectionTitle}>Prerequisites</Text>
      {subject.prerequisites.length === 0 ? (
        <Text style={styles.emptyText}>No prerequisites — open to all.</Text>
      ) : (
        subject.prerequisites.map((prereqKey) => {
          const prereq = subjects[prereqKey];
          const prereqStatus = allStatuses[prereqKey] ?? "locked";
          const prereqCfg = STATUS_CONFIG[prereqStatus];
          return (
            <TouchableOpacity
              key={prereqKey}
              style={styles.relatedCard}
              onPress={() =>
                navigation.push("SubjectDetail", { subjectKey: prereqKey })
              }
            >
              <View>
                <Text style={styles.relatedCode}>{prereq?.code}</Text>
                <Text style={styles.relatedName}>{prereq?.name}</Text>
              </View>
              <Text style={[styles.relatedStatus, { color: prereqCfg.color }]}>
                {prereqCfg.emoji} {prereqCfg.label}
              </Text>
            </TouchableOpacity>
          );
        })
      )}

      {/* Missing prereqs warning */}
      {missingPrereqs.length > 0 && (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Still needs:</Text>
          {missingPrereqs.map((code) => (
            <Text key={code} style={styles.warningItem}>• {code}</Text>
          ))}
        </View>
      )}

      {/* Subjects unlocked by this one */}
      <Text style={styles.sectionTitle}>Unlocks These Subjects</Text>
      {dependents.length === 0 ? (
        <Text style={styles.emptyText}>No subjects depend on this one.</Text>
      ) : (
        dependents.map((depKey) => {
          const dep = subjects[depKey];
          const depStatus = allStatuses[depKey] ?? "locked";
          const depCfg = STATUS_CONFIG[depStatus];
          return (
            <TouchableOpacity
              key={depKey}
              style={styles.relatedCard}
              onPress={() =>
                navigation.push("SubjectDetail", { subjectKey: depKey })
              }
            >
              <View>
                <Text style={styles.relatedCode}>{dep?.code}</Text>
                <Text style={styles.relatedName}>{dep?.name}</Text>
              </View>
              <Text style={[styles.relatedStatus, { color: depCfg.color }]}>
                {depCfg.emoji} {depCfg.label}
              </Text>
            </TouchableOpacity>
          );
        })
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 16 },
  header: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    borderLeftWidth: 5,
    padding: 18,
    marginBottom: 20,
  },
  code: { fontSize: 14, fontWeight: "700", color: "#94a3b8" },
  name: { fontSize: 20, fontWeight: "800", color: "#f8fafc", marginTop: 4 },
  meta: { fontSize: 13, color: "#64748b", marginTop: 6 },
  statusBadge: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: { fontWeight: "700", fontSize: 14 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3b82f6",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  actionBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionEmoji: { fontSize: 20 },
  actionLabel: { fontSize: 12, fontWeight: "700", marginTop: 4 },
  clearBtn: { alignSelf: "center", marginBottom: 20 },
  clearBtnText: { color: "#64748b", fontSize: 13 },
  relatedCard: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  relatedCode: { fontSize: 12, fontWeight: "700", color: "#94a3b8" },
  relatedName: { fontSize: 13, color: "#e2e8f0", marginTop: 2, maxWidth: 220 },
  relatedStatus: { fontSize: 12, fontWeight: "700" },
  emptyText: { color: "#475569", fontSize: 13, marginBottom: 16 },
  warningBox: {
    backgroundColor: "#7c2d12",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  warningTitle: { color: "#fca5a5", fontWeight: "700", marginBottom: 4 },
  warningItem: { color: "#fca5a5", fontSize: 13 },
});
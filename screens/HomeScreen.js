import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  getProgress,
  computeAllStatuses,
  getProgressSummary,
} from "../utils/progressStore";
import { getCurriculumByYearSem } from "../data/curriculum";

const STATUS_CONFIG = {
  passed:    { color: "#22c55e", label: "Passed",    emoji: "✅" },
  enrolled:  { color: "#3b82f6", label: "Enrolled",  emoji: "📘" },
  failed:    { color: "#ef4444", label: "Failed",    emoji: "❌" },
  available: { color: "#f59e0b", label: "Available", emoji: "🔓" },
  locked:    { color: "#6b7280", label: "Locked",    emoji: "🔒" },
};

export default function HomeScreen({ navigation }) {
  const [statuses, setStatuses] = useState({});
  const [summary, setSummary] = useState({});
  const curriculum = getCurriculumByYearSem();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const progress = await getProgress();
        setStatuses(computeAllStatuses(progress));
        setSummary(getProgressSummary(progress));
      })();
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BSIT Tracker</Text>
        <Text style={styles.headerSub}>USC — Effective 2023</Text>
        <TouchableOpacity
          style={styles.treeBtn}
          onPress={() => navigation.navigate("Tree")}
        >
          <Text style={styles.treeBtnText}>🌐 View Tree</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Bar */}
      {summary.total > 0 && (
        <View style={styles.summaryRow}>
          {["passed", "enrolled", "failed", "available", "locked"].map((s) => (
            <View key={s} style={styles.summaryItem}>
              <Text style={[styles.summaryNum, { color: STATUS_CONFIG[s].color }]}>
                {summary[s] ?? 0}
              </Text>
              <Text style={styles.summaryLabel}>{STATUS_CONFIG[s].label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${summary.total ? (summary.passed / summary.total) * 100 : 0}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {summary.passed ?? 0} / {summary.total ?? 0} subjects passed
      </Text>

      {/* Curriculum List */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {curriculum.map((group) => (
          <View key={`Y${group.year}S${group.sem}`} style={styles.group}>
            <Text style={styles.groupLabel}>{group.label}</Text>
            {group.subjects.map((subject) => {
              const status = statuses[subject.key] ?? "locked";
              const cfg = STATUS_CONFIG[status];
              return (
                <TouchableOpacity
                  key={subject.key}
                  style={[styles.card, { borderLeftColor: cfg.color }]}
                  onPress={() =>
                    navigation.navigate("SubjectDetail", {
                      subjectKey: subject.key,
                    })
                  }
                >
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardCode}>{subject.code}</Text>
                    <Text style={styles.cardName}>{subject.name}</Text>
                    <Text style={styles.cardUnits}>{subject.units} units</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.cardEmoji}>{cfg.emoji}</Text>
                    <Text style={[styles.cardStatus, { color: cfg.color }]}>
                      {cfg.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: {
    backgroundColor: "#1e293b",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#f8fafc" },
  headerSub: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
  treeBtn: {
    marginTop: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  treeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1e293b",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  summaryItem: { alignItems: "center" },
  summaryNum: { fontSize: 20, fontWeight: "800" },
  summaryLabel: { fontSize: 10, color: "#94a3b8", marginTop: 2 },
  progressBarBg: {
    height: 4,
    backgroundColor: "#334155",
  },
  progressBarFill: {
    height: 4,
    backgroundColor: "#22c55e",
  },
  progressText: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "right",
    paddingRight: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  scroll: { flex: 1, paddingHorizontal: 16 },
  group: { marginBottom: 8 },
  groupLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3b82f6",
    marginTop: 20,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: { flex: 1 },
  cardCode: { fontSize: 13, fontWeight: "700", color: "#cbd5e1" },
  cardName: { fontSize: 14, color: "#f1f5f9", marginTop: 2, flexWrap: "wrap" },
  cardUnits: { fontSize: 11, color: "#64748b", marginTop: 4 },
  cardRight: { alignItems: "center", marginLeft: 12 },
  cardEmoji: { fontSize: 22 },
  cardStatus: { fontSize: 10, fontWeight: "700", marginTop: 2 },
});
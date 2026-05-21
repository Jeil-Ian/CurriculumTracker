import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Pressable,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  getProgress,
  computeAllStatuses,
  getProgressSummary,
} from "../utils/progressStore";
import { getCurriculumByYearSem } from "../data/curriculum";
import SubjectCard from "../components/SubjectCard";

const { width } = Dimensions.get("window");

const STATUS_CONFIG = {
  passed:    { color: "#34d399", bg: "#064e3b", label: "Passed",    icon: "✓" },
  enrolled:  { color: "#60a5fa", bg: "#1e3a5f", label: "Enrolled",  icon: "◉" },
  failed:    { color: "#f87171", bg: "#4c1d1d", label: "Failed",    icon: "✗" },
  available: { color: "#fbbf24", bg: "#451a03", label: "Available", icon: "◈" },
  locked:    { color: "#475569", bg: "#1e293b", label: "Locked",    icon: "◌" },
};

function SemesterRing({ passed, total, color, label }) {
  const percent = total > 0 ? passed / total : 0;
  const R = 24;
  const circumference = 2 * Math.PI * R;
  const dash = circumference * percent;

  return (
    <View style={ringStyles.wrap}>
      <View style={ringStyles.svgWrap}>
        {/* Placeholder ring using View borders */}
        <View style={[ringStyles.track, { borderColor: "#1e293b" }]}>
          <View
            style={[
              ringStyles.fill,
              {
                borderColor: color,
                borderTopColor: percent > 0.75 ? color : "transparent",
                borderRightColor: percent > 0.25 ? color : "transparent",
                borderBottomColor: percent > 0.5 ? color : "transparent",
                borderLeftColor: percent > 0 ? color : "transparent",
              },
            ]}
          />
        </View>
        <Text style={[ringStyles.num, { color }]}>
          {passed}/{total}
        </Text>
      </View>
      <Text style={ringStyles.label}>{label}</Text>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  wrap: { alignItems: "center", marginHorizontal: 6 },
  svgWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
  },
  fill: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
  },
  num: { fontSize: 11, fontWeight: "800", textAlign: "center" },
  label: { fontSize: 9, color: "#64748b", marginTop: 3, textAlign: "center" },
});

function CollapsibleSemester({ group, statuses, navigation }) {
  const [expanded, setExpanded] = useState(true);
  const anim = useRef(new Animated.Value(1)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.spring(anim, { toValue, useNativeDriver: false, tension: 60, friction: 10 }).start();
  };

  const passedCount = group.subjects.filter(
    (s) => statuses[s.key] === "passed"
  ).length;
  const total = group.subjects.length;
  const pct = total > 0 ? Math.round((passedCount / total) * 100) : 0;

  const gradientColors =
    pct === 100
      ? ["#064e3b", "#0f172a"]
      : pct > 50
      ? ["#1a2a4a", "#0f172a"]
      : ["#1e293b", "#0f172a"];

  return (
    <View style={semStyles.container}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.8}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={semStyles.header}
        >
          <View style={semStyles.headerLeft}>
            <View style={semStyles.semBadge}>
              <Text style={semStyles.semBadgeText}>
                Y{group.year}·S{group.sem === 3 ? "☀" : group.sem}
              </Text>
            </View>
            <View>
              <Text style={semStyles.semLabel}>{group.label}</Text>
              <Text style={semStyles.semMeta}>
                {passedCount}/{total} subjects
              </Text>
            </View>
          </View>
          <View style={semStyles.headerRight}>
            <View style={semStyles.pctWrap}>
              <Text
                style={[
                  semStyles.pctText,
                  { color: pct === 100 ? "#34d399" : pct > 50 ? "#60a5fa" : "#94a3b8" },
                ]}
              >
                {pct}%
              </Text>
            </View>
            <Text style={semStyles.chevron}>{expanded ? "▴" : "▾"}</Text>
          </View>
        </LinearGradient>
        {/* Progress bar */}
        <View style={semStyles.progressBg}>
          <View
            style={[
              semStyles.progressFill,
              {
                width: `${pct}%`,
                backgroundColor:
                  pct === 100 ? "#34d399" : pct > 50 ? "#60a5fa" : "#f59e0b",
              },
            ]}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={semStyles.body}>
          {group.subjects.map((subject) => (
            <SubjectCard
              key={subject.key}
              subject={subject}
              status={statuses[subject.key] ?? "locked"}
              onPress={() =>
                navigation.navigate("SubjectDetail", { subjectKey: subject.key })
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}

const semStyles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e3a5f",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  semBadge: {
    backgroundColor: "rgba(59,130,246,0.2)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
  },
  semBadgeText: { color: "#7dd3fc", fontSize: 11, fontWeight: "800" },
  semLabel: { color: "#e2e8f0", fontSize: 13, fontWeight: "700" },
  semMeta: { color: "#64748b", fontSize: 11, marginTop: 1 },
  pctText: { fontSize: 16, fontWeight: "900" },
  pctWrap: {},
  chevron: { color: "#475569", fontSize: 14 },
  progressBg: { height: 2, backgroundColor: "#1e293b" },
  progressFill: { height: 2 },
  body: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 },
});

export default function HomeScreen({ navigation }) {
  const [statuses, setStatuses] = useState({});
  const [summary, setSummary] = useState({});
  const [filterStatus, setFilterStatus] = useState(null);
  const curriculum = getCurriculumByYearSem();
  const scrollY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const progress = await getProgress();
        setStatuses(computeAllStatuses(progress));
        setSummary(getProgressSummary(progress));
      })();
    }, [])
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.95],
    extrapolate: "clamp",
  });

  const overallPct =
    summary.total > 0
      ? Math.round((summary.passed / summary.total) * 100)
      : 0;

  const motivationalMsg =
    overallPct === 0
      ? "Let's begin your journey 🚀"
      : overallPct < 25
      ? "Great start! Keep pushing 💪"
      : overallPct < 50
      ? "Halfway there, don't stop! ⚡"
      : overallPct < 75
      ? "More than halfway done! 🔥"
      : overallPct < 100
      ? "Almost there, you've got this! 🎯"
      : "You crushed it! 🎓";

  const filteredCurriculum = filterStatus
    ? curriculum.map((g) => ({
        ...g,
        subjects: g.subjects.filter(
          (s) => (statuses[s.key] ?? "locked") === filterStatus
        ),
      })).filter((g) => g.subjects.length > 0)
    : curriculum;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Gradient background accent */}
      <LinearGradient
        colors={["#0c1f3a", "#0f172a", "#0f172a"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
      />

      {/* Hero Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={["#0c1f3a", "#111827"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingLabel}>BSIT Tracker</Text>
              <Text style={styles.greetingName}>USC · Effective 2023</Text>
              <Text style={styles.motivational}>{motivationalMsg}</Text>
            </View>
            <TouchableOpacity
              style={styles.treeBtn}
              onPress={() => navigation.navigate("Tree")}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#3b82f6", "#8b5cf6"]}
                style={styles.treeBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.treeBtnIcon}>⎇</Text>
                <Text style={styles.treeBtnText}>Tree</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Big progress ring area */}
          <View style={styles.progressRow}>
            <View style={styles.bigProgress}>
              <View style={styles.bigProgressRing}>
                <View
                  style={[
                    styles.bigProgressArc,
                    { borderColor: "#3b82f6" },
                  ]}
                />
                <View style={styles.bigProgressInner}>
                  <Text style={styles.bigPct}>{overallPct}%</Text>
                  <Text style={styles.bigPctLabel}>Complete</Text>
                </View>
              </View>
              <Text style={styles.bigProgressSub}>
                {summary.passed ?? 0} of {summary.total ?? 0} subjects
              </Text>
            </View>

            {/* Stats grid */}
            <View style={styles.statsGrid}>
              {[
                { key: "passed",   label: "Passed",   val: summary.passed   ?? 0 },
                { key: "enrolled", label: "Active",   val: summary.enrolled ?? 0 },
                { key: "available",label: "Ready",    val: summary.available?? 0 },
                { key: "failed",   label: "Failed",   val: summary.failed   ?? 0 },
              ].map(({ key, label, val }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.statCard,
                    filterStatus === key && { borderColor: STATUS_CONFIG[key].color, borderWidth: 1.5 },
                  ]}
                  onPress={() => setFilterStatus(filterStatus === key ? null : key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.statNum, { color: STATUS_CONFIG[key].color }]}>
                    {val}
                  </Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Full progress bar */}
          <View style={styles.fullBar}>
            <View style={[styles.fullBarFill, { width: `${overallPct}%` }]}>
              <LinearGradient
                colors={["#3b82f6", "#8b5cf6", "#34d399"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Filter chips */}
      {filterStatus && (
        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>
            Showing:{" "}
            <Text style={{ color: STATUS_CONFIG[filterStatus].color }}>
              {STATUS_CONFIG[filterStatus].label}
            </Text>
          </Text>
          <TouchableOpacity onPress={() => setFilterStatus(null)}>
            <Text style={styles.filterClear}>✕ Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Semester List */}
      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.listPad}>
          {filteredCurriculum.map((group) => (
            <CollapsibleSemester
              key={`Y${group.year}S${group.sem}`}
              group={group}
              statuses={statuses}
              navigation={navigation}
            />
          ))}
        </View>
        <View style={{ height: 60 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: {},
  headerGradient: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e3a5f",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  greetingLabel: {
    fontSize: 22,
    fontWeight: "900",
    color: "#f8fafc",
    letterSpacing: -0.5,
  },
  greetingName: { fontSize: 12, color: "#64748b", marginTop: 2 },
  motivational: { fontSize: 13, color: "#7dd3fc", marginTop: 6, fontStyle: "italic" },
  treeBtn: { borderRadius: 12, overflow: "hidden" },
  treeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 14,
    gap: 5,
  },
  treeBtnIcon: { fontSize: 14, color: "#fff" },
  treeBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 14,
  },
  bigProgress: { alignItems: "center" },
  bigProgressRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: "#1e3a5f",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bigProgressArc: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderTopColor: "#3b82f6",
    borderRightColor: "#8b5cf6",
    borderBottomColor: "#1e3a5f",
    borderLeftColor: "#1e3a5f",
  },
  bigProgressInner: { alignItems: "center" },
  bigPct: { fontSize: 20, fontWeight: "900", color: "#f8fafc" },
  bigPctLabel: { fontSize: 9, color: "#64748b", marginTop: -1 },
  bigProgressSub: { fontSize: 10, color: "#475569", marginTop: 6, textAlign: "center" },
  statsGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statCard: {
    width: "46%",
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  statNum: { fontSize: 18, fontWeight: "900" },
  statLabel: { fontSize: 9, color: "#64748b", marginTop: 2 },
  fullBar: {
    height: 3,
    backgroundColor: "#1e293b",
    borderRadius: 2,
    overflow: "hidden",
  },
  fullBarFill: { height: 3, borderRadius: 2, overflow: "hidden" },
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  filterLabel: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  filterClear: { fontSize: 12, color: "#ef4444" },
  scroll: { flex: 1 },
  listPad: { paddingHorizontal: 12, paddingTop: 12 },
});
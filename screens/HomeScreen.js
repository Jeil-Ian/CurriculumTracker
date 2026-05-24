import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Animated, Dimensions, ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  getProgress, computeAllStatuses, getProgressSummary,
} from "../utils/progressStore";
import { getCurriculumByYearSem } from "../data/curriculum";
import SubjectCard from "../components/SubjectCard";
import * as authService from "../src/services/auth";
import { Feather, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const STATUS_CONFIG = {
  passed:    { color: "#34d399", bg: "#064e3b", label: "Passed",    icon: "✓" },
  enrolled:  { color: "#60a5fa", bg: "#1e3a5f", label: "Enrolled",  icon: "◉" },
  failed:    { color: "#f87171", bg: "#4c1d1d", label: "Failed",    icon: "✗" },
  available: { color: "#fbbf24", bg: "#451a03", label: "Available", icon: "◈" },
  locked:    { color: "#475569", bg: "#1e293b", label: "Locked",    icon: "◌" },
};

const YEAR_LABELS = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year" };
const NEXT_YEAR_UNITS = { 1: 50, 2: 121, 3: null };

function CollapsibleSemester({ group, statuses, navigation, isCurrentSem, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = () => setExpanded(!expanded);

  const passedCount = group.subjects.filter((s) => statuses[s.key] === "passed").length;
  const total = group.subjects.length;
  const pct = total > 0 ? Math.round((passedCount / total) * 100) : 0;

  const gradientColors =
    pct === 100 ? ["#064e3b", "#0f172a"]
    : pct > 50  ? ["#1a2a4a", "#0f172a"]
    :              ["#1e293b", "#0f172a"];

  return (
    <View style={[semStyles.container, isCurrentSem && semStyles.currentSem]}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.8}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={semStyles.header}
        >
          <View style={semStyles.headerLeft}>
            <View style={[semStyles.semBadge, isCurrentSem && semStyles.currentBadge]}>
              <Text style={[semStyles.semBadgeText, isCurrentSem && { color: "#34d399" }]}>
                Y{group.year}·S{group.sem === 3 ? "☀" : group.sem}
              </Text>
            </View>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={semStyles.semLabel}>{group.label}</Text>
                {isCurrentSem && (
                  <View style={semStyles.currentTag}>
                    <Text style={semStyles.currentTagText}>Current</Text>
                  </View>
                )}
              </View>
              <Text style={semStyles.semMeta}>{passedCount}/{total} subjects</Text>
            </View>
          </View>
          <View style={semStyles.headerRight}>
            <Text style={[
              semStyles.pctText,
              { color: pct === 100 ? "#34d399" : pct > 50 ? "#60a5fa" : "#94a3b8" },
            ]}>
              {pct}%
            </Text>
            <Text style={semStyles.chevron}>{expanded ? "▴" : "▾"}</Text>
          </View>
        </LinearGradient>
        <View style={semStyles.progressBg}>
          <View style={[
            semStyles.progressFill,
            { width: `${pct}%`, backgroundColor: pct === 100 ? "#34d399" : pct > 50 ? "#60a5fa" : "#f59e0b" },
          ]} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={semStyles.body}>
          {group.subjects.map((subject) => (
            <SubjectCard
              key={subject.key}
              subject={subject}
              status={statuses[subject.key] ?? "locked"}
              onPress={() => navigation.navigate("SubjectDetail", { subjectKey: subject.key })}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const semStyles = StyleSheet.create({
  container:      { marginBottom: 12, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#1e3a5f" },
  currentSem:     { borderColor: "#34d399", borderWidth: 1.5 },
  header:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  headerLeft:     { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  headerRight:    { flexDirection: "row", alignItems: "center", gap: 8 },
  semBadge:       { backgroundColor: "rgba(59,130,246,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(59,130,246,0.3)" },
  currentBadge:   { backgroundColor: "rgba(52,211,153,0.15)", borderColor: "rgba(52,211,153,0.4)" },
  semBadgeText:   { color: "#7dd3fc", fontSize: 11, fontWeight: "800" },
  semLabel:       { color: "#e2e8f0", fontSize: 13, fontWeight: "700" },
  semMeta:        { color: "#64748b", fontSize: 11, marginTop: 1 },
  pctText:        { fontSize: 16, fontWeight: "900" },
  chevron:        { color: "#475569", fontSize: 14 },
  progressBg:     { height: 2, backgroundColor: "#1e293b" },
  progressFill:   { height: 2 },
  body:           { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 },
  currentTag:     { backgroundColor: "rgba(52,211,153,0.15)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(52,211,153,0.3)" },
  currentTagText: { color: "#34d399", fontSize: 9, fontWeight: "800" },
});

// Find the current semester index — first sem that isn't 100% passed
function findCurrentSemIndex(curriculum, statuses) {
  for (let i = 0; i < curriculum.length; i++) {
    const group = curriculum[i];
    const allPassed = group.subjects.every((s) => statuses[s.key] === "passed");
    if (!allPassed) return i;
  }
  return curriculum.length - 1;
}

export default function HomeScreen({ navigation }) {
  const [statuses, setStatuses]         = useState({});
  const [summary, setSummary]           = useState({});
  const [filterStatus, setFilterStatus] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [currentSemIndex, setCurrentSemIndex] = useState(0);

  const curriculum    = getCurriculumByYearSem();
  const scrollRef     = useRef(null);
  const semOffsets    = useRef([]);
  const scrollY       = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          setLoading(true);
          const user = await authService.getCurrentUser();
          if (user) {
            const progress = await getProgress(user.id);
            const computed  = computeAllStatuses(progress);
            const sum       = getProgressSummary(progress);
            setStatuses(computed);
            setSummary(sum);
            const idx = findCurrentSemIndex(curriculum, computed);
            setCurrentSemIndex(idx);
          }
        } catch (err) {
          console.error("Error loading home screen:", err);
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  // Auto-scroll to current semester after layout
  useEffect(() => {
    if (!loading && semOffsets.current[currentSemIndex] !== undefined) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: semOffsets.current[currentSemIndex],
          animated: true,
        });
      }, 400);
    }
  }, [loading, currentSemIndex]);

  const handleLogout = async () => {
    try { await authService.logout(); }
    catch (err) { console.error("Error logging out:", err); }
  };

  const overallPct = summary.total > 0
    ? Math.round((summary.passed / summary.total) * 100) : 0;

  const motivationalMsg =
    overallPct === 0   ? "Let's begin your journey 🚀"
    : overallPct < 25  ? "Great start! Keep pushing 💪"
    : overallPct < 50  ? "Halfway there, don't stop! ⚡"
    : overallPct < 75  ? "More than halfway done! 🔥"
    : overallPct < 100 ? "Almost there, you've got this! 🎯"
    :                    "You crushed it! 🎓";

  const yearStanding   = summary.yearStanding ?? 1;
  const unitsPassed    = summary.unitsPassed  ?? 0;
  const totalUnits     = summary.totalUnits   ?? 0;
  const nextYearUnits  = NEXT_YEAR_UNITS[yearStanding];
  const unitsToNext    = nextYearUnits ? nextYearUnits - unitsPassed : 0;

  const filteredCurriculum = filterStatus
    ? curriculum.map((g) => ({
        ...g,
        subjects: g.subjects.filter((s) => (statuses[s.key] ?? "locked") === filterStatus),
      })).filter((g) => g.subjects.length > 0)
    : curriculum;

  // Track Y offset for each semester card
  const headerHeight = useRef(0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0c1f3a", "#0f172a", "#0f172a"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
      />

      {/* Hero Header */}
      <View
        onLayout={(e) => { headerHeight.current = e.nativeEvent.layout.height; }}
      >
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
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.treeBtn} onPress={() => navigation.navigate("Tree")} activeOpacity={0.7}>
                <LinearGradient colors={["#3b82f6", "#8b5cf6"]} style={styles.treeBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.treeBtnIcon}>⎇</Text>
                  <Text style={styles.treeBtnText}>Tree</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
                <Feather name="log-out" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress ring + stats */}
          <View style={styles.progressRow}>
            <View style={styles.bigProgress}>
              <View style={styles.bigProgressRing}>
                <View style={styles.bigProgressArc} />
                <View style={styles.bigProgressInner}>
                  <Text style={styles.bigPct}>{overallPct}%</Text>
                  <Text style={styles.bigPctLabel}>Complete</Text>
                </View>
              </View>
              {/* Subjects + units */}
              <Text style={styles.bigProgressSub}>
                {summary.passed ?? 0}/{summary.total ?? 0} subjects
              </Text>
              <Text style={styles.bigProgressUnits}>
                {unitsPassed}/{totalUnits} units
              </Text>
            </View>

            <View style={styles.rightCol}>
              {/* Year standing badge */}
              <View style={styles.yearStandingCard}>
                <LinearGradient colors={["#1e3a5f", "#0f172a"]} style={styles.yearStandingGradient}>
                  <Text style={styles.yearStandingLabel}>Year Standing</Text>
                  <Text style={styles.yearStandingValue}>{YEAR_LABELS[yearStanding]}</Text>
                  {nextYearUnits && (
                    <Text style={styles.yearStandingNext}>
                      {unitsToNext > 0 ? `${unitsToNext} units to ${YEAR_LABELS[yearStanding + 1]}` : `${YEAR_LABELS[yearStanding + 1]} unlocked!`}
                    </Text>
                  )}
                </LinearGradient>
              </View>

              {/* Stats grid */}
              <View style={styles.statsGrid}>
                {[
                  { key: "passed",    label: "Passed",  val: summary.passed    ?? 0 },
                  { key: "enrolled",  label: "Active",  val: summary.enrolled  ?? 0 },
                  { key: "available", label: "Ready",   val: summary.available ?? 0 },
                  { key: "failed",    label: "Failed",  val: summary.failed    ?? 0 },
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
                    <Text style={[styles.statNum, { color: STATUS_CONFIG[key].color }]}>{val}</Text>
                    <Text style={styles.statLabel}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Full gradient progress bar */}
          <View style={styles.fullBar}>
            <View style={[styles.fullBarFill, { width: `${overallPct}%` }]}>
              <LinearGradient colors={["#3b82f6", "#8b5cf6", "#34d399"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Filter bar */}
      {filterStatus && (
        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>
            Showing: <Text style={{ color: STATUS_CONFIG[filterStatus].color }}>{STATUS_CONFIG[filterStatus].label}</Text>
          </Text>
          <TouchableOpacity onPress={() => setFilterStatus(null)}>
            <Text style={styles.filterClear}>✕ Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          <View style={styles.listPad}>
            {filteredCurriculum.map((group, index) => {
              const realIndex = filterStatus
                ? curriculum.findIndex((g) => g.year === group.year && g.sem === group.sem)
                : index;
              const isCurrentSem = realIndex === currentSemIndex;
              // Only expand current sem and earlier incomplete ones by default
              const allPassed = group.subjects.every((s) => statuses[s.key] === "passed");
              const defaultExpanded = isCurrentSem || (!allPassed && realIndex <= currentSemIndex);

              return (
                <View
                  key={`Y${group.year}S${group.sem}`}
                  onLayout={(e) => {
                    semOffsets.current[realIndex] = e.nativeEvent.layout.y;
                  }}
                >
                  <CollapsibleSemester
                    group={group}
                    statuses={statuses}
                    navigation={navigation}
                    isCurrentSem={isCurrentSem}
                    defaultExpanded={defaultExpanded}
                  />
                </View>
              );
            })}
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: "#0f172a" },
  loadingContainer:  { flex: 1, justifyContent: "center", alignItems: "center" },
  headerGradient:    { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#1e3a5f" },
  headerTop:         { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerActions:     { flexDirection: "row", alignItems: "center", gap: 8 },
  greetingLabel:     { fontSize: 22, fontWeight: "900", color: "#f8fafc", letterSpacing: -0.5 },
  greetingName:      { fontSize: 12, color: "#64748b", marginTop: 2 },
  motivational:      { fontSize: 13, color: "#7dd3fc", marginTop: 6, fontStyle: "italic" },
  treeBtn:           { borderRadius: 12, overflow: "hidden" },
  treeBtnGradient:   { flexDirection: "row", alignItems: "center", paddingVertical: 9, paddingHorizontal: 14, gap: 5 },
  treeBtnIcon:       { fontSize: 14, color: "#fff" },
  treeBtnText:       { color: "#fff", fontWeight: "800", fontSize: 13 },
  logoutBtn:         { backgroundColor: "#ef444422", borderRadius: 10, borderWidth: 1, borderColor: "#ef444455", padding: 9 },
  logoutBtnText:     { fontSize: 14, color: "#ef4444" },
  progressRow:       { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  bigProgress:       { alignItems: "center", width: 88 },
  bigProgressRing:   { width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: "#1e3a5f", alignItems: "center", justifyContent: "center", position: "relative" },
  bigProgressArc:    { position: "absolute", width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderTopColor: "#3b82f6", borderRightColor: "#8b5cf6", borderBottomColor: "#1e3a5f", borderLeftColor: "#1e3a5f" },
  bigProgressInner:  { alignItems: "center" },
  bigPct:            { fontSize: 18, fontWeight: "900", color: "#f8fafc" },
  bigPctLabel:       { fontSize: 8, color: "#64748b" },
  bigProgressSub:    { fontSize: 10, color: "#94a3b8", marginTop: 6, textAlign: "center", fontWeight: "600" },
  bigProgressUnits:  { fontSize: 10, color: "#475569", marginTop: 2, textAlign: "center" },
  rightCol:          { flex: 1, gap: 8 },
  yearStandingCard:  { borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "#1e3a5f" },
  yearStandingGradient: { paddingHorizontal: 12, paddingVertical: 8 },
  yearStandingLabel: { fontSize: 9, color: "#475569", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  yearStandingValue: { fontSize: 15, fontWeight: "900", color: "#7dd3fc", marginTop: 1 },
  yearStandingNext:  { fontSize: 9, color: "#475569", marginTop: 2 },
  statsGrid:         { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  statCard:          { width: "46%", backgroundColor: "#1e293b", borderRadius: 10, padding: 7, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  statNum:           { fontSize: 16, fontWeight: "900" },
  statLabel:         { fontSize: 8, color: "#64748b", marginTop: 1 },
  fullBar:           { height: 3, backgroundColor: "#1e293b", borderRadius: 2, overflow: "hidden" },
  fullBarFill:       { height: 3, borderRadius: 2, overflow: "hidden" },
  filterBar:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#1e293b", borderBottomWidth: 1, borderBottomColor: "#334155" },
  filterLabel:       { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  filterClear:       { fontSize: 12, color: "#ef4444" },
  scroll:            { flex: 1 },
  listPad:           { paddingHorizontal: 12, paddingTop: 12 },
});

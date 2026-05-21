import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import Svg, {
  Defs,
  Path,
  Rect,
  Text as SvgText,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { getProgress, computeAllStatuses } from "../utils/progressStore";
import { subjects } from "../data/curriculum";
import SubjectNode from "../components/SubjectNode";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const STATUS_COLORS = {
  passed:    "#34d399",
  enrolled:  "#60a5fa",
  failed:    "#f87171",
  available: "#fbbf24",
  locked:    "#334155",
};

const NODE_W       = 114;
const NODE_H       = 54;
const COL_GAP      = 136;
const ROW_GAP      = 74;
const PAD_X        = 20;
const PAD_Y        = 32;
const MIN_SCALE     = 0.25;
const MAX_SCALE     = 1.6;
const DEFAULT_SCALE = 0.55;

const COLUMNS = [
  { year: 1, sem: 1, label: "Yr1 · 1st Sem" },
  { year: 1, sem: 2, label: "Yr1 · 2nd Sem" },
  { year: 1, sem: 3, label: "Yr1 · Summer ☀" },
  { year: 2, sem: 1, label: "Yr2 · 1st Sem" },
  { year: 2, sem: 2, label: "Yr2 · 2nd Sem" },
  { year: 2, sem: 3, label: "Yr2 · Summer ☀" },
  { year: 3, sem: 1, label: "Yr3 · 1st Sem" },
  { year: 3, sem: 2, label: "Yr3 · 2nd Sem" },
];

const LEGEND = [
  { status: "passed",    label: "Passed"   },
  { status: "enrolled",  label: "Enrolled" },
  { status: "available", label: "Unlocked" },
  { status: "failed",    label: "Failed"   },
  { status: "locked",    label: "Locked"   },
];

function buildLayout() {
  const cols = COLUMNS.map((col) => ({
    ...col,
    subjects: Object.entries(subjects)
      .filter(([, s]) => s.year === col.year && s.sem === col.sem)
      .map(([key, s]) => ({ key, ...s })),
  }));

  const positions = {};
  cols.forEach((col, colIdx) => {
    col.subjects.forEach((s, rowIdx) => {
      positions[s.key] = {
        x: PAD_X + colIdx * (NODE_W + COL_GAP),
        y: PAD_Y + 54 + rowIdx * (NODE_H + ROW_GAP),
      };
    });
  });

  const vals = Object.values(positions);
  const canvasW = vals.length ? Math.max(...vals.map((p) => p.x)) + NODE_W + PAD_X : SCREEN_W;
  const canvasH = vals.length ? Math.max(...vals.map((p) => p.y)) + NODE_H + PAD_Y : SCREEN_H;

  return { positions, cols, canvasW, canvasH };
}

function cubicPath(x1, y1, x2, y2) {
  const cx1 = x1 + (x2 - x1) * 0.5;
  const cx2 = x2 - (x2 - x1) * 0.5;
  return `M${x1},${y1} C${cx1},${y1} ${cx2},${y2} ${x2},${y2}`;
}

function touchDist(t1, t2) {
  const dx = t1.pageX - t2.pageX;
  const dy = t1.pageY - t2.pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function TreeScreen({ navigation }) {
  const [statuses, setStatuses] = useState({});
  const [selected, setSelected] = useState(null);
  // Only used for the scale % label — updated via listener, not setState on every frame
  const [displayScale, setDisplayScale] = useState(DEFAULT_SCALE);

  const { positions, cols, canvasW, canvasH } = buildLayout();
  const INITIAL_OFFSET_X = (SCREEN_W - canvasW * DEFAULT_SCALE) / 2;
  const INITIAL_OFFSET_Y = 20;

  // ── Animated values (native driver) ───────────────────────────────────────
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(DEFAULT_SCALE)).current;

  // Raw JS refs for math (no re-render)
  const curScale   = useRef(DEFAULT_SCALE);
  const curOffset  = useRef({ x: 0, y: 0 });
  const baseScale  = useRef(DEFAULT_SCALE);
  const baseOffset = useRef({ x: 0, y: 0 });

  // Apply centered starting position once on mount
  useEffect(() => {
    translateX.setValue(INITIAL_OFFSET_X);
    translateY.setValue(INITIAL_OFFSET_Y);
    curOffset.current  = { x: INITIAL_OFFSET_X, y: INITIAL_OFFSET_Y };
    baseOffset.current = { x: INITIAL_OFFSET_X, y: INITIAL_OFFSET_Y };
  }, []);
  const initDist   = useRef(null);

  // Update the % label at low frequency
  useEffect(() => {
    const id = scaleAnim.addListener(({ value }) => {
      setDisplayScale(value);
    });
    return () => scaleAnim.removeListener(id);
  }, []);

  useEffect(() => {
    (async () => {
      const progress = await getProgress();
      setStatuses(computeAllStatuses(progress));
    })();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const setTransform = (scale, x, y) => {
    curScale.current   = scale;
    curOffset.current  = { x, y };
    // Drive native thread directly — no setState, no re-render
    translateX.setValue(x);
    translateY.setValue(y);
    scaleAnim.setValue(scale);
  };

  // ── PanResponder ──────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,

      onPanResponderGrant() {
        baseScale.current  = curScale.current;
        baseOffset.current = { ...curOffset.current };
        initDist.current   = null;
      },

      onPanResponderMove(evt, gestureState) {
        const touches = evt.nativeEvent.touches;

        if (touches.length >= 2) {
          const d    = touchDist(touches[0], touches[1]);
          const midX = (touches[0].pageX + touches[1].pageX) / 2;
          const midY = (touches[0].pageY + touches[1].pageY) / 2;

          if (initDist.current === null) {
            initDist.current = d;
            return;
          }

          const raw      = baseScale.current * (d / initDist.current);
          const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, raw));
          const ratio    = newScale / baseScale.current;
          const newX     = midX - ratio * (midX - baseOffset.current.x);
          const newY     = midY - ratio * (midY - baseOffset.current.y);

          // Native setValue — bypasses JS render loop entirely
          translateX.setValue(newX);
          translateY.setValue(newY);
          scaleAnim.setValue(newScale);
          curScale.current  = newScale;
          curOffset.current = { x: newX, y: newY };
        } else {
          const newX = baseOffset.current.x + gestureState.dx;
          const newY = baseOffset.current.y + gestureState.dy;
          translateX.setValue(newX);
          translateY.setValue(newY);
          curOffset.current = { x: newX, y: newY };
        }
      },

      onPanResponderRelease() {
        baseScale.current  = curScale.current;
        baseOffset.current = { ...curOffset.current };
        initDist.current   = null;
      },
    })
  ).current;

  // ── Button zoom (spring for feel) ─────────────────────────────────────────
  const zoom = (factor) => {
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, curScale.current * factor));
    const cx   = SCREEN_W / 2;
    const cy   = SCREEN_H / 2;
    const ratio = newScale / curScale.current;
    const newX  = cx - ratio * (cx - curOffset.current.x);
    const newY  = cy - ratio * (cy - curOffset.current.y);

    curScale.current   = newScale;
    curOffset.current  = { x: newX, y: newY };
    baseScale.current  = newScale;
    baseOffset.current = { x: newX, y: newY };

    Animated.parallel([
      Animated.spring(scaleAnim,  { toValue: newScale, useNativeDriver: true, tension: 120, friction: 10 }),
      Animated.spring(translateX, { toValue: newX,     useNativeDriver: true, tension: 120, friction: 10 }),
      Animated.spring(translateY, { toValue: newY,     useNativeDriver: true, tension: 120, friction: 10 }),
    ]).start();
  };

  const resetView = () => {
    curScale.current   = DEFAULT_SCALE;
    curOffset.current  = { x: INITIAL_OFFSET_X, y: INITIAL_OFFSET_Y };
    baseScale.current  = DEFAULT_SCALE;
    baseOffset.current = { x: INITIAL_OFFSET_X, y: INITIAL_OFFSET_Y };

    Animated.parallel([
      Animated.spring(scaleAnim,  { toValue: DEFAULT_SCALE,    useNativeDriver: true, tension: 120, friction: 10 }),
      Animated.spring(translateX, { toValue: INITIAL_OFFSET_X, useNativeDriver: true, tension: 120, friction: 10 }),
      Animated.spring(translateY, { toValue: INITIAL_OFFSET_Y, useNativeDriver: true, tension: 120, friction: 10 }),
    ]).start();
  };

  // ── Edges ─────────────────────────────────────────────────────────────────
  const edges = [];
  for (const [key, subject] of Object.entries(subjects)) {
    for (const prereq of (subject.prerequisites || [])) {
      if (positions[prereq] && positions[key]) {
        const from          = positions[prereq];
        const to            = positions[key];
        const isHighlighted = selected === key || selected === prereq;
        const isFailed      = statuses[prereq] === "failed" || statuses[key] === "failed";
        const isPassed      = statuses[prereq] === "passed";
        edges.push({
          key: `${prereq}->${key}`,
          path: cubicPath(
            from.x + NODE_W, from.y + NODE_H / 2,
            to.x,            to.y   + NODE_H / 2
          ),
          strokeColor: isHighlighted ? "#f59e0b"
            : isFailed  ? "#f8717155"
            : isPassed  ? "#34d39966"
            : "#1e3a5f",
          strokeWidth: isHighlighted ? 2.5 : 1.5,
          dashed:  isFailed,
          opacity: isHighlighted ? 1 : 0.7,
        });
      }
    }
  }

  const handleNodePress = (key) => {
    if (selected === key) {
      navigation.navigate("SubjectDetail", { subjectKey: key });
    } else {
      setSelected(key);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0c1f3a", "#0f172a"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
      />

      {/* Legend */}
      <View style={styles.legendRow}>
        {LEGEND.map(({ status, label }) => (
          <View key={status} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[status] }]} />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>Pinch to zoom · Drag to pan · Tap node to select</Text>

      {/* Canvas */}
      <View style={styles.canvasOuter} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.canvasInner,
            {
              width: canvasW,
              height: canvasH,
              transform: [
                { translateX },
                { translateY },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* SVG: edges + column headers */}
          <Svg width={canvasW} height={canvasH} style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgGradient id="ep" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#34d399" stopOpacity="0.5" />
                <Stop offset="1" stopColor="#34d399" stopOpacity="0.2" />
              </SvgGradient>
            </Defs>

            {cols.map((col, i) => {
              const x = PAD_X + i * (NODE_W + COL_GAP);
              return (
                <React.Fragment key={`c${i}`}>
                  <Rect x={x} y={PAD_Y - 8} width={NODE_W} height={38}
                    rx={8} fill="#0c1f3a" stroke="#1e3a5f" strokeWidth="1" />
                  <SvgText x={x + NODE_W / 2} y={PAD_Y + 15}
                    textAnchor="middle" fontSize="9" fontWeight="700" fill="#7dd3fc">
                    {col.label}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {edges.map((e) => (
              <Path key={e.key} d={e.path}
                stroke={e.strokeColor} strokeWidth={e.strokeWidth}
                fill="none"
                strokeDasharray={e.dashed ? "6,4" : undefined}
                opacity={e.opacity}
              />
            ))}
          </Svg>

          {/* Nodes */}
          {Object.entries(positions).map(([key, pos]) => (
            <SubjectNode
              key={key}
              subject={subjects[key]}
              status={statuses[key] ?? "locked"}
              isSelected={selected === key}
              onPress={() => handleNodePress(key)}
              x={pos.x} y={pos.y}
              width={NODE_W} height={NODE_H}
            />
          ))}
        </Animated.View>
      </View>

      {/* Zoom controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomBtn} onPress={() => zoom(1.25)} activeOpacity={0.7}>
          <Text style={styles.zoomBtnText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomBtn} onPress={() => zoom(0.8)} activeOpacity={0.7}>
          <Text style={styles.zoomBtnText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.zoomBtn, styles.zoomReset]} onPress={resetView} activeOpacity={0.7}>
          <Text style={[styles.zoomBtnText, { fontSize: 13 }]}>⊡</Text>
        </TouchableOpacity>
        <View style={styles.scalePill}>
          <Text style={styles.scaleText}>{Math.round(displayScale * 100)}%</Text>
        </View>
      </View>

      {/* Bottom drawer */}
      {selected && (
        <View style={styles.drawerWrapper}>
          <TouchableOpacity
            style={[styles.drawer, { borderTopColor: STATUS_COLORS[statuses[selected] ?? "locked"] }]}
            onPress={() => navigation.navigate("SubjectDetail", { subjectKey: selected })}
            activeOpacity={0.8}
          >
            <LinearGradient colors={["#111827", "#0f172a"]} style={styles.drawerGradient}>
              <View style={styles.drawerLeft}>
                <View style={[styles.drawerDot, { backgroundColor: STATUS_COLORS[statuses[selected] ?? "locked"] }]} />
                <View>
                  <Text style={styles.drawerCode}>{subjects[selected]?.code}</Text>
                  <Text style={styles.drawerName}>{subjects[selected]?.name}</Text>
                  <Text style={styles.drawerMeta}>
                    Year {subjects[selected]?.year} ·{" "}
                    {subjects[selected]?.sem === 3 ? "Summer"
                      : subjects[selected]?.sem === 1 ? "1st Sem" : "2nd Sem"}{" "}
                    · {subjects[selected]?.units} units
                  </Text>
                </View>
              </View>
              <LinearGradient colors={["#3b82f6", "#8b5cf6"]} style={styles.openBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.openBtnText}>Open →</Text>
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: "#0f172a" },
  legendRow: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
    backgroundColor: "#111827", borderBottomWidth: 1,
    borderBottomColor: "#1e3a5f", paddingVertical: 8, paddingHorizontal: 14,
  },
  legendItem:  { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot:   { width: 8, height: 8, borderRadius: 4 },
  legendText:  { color: "#64748b", fontSize: 10, fontWeight: "600" },
  hint: {
    fontSize: 10, color: "#334155", textAlign: "center",
    paddingVertical: 5, backgroundColor: "#0f172a", fontStyle: "italic",
  },
  canvasOuter: { flex: 1, overflow: "hidden" },
  canvasInner: { position: "absolute", top: 0, left: 0 },
  zoomControls: {
    position: "absolute", right: 14, bottom: 110,
    alignItems: "center", gap: 8,
  },
  zoomBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155",
    alignItems: "center", justifyContent: "center",
    elevation: 6, shadowColor: "#000",
    shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  zoomReset:    { backgroundColor: "#1a2a4a", borderColor: "#3b82f6" },
  zoomBtnText:  { color: "#e2e8f0", fontSize: 20, fontWeight: "700", lineHeight: 24 },
  scalePill: {
    backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#334155",
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  scaleText:     { color: "#475569", fontSize: 9, fontWeight: "700" },
  drawerWrapper: {
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 12,
  },
  drawer:         { borderTopWidth: 2, overflow: "hidden" },
  drawerGradient: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16,
  },
  drawerLeft:  { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  drawerDot:   { width: 10, height: 10, borderRadius: 5 },
  drawerCode:  { fontSize: 11, fontWeight: "800", color: "#64748b", letterSpacing: 0.5 },
  drawerName:  { fontSize: 14, fontWeight: "700", color: "#f1f5f9", marginTop: 1 },
  drawerMeta:  { fontSize: 10, color: "#475569", marginTop: 2 },
  openBtn:     { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  openBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
});
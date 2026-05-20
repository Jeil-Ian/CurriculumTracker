import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Svg, { Line, Rect, Text as SvgText, Circle } from "react-native-svg";
import { getProgress, computeAllStatuses } from "../utils/progressStore";
import { subjects } from "../data/curriculum";

const STATUS_COLORS = {
  passed:    "#22c55e",
  enrolled:  "#3b82f6",
  failed:    "#ef4444",
  available: "#f59e0b",
  locked:    "#334155",
};

const STATUS_TEXT_COLORS = {
  passed:    "#fff",
  enrolled:  "#fff",
  failed:    "#fff",
  available: "#0f172a",
  locked:    "#94a3b8",
};

// Layout constants
const NODE_W = 110;
const NODE_H = 52;
const COL_GAP = 140;   // horizontal gap between semester columns
const ROW_GAP = 72;    // vertical gap between nodes
const PAD_X = 20;
const PAD_Y = 30;

// Column order: Y1S1, Y1S2, Y1S3(Summer), Y2S1, Y2S2, Y2S3(Summer), Y3S1, Y3S2
const COLUMNS = [
  { year: 1, sem: 1, label: "Yr1\n1st Sem" },
  { year: 1, sem: 2, label: "Yr1\n2nd Sem" },
  { year: 1, sem: 3, label: "Yr1\nSummer" },
  { year: 2, sem: 1, label: "Yr2\n1st Sem" },
  { year: 2, sem: 2, label: "Yr2\n2nd Sem" },
  { year: 2, sem: 3, label: "Yr2\nSummer" },
  { year: 3, sem: 1, label: "Yr3\n1st Sem" },
  { year: 3, sem: 2, label: "Yr3\n2nd Sem" },
];

function buildLayout() {
  // Group subjects by column
  const cols = COLUMNS.map((col) => ({
    ...col,
    subjects: Object.entries(subjects)
      .filter(([, s]) => s.year === col.year && s.sem === col.sem)
      .map(([key, s]) => ({ key, ...s })),
  }));

  // Assign x/y positions
  const positions = {};
  cols.forEach((col, colIdx) => {
    col.subjects.forEach((s, rowIdx) => {
      positions[s.key] = {
        x: PAD_X + colIdx * (NODE_W + COL_GAP),
        y: PAD_Y + 50 + rowIdx * (NODE_H + ROW_GAP), // 50 for column header
      };
    });
  });

  // Find total canvas size
  const maxX = Math.max(...Object.values(positions).map((p) => p.x)) + NODE_W + PAD_X;
  const maxY = Math.max(...Object.values(positions).map((p) => p.y)) + NODE_H + PAD_Y;

  return { positions, cols, canvasW: maxX, canvasH: maxY };
}

function wrapText(text, maxChars = 14) {
  if (text.length <= maxChars) return [text];
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length <= maxChars) {
      line = (line + " " + word).trim();
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2); // max 2 lines
}

export default function TreeScreen({ navigation }) {
  const [statuses, setStatuses] = useState({});
  const [selected, setSelected] = useState(null);
  const { positions, cols, canvasW, canvasH } = buildLayout();

  useEffect(() => {
    (async () => {
      const progress = await getProgress();
      setStatuses(computeAllStatuses(progress));
    })();
  }, []);

  // Build all edges (prerequisite lines)
  const edges = [];
  for (const [key, subject] of Object.entries(subjects)) {
    for (const prereq of subject.prerequisites) {
      if (positions[prereq] && positions[key]) {
        const from = positions[prereq];
        const to = positions[key];
        edges.push({
          key: `${prereq}->${key}`,
          x1: from.x + NODE_W,
          y1: from.y + NODE_H / 2,
          x2: to.x,
          y2: to.y + NODE_H / 2,
          isHighlighted:
            selected === key || selected === prereq,
          toFailed: statuses[key] === "failed" || statuses[prereq] === "failed",
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
      {/* Legend */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legend}>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <View key={status} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{status}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.hint}>
        Tap a node to highlight · Tap again to view details
      </Text>

      {/* SVG Canvas */}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <ScrollView showsVerticalScrollIndicator>
          <Svg width={canvasW} height={canvasH}>

            {/* Column Headers */}
            {cols.map((col, i) => {
              const x = PAD_X + i * (NODE_W + COL_GAP);
              return (
                <React.Fragment key={`col-${i}`}>
                  <Rect
                    x={x}
                    y={PAD_Y - 10}
                    width={NODE_W}
                    height={44}
                    rx={6}
                    fill="#1e3a5f"
                  />
                  {col.label.split("\n").map((line, li) => (
                    <SvgText
                      key={li}
                      x={x + NODE_W / 2}
                      y={PAD_Y + 6 + li * 16}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill="#7dd3fc"
                    >
                      {line}
                    </SvgText>
                  ))}
                </React.Fragment>
              );
            })}

            {/* Edges (lines) */}
            {edges.map((e) => (
              <Line
                key={e.key}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke={
                  e.isHighlighted
                    ? "#f59e0b"
                    : e.toFailed
                    ? "#ef444455"
                    : "#334155"
                }
                strokeWidth={e.isHighlighted ? 2.5 : 1}
                strokeDasharray={e.toFailed ? "5,3" : null}
              />
            ))}

            {/* Nodes */}
            {Object.entries(positions).map(([key, pos]) => {
              const subject = subjects[key];
              const status = statuses[key] ?? "locked";
              const fillColor = STATUS_COLORS[status];
              const textColor = STATUS_TEXT_COLORS[status];
              const isSelected = selected === key;
              const nameLines = wrapText(subject.code, 14);

              return (
                <React.Fragment key={key}>
                  {/* Selection ring */}
                  {isSelected && (
                    <Rect
                      x={pos.x - 3}
                      y={pos.y - 3}
                      width={NODE_W + 6}
                      height={NODE_H + 6}
                      rx={11}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                  )}
                  <Rect
                    x={pos.x}
                    y={pos.y}
                    width={NODE_W}
                    height={NODE_H}
                    rx={8}
                    fill={fillColor}
                    onPress={() => handleNodePress(key)}
                    opacity={status === "locked" ? 0.6 : 1}
                  />
                  {/* Subject code */}
                  <SvgText
                    x={pos.x + NODE_W / 2}
                    y={pos.y + (nameLines.length === 1 ? 20 : 15)}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill={textColor}
                    onPress={() => handleNodePress(key)}
                  >
                    {subject.code}
                  </SvgText>
                  {/* Short name */}
                  {wrapText(subject.name, 15).map((line, li) => (
                    <SvgText
                      key={li}
                      x={pos.x + NODE_W / 2}
                      y={pos.y + 30 + li * 13}
                      textAnchor="middle"
                      fontSize="8"
                      fill={textColor}
                      opacity={0.85}
                      onPress={() => handleNodePress(key)}
                    >
                      {line}
                    </SvgText>
                  ))}
                </React.Fragment>
              );
            })}
          </Svg>
        </ScrollView>
      </ScrollView>

      {/* Bottom selected subject bar */}
      {selected && (
        <TouchableOpacity
          style={[
            styles.selectedBar,
            { borderLeftColor: STATUS_COLORS[statuses[selected] ?? "locked"] },
          ]}
          onPress={() => navigation.navigate("SubjectDetail", { subjectKey: selected })}
        >
          <View>
            <Text style={styles.selectedCode}>{subjects[selected]?.code}</Text>
            <Text style={styles.selectedName}>{subjects[selected]?.name}</Text>
          </View>
          <Text style={styles.selectedTap}>Tap to open →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  legend: {
    flexGrow: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#1e293b",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  legendText: { color: "#94a3b8", fontSize: 11, textTransform: "capitalize" },
  hint: {
    fontSize: 11,
    color: "#475569",
    textAlign: "center",
    paddingVertical: 6,
    backgroundColor: "#0f172a",
  },
  selectedBar: {
    backgroundColor: "#1e293b",
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCode: { fontSize: 12, fontWeight: "700", color: "#94a3b8" },
  selectedName: { fontSize: 14, fontWeight: "700", color: "#f1f5f9" },
  selectedTap: { fontSize: 12, color: "#3b82f6", fontWeight: "700" },
});
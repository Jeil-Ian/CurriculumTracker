import React, { useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const STATUS_CONFIG = {
  passed: {
    color: "#34d399",
    bg: "rgba(6,78,59,0.6)",
    border: "rgba(52,211,153,0.3)",
    label: "Passed",
    icon: "✓",
    glow: "rgba(52,211,153,0.12)",
  },
  enrolled: {
    color: "#60a5fa",
    bg: "rgba(30,58,95,0.6)",
    border: "rgba(96,165,250,0.3)",
    label: "Enrolled",
    icon: "◉",
    glow: "rgba(96,165,250,0.12)",
  },
  failed: {
    color: "#f87171",
    bg: "rgba(76,29,29,0.6)",
    border: "rgba(248,113,113,0.3)",
    label: "Failed",
    icon: "✗",
    glow: "rgba(248,113,113,0.12)",
  },
  available: {
    color: "#fbbf24",
    bg: "rgba(69,26,3,0.6)",
    border: "rgba(251,191,36,0.3)",
    label: "Available",
    icon: "◈",
    glow: "rgba(251,191,36,0.12)",
  },
  locked: {
    color: "#475569",
    bg: "rgba(15,23,42,0.4)",
    border: "rgba(71,85,105,0.2)",
    label: "Locked",
    icon: "◌",
    glow: "transparent",
  },
};

export default function SubjectCard({ subject, status, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.locked;
  const isLocked = status === "locked";

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: cfg.bg,
            borderColor: cfg.border,
            shadowColor: cfg.color,
          },
          isLocked && styles.cardLocked,
        ]}
      >
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: cfg.color }]} />

        <View style={styles.cardInner}>
          {/* Code + units row */}
          <View style={styles.topRow}>
            <Text style={[styles.code, isLocked && styles.lockedText]}>
              {subject.code}
            </Text>
            <View style={[styles.unitsBadge, { borderColor: cfg.border }]}>
              <Text style={[styles.unitsText, { color: cfg.color }]}>
                {subject.units}u
              </Text>
            </View>
          </View>

          {/* Subject name */}
          <Text
            style={[styles.name, isLocked && styles.lockedText]}
            numberOfLines={1}
          >
            {subject.name}
          </Text>

          {/* Bottom row with status */}
          <View style={styles.bottomRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${cfg.color}22`, borderColor: `${cfg.color}44` },
              ]}
            >
              <Text style={[styles.statusIcon, { color: cfg.color }]}>
                {cfg.icon}
              </Text>
              <Text style={[styles.statusLabel, { color: cfg.color }]}>
                {cfg.label}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </View>
        </View>

        {/* Glow overlay for active statuses */}
        {!isLocked && (
          <View
            style={[
              styles.glowOverlay,
              { backgroundColor: cfg.glow },
            ]}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 7 },
  card: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  cardLocked: { opacity: 0.55 },
  accentBar: {
    width: 3,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardInner: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  code: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  unitsBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unitsText: { fontSize: 10, fontWeight: "700" },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: 8,
  },
  lockedText: { color: "#475569" },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusIcon: { fontSize: 11, fontWeight: "800" },
  statusLabel: { fontSize: 10, fontWeight: "700" },
  arrow: { color: "#334155", fontSize: 18 },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
});
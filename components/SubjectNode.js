import React, { useRef, useEffect } from "react";
import { Animated, TouchableOpacity, View, Text, StyleSheet } from "react-native";

const STATUS_CONFIG = {
  passed:    { fill: "#064e3b", stroke: "#34d399", text: "#34d399", glow: "#34d39940" },
  enrolled:  { fill: "#1e3a5f", stroke: "#60a5fa", text: "#60a5fa", glow: "#60a5fa40" },
  failed:    { fill: "#4c1d1d", stroke: "#f87171", text: "#f87171", glow: "#f8717140" },
  available: { fill: "#451a03", stroke: "#fbbf24", text: "#fbbf24", glow: "#fbbf2440" },
  locked:    { fill: "#1e293b", stroke: "#334155", text: "#475569", glow: "transparent" },
};

export default function SubjectNode({
  subject,
  status,
  isSelected,
  onPress,
  x,
  y,
  width: nodeW = 110,
  height: nodeH = 52,
}) {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.locked;

  useEffect(() => {
    if (status === "available") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: false }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [status]);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.07 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isSelected]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9],
  });

  const borderWidth = isSelected ? 2.5 : 1.5;

  // Wrap text to max 2 lines of ~14 chars
  const codeText = subject.code;
  const nameLines = subject.name.length > 14
    ? [subject.name.slice(0, 14), subject.name.slice(14, 28)]
    : [subject.name];

  return (
    <Animated.View
      style={[
        styles.nodeContainer,
        {
          position: "absolute",
          left: x,
          top: y,
          width: nodeW,
          height: nodeH,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Glow ring for available */}
      {status === "available" && (
        <Animated.View
          style={[
            styles.glowRing,
            {
              width: nodeW + 16,
              height: nodeH + 16,
              top: -8,
              left: -8,
              borderRadius: 16,
              borderColor: cfg.stroke,
              opacity: glowOpacity,
            },
          ]}
        />
      )}
      {/* Selection ring */}
      {isSelected && (
        <View
          style={[
            styles.selectionRing,
            {
              width: nodeW + 10,
              height: nodeH + 10,
              top: -5,
              left: -5,
              borderRadius: 14,
              borderColor: "#f59e0b",
            },
          ]}
        />
      )}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.node,
          {
            backgroundColor: cfg.fill,
            borderColor: cfg.stroke,
            borderWidth,
            width: nodeW,
            height: nodeH,
            opacity: status === "locked" ? 0.55 : 1,
          },
        ]}
      >
        <Text style={[styles.nodeCode, { color: cfg.text }]} numberOfLines={1}>
          {codeText}
        </Text>
        {nameLines.slice(0, 2).map((line, i) => (
          <Text
            key={i}
            style={[styles.nodeName, { color: cfg.text, opacity: 0.75 }]}
            numberOfLines={1}
          >
            {line}
          </Text>
        ))}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  nodeContainer: { zIndex: 10 },
  glowRing: {
    position: "absolute",
    borderWidth: 2,
    zIndex: 1,
  },
  selectionRing: {
    position: "absolute",
    borderWidth: 2,
    zIndex: 2,
  },
  node: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 6,
    zIndex: 3,
  },
  nodeCode: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  nodeName: {
    fontSize: 7.5,
    textAlign: "center",
    marginTop: 1,
  },
});
import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, ActivityIndicator, KeyboardAvoidingView,
  ScrollView, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as authService from "../src/services/auth";

export default function SignupScreen({ navigation }) {
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");
  const [showPass, setShowPass]             = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const validateForm = () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("All fields are required"); return false;
    }
    if (!email.includes("@")) {
      setError("Invalid email format"); return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters"); return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match"); return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) { shake(); return; }
    setLoading(true);
    setError("");
    const { user, error: signupError } = await authService.signup(email, password);
    setLoading(false);
    if (signupError) {
      setError(signupError);
      shake();
    } else {
      setEmail(""); setPassword(""); setConfirmPassword("");
    }
  };

  // Password strength
  const strength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;
  const strengthColors = ["#334155", "#f87171", "#fbbf24", "#34d399"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0c1f3a", "#0f172a", "#0f172a"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
      />

      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <LinearGradient colors={["#34d399", "#3b82f6"]} style={styles.logoGradient}>
              <Text style={styles.logoText}>ST</Text>
            </LinearGradient>
          </View>
          <Text style={styles.appName}>SubjectTracker</Text>
          <Text style={styles.appSub}>USC BSIT · Effective 2023</Text>
        </View>

        <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.cardTitle}>Create account</Text>
          <Text style={styles.cardSub}>Start tracking your progress</Text>

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputWrap}>
              <Feather name="mail" size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor="#334155"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {email.includes("@") && email.includes(".") && (
                <Text style={{ color: "#34d399", fontSize: 14 }}>✓</Text>
              )}
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <Feather name="key" size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor="#334155"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color="#64748b" />
              </TouchableOpacity>
            </View>
            {/* Strength bar */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      { backgroundColor: i <= strength ? strengthColors[strength] : "#1e293b" },
                    ]}
                  />
                ))}
                <Text style={[styles.strengthLabel, { color: strengthColors[strength] }]}>
                  {strengthLabels[strength]}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Confirm Password</Text>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor="#334155"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
                secureTextEntry={!showPass}
              />
              {confirmPassword.length > 0 && (
                <Text style={{ color: confirmPassword === password ? "#34d399" : "#f87171", fontSize: 14 }}>
                  {confirmPassword === password ? "✓" : "✗"}
                </Text>
              )}
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.btnWrap}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? ["#334155", "#334155"] : ["#34d399", "#3b82f6"]}
              style={styles.btn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Create Account →</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate("Login")}
            disabled={loading}
          >
            <Text style={styles.secondaryBtnText}>
              Already have an account? <Text style={styles.secondaryBtnLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: "#0f172a" },
  scroll:        { flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, paddingVertical: 40 },
  orb1:          { position: "absolute", width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(52,211,153,0.07)", top: -60, left: -80 },
  orb2:          { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(59,130,246,0.07)", bottom: 80, right: -60 },
  logoArea:      { alignItems: "center", marginBottom: 36 },
  logoIcon:      { width: 64, height: 64, borderRadius: 18, overflow: "hidden", marginBottom: 14 },
  logoGradient:  { flex: 1, alignItems: "center", justifyContent: "center" },
  logoText:      { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  appName:       { fontSize: 24, fontWeight: "900", color: "#f8fafc", letterSpacing: -0.5 },
  appSub:        { fontSize: 12, color: "#475569", marginTop: 4 },
  card:          { backgroundColor: "#1e293b", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#334155" },
  cardTitle:     { fontSize: 20, fontWeight: "800", color: "#f8fafc", marginBottom: 4 },
  cardSub:       { fontSize: 13, color: "#64748b", marginBottom: 24 },
  fieldWrap:     { marginBottom: 16 },
  fieldLabel:    { fontSize: 12, fontWeight: "700", color: "#94a3b8", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" },
  inputWrap:     { flexDirection: "row", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 10, borderWidth: 1, borderColor: "#334155", paddingHorizontal: 12 },
  inputIcon:     { fontSize: 14, marginRight: 8 },
  input:         { flex: 1, color: "#f1f5f9", fontSize: 14, paddingVertical: 12 },
  eyeBtn:        { padding: 4 },
  eyeText:       { fontSize: 14 },
  strengthRow:   { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  strengthBar:   { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontSize: 10, fontWeight: "700", width: 40 },
  errorBox:      { backgroundColor: "rgba(248,113,113,0.1)", borderRadius: 8, borderWidth: 1, borderColor: "rgba(248,113,113,0.3)", padding: 10, marginBottom: 16 },
  errorText:     { color: "#f87171", fontSize: 13, fontWeight: "500" },
  btnWrap:       { borderRadius: 12, overflow: "hidden", marginTop: 4 },
  btn:           { paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  btnText:       { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },
  divider:       { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine:   { flex: 1, height: 1, backgroundColor: "#1e3a5f" },
  dividerText:   { color: "#334155", fontSize: 12, marginHorizontal: 12 },
  secondaryBtn:  { alignItems: "center" },
  secondaryBtnText: { color: "#64748b", fontSize: 13 },
  secondaryBtnLink: { color: "#60a5fa", fontWeight: "700" },
});

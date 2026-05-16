import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT, SPACE, RADII } from "../../lib/utils";
import { signIn, sendPasswordReset } from "../../lib/firebase";
import { authApi } from "../../lib/api";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import type { User } from "../../types";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1 — Firebase sign in
      const firebaseUser = await signIn(email.trim().toLowerCase(), password);

      // Step 2 — Get JWT token
      const token = await firebaseUser.getIdToken();
      setToken(token);

      // Step 3 — Fetch user profile
      const response = await authApi.getMe();
      const user: User = response.data.data.user;

      // Step 4 — Block NGO and Admin users
      if (user.role !== "DONOR") {
        router.replace("/(auth)/wrong-role");
        return;
      }

      setUser(user);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      const code = err?.code ?? "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else if (code === "auth/user-disabled") {
        setError("Your account has been disabled. Please contact support.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        "Enter your email",
        "Please enter your email address first then tap Forgot Password.",
      );
      return;
    }
    try {
      await sendPasswordReset(email.trim().toLowerCase());
      Alert.alert(
        "Email sent ✉️",
        "Check your inbox for a password reset link.",
        [{ text: "OK" }],
      );
    } catch (err) {
      Alert.alert(
        "Failed",
        "Could not send reset email. Please check your email address.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          {router.canGoBack() && (
            <TouchableOpacity
              style={styles.back}
              onPress={() => router.back()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>
          )}

          {/* Logo mark */}
          <View style={styles.logoWrap}>
            <View style={styles.logoMark}>
              <Ionicons name="leaf" size={22} color={COLORS.primary} />
            </View>
          </View>

          {/* Heading */}
          <View style={styles.headingBlock}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subheading}>
              Sign in to your GivHive account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={COLORS.textSub}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.textHint}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={COLORS.textSub}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textHint}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={COLORS.textSub}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error message */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={COLORS.error}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Sign in button */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>
                {loading ? "Signing in..." : "Sign in"}
              </Text>
              {!loading && (
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={COLORS.surface}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.footerCta}>Create one</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACE.xl,
    paddingBottom: SPACE["3xl"],
  },
  back: {
    marginTop: SPACE.lg,
    width: 40,
    height: 40,
    borderRadius: RADII.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    marginTop: SPACE["3xl"],
    marginBottom: SPACE["2xl"],
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headingBlock: {
    gap: SPACE.sm,
    marginBottom: SPACE["3xl"],
  },
  heading: {
    fontSize: FONT["3xl"],
    fontWeight: "800",
    color: COLORS.text,
  },
  subheading: {
    fontSize: FONT.base,
    color: COLORS.textSub,
    lineHeight: 22,
  },
  form: {
    gap: SPACE.xl,
    marginBottom: SPACE["3xl"],
  },
  fieldGroup: {
    gap: SPACE.sm,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: FONT.sm,
    fontWeight: "600",
    color: COLORS.text,
  },
  forgotText: {
    fontSize: FONT.sm,
    color: COLORS.primary,
    fontWeight: "600",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACE.md,
    height: 52,
    gap: SPACE.sm,
  },
  inputIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: FONT.base,
    color: COLORS.text,
    paddingVertical: 0,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.lg,
    paddingVertical: SPACE.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACE.sm,
    marginTop: SPACE.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: FONT.base,
    fontWeight: "700",
    color: COLORS.surface,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    fontSize: FONT.md,
    color: COLORS.textSub,
  },
  footerCta: {
    fontSize: FONT.md,
    color: COLORS.primary,
    fontWeight: "700",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    backgroundColor: COLORS.errorLight,
    borderRadius: RADII.md,
    padding: SPACE.md,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
  },
  errorText: {
    fontSize: FONT.sm,
    color: COLORS.error,
    flex: 1,
    lineHeight: 18,
  },
});

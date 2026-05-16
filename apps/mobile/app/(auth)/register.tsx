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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT, SPACE, RADII } from "../../lib/utils";
import { authApi } from "../../lib/api";
import { signIn } from "../../lib/firebase";
import { useAuthStore } from "../../store/authStore";
import type { User } from "../../types";

type Role = "DONOR" | "NGO";

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [role, setRole] = useState<Role>("DONOR");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      await authApi.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      const firebaseUser = await signIn(email.trim().toLowerCase(), password);
      const token = await firebaseUser.getIdToken();
      setToken(token);
      const response = await authApi.getMe();
      const user: User = response.data.data.user;
      setUser(user);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "";
      if (message.includes("already exists")) {
        setError("An account with this email already exists. Sign in instead.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
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
            <Text style={styles.heading}>Create account</Text>
            <Text style={styles.subheading}>
              Join GivHive and start making a difference
            </Text>
          </View>

          {/* Role selector */}
          <View style={styles.roleSection}>
            <Text style={styles.label}>I am joining as</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === "DONOR" && styles.roleCardActive,
                ]}
                onPress={() => setRole("DONOR")}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.roleIcon,
                    role === "DONOR" && styles.roleIconActive,
                  ]}
                >
                  <Ionicons
                    name="heart-outline"
                    size={20}
                    color={role === "DONOR" ? COLORS.surface : COLORS.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.roleLabel,
                    role === "DONOR" && styles.roleLabelActive,
                  ]}
                >
                  Donor
                </Text>
                <Text
                  style={[
                    styles.roleDesc,
                    role === "DONOR" && styles.roleDescActive,
                  ]}
                >
                  Give food or cash
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === "NGO" && styles.roleCardActive,
                ]}
                onPress={() => setRole("NGO")}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.roleIcon,
                    role === "NGO" && styles.roleIconActive,
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={role === "NGO" ? COLORS.surface : COLORS.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.roleLabel,
                    role === "NGO" && styles.roleLabelActive,
                  ]}
                >
                  Charity
                </Text>
                <Text
                  style={[
                    styles.roleDesc,
                    role === "NGO" && styles.roleDescActive,
                  ]}
                >
                  Receive donations
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name row */}
            <View style={styles.nameRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>First name</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name"
                    placeholderTextColor={COLORS.textHint}
                    autoCapitalize="words"
                  />
                </View>
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Last name</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                    placeholderTextColor={COLORS.textHint}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>

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
              <Text style={styles.label}>Password</Text>
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
                  placeholder="At least 6 characters"
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

            {/* Confirm password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={COLORS.textSub}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat your password"
                  placeholderTextColor={COLORS.textHint}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
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

            {/* Register button */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>
                {loading ? "Creating account..." : "Create account"}
              </Text>
              {!loading && (
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={COLORS.surface}
                />
              )}
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              By creating an account you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.footerCta}>Sign in</Text>
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
    marginBottom: SPACE["2xl"],
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
  roleSection: {
    gap: SPACE.md,
    marginBottom: SPACE["2xl"],
  },
  roleRow: {
    flexDirection: "row",
    gap: SPACE.md,
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: SPACE.md,
    gap: SPACE.sm,
    alignItems: "flex-start",
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  roleIcon: {
    width: 38,
    height: 38,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  roleIconActive: {
    backgroundColor: COLORS.primary,
  },
  roleLabel: {
    fontSize: FONT.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  roleLabelActive: {
    color: COLORS.primary,
  },
  roleDesc: {
    fontSize: FONT.xs,
    color: COLORS.textSub,
  },
  roleDescActive: {
    color: COLORS.primary,
  },
  form: {
    gap: SPACE.xl,
    marginBottom: SPACE["2xl"],
  },
  nameRow: {
    flexDirection: "row",
    gap: SPACE.md,
  },
  fieldGroup: {
    gap: SPACE.sm,
  },
  label: {
    fontSize: FONT.sm,
    fontWeight: "600",
    color: COLORS.text,
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
  terms: {
    fontSize: FONT.xs,
    color: COLORS.textSub,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: "600",
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

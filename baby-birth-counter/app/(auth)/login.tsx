import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "../../hooks/useTheme";
import {
  handleGoogleSignIn,
  handleAppleSignIn,
  handleEmailSignIn,
  handleEmailSignUp,
  handlePasswordReset,
} from "../../lib/auth";

// Required for Expo AuthSession to work properly
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = "221058220394-hq1n3odu1h6huutggd30g49fggl7dlc4.apps.googleusercontent.com";
const GOOGLE_IOS_CLIENT_ID = "221058220394-dv3hummv39h3l93g3ptie2iahjls17sh.apps.googleusercontent.com";

type EmailMode = "signIn" | "signUp";

export default function LoginScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailMode, setEmailMode] = useState<EmailMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleAuth(id_token);
      }
    }
  }, [response]);

  const handleGoogleAuth = async (idToken: string) => {
    try {
      setLoading(true);
      setError(null);
      await handleGoogleSignIn(idToken);
    } catch (err: any) {
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    try {
      setError(null);
      await promptAsync();
    } catch {
      setError("Failed to start Google sign-in. Please try again.");
    }
  };

  const onAppleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await handleAppleSignIn();
    } catch {
      setError("Failed to sign in with Apple. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onEmailSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (emailMode === "signUp" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (emailMode === "signUp" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      if (emailMode === "signUp") {
        await handleEmailSignUp(email.trim(), password);
      } else {
        await handleEmailSignIn(email.trim(), password);
      }
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Try signing in.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email above, then tap Forgot Password.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await handlePasswordReset(email.trim());
      setResetSent(true);
    } catch {
      setError("Could not send reset email. Check the address and try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleEmailMode = () => {
    setEmailMode((m) => (m === "signIn" ? "signUp" : "signIn"));
    setError(null);
    setPassword("");
    setConfirmPassword("");
    setResetSent(false);
  };

  const colors = theme.colors;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top section — branding */}
        <View style={styles.brandSection}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryAccent }]}>
            <Text style={styles.iconEmoji}>👶</Text>
          </View>
          <Text style={[styles.title, { color: colors.primaryText }]}>
            Firstprints
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Track every precious arrival
          </Text>
        </View>

        {/* Middle section — sign in buttons */}
        <View style={styles.buttonSection}>
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.destructive + "20" }]}>
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          )}

          {resetSent && (
            <View style={[styles.errorBanner, { backgroundColor: colors.primaryAccent + "20" }]}>
              <Text style={[styles.errorText, { color: colors.primaryAccent }]}>
                Password reset email sent. Check your inbox.
              </Text>
            </View>
          )}

          {/* Google Sign-In */}
          <TouchableOpacity
            style={[styles.signInButton, styles.googleButton]}
            onPress={onGoogleSignIn}
            disabled={loading || !request}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#4285F4" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple Sign-In (iOS only) */}
          {Platform.OS === "ios" && (
            <TouchableOpacity
              style={[styles.signInButton, styles.appleButton]}
              onPress={onAppleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.appleIcon}></Text>
                  <Text style={styles.appleText}>Sign in with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.secondaryText + "40" }]} />
            <Text style={[styles.dividerText, { color: colors.secondaryText }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.secondaryText + "40" }]} />
          </View>

          {/* Email/Password toggle */}
          {!showEmailForm ? (
            <TouchableOpacity
              style={[styles.signInButton, styles.emailButton, { borderColor: colors.secondaryText + "60" }]}
              onPress={() => setShowEmailForm(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.emailButtonText, { color: colors.primaryText }]}>
                Continue with email
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.emailForm}>
              <Text style={[styles.emailFormTitle, { color: colors.primaryText }]}>
                {emailMode === "signIn" ? "Sign in" : "Create account"}
              </Text>

              <TextInput
                style={[styles.input, { borderColor: colors.secondaryText + "40", color: colors.primaryText, backgroundColor: colors.background }]}
                placeholder="Email"
                placeholderTextColor={colors.secondaryText}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />

              <TextInput
                style={[styles.input, { borderColor: colors.secondaryText + "40", color: colors.primaryText, backgroundColor: colors.background }]}
                placeholder="Password"
                placeholderTextColor={colors.secondaryText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {emailMode === "signUp" && (
                <TextInput
                  style={[styles.input, { borderColor: colors.secondaryText + "40", color: colors.primaryText, backgroundColor: colors.background }]}
                  placeholder="Confirm password"
                  placeholderTextColor={colors.secondaryText}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              )}

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primaryAccent }]}
                onPress={onEmailSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {emailMode === "signIn" ? "Sign in" : "Create account"}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.emailFooterRow}>
                <TouchableOpacity onPress={toggleEmailMode}>
                  <Text style={[styles.emailFooterLink, { color: colors.primaryAccent }]}>
                    {emailMode === "signIn" ? "New here? Create account" : "Already have an account? Sign in"}
                  </Text>
                </TouchableOpacity>

                {emailMode === "signIn" && (
                  <TouchableOpacity onPress={onForgotPassword}>
                    <Text style={[styles.emailFooterLink, { color: colors.secondaryText }]}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.secondaryText }]}>
            Your data is securely stored and tied to your account
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 50,
  },
  brandSection: {
    alignItems: "center",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  buttonSection: {
    gap: 16,
    marginTop: 40,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 12,
    gap: 10,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADCE0",
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4285F4",
  },
  googleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3C4043",
  },
  appleButton: {
    backgroundColor: "#000000",
  },
  appleIcon: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  appleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
  },
  emailButton: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emailForm: {
    gap: 12,
  },
  emailFormTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emailFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  emailFooterLink: {
    fontSize: 13,
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
  },
});

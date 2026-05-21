import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "../../hooks/useTheme";
import { handleGoogleSignIn, handleAppleSignIn } from "../../lib/auth";

// Required for Expo AuthSession to work properly
WebBrowser.maybeCompleteAuthSession();

// Use the WEB client ID for expo-auth-session proxy flow
const GOOGLE_WEB_CLIENT_ID = "221058220394-hq1n3odu1h6huutggd30g49fggl7dlc4.apps.googleusercontent.com";
const GOOGLE_IOS_CLIENT_ID = "221058220394-dv3hummv39h3l93g3ptie2iahjls17sh.apps.googleusercontent.com";

export default function LoginScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      console.error("Google sign-in error:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    try {
      setError(null);
      await promptAsync();
    } catch (err: any) {
      console.error("Google prompt error:", err);
      setError("Failed to start Google sign-in. Please try again.");
    }
  };

  const onAppleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const success = await handleAppleSignIn();
      if (!success) {
        // User cancelled — no error needed
      }
    } catch (err: any) {
      console.error("Apple sign-in error:", err);
      setError("Failed to sign in with Apple. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top section — branding */}
      <View style={styles.brandSection}>
        <View
          style={[styles.iconCircle, { backgroundColor: colors.primaryAccent }]}
        >
          <Text style={styles.iconEmoji}>👶</Text>
        </View>
        <Text style={[styles.title, { color: colors.primaryText }]}>
          Baby Birth Counter
        </Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Track every precious arrival
        </Text>
      </View>

      {/* Middle section — sign in buttons */}
      <View style={styles.buttonSection}>
        {error && (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: colors.destructive + "20" },
            ]}
          >
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {error}
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
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.secondaryText }]}>
          Your data is securely stored and tied to your account
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
  },
});
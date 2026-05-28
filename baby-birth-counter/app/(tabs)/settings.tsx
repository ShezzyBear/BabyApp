import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { signOut, handleDeleteAccount } from "../../lib/auth";
import { ThemeMode } from "../../lib/theme";
import ConfirmDialog from "../../components/ConfirmDialog";
import { SafeAreaView } from "react-native-safe-area-context";

const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { user } = useAuth();
  const colors = theme.colors;
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReauthNotice, setShowReauthNotice] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSignOut = async () => {
    setShowSignOutConfirm(false);
    await signOut();
  };

  const handleDeleteConfirmed = async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);
    try {
      await handleDeleteAccount();
      Alert.alert(
        "Account Deleted",
        "Your account and all associated data have been permanently deleted.",
        [{ text: "OK" }]
      );
    } catch (err: any) {
      setDeleting(false);
      if (err?.code === "auth/requires-recent-login") {
        setShowReauthNotice(true);
      }
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.screenTitle, { color: colors.primaryText }]}>
          Settings
        </Text>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
            Account
          </Text>
          <View
            style={[styles.card, { backgroundColor: colors.surface }]}
          >
            <View style={styles.accountRow}>
              {user?.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  style={styles.avatar}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    styles.avatarPlaceholder,
                    { backgroundColor: colors.primaryAccent + "30" },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarLetter,
                      { color: colors.primaryAccent },
                    ]}
                  >
                    {(user?.displayName || user?.email || "U")[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.accountInfo}>
                <Text
                  style={[styles.displayName, { color: colors.primaryText }]}
                >
                  {user?.displayName || "User"}
                </Text>
                <Text style={[styles.email, { color: colors.secondaryText }]}>
                  {user?.email || ""}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
            Appearance
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text
              style={[styles.settingLabel, { color: colors.primaryText }]}
            >
              Theme
            </Text>
            <View style={styles.themeRow}>
              {themeOptions.map((option) => {
                const isSelected = themeMode === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: isSelected
                          ? colors.primaryAccent
                          : colors.background,
                        borderColor: isSelected
                          ? colors.primaryAccent
                          : colors.divider,
                      },
                    ]}
                    onPress={() => setThemeMode(option.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.themeOptionText,
                        {
                          color: isSelected ? "#FFFFFF" : colors.secondaryText,
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
            About
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.primaryText }]}>
                Version
              </Text>
              <Text
                style={[styles.aboutValue, { color: colors.secondaryText }]}
              >
                1.0.0
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: colors.destructive }]}
          onPress={() => setShowSignOutConfirm(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.signOutText, { color: colors.destructive }]}>
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={() => setShowDeleteConfirm(true)}
          disabled={deleting}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteAccountText}>
            {deleting ? "Deleting account…" : "Delete Account"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out Confirmation */}
      <ConfirmDialog
        visible={showSignOutConfirm}
        title="Sign Out?"
        message="Are you sure you want to sign out? Your data is safely stored and will be here when you return."
        confirmLabel="Sign Out"
        destructive
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutConfirm(false)}
      />

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Account?"
        message="This will permanently delete your account and all birth records. This cannot be undone."
        confirmLabel="Delete Account"
        destructive
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Re-authentication notice */}
      <ConfirmDialog
        visible={showReauthNotice}
        title="Sign In Again to Continue"
        message="For security, deleting your account requires a recent sign-in. Please sign out and sign back in, then try again."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        destructive
        onConfirm={async () => { setShowReauthNotice(false); await signOut(); }}
        onCancel={() => setShowReauthNotice(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    gap: 24,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingLeft: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: "700",
  },
  accountInfo: {
    flex: 1,
    gap: 2,
  },
  displayName: {
    fontSize: 16,
    fontWeight: "600",
  },
  email: {
    fontSize: 14,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  themeRow: {
    flexDirection: "row",
    gap: 8,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  themeOptionText: {
    fontSize: 14,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aboutLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  aboutValue: {
    fontSize: 15,
  },
  signOutButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteAccountButton: {
    alignItems: "center",
    paddingVertical: 14,
  },
  deleteAccountText: {
    fontSize: 14,
    color: "#999999",
    textDecorationLine: "underline",
  },
});

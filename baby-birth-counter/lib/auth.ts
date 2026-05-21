import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
} from "firebase/auth";
import * as Google from "expo-auth-session/providers/google";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { auth } from "./firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// ============================================================
// GOOGLE OAUTH CLIENT ID
// (from Google Cloud Console → APIs & Services → Credentials)
// ============================================================
export const GOOGLE_CLIENT_ID = "221058220394-dv3hummv39h3l93g3ptie2iahjls17sh.apps.googleusercontent.com";

/**
 * Hook config for Google Auth — use this in your component:
 * const [request, response, promptAsync] = Google.useAuthRequest(googleAuthConfig);
 */
export const googleAuthConfig = {
  iosClientId: GOOGLE_CLIENT_ID,
  expoClientId: GOOGLE_CLIENT_ID, // Keep for Expo Go compatibility
  useProxy: false,
};

/**
 * Exchange Google auth response for Firebase credential and sign in.
 */
export async function handleGoogleSignIn(idToken: string): Promise<void> {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  await ensureUserDoc(result.user.uid, {
    displayName: result.user.displayName || "User",
    email: result.user.email || "",
    provider: "google",
  });
}

/**
 * Perform Apple Sign-In and exchange for Firebase credential.
 * Returns true on success, false if user cancelled.
 */
export async function handleAppleSignIn(): Promise<boolean> {
  try {
    // Generate a random nonce for security
    const nonce = Math.random().toString(36).substring(2, 18);
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      nonce
    );

    const appleCredential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    const { identityToken } = appleCredential;
    if (!identityToken) throw new Error("No identity token from Apple");

    const provider = new OAuthProvider("apple.com");
    const credential = provider.credential({
      idToken: identityToken,
      rawNonce: nonce,
    });

    const result = await signInWithCredential(auth, credential);

    // Apple only provides name on first sign-in
    const displayName = appleCredential.fullName
      ? `${appleCredential.fullName.givenName || ""} ${appleCredential.fullName.familyName || ""}`.trim()
      : result.user.displayName || "User";

    await ensureUserDoc(result.user.uid, {
      displayName,
      email: appleCredential.email || result.user.email || "",
      provider: "apple",
    });

    return true;
  } catch (error: any) {
    if (error.code === "ERR_REQUEST_CANCELED") {
      return false; // User cancelled — not an error
    }
    throw error;
  }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Create user document in Firestore if it doesn't exist,
 * or update lastLoginAt if it does.
 */
async function ensureUserDoc(
  userId: string,
  data: { displayName: string; email: string; provider: string }
): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      ...data,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      themePreference: "light",
    });
  } else {
    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
  }
}

// Firebase auth error codes are not user-facing; map the ones our screens can hit.
const MESSAGES = {
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/user-not-found": "Email or password is incorrect.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/email-already-in-use": "An account already exists for that email.",
  "auth/weak-password": "Passwords need to be at least 8 characters.",
  "auth/missing-password": "Enter your password.",
  "auth/too-many-requests": "Too many attempts. Try again in a few minutes.",
  "auth/network-request-failed": "No connection. Check your internet and try again.",
  // Email/password sign-in is switched off in the Firebase console.
  "auth/operation-not-allowed": "Email sign-in isn't enabled for this app yet.",
  "auth/configuration-not-found": "Email sign-in isn't enabled for this app yet.",
};

export function authErrorMessage(error) {
  return MESSAGES[error?.code] ?? "Something went wrong. Please try again.";
}

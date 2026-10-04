/**
 * Safe client-side tactile haptic feedback for mobile devices (iOS / Android)
 * Gracefully ignores desktop and unsupported browsers.
 */
export function triggerHaptic(type: "selection" | "light" | "medium" | "heavy" | "success" | "warning" | "error" = "selection") {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;

  try {
    switch (type) {
      case "selection":
      case "light":
        navigator.vibrate(8);
        break;
      case "medium":
        navigator.vibrate(15);
        break;
      case "heavy":
        navigator.vibrate(25);
        break;
      case "success":
        navigator.vibrate([10, 40, 15]);
        break;
      case "warning":
        navigator.vibrate([20, 50, 20]);
        break;
      case "error":
        navigator.vibrate([25, 60, 25, 60, 25]);
        break;
    }
  } catch {
    // Ignore any browser permission or hardware exceptions
  }
}

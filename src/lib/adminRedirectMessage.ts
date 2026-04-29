const adminRedirectMessageStorageKey = "adminRedirectMessage";

export function storeAdminRedirectMessage(message: string) {
  try {
    window.sessionStorage.setItem(adminRedirectMessageStorageKey, message);
  } catch {
    // Ignore storage failures and fall back to a plain redirect.
  }
}

export function peekAdminRedirectMessage() {
  try {
    return window.sessionStorage.getItem(adminRedirectMessageStorageKey);
  } catch {
    return null;
  }
}

export function clearAdminRedirectMessage() {
  try {
    window.sessionStorage.removeItem(adminRedirectMessageStorageKey);
  } catch {
    // Ignore storage failures while clearing persisted redirect state.
  }
}
